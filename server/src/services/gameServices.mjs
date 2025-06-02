// filepath: gameServices.mjs
import ErrorDTO from '../models/errors.mjs';
import * as dao from '../dao/dao.mjs';
import CONFIG from '../config/config.mjs';

// =================== GAME SERVICES ===================

// --- Game Validation & Data Access ---

/**
 * Validates that a game exists and returns it
 * @param {number|string} gameId - The game ID to validate
 * @returns {Promise<Object>} The game object
 * @throws {ErrorDTO} If game not found
 */
export async function validateGameExists(gameId) {
  const game = await dao.getGameById(parseInt(gameId));
  if (!game) {
    throw ErrorDTO.notFound(`Game with ID ${gameId} not found`);
  }
  return game;
}

/**
 * Attaches card details to game records
 * @param {Array} records - Array of game records
 * @returns {Promise<Array>} Records with attached card details
 */
export async function attachCardDetailsToRecords(records) {
  await Promise.all(records.map(async (record) => {
    const card = await dao.getCardById(record.cardId);
    record.card = card;
  }));
  return records;
}

/**
 * Gets a game with properly masked records based on game state
 * @param {number|string} gameId - The game ID
 * @param {number|null} maxRecords - Maximum number of records to show
 * @param {boolean} hideCurrentCard - Whether to hide misery index for current card
 * @returns {Promise<Object>} Game object with masked records
 */
export async function getGameWithMaskedRecords(gameId, maxRecords = null, hideCurrentCard = false) {
  const game = await validateGameExists(gameId);
  const records = await dao.getGameRecordsByGameId(parseInt(gameId));
  
  if (!records || records.length === 0) {
    throw ErrorDTO.notFound(`No records found for game with ID ${gameId}`);
  }

  // Determine how many records to show
  const recordsToShow = maxRecords || (3 + game.roundNum);
  const maskedRecords = records.slice(0, recordsToShow);
  
  // Attach card details
  await attachCardDetailsToRecords(maskedRecords);
  
  // Hide misery index for current round card if needed
  if (hideCurrentCard && !game.isEnded && maskedRecords.length > 0) {
    const currentCardIndex = 3 + game.roundNum;
    if (maskedRecords[currentCardIndex]) {
      maskedRecords[currentCardIndex].card.miseryIndex = null;
    }
  }
  
  game.records = maskedRecords;
  return game;
}

// --- Game Creation Utilities ---

/**
 * Generates unique random card IDs
 * @param {number} count - Number of unique IDs to generate
 * @param {number} totalCards - Total number of available cards
 * @returns {Array<number>} Array of unique card IDs
 */
export function generateUniqueCardIds(count, totalCards) {
  const cardIndices = new Set();
  while (cardIndices.size < count) {
    const randomIndex = crypto.randomInt(0, totalCards);
    cardIndices.add(randomIndex);
  }
  return [...cardIndices];
}

/**
 * Creates game records for a new game
 * @param {number} gameId - The game ID
 * @param {Array<number>} cardIds - Array of card IDs
 * @returns {Promise<void>}
 */
export async function createGameRecords(gameId, cardIds) {
  await Promise.all(
    cardIds.map((cardId, index) => {
      const roundNumber = index < 3 ? 0 : index - 2;
      return dao.createGameRecord(gameId, cardId, roundNumber);
    })
  );
}

/**
 * Creates a new game with complete initial setup
 * @param {number} userId - The user ID
 * @param {string} createdAt - Creation timestamp
 * @returns {Promise<Object>} Complete game object with initial state
 */
export async function createNewGameWithSetup(userId, createdAt) {
  // 1. Create game
  const gameId = await dao.createGame(userId, createdAt, false);
  
  // 2. Generate random cards and create records
  const cardIds = generateUniqueCardIds(6, CONFIG.CARDS_NUMBER);
  await createGameRecords(gameId, cardIds);
  
  // 3. Get game with initial state (4 cards, mask the 4th)
  const game = await getGameWithMaskedRecords(gameId, 4, false);
  
  // 4. Manually mask the 4th card for initial state
  if (game.records.length > 3) {
    game.records[3].card.miseryIndex = null;
  }
  
  return game;
}

