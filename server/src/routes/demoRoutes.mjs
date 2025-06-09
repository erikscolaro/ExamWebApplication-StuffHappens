import express from 'express';
import ErrorDTO from '../models/errors.mjs';
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

const router = express.Router();

// =================== ROUTE HANDLERS ===================

// POST /api/v1/demos/new - Create a new demo game
// expected empty body, so no validators needed
/*
response: Basic demo game object without records (records are created in database but not returned)
{
  "id": 1,
  "createdAt": "2023-10-01T12:00:00Z",
  "roundNum": 0,
  "isEnded": false,
  "isDemo": true,
  "records": []
}
*/
router.post(
  "/new",
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const createdAt = dayjs().toISOString();
      // For demo games, userId is null and isDemo is true
      const demoGame = await createNewGameWithSetup(null, createdAt, true);
      
      res.status(201).json(demoGame);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/demos/:gameId/round/:roundId/begin - Start a round and get next card for demo game
// request: empty body (gameId and roundId in params)
/* response: Game state with filtered records + next card without misery index
{
  "game": {
    "id": 1,
    "createdAt": "2023-10-01T12:00:00Z",
    "roundNum": 1,
    "isEnded": false,
    "isDemo": true,
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

response if demo game is ended:
Returns an error status indicating the game has already ended
*/
router.post(
  "/:gameId/round/:roundId/begin",
  validateGameId,
  validateRoundId,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { gameId, roundId } = req.params;
      // Demo games: isDemo=true, userId=null
      const response = await handleDrawCard(gameId, roundId, true, null);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/demos/:gameId/round/:roundId/verify - Submit answer for current demo game round
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
      
      // Demo games: isDemo=true, userId=null
      const response = await handleCheckAnswer(gameId, cardsIds, roundId, true, null);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
