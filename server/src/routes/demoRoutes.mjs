import express from 'express';
import ErrorDTO from '../models/errors.mjs';
import {
  handleValidationErrors,
  validateCardIds,
  validateGameId,
} from "../middleware/validationMiddleware.mjs";
import {
  createNewGameWithSetup,
  handleDrawCard,
  handleCheckAnswer
} from "../services/gameServices.mjs";
import dayjs from "dayjs";

const router = express.Router();

// =================== ROUTE HANDLERS ===================

// POST /api/v1/demos - Create a new demo game
// expected empty body, so no validators needed
/*
response: res.json(demoGame.toJSON()) - the demo game json with first card with all details.
{
  "id": 1,
  "userId": null,
  "createdAt": "2023-10-01T12:00:00Z",
  "roundNum": 0,
  "isEnded": false,
  "isDemo": true,
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
    }
  ]
}
*/
router.post(
  "/",
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

// GET /api/v1/demos/:gameId/draw - Get next card to be played in the demo game obscured
// expected empty body, so no validators needed
/* response: res.json({
  game: game.toJSON(),
  nextCard: nextCard.toJSONWithoutMiseryIndex()
})
{
  game: {
    "id": 1,
    "createdAt": "2023-10-01T12:00:00Z",
    "roundNum": 1,
    "isEnded": false,
    "isDemo": true,
    "records": []
  },
  "nextCard": {
    "id": 5,
    "name": "Card Name",
    "imageFilename": "http://example.com/image.jpg"
  }
}

response if demo game is ended: res.json({
  game: game.toJSON(),
  nextCard: null
})
{
  game: {
    "id": 1,
    "createdAt": "2023-10-01T12:00:00Z",
    "roundNum": 1,
    "isEnded": true,
    "isDemo": true,
    "records": []
  },
  nextCard: null // No next card if game is ended
}
*/
router.post(
  "/:gameId/draw",
  validateGameId,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { gameId } = req.params;
      // Demo games: isDemo=true, userId=null
      const response = await handleDrawCard(gameId, true, null);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/demos/:gameId/check - Check answer for the current demo game round
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
      
      // Demo games: isDemo=true, userId=null
      const response = await handleCheckAnswer(gameId, cardsIds, true, null);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
