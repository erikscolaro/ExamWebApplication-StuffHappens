// filepath: gameServices.mjs
import ErrorDTO from "../models/errors.mjs";
import * as dao from "../dao/dao.mjs";
import CONFIG from "../config/config.mjs";
import { Game } from "../models/game.mjs";
import crypto from "crypto";
import dayjs from "dayjs";

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
 * Creates a new game with initial setup and 3 base cards
 * @param {number} userId - The user ID (null for demo games)
 * @param {string} createdAt - Creation timestamp
 * @param {boolean} isDemo - Whether this is a demo game (default: false)
 * @returns {Promise<Game>} The game object with records
 * @throws {ErrorDTO} If game creation fails
 */
export async function createNewGameWithSetup(
  userId,
  createdAt,
  isDemo = false
) {
  const gameId = await dao.createGame(userId, createdAt, isDemo);

  const allCards = await dao.getCards();
  const cardIds = generateUniqueCardIds(3, allCards.length);

  // Create 3 base cards (round 0, always "guessed")
  await Promise.all(
    cardIds.map((cardIndex) => {
      return dao.createGameRecord(
        gameId,
        allCards[cardIndex].id,
        0,
        true,
        createdAt,
        createdAt
      );
    })
  );

  const game = await dao.getGameWithRecordsAndCards(gameId);
  if (!game) {
    throw ErrorDTO.internalServerError(
      `Failed to create game with ID ${gameId}`
    );
  }
  return game;
}

/**
 * Checks if game should end and updates game state accordingly
 * @param {Game} game - The game object
 * @returns {Promise<Game>} Updated game object
 */
export async function checkAndUpdateGameEnding(game) {
  if (game.isEnded) {
    return game;
  }
  let shouldEnd = false;

  if (game.isDemo) {
    shouldEnd = game.roundNum >= 1;
  } else {
    const correctGuesses = game.records.filter(
      (record) => record.wasGuessed === true
    ).length;
    shouldEnd = game.livesRemaining <= 0 || correctGuesses >= 6;
  }
  if (shouldEnd) {
    game.isEnded = true;
  }

  await dao.updateGame(
    game.id,
    game.roundNum,
    game.isEnded,
    game.livesRemaining
  );
  return game;
}

/**
 * Evaluates user answer by comparing with correct card order by misery index
 * @param {Game} game - The game object with records
 * @param {Array<number>} userAnswer - Array of card IDs in user's chosen order
 * @returns {Object} Evaluation result with isCorrect flag
 */
