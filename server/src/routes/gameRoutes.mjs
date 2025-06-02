import express from 'express';
import ErrorDTO from '../models/errors.mjs';
import { listGames, createGame, listGameRecords, createGameRecord } from '../dao/dao.mjs';

const router = express.Router();

// GET /api/v1/users/:userId/games - Get game history for user
router.get('/users/:userId/games', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Check if the requesting user can access this user's games
    if (req.user.id !== parseInt(userId)) {
      return next(ErrorDTO.forbidden("You can only access your own games."));
    }
    
    const games = await listGames(req.user.id);
    res.json({ games });
  } catch (error) {
    next(ErrorDTO.internalServerError("Failed to retrieve game history."));
  }
});

// POST /api/v1/users/:userId/games - Create a new game
router.post('/users/:userId/games', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Check if the requesting user can create games for this user
    if (req.user.id !== parseInt(userId)) {
      return next(ErrorDTO.forbidden("You can only create games for yourself."));
    }
    
    const gameId = await createGame(req.user.username);
    res.status(201).json({ 
      gameId,
      message: "Game created successfully"
    });
  } catch (error) {
    next(ErrorDTO.internalServerError("Failed to create game."));
  }
});

// GET /api/v1/users/:userId/games/:gameId - Get specific game status
router.get('/users/:userId/games/:gameId', async (req, res, next) => {
  try {
    const { userId, gameId } = req.params;
    
    // Check if the requesting user can access this user's games
    if (req.user.id !== parseInt(userId)) {
      return next(ErrorDTO.forbidden("You can only access your own games."));
    }
    
    const gameRecords = await listGameRecords(gameId);
    
    if (!gameRecords || gameRecords.length === 0) {
      return next(ErrorDTO.notFound("Game not found."));
    }
    
    res.json({ 
      gameId: parseInt(gameId),
      records: gameRecords 
    });
  } catch (error) {
    next(ErrorDTO.internalServerError("Failed to retrieve game status."));
  }
});

// PUT /api/v1/users/:userId/games/:gameId/rounds/:roundId - Submit answer for a round
router.put('/users/:userId/games/:gameId/rounds/:roundId', async (req, res, next) => {
  try {
    const { userId, gameId, roundId } = req.params;
    const { answer } = req.body;
    
    // Check if the requesting user can play this user's games
    if (req.user.id !== parseInt(userId)) {
      return next(ErrorDTO.forbidden("You can only play your own games."));
    }
    
    // Validate answer
    if (answer === undefined || answer === null) {
      return next(ErrorDTO.badRequest("Answer is required."));
    }
    
    // Create game record for this round
    const recordId = await createGameRecord(gameId, roundId, answer);
    
    res.json({ 
      roundId: parseInt(roundId),
      answer,
      recordId,
      message: "Answer submitted successfully"
    });
  } catch (error) {
    next(ErrorDTO.internalServerError("Failed to submit answer."));
  }
});

export default router;
