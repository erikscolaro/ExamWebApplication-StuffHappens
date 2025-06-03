import express from "express";
import ErrorDTO from "../models/errors.mjs";
import {
  handleValidationErrors,
  validateCardIds,
  validateGameId,
} from "../middleware/validationMiddleware.mjs";
import {
  createNewGameWithSetup,
  getUserGameHistory,
  handleDrawCard,
  handleCheckAnswer
} from "../services/gameServices.mjs";
import dayjs from "dayjs";

const router = express.Router();

// =================== ROUTE HANDLERS ===================

// GET /api/v1/users/:userId/games - Get game history for user
// request: username in params, no body
// response: array of games with records
router.get(
  "/",
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = parseInt(req.user.id);
      const games = await getUserGameHistory(userId);
      res.status(200).json({ history: games });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/users/:userId/games - Create a new game
// expected empty body, so no validators needed
/*
response: game.toJSON() - the game json with first 3 cards with all details.
{
  "id": 1,
  "userId": 1,
  "createdAt": "2023-10-01T12:00:00Z",
  "roundNum": 0,
  "isEnded": false,
  "isDemo": false,
  "records": [
    {
      "card": {
        "id": 5,
        "name": "Card Name",
        "imageFilename": "http://example.com/image.jpg",
        "miseryIndex": 10
      },
      "round": 0,
      "wasGuessed": null,
      "timedOut": null
    }, {...}, {...}
  ]
}
*/

router.post(
  "/",
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

// GET /api/v1/users/:userId/games/:gameId/draw - Get next card to be played in the game obscured
// expected empty body, so no validators needed
/* response:
{
  game: {
    "id": 1,
    "createdAt": "2023-10-01T12:00:00Z",
    "roundNum": 1,
    "isEnded": false,
    "isDemo": false,
    "records": []
  },
  "nextCard": {
    "id": 5,
    "name": "Card Name",
    "imageFilename": "http://example.com/image.jpg"
  }
}

response if game is ended:
{
  game: {
    "id": 1,
    "createdAt": "2023-10-01T12:00:00Z",
    "roundNum": 3,
    "isEnded": true,
    "isDemo": false,
    "records": []
  },
  nextCard: null // No next card if game is ended
}
*/
router.get(
  "/:gameId/draw",
  validateGameId,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { gameId } = req.params;
      const userId = parseInt(req.user.id);
      // Regular games: isDemo=false, userId from auth
      const response = await handleDrawCard(gameId, false, userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/users/:userId/games/:gameId/check - Check answer for the current game round
/*
expected body:
{
  "cardsIds": [1, 2, 3, 4]
}
response if correct answer:
{
  "isCorrect": true,
  "correctOrder": [1, 2, 3, 4]
}
response if incorrect answer:
{
  "isCorrect": false,
  "correctOrder": [4, 3, 2, 1] 
}
response if user did not answer in time:
{
  "isCorrect": false
}
*/
router.put(
  "/:gameId/check",
  validateGameId,
  validateCardIds,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { gameId } = req.params;
      const { cardsIds } = req.body;
      const userId = parseInt(req.user.id);
      
      // Regular games: isDemo=false, userId from auth
      const response = await handleCheckAnswer(gameId, cardsIds, false, userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
