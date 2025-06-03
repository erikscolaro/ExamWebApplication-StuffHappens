// filepath: gameServices.mjs
import ErrorDTO from '../models/errors.mjs';
import * as dao from '../dao/dao.mjs';
import CONFIG from '../config/config.mjs';
import { Game } from '../models/game.mjs';

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
 * @returns {Promise<Game>} Complete game object with initial state
 */
export async function createNewGameWithSetup(userId, createdAt, isDemo = false) {
  // 1. Create game with initial state round 0 and not ended
  const gameId = await dao.createGame(userId, createdAt, isDemo);
  
  // 2. Generate random cards and create records
  const cardIds = generateUniqueCardIds(isDemo?4:6, CONFIG.CARDS_NUMBER);
  
  // 3. Create game records
  await Promise.all(
    cardIds.map((cardId, index) => {
      const roundNumber = index < 3 ? 0 : index - 2;
      return dao.createGameRecord(gameId, cardId, roundNumber, roundNumber==0?true:null);
    })
  );

  // 4. Get complete game state
  const game = await dao.getGameWithRecordsAndCards(gameId);
  if (!game) {
    throw ErrorDTO.notFound(`Game with ID ${gameId} not found after creation`);
  }

  return game;
}

// --- Route Response Helpers ---

/**
 * Gets user's game history
 * @param {number|string} userId - The user ID
 * @returns {Promise<Array<Game>>} Array of user's games with records
 */
export async function getUserGameHistory(userId) {
  return await dao.getGamesWithRecordsAndCards(parseInt(userId));
}

// --- Game Logic & Evaluation ---

/**
 * Checks if game should end and updates game state accordingly
 * @param {Game} game - The game object
 * @returns {Promise<Game>} Updated game object
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
 * Evaluates user answer by comparing with correct card order by misery index
 * @param {Game} game - The game object with records
 * @param {Array<number>} userAnswer - Array of card IDs in user's chosen order
 * @returns {boolean} Evaluation result with isCorrect flag and correct order
 */
export function evaluateUserAnswer(game, userAnswer) {
  // Filter records: wasGussedInTime !== false (strict) and round <= game.roundNum
  const validRecords = game.records.filter(record => 
    record.wasguessedintime !== false && record.round <= game.roundNum
  );
  
  // Map records to cards, sort by misery index ascending, then map to card IDs
  const correctOrderedIds = validRecords
    .map(record => record.cardObject)
    .sort((a, b) => a.miseryindex - b.miseryindex)
    .map(card => card.id);

  // Compare arrays
  const isCorrect =
    correctOrderedIds.length === userAnswer.length &&
    correctOrderedIds.every((id, index) => id === userAnswer[index]);
    if (isCorrect) {
    // User answer is correct
    return {
      isCorrect: true,
      correctOrder: correctOrderedIds,
    };
  } else {
    // User answer is incorrect
    return {
      isCorrect: false,
      correctOrder: correctOrderedIds
    };
  }
}

