import express from 'express';
import ErrorDTO from '../models/errors.mjs';
import { body } from 'express-validator';
import {
  handleValidationErrors,
  validateGameCreation,
  validateUserIdMatchesSession,
} from "../middleware/validationMiddleware.mjs";
import { Game, GameRecord } from '../models/game.mjs';
import {
  validateGameExists,
  createNewGameWithSetup,
  getGameStatus,
  getUserGameHistory,
  checkAndUpdateGameEnd,
  getCardsForEvaluation,
  evaluateAnswer,
  getUpdatedGameState
} from '../services/gameServices.mjs';
import * as dao from '../dao/dao.mjs';

const router = express.Router();

// =================== ROUTE HANDLERS ===================

// GET /api/v1/users/:userId/games - Get game history for user
router.get('/users/:userId/games', 
  validateUserIdMatchesSession,
  handleValidationErrors,  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const games = await getUserGameHistory(userId);
      res.status(200).json({ history: games });
    } catch (error) {
      next(ErrorDTO.internalServerError(error.message));
    }
});

// POST /api/v1/users/:userId/games - Create a new game
router.post(
  "/users/:userId/games",
  validateUserIdMatchesSession,
  validateGameCreation,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const { createdAt } = req.body;

      const game = await createNewGameWithSetup(userId, createdAt);
      res.status(201).json(game);
    } catch (error) {
      console.error(error);
      next(ErrorDTO.internalServerError("Failed to create game"));
    }
  }
);

// GET /api/v1/users/:userId/games/:gameId - Get specific game status
router.get(
  "/users/:userId/games/:gameId",
  validateUserIdMatchesSession,
  handleValidationErrors,  async (req, res, next) => {
    try {
      const { gameId } = req.params;
      const game = await getGameStatus(gameId);
      res.status(200).json(game);
    } catch (error) {
      next(ErrorDTO.internalServerError("Failed to retrieve game status"));
    }  }
);

// PUT /api/v1/users/:userId/games/:gameId/rounds/:roundId - Submit answer for a round
router.put(
  "/users/:userId/games/:gameId/rounds/:roundId",
  validateUserIdMatchesSession,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { gameId, roundId } = req.params;
      const { answer } = req.body.cardsIds;

      // 1. Validate game exists
      let game = await validateGameExists(gameId);
      
      // 2. Check if game should end and update if needed
      game = await checkAndUpdateGameEnd(game);
      
      // 3. Get correct card order for evaluation
      const correctOrder = await getCardsForEvaluation(gameId, game.roundNum);
      
      // 4. Evaluate user's answer
      const evaluation = await evaluateAnswer(gameId, roundId, answer, correctOrder);
      
      // 5. Advance to next round
      await dao.updateGame(game.id, game.roundNum + 1, game.isEnded);
      
      // 6. Get updated game state for response
      const updatedGame = await getUpdatedGameState(gameId);
      
      // 7. Send response
      res.status(200).json({
        message: "Answer submitted successfully",
        game: updatedGame,
        evaluation: evaluation,
        isGameEnded: updatedGame.isEnded
      });

    } catch (error) {
      if (error instanceof ErrorDTO) {
        next(error);
      } else {
        next(ErrorDTO.internalServerError("Failed to submit answer"));
      }
    }
  }
);

export default router;
