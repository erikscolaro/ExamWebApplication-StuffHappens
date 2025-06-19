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
  handleCheckAnswer,
} from "../services/gameServices.mjs";
import dayjs from "dayjs";
import { getGamesWithRecordsAndCards } from "../dao/dao.mjs";

const router = express.Router();

// =================== AUTHENTICATED GAME ROUTES ===================

// GET /api/v1/users/:userId/games - Get game history for authenticated user
// Request: No body - userId taken from authenticated user session
// Response: Object with history array containing all games with complete records and cards
router.get("/", handleValidationErrors, async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const games = await getGamesWithRecordsAndCards(parseInt(userId));
    res.status(200).json({ history: games });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/users/:userId/games/new - Create a new game for authenticated user
// Request: Empty body - userId taken from authenticated user session
// Response: Basic game object without records (records are created in database but not returned)
/*
response: Basic game object without records (records are created in database but not returned)
{
  "id": 1,
  "createdAt": "2023-10-01T12:00:00Z",
  "roundNum": 0,
  "isEnded": false,
  "isDemo": false,
  "livesRemaining": 3,
  "records": []
}
*/
router.post("/new", handleValidationErrors, async (req, res, next) => {
  try {
    const userId = parseInt(req.user.id);
    const createdAt = dayjs().toISOString();

    const game = await createNewGameWithSetup(userId, createdAt, false);

    res.status(201).json(game);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/users/:userId/games/:gameId/round/:roundId/begin - Start a round and get next card (without misery index)
// Request: Empty body (gameId and roundId in params, userId from authenticated user)
// Response: Game object (without records) + next card (without misery index)
/* response: Game object (without records) + next card (without misery index)
{
  "game": {
    "id": 1,
    "createdAt": "2023-10-01T12:00:00Z",
    "roundNum": 1,
    "isEnded": false,
    "isDemo": false,
    "livesRemaining": 3
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
      const { gameId, roundId } = req.params;
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
  "isEnded": false,
  "livesRemaining": 3
}

response if incorrect answer:
{
  "gameRecord": {
    "card": null,  // No card details provided for wrong answers
    "round": 1,
    "wasGuessed": false
  },
  "isEnded": false,  // true if game ended due to no lives remaining
  "livesRemaining": 2
}

response if user did not answer in time (timeout):
{
  "gameRecord": {
    "card": null,
    "round": 1,
    "wasGuessed": false
  },
  "isEnded": false,  // true if game ended due to no lives remaining
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
      const { cardsIds } = req.body ? req.body : { cardsIds: null };
      const userId = parseInt(req.user.id);

      // Regular games: isDemo=false, userId from auth
      const response = await handleCheckAnswer(
        gameId,
        cardsIds,
        roundId,
        false,
        userId
      );
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
