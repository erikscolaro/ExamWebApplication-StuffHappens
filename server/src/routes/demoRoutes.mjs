import express from "express";
import ErrorDTO from "../models/errors.mjs";
import {
  handleValidationErrors,
  validateCardIds,
  validateGameId,
  validateRoundId,
} from "../middleware/validationMiddleware.mjs";
import {
  createNewGameWithSetup,
  handleDrawCard,
  handleCheckAnswer,
} from "../services/gameServices.mjs";
import dayjs from "dayjs";

const router = express.Router();

// =================== DEMO GAME ROUTES ===================

// POST /api/v1/demos/new - Create a new demo game
// Request: Empty body - no authentication required for demo games
// Response: Basic demo game object without records (records are created in database but not returned)
/*
response: Basic demo game object without records (records are created in database but not returned)
{
  "id": 1,
  "createdAt": "2023-10-01T12:00:00Z",
  "roundNum": 0,
  "isEnded": false,
  "isDemo": true,
  "livesRemaining": 3,
  "records": []
}
*/
router.post("/new", handleValidationErrors, async (req, res, next) => {
  try {
    const createdAt = dayjs().toISOString();
    // For demo games, userId is null and isDemo is true
    const demoGame = await createNewGameWithSetup(null, createdAt, true);

    res.status(201).json(demoGame);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/demos/:gameId/round/:roundId/begin - Start a round and get next card for demo game
// Request: Empty body (gameId and roundId in params) - no authentication required
// Response: Game object (without records) + next card (without misery index)
/* response: Game object (without records) + next card (without misery index)
{
  "game": {
    "id": 1,
    "createdAt": "2023-10-01T12:00:00Z",
    "roundNum": 1,
    "isEnded": false,
    "isDemo": true,
    "livesRemaining": 3
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
// Request: Body with cardsIds array - no authentication required
// Response: Game record with evaluation result, game status and lives remaining
/*
request body:
{
  "cardsIds": [1, 2, 3, 4]  // Array of card IDs in user's chosen order
}

response if correct answer:
{
  "gameRecord": {
    "card": {
      "id": 8,
      "name": "Card Name",
      "imageFilename": "image8.jpg",
      "miseryIndex": 25.5
    },
    "round": 1,
    "wasGuessed": true
  },
  "isEnded": true,  // Demo games always end after 1 round
  "livesRemaining": 3
}

response if incorrect answer:
{
  "gameRecord": {
    "card": null,  // No card details provided for wrong answers
    "round": 1,
    "wasGuessed": false
  },
  "isEnded": true,  // Demo games always end after 1 round
  "livesRemaining": 2
}

response if user did not answer in time (timeout):
{
  "gameRecord": {
    "card": null,
    "round": 1,
    "wasGuessed": false
  },
  "isEnded": true,  // Demo games always end after 1 round
  "livesRemaining": 2
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
      const response = await handleCheckAnswer(
        gameId,
        cardsIds,
        roundId,
        true,
        null
      );
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
