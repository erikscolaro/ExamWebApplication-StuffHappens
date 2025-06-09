// filepath: gameServices.mjs
import ErrorDTO from "../models/errors.mjs";
import * as dao from "../dao/dao.mjs";
import CONFIG from "../config/config.mjs";
import { Game } from "../models/game.mjs";
import crypto from "crypto";
import dayjs from "dayjs";

// =================== GAME SERVICES ===================

// --- Game Creation Utilities ---

/**
 * Generates unique random card IDs
 * @param {number} count - Number of unique IDs to generate
 * @param {number} totalCards - Total number of available cards
 * @returns {Array<number>} Array of unique card IDs
 */
function generateUniqueCardIds(count, totalCards) {
  const cardIndices = new Set();
  while (cardIndices.size < count) {
    const randomIndex = crypto.randomInt(0, totalCards);
    cardIndices.add(randomIndex);
  }
  return [...cardIndices];
}

/**
 * Creates a new game with complete initial setup
 * @param {number} userId - The user ID
 * @param {string} createdAt - Creation timestamp
 * @param {boolean} isDemo - Whether this is a demo game (default: false)
 * @returns {Promise<Game>} The game object without cards
 * @throws {ErrorDTO} If game creation fails
 */
export async function createNewGameWithSetup(
  userId,
  createdAt,
  isDemo = false
) {
  // Create game with initial state round 0 and not ended
  const gameId = await dao.createGame(userId, createdAt, isDemo);

  // Generate random cards and create records
  const cardIds = generateUniqueCardIds(isDemo ? 4 : 6, CONFIG.CARDS_NUMBER);

  // Create game records
  await Promise.all(
    cardIds.map((cardId, index) => {
      const roundNumber = index < 3 ? 0 : index - 2;
      const wasGuessed = roundNumber === 0 ? true : null;
      const timedOut = roundNumber === 0 ? false : null;
      return dao.createGameRecord(
        gameId,
        cardId,
        roundNumber,
        wasGuessed,
        timedOut
      );
    })
  );

  // Get complete game state with updated round number
  const game = await dao.getGameById(gameId);
  if (!game) {
    throw ErrorDTO.internalServerError(
      `Failed to create game with ID ${gameId}`
    );
  }

  // Return basic game object without records for API response (use toJSON method)
  return game;
}

// --- Game Logic & Evaluation ---

/**
 * Checks if game should end and updates game state accordingly
 * @param {Game} game - The game object
 * @returns {Promise<Game>} Updated game object
 */
export async function checkAndUpdateGameState(game) {
  if (game.isEnded) {
    return game;
  }

  const isLastRound =
    (game.isDemo && game.roundNum >= CONFIG.DEMO_ROUNDS) ||
    (!game.isDemo && game.roundNum >= CONFIG.FULL_ROUNDS);

  if (isLastRound) {
    game.isEnded = true;
  } else {
    game.roundNum += 1;
  }

  await dao.updateGame(game.id, game.roundNum, game.isEnded);
  return game;
}

/**
 * Evaluates user answer by comparing with correct card order by misery index
 * @param {Game} game - The game object with records
 * @param {Array<number>} userAnswer - Array of card IDs in user's chosen order
 * @returns {Object} Evaluation result with isCorrect flag and correct order
 */
export function evaluateUserAnswer(game, userAnswer) {
  const validRecords = game.records.filter(
    (record) => record.timedOut === false && record.round <= game.roundNum
  );

  // Map records to cards, sort by misery index ascending, then map to card IDs
  const correctOrderedIds = validRecords
    .map((record) => record.card)
    .sort((a, b) => a.miseryIndex - b.miseryIndex)
    .map((card) => card.id);

  // Compare arrays and return result
  const isCorrect =
    correctOrderedIds.length === userAnswer.length &&
    correctOrderedIds.every((id, index) => id === userAnswer[index]);

  return {
    isCorrect,
    correctOrder: correctOrderedIds,
  };
}

/**
 * Validates game existence, type, and user authorization
 * @param {number} gameId - The game ID
 * @param {boolean|null} isDemo - Whether this is a demo game (null to skip validation)
 * @param {number|null} userId - The user ID (null for demo games)
 * @returns {Promise<Game>} Validated game object with records and cards
 * @throws {ErrorDTO} If validation fails
 */
async function validateGameAccess(gameId, isDemo = null, userId = null) {
  // 1. Get game with complete records and cards
  const game = await dao.getGameWithRecordsAndCards(gameId);
  if (!game || !game.records || game.records.length === 0) {
    throw ErrorDTO.notFound(`Game with ID ${gameId} not found`);
  }

  // 2. Validate game type if specified
  if (isDemo !== null && game.isDemo !== isDemo) {
    const gameType = isDemo ? "demo game" : "regular game";
    throw ErrorDTO.badRequest(`Game with ID ${gameId} is not a ${gameType}`);
  }

  // 3. SECURITY CHECK: Verify user authorization
  if (isDemo === false) {
    // For regular games, verify user owns the game
    if (!userId || game.userid !== userId) {
      throw ErrorDTO.forbidden(
        `Access denied: Game ${gameId} does not belong to user ${userId}`
      );
    }
  }

  return game;
}