// --- Route Response Helpers ---

/**
 * Gets game status for API response
 * @param {number|string} gameId - The game ID
 * @returns {Promise<Object>} Game status with properly masked data
 */
export async function getGameStatus(gameId) {
  return await getGameWithMaskedRecords(gameId, null, true);
}

/**
 * Gets user's game history
 * @param {number|string} userId - The user ID
 * @returns {Promise<Array>} Array of user's games with records
 */
export async function getUserGameHistory(userId) {
  return await dao.getGamesWithRecords(parseInt(userId));
}

// --- Game Logic & Evaluation ---

/**
 * Checks if game should end and updates game state accordingly
 * @param {Object} game - The game object
 * @returns {Promise<Object>} Updated game object
 */
export async function checkAndUpdateGameEnd(game) {
  const isLastRound = (game.isDemo && game.roundNum >= CONFIG.DEMO_ROUNDS) ||
                     (!game.isDemo && game.roundNum >= CONFIG.FULL_ROUNDS);
  
  if (isLastRound) {
    await dao.updateGame(game.id, game.roundNum, true);
    game.isEnded = true;
  }
  return game;
}

/**
 * Gets cards for evaluation, sorted by misery index
 * @param {number|string} gameId - The game ID
 * @param {number} roundNum - Current round number
 * @returns {Promise<Array<number>>} Array of card IDs sorted by misery index (ascending)
 */
export async function getCardsForEvaluation(gameId, roundNum) {
  const records = await dao.getGameRecordsByGameId(parseInt(gameId));
  if (!records || records.length === 0) {
    throw ErrorDTO.notFound(`No records found for game with ID ${gameId}`);
  }
  
  // Get cards that haven't been considered yet
  const unconsidered = records
    .slice(0, 3 + roundNum)
    .filter(record => !record.wasConsidered);
  
  // Get card details with misery index
  const cardsWithMisery = await Promise.all(
    unconsidered.map(async (record) => {
      const card = await dao.getCardById(record.cardId);
      return { id: card.id, miseryIndex: card.miseryIndex };
    })
  );
  
  // Return cards sorted by misery index (ascending)
  return cardsWithMisery
    .sort((a, b) => a.miseryIndex - b.miseryIndex)
    .map(card => card.id);
}

/**
 * Evaluates user's answer against correct order
 * @param {number|string} gameId - The game ID
 * @param {number|string} roundId - The round ID
 * @param {Array<number>} userAnswer - User's card order
 * @param {Array<number>} correctOrder - Correct card order
 * @returns {Promise<Object>} Evaluation result with isCorrect and wasConsidered flags
 */
export async function evaluateAnswer(gameId, roundId, userAnswer, correctOrder) {
  let isCorrect = false;
  let wasConsidered = true;
  
  if (userAnswer.length !== correctOrder.length) {
    // User didn't consider all cards
    wasConsidered = false;
  } else {
    // Check if order is correct
    isCorrect = userAnswer.every((id, index) => id === correctOrder[index]);
  }
  
  await dao.updateGameRecord(parseInt(gameId), parseInt(roundId), isCorrect, wasConsidered);
  return { isCorrect, wasConsidered };
}

/**
 * Gets updated game state for response after round submission
 * @param {number|string} gameId - The game ID
 * @returns {Promise<Object>} Updated game state with relevant records
 */
export async function getUpdatedGameState(gameId) {
  const game = await dao.getGameById(parseInt(gameId));
  const records = await dao.getGameRecordsByGameId(parseInt(gameId));
  
  // Only show relevant records
  const relevantRecords = records.slice(0, 3 + game.roundNum);
  
  // Add card details to each record
  await Promise.all(relevantRecords.map(async (record) => {
    const card = await dao.getCardById(record.cardId);
    record.card = card;
  }));
  
  // Hide misery index for current round card if game continues
  if (!game.isEnded && relevantRecords.length > 0) {
    const currentCardIndex = 3 + game.roundNum - 1;
    if (relevantRecords[currentCardIndex]) {
      relevantRecords[currentCardIndex].card.miseryIndex = null;
    }
  }
  
  game.records = relevantRecords;
  return game;
}
