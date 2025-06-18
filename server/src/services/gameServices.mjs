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
 * Creates a new game with initial setup
 * @param {number} userId - The user ID
 * @param {string} createdAt - Creation timestamp
 * @param {boolean} isDemo - Whether this is a demo game (default: false)
 * @returns {Promise<Game>} The game object
 * @throws {ErrorDTO} If game creation fails
 */
export async function createNewGameWithSetup(
  userId,
  createdAt,
  isDemo = false
) {
  // Create game with initial state round 1 and not ended, 3 lives
  const gameId = await dao.createGame(userId, createdAt, isDemo);

  // Generate 3 initial cards that stay on the table
  const allCards = await dao.getCards();
  const cardIds = generateUniqueCardIds(3, allCards.length);

  // Create game records for the 3 base cards (round 0, already "guessed")
  await Promise.all(
    cardIds.map((cardIndex) => {
      return dao.createGameRecord(
        gameId,
        allCards[cardIndex].id,
        0, // round 0 for base cards
        true, // wasGuessed = true (they are always visible)
        createdAt, // requestedAt
        createdAt  // respondedAt
      );
    })
  );

  // Get the created game with its records
  const game = await dao.getGameWithRecordsAndCards(gameId);
  if (!game) {
    throw ErrorDTO.internalServerError(
      `Failed to create game with ID ${gameId}`
    );
  }

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

  let shouldEnd = false;
  
  if (game.isDemo) {
    // Demo games end after 1 round regardless of result
    shouldEnd = game.roundNum >= 1;  } else {
    // Regular games end when:
    // 1. No lives remaining (3 errors), OR
    // 2. 6 total cards guessed correctly (3 base cards + 3 round cards)
    const correctGuesses = game.records.filter(record => 
      record.wasGuessed === true
    ).length;
    shouldEnd = game.livesRemaining <= 0 || correctGuesses >= 6;
  }

  if (shouldEnd) {
    game.isEnded = true;
  } else {
    game.roundNum += 1;
  }

  await dao.updateGame(game.id, game.roundNum, game.isEnded, game.livesRemaining);
  return game;
}

/**
 * Evaluates user answer by comparing with correct card order by misery index
 * @param {Game} game - The game object with records
 * @param {Array<number>} userAnswer - Array of card IDs in user's chosen order
 * @returns {Object} Evaluation result with isCorrect flag and correct order
 */
export function evaluateUserAnswer(game, userAnswer) {
  // Include only:
  // 1. Cards from previous rounds that were guessed correctly (wasGuessed = true)
  // 2. The current round card (regardless of wasGuessed status, since it's being answered now)
  const validRecords = game.records.filter(
    (record) => record.card && (
      (record.round < game.roundNum && record.wasGuessed === true) ||
      (record.round === game.roundNum)
    )
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
    isCorrect
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
  if (!game) {
    throw ErrorDTO.notFound(`Game with ID ${gameId} not found`);
  }

  // Initialize records if null
  if (!game.records) {
    game.records = [];
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

  // Check if there's already a card for this round
  let nextCardRecord = game.records.find(
    (record) => record.round === game.roundNum
  );
  if (!nextCardRecord || !nextCardRecord.card) {
    throw ErrorDTO.notFound(
      `No card found for game ${gameId} in round ${game.roundNum}`
    );
  }
  const nextCard = nextCardRecord.card;

  // Update next card record with drawn datetime only if it was not drawn before
  if (nextCardRecord.requestedAt=== null) {
    await dao.updateGameRecord(
      nextCardRecord.id,
      nextCardRecord.wasGuessed,
      dayjs().toISOString(),
      null
    );
    nextCardRecord.requestedAt = dayjs().toISOString();
  }

  if (!nextCardRecord.card) {
    throw ErrorDTO.notFound(
      `No card found for game ${gameId} in round ${game.roundNum}`
    );
  }

  // Filter records to show base cards (round 0) + previously guessed cards (wasGuessed = true)
  game.records = game.records.filter(
    (record) => (record.round === 0) || (record.round < game.roundNum && record.wasGuessed === true)
  );

  // Prepare response with game state and next card
  return {
    game: game.toJSON(),
    nextCard: nextCardRecord.card.toJSONWithoutMiseryIndex(),
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
  // Saved before all to minimize lag issues with async
  const respondedAt = dayjs();

  // Validate game access and get game object
  let game = await validateGameAccess(gameId, isDemo, userId);

  // Check if the game is in the correct round and not ended
  if (game.roundNum != roundId) {
    throw ErrorDTO.badRequest(`Game ${gameId} is not in round ${roundId}`);
  }
  if (game.isEnded) {
    const gameType = game.isDemo ? "Demo game" : "Game";
    throw ErrorDTO.badRequest(`${gameType} ${gameId} has already ended`);
  }

  // Find the current round record
  const currentRecord = game.records.find(
    (record) => record.round === game.roundNum
  );

  if (!currentRecord) {
    throw ErrorDTO.internalServerError(
      `No record found for game ${gameId} in round ${game.roundNum}`
    );
  }

  if (currentRecord.respondedAt === null) {
    currentRecord.respondedAt = respondedAt.toISOString();
  }

  // Check if user provided a valid answer
  let response = null;
  if (!cardsIds || cardsIds.length === 0) {
    response = { isCorrect: false };
    currentRecord.wasGuessed = false;
  } else {
    response = evaluateUserAnswer(game, cardsIds);
    currentRecord.wasGuessed = response.isCorrect;
  }

  // Update lives if answer is wrong (only for non-demo games)
  if (!response.isCorrect && !game.isDemo) {
    game.livesRemaining -= 1;
  }

  // Update game record
  await dao.updateGameRecord(
    currentRecord.id,
    currentRecord.wasGuessed,
    currentRecord.requestedAt,
    currentRecord.respondedAt
  );

  // Update game state if needed
  game = await checkAndUpdateGameState(game);
  response.isEnded = game.isEnded;
  response.livesRemaining = game.livesRemaining;

  // For demo games, delete the game after validation
  if (game.isDemo && game.isEnded) {
    try {
      await dao.deleteDemoGame(gameId);
    } catch (error) {
      // Log error but don't fail the response
      console.error(`Failed to delete demo game ${gameId}:`, error);
    }
  }

  return response;
}
