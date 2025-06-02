import express from 'express';
import ErrorDTO from '../models/errors.mjs';
import * as dao from '../dao/dao.mjs';
 
const router = express.Router();

// GET /api/v1/users/:userId/games - Get game history for user
router.get('/users/:userId/games', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Validate userId parameter
    if (!userId || isNaN(parseInt(userId))) {
      return next(ErrorDTO.badRequest("Invalid user ID provided"));
    }

    // Get games with records for the user
    const games = await dao.getGamesWithRecords(parseInt(userId));
    
    res.json({
      message: "Games retrieved successfully",
      data: games
    });

  } catch (error) {
    next(ErrorDTO.internalServerError("Failed to retrieve game history"));
  }
});

// POST /api/v1/users/:userId/games - Create a new game
router.post('/users/:userId/games', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Validate userId parameter
    if (!userId || isNaN(parseInt(userId))) {
      return next(ErrorDTO.badRequest("Invalid user ID provided"));
    }

    // TODO: Implement game creation logic
    // - Validate user exists
    // - Create new game record
    // - Initialize game state (cards, rounds, etc.)
    
    res.status(201).json({
      message: "Game created successfully",
      data: {
        gameId: null, // TODO: Return actual game ID
        status: "created"
      }
    });

  } catch (error) {
    next(ErrorDTO.internalServerError("Failed to create game"));
  }
});

// GET /api/v1/users/:userId/games/:gameId - Get specific game status
router.get('/users/:userId/games/:gameId', async (req, res, next) => {
  try {
    const { userId, gameId } = req.params;
    
    // Validate parameters
    if (!userId || isNaN(parseInt(userId))) {
      return next(ErrorDTO.badRequest("Invalid user ID provided"));
    }
    if (!gameId || isNaN(parseInt(gameId))) {
      return next(ErrorDTO.badRequest("Invalid game ID provided"));
    }

    // TODO: Implement game status retrieval
    // - Validate user owns the game
    // - Get game details with current state
    // - Return game progress, current round, etc.
    
    res.json({
      message: "Game status retrieved successfully",
      data: {
        gameId: parseInt(gameId),
        userId: parseInt(userId),
        status: "in_progress", // TODO: Get actual status
        currentRound: null, // TODO: Get current round
        records: [] // TODO: Get game records
      }
    });

  } catch (error) {
    next(ErrorDTO.internalServerError("Failed to retrieve game status"));
  }
});

// PUT /api/v1/users/:userId/games/:gameId/rounds/:roundId - Submit answer for a round
router.put('/users/:userId/games/:gameId/rounds/:roundId', async (req, res, next) => {
  try {
    const { userId, gameId, roundId } = req.params;
    const { answer } = req.body;
    
    // Validate parameters
    if (!userId || isNaN(parseInt(userId))) {
      return next(ErrorDTO.badRequest("Invalid user ID provided"));
    }
    if (!gameId || isNaN(parseInt(gameId))) {
      return next(ErrorDTO.badRequest("Invalid game ID provided"));
    }
    if (!roundId || isNaN(parseInt(roundId))) {
      return next(ErrorDTO.badRequest("Invalid round ID provided"));
    }
    if (answer === undefined || answer === null) {
      return next(ErrorDTO.badRequest("Answer is required"));
    }

    // TODO: Implement answer submission logic
    // - Validate user owns the game
    // - Validate round exists and is current
    // - Process the answer (higher/lower/equal)
    // - Update game state
    // - Return result and next state
    
    res.json({
      message: "Answer submitted successfully",
      data: {
        roundId: parseInt(roundId),
        answer: answer,
        isCorrect: null, // TODO: Calculate if answer is correct
        nextCard: null, // TODO: Return next card if game continues
        gameStatus: "in_progress" // TODO: Update game status
      }
    });

  } catch (error) {
    next(ErrorDTO.internalServerError("Failed to submit answer"));
  }
});

export default router;
