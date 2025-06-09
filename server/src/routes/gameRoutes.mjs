import express from "express";
import {
  handleValidationErrors,
  validateCardIds,
  validateGameId,
  validateRoundId,
} from "../middleware/validationMiddleware.mjs";
import {
  createNewGameWithSetup,
  handleDrawCard,
  handleCheckAnswer
} from "../services/gameServices.mjs";
import dayjs from "dayjs";
import { getGamesWithRecordsAndCards } from "../dao/dao.mjs";

const router = express.Router();

// =================== ROUTE HANDLERS ===================

// GET /api/v1/users/:userId/games - Get game history for authenticated user
// request: no params, no body (userId taken from authenticated user)
// response: { history: Array<Game> } where each game contains complete records and cards
router.get(
  "/",
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = parseInt(req.user.id);
      const games = await getGamesWithRecordsAndCards(parseInt(userId));
      res.status(200).json({ history: games });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/users/:userId/games/new - Create a new game for authenticated user
// request: empty body (userId taken from authenticated user)
/*
response: Basic game object without records (records are created in database but not returned)
{
  "id": 1,
  "createdAt": "2023-10-01T12:00:00Z",
  "roundNum": 0,
  "isEnded": false,
  "isDemo": false,
  "records": []
}
*/
router.post(
  "/new",
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = parseInt(req.user.id);
      const createdAt = dayjs().toISOString();

      const game = await createNewGameWithSetup(userId, createdAt, false);
      
      res.status(201).json(game);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/users/:userId/games/:gameId/round/:roundId/begin - Start a round and get next card (without misery index)
// request: empty body (gameId and roundId in params, userId from authenticated user)
/* response: Game state with filtered records + next card without misery index
{
  "game": {
    "id": 1,
    "createdAt": "2023-10-01T12:00:00Z",
    "roundNum": 1,
    "isEnded": false,
    "isDemo": false,
    "records": [
      // Only cards from previous rounds where timedOut = false
      {
        "card": {
          "id": 5,
          "name": "Card Name",
          "imageFilename": "image5.jpg",
          "miseryIndex": 10
        },
        "round": 0,
        "wasGuessed": true,
        "timedOut": false
      }
      // ... other cards from round < current roundNum where timedOut = false
    ]
  },
  "nextCard": {
    "id": 8,
    "name": "Next Card Name",
    "imageFilename": "image8.jpg"
    // Note: no miseryIndex included
  }
}

response if game is ended:
Returns an error status indicating the game has already ended
*/
router.post(
  "/:gameId/round/:roundId/begin",
  validateGameId,
  validateRoundId,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { gameId, roundId} = req.params;
      const userId = parseInt(req.user.id);
      // Regular games: isDemo=false, userId from auth
      const response = await handleDrawCard(gameId, roundId, false, userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/users/:userId/games/:gameId/round/:roundId/verify - Submit answer for current game round
/*
request body:
{
  "cardsIds": [1, 2, 3, 4]  // Array of card IDs in user's chosen order
}

response if correct answer:
{
  "isCorrect": true,
  "correctOrder": [1, 2, 3, 4]  // Cards sorted by misery index (ascending)
}

response if incorrect answer:
{
  "isCorrect": false,
  "correctOrder": [3, 1, 4, 2]  // Correct order sorted by misery index (ascending)
}

response if user did not answer in time (timeout):
{
  "isCorrect": false
  // Note: no correctOrder provided for timeout
}
*/
router.post(
  "/:gameId/round/:roundId/verify",
  validateGameId,
  validateRoundId,
  validateCardIds,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { gameId, roundId } = req.params;
      const { cardsIds } = req.body;
      const userId = parseInt(req.user.id);
      
      // Regular games: isDemo=false, userId from auth
      const response = await handleCheckAnswer(gameId, cardsIds, roundId, false, userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