// --- Route Handler Helpers ---

/**
 * Common logic for drawing the next card in a game
 * @param {number} gameId - The game ID
 * @param {number} roundId - The round ID
 * @param {boolean|null} isDemo - Whether this is a demo game (null to skip validation)
 * @param {number|null} userId - The user ID (null for demo games)
 * @returns {Promise<Object>} Response object with game and nextCard
 * @throws {ErrorDTO} If game is not found, ended, or in wrong round
 */
export async function handleDrawCard(
  gameId,
  roundId,
  isDemo = null,
  userId = null
) {
  // Validate game access and get game object
  const game = await validateGameAccess(gameId, isDemo, userId);

  // Check if the game is in a valid state to draw a card
  if (game.isEnded) {
    throw ErrorDTO.badRequest(`Game with ID ${gameId} has already ended`);
  } else if (parseInt(game.roundNum) != parseInt(roundId)) {
    throw ErrorDTO.badRequest(
      `Game with ID ${gameId} is not in round ${roundId}`
    );
  }

  // Extract the card for the current round (nextCard)
  const nextCardRecord = game.records.find(
    (record) => record.round === game.roundNum
  );
  if (!nextCardRecord || !nextCardRecord.card) {
    throw ErrorDTO.notFound(
      `No card found for game ${gameId} in round ${game.roundNum}`
    );
  }
  const nextCard = nextCardRecord.card;

  // Update next card record with drawn datetime
  await dao.updateGameRecord(
    nextCardRecord.id,
    null,
    null,
    dayjs().toISOString(),
    null
  );

  // Filter records in game: round < game.roundNum && timedOut = false
  game.records = game.records.filter(
    (record) => record.round < game.roundNum && record.timedOut === false
  );

  // Prepare response with game state and next card
  return {
    game: game.toJSON(),
    nextCard: nextCard.toJSONWithoutMiseryIndex(),
  };
}

/**
 * Common logic for checking user answers in a game
 * @param {number} gameId - The game ID
 * @param {Array<number>} cardsIds - Array of card IDs in user's order
 * @param {number} roundId - The round ID
 * @param {boolean|null} isDemo - Whether this is a demo game (null to skip validation)
 * @param {number|null} userId - The user ID (null for demo games)
 * @returns {Promise<Object>} Response object with evaluation result
 * @throws {ErrorDTO} If game is not found, ended, or in wrong round
 */
export async function handleCheckAnswer(
  gameId,
  cardsIds,
  roundId,
  isDemo = null,
  userId = null
) {
  // saved before all to minimize lag issues with async
  const respondedAt = dayjs();

  // Validate game access and get game object
  const game = await validateGameAccess(gameId, isDemo, userId);

  // Check if the game is in the correct round and not ended
  if (game.roundNum != roundId) {
    throw ErrorDTO.badRequest(`Game ${gameId} is not in round ${roundId}`);
  }
  if (game.isEnded) {
    const gameType = game.isDemo ? "Demo game" : "Game";
    throw ErrorDTO.badRequest(`${gameType} ${gameId} has already ended`);
  }

  // Check if the user answered in time
  let response = null;
  const currentRecord = game.records.find(
    (record) => record.round === game.roundNum
  );

  if (!currentRecord) {
    throw ErrorDTO.internalServerError(
      `No record found for game ${gameId} in round ${game.roundNum}`
    );
  }

  currentRecord.respondedAt = respondedAt.toISOString();
  const isTimedOut =
    dayjs(currentRecord.respondedAt).diff(dayjs(currentRecord.requestedAt)) >
    CONFIG.MAX_RESPONSE_TIME;

  if (isTimedOut) {
    response = { isCorrect: false };
    currentRecord.wasGuessed = false;
    currentRecord.timedOut = true;
  } else {
    // this order is important!!! do not modify
    currentRecord.timedOut = false;
    response = evaluateUserAnswer(game, cardsIds);
    currentRecord.wasGuessed = response.isCorrect;
  }

  // Update game record
  await dao.updateGameRecord(
    currentRecord.id,
    currentRecord.wasGuessed,
    currentRecord.timedOut,
    currentRecord.requestedAt,
    currentRecord.respondedAt
  );

  // Update game state if needed
  response.game = await checkAndUpdateGameState(game);
  if (!response.game.isEnded) response.game.roundNum -= 1;
  // only to send the correct number to client

  // Filter records in game: round < game.roundNum && timedOut = false
  game.records = game.records.filter(
    (record) => record.round <= game.roundNum && record.timedOut === false
  );

  return response;
}
