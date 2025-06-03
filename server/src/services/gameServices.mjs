// filepath: gameServices.mjs
import ErrorDTO from '../models/errors.mjs';
import * as dao from '../dao/dao.mjs';
import CONFIG from '../config/config.mjs';
import { Game } from '../models/game.mjs';
import crypto from 'crypto';
import dayjs from 'dayjs';

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
      const wasGuessed = roundNumber === 0 ? true : null;
      const timedOut = roundNumber === 0 ? false : null;
      return dao.createGameRecord(gameId, cardId, roundNumber, wasGuessed, timedOut);
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
  const validRecords = game.records.filter(
    (record) =>
      (record.timedOut === false && record.round <= game.roundNum)
  );
  
  // Map records to cards, sort by misery index ascending, then map to card IDs
  const correctOrderedIds = validRecords
    .map(record => record.card)
    .sort((a, b) => a.miseryIndex - b.miseryIndex)
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

// --- Route Handler Helpers ---

/**
 * Common logic for drawing the next card in a game
 * @param {number} gameId - The game ID
 * @param {boolean} isDemo - Whether this is a demo game (for validation)
 * @param {number|null} userId - The user ID (null for demo games)
 * @returns {Promise<Object>} Response object with game and nextCard
 */
export async function handleDrawCard(gameId, isDemo = null, userId = null) {
  // 1. Get game with complete records and cards
  const game = await dao.getGameWithRecordsAndCards(gameId);
  if (!game || !game.records || game.records.length === 0) {
    throw ErrorDTO.notFound(`Game with ID ${gameId} not found`);
  }

  // 2. validate game type if specified
  if (isDemo !== null && game.isDemo !== isDemo) {
    const gameType = isDemo ? "demo game" : "regular game";
    throw ErrorDTO.badRequest(`Game with ID ${gameId} is not a ${gameType}`);
  }

  // 3. SECURITY CHECK: Verify user authorization
  if (isDemo === false) {
    // For regular games, verify user owns the game
    if (!userId || game.userid !== userId) {
      throw ErrorDTO.forbidden(`Access denied: Game ${gameId} does not belong to user ${userId}`);
    }
  } else if (isDemo === true) {
    // For demo games, verify it's actually a demo (userId should be null)
    if (game.userid !== null) {
      throw ErrorDTO.forbidden(`Access denied: Game ${gameId} is not a demo game`);
    }
  }
  // 4. set game end state if needed and return if ended
  const updatedGame = await checkAndUpdateGameEnd(game);
  if (updatedGame.isEnded) {
    return {
      game: updatedGame.toJSON(),
      nextCard: null // No next card if game is ended
    };
  }

  // 5. increment round number
  game.roundNum += 1;
  await dao.updateGame(game.id, game.roundNum, game.isEnded);
  // 6. Extract the card for the current round (nextCard)
  const nextCardRecord = game.records.find(record => record.round === game.roundNum);
  if (!nextCardRecord || !nextCardRecord.card) {
    throw ErrorDTO.notFound(
      `No card found for game ${gameId} in round ${game.roundNum}`
    );
  }
  const nextCard = nextCardRecord.card;

  // 7. Update next card record with drawn datetime
  await dao.updateGameRecord(
    nextCardRecord.id,
    null,
    null,
    dayjs().toISOString(),
    null
  );

  // 8. Filter records in game: round < game.roundNum && timedOut = false
  game.records = game.records.filter(
    record => record.round < game.roundNum && record.timedOut === false
  );

  // 9. Prepare response with game state and next card
  return {
    game: game.toJSON(),
    nextCard: nextCard.toJSONWithoutMiseryIndex()
  };
}

/**
 * Common logic for checking user answers in a game
 * @param {number} gameId - The game ID
 * @param {Array<number>} cardsIds - Array of card IDs in user's order
 * @param {boolean} isDemo - Whether this is a demo game (for validation)
 * @param {number|null} userId - The user ID (null for demo games)
 * @returns {Promise<Object>} Response object with evaluation result
 */
export async function handleCheckAnswer(gameId, cardsIds, isDemo = null, userId = null) {
  // saved before all to minimize lag issues with async
  const respondedAt = dayjs();

  // 1. check if game exists
  const game = await dao.getGameWithRecordsAndCards(gameId);
  if (!game || !game.records || game.records.length === 0) {
    throw ErrorDTO.notFound(`Game with ID ${gameId} not found`);
  }
  
  // 2. validate game type and user authorization
  if (isDemo !== null && game.isDemo !== isDemo) {
    const gameType = isDemo ? "demo game" : "regular game";
    throw ErrorDTO.badRequest(`Game with ID ${gameId} is not a ${gameType}`);
  }

  // 3. SECURITY CHECK: Verify user authorization
  if (isDemo === false) {
    // For regular games, verify user owns the game
    if (!userId || game.userid !== userId) {
      throw ErrorDTO.forbidden(`Access denied: Game ${gameId} does not belong to user ${userId}`);
    }
  } else if (isDemo === true) {
    // For demo games, verify it's actually a demo (userId should be null)
    if (game.userid !== null) {
      throw ErrorDTO.forbidden(`Access denied: Game ${gameId} is not a demo game`);
    }
  }

  // 2. manage game end state
  if (game.isEnded) {
    const gameType = game.isDemo ? "Demo game" : "Game";
    throw ErrorDTO.badRequest(`${gameType} has already ended`);
  } 

  // 3. Check if the user answered in time
  let response = null;
  const currentRecord = game.records.find(
    (record) => record.round === game.roundNum
  );

  if (!currentRecord) {
    throw ErrorDTO.notFound(
      `No record found for game ${gameId} in round ${game.roundNum}`
    );
  }

  currentRecord.respondedAt = respondedAt.toISOString();      
  if (
    dayjs(currentRecord.respondedAt).diff(
      dayjs(currentRecord.requestedAt)
    ) > CONFIG.MAX_RESPONSE_TIME
  ) {
    // 3.1 User did not answer in time
    currentRecord.wasGuessed = false;
    currentRecord.timedOut = true;
    response = {
      isCorrect: false,
    };
  } else {
    // User has answered in time
    currentRecord.timedOut = false;
    // 3.2 Check if the user answer (as cards IDs) matches the true card IDs ordered by misery index
    const evaluationResult = evaluateUserAnswer(game, cardsIds);
    if (evaluationResult.isCorrect) {
      // 3.3 User answer is correct
      currentRecord.wasGuessed = true;
    } else {
      // 3.4 User answer is incorrect
      currentRecord.wasGuessed = false;
    }
    response = evaluationResult;
  }
  
  // 4. Update game record
  await dao.updateGameRecord(
    currentRecord.id,
    currentRecord.wasGuessed,
    currentRecord.timedOut,
    currentRecord.requestedAt,
    currentRecord.respondedAt
  );

  // 5. return response
  return response;
}