export function evaluateUserAnswer(game, userAnswer) {
  const validRecords = game.records.filter(
    (record) =>
      record.card &&
      ((record.round < game.roundNum && record.wasGuessed === true) ||
        record.round === game.roundNum)
  );

  const correctOrderedIds = validRecords
    .map((record) => record.card)
    .sort((a, b) => a.miseryIndex - b.miseryIndex)
    .map((card) => card.id);

  const isCorrect =
    correctOrderedIds.length === userAnswer.length &&
    correctOrderedIds.every((id, index) => id === userAnswer[index]);

  return {
    isCorrect,
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
  const game = await dao.getGameWithRecordsAndCards(gameId);
  if (!game) {
    throw ErrorDTO.notFound(`Game with ID ${gameId} not found`);
  }

  if (!game.records) {
    game.records = [];
  }

  if (isDemo !== null && game.isDemo !== isDemo) {
    const gameType = isDemo ? "demo game" : "regular game";
    throw ErrorDTO.badRequest(`Game with ID ${gameId} is not a ${gameType}`);
  }

  if (isDemo === false) {
    if (!userId || game.userid !== userId) {
      throw ErrorDTO.forbidden(
        `Access denied: Game ${gameId} does not belong to user ${userId}`
      );
    }
  }
  return game;
}

/**
 * Handles drawing the next card in a game round
 * @param {number} gameId - The game ID
 * @param {number} roundId - The round ID
 * @param {boolean|null} isDemo - Whether this is a demo game (null to skip validation)
 * @param {number|null} userId - The user ID (null for demo games)
 * @returns {Promise<Object>} Response object with game (without records) and nextCard
 * @throws {ErrorDTO} If game is not found, ended, or in wrong round
 */
export async function handleDrawCard(
  gameId,
  roundId,
  isDemo = null,
  userId = null
) {
  const game = await validateGameAccess(gameId, isDemo, userId);
  if (game.isEnded) {
    throw ErrorDTO.badRequest(`Game with ID ${gameId} has already ended`);
  }

  const currentRound = parseInt(game.roundNum);
  const requestedRound = parseInt(roundId);

  if (requestedRound !== currentRound + 1) {
    throw ErrorDTO.badRequest(
      `Game with ID ${gameId} is in round ${currentRound}, cannot draw card for round ${requestedRound}`
    );
  }

  game.roundNum = requestedRound;
  await dao.updateGame(
    gameId,
    game.roundNum,
    game.isEnded,
    game.livesRemaining
  );

  const allCards = await dao.getCards();
  const usedCardIds = game.records.map((record) => record.card.id);

  const availableCards = allCards.filter(
    (card) => !usedCardIds.includes(card.id)
  );

  if (availableCards.length === 0) {
    throw ErrorDTO.internalServerError(
      `No more cards available for game ${gameId}`
    );
  }

  const randomIndex = crypto.randomInt(0, availableCards.length);
  const selectedCard = availableCards[randomIndex];

  const recordId = await dao.createGameRecord(
    gameId,
    selectedCard.id,
    requestedRound,
    null,
    dayjs().toISOString(),
    null
  );

  const nextCardRecord = {
    id: recordId,
    card: selectedCard,
    round: requestedRound,
    wasGuessed: null,
    requestedAt: dayjs().toISOString(),
    respondedAt: null,
  };
  const gameForResponse = new Game(
    game.id,
    game.userid,
    game.createdat,
    game.roundNum,
    game.isEnded,
    game.isDemo,
    game.livesRemaining,
    []
  );

  return {
    game: gameForResponse.toJSON(),
    nextCard: nextCardRecord.card.toJSONWithoutMiseryIndex(),
  };
}

/**
 * Handles checking user answers in a game round
 * @param {number} gameId - The game ID
 * @param {Array<number>} cardsIds - Array of card IDs in user's order
 * @param {number} roundId - The round ID
 * @param {boolean|null} isDemo - Whether this is a demo game (null to skip validation)
 * @param {number|null} userId - The user ID (null for demo games)
 * @returns {Promise<Object>} Response object with game record and game status
 * @throws {ErrorDTO} If game is not found, ended, or in wrong round
 */
export async function handleCheckAnswer(
  gameId,
  cardsIds,
  roundId,
  isDemo = null,
  userId = null
) {
  const respondedAt = dayjs();

  let game = await validateGameAccess(gameId, isDemo, userId);

  if (game.roundNum != roundId) {
    throw ErrorDTO.badRequest(`Game ${gameId} is not in round ${roundId}`);
  }
  if (game.isEnded) {
    const gameType = game.isDemo ? "Demo game" : "Game";
    throw ErrorDTO.badRequest(`${gameType} ${gameId} has already ended`);
  }

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

  let isCorrect = false;
  if (!cardsIds || cardsIds.length === 0) {
    isCorrect = false;
    currentRecord.wasGuessed = false;
  } else {
    const evaluation = evaluateUserAnswer(game, cardsIds);
    isCorrect = evaluation.isCorrect;
    currentRecord.wasGuessed = isCorrect;
  }

  if (!isCorrect) {
    game.livesRemaining -= 1;
  }

  await dao.updateGameRecord(
    currentRecord.id,
    currentRecord.wasGuessed,
    currentRecord.requestedAt,
    currentRecord.respondedAt
  );

  game = await checkAndUpdateGameEnding(game);

  const gameRecord = {
    card: isCorrect ? currentRecord.card.toJSON() : null,
    round: currentRecord.round,
    wasGuessed: currentRecord.wasGuessed,
  };

  const response = {
    gameRecord: gameRecord,
    isEnded: game.isEnded,
    livesRemaining: game.livesRemaining,
  };

  if (game.isDemo && game.isEnded) {
    try {
      await dao.deleteDemoGame(gameId);
    } catch (error) {
      console.error(`Failed to delete demo game ${gameId}:`, error);
    }
  }

  return response;
}
