import express from "express";
import ErrorDTO from "../models/errors.mjs";
import {
  handleValidationErrors,
  validateCardIds,
  validateGameId,
  validateUserIdMatchesSession,
} from "../middleware/validationMiddleware.mjs";
import {
  createNewGameWithSetup,
  getUserGameHistory,
  evaluateUserAnswer,
  checkAndUpdateGameEnd
} from "../services/gameServices.mjs";
import * as dao from "../dao/dao.mjs";
import dayjs from "dayjs";
import CONFIG from "../config/config.mjs";

const router = express.Router();

// =================== ROUTE HANDLERS ===================

// GET /api/v1/users/:userId/games - Get game history for user
// request: userId in params, no body
// response: array of games with records
router.get(
  "/",
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const games = await getUserGameHistory(userId);
      res.status(200).json({ history: games });
    } catch (error) {
      next(ErrorDTO.internalServerError(error.message));
    }
  }
);

// POST /api/v1/users/:userId/games - Create a new game
// expected empty body, so no validators needed
/*
response: the game json with first 3 cards with all details.
{
  "id": 1,
  "userId": 1,
  "createdAt": "2023-10-01T12:00:00Z",
  "roundNum": 0,
  "isEnded": false,
  "isDemo": false,
  "records": [
    {
      "id": 1,
      "cardId": 5,
      "round": 0,
      "wasGuessedInTime": null,
      "requestedAt": null,
      "respondedAt": null,
      "cardObject": {
        "id": 5,
        "name": "Card Name",
        "imageFilename": "http://example.com/image.jpg",
        "miseryIndex": 10
      }
    }, {...}, {...}
  ]
}
*/

router.post(
  "/",
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId);
      const createdAt = dayjs().toISOString();

      const game = await createNewGameWithSetup(userId, createdAt);
      res.status(201).json(game);
    } catch (error) {
      console.error(error);
      next(ErrorDTO.internalServerError("Failed to create game"));
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

      // 1. check if game exists
      const game = await dao.getGameById(gameId);
      if (!game) {
        return next(ErrorDTO.notFound(`Game with ID ${gameId} not found`));
      }

      // 2. set game end state if needed and return if ended
      const updatedGame = await checkAndUpdateGameEnd(game);
      if (updatedGame.isEnded) {
        return res.status(200).json({
          game: updatedGame.toJSON(),
          nextCard: null // No next card if game is ended
        });
      }


      // 3. increment round number, shoud not go over 3 or 1 depending on isdemo flag but limited
      // by the previous check
      game.roundNum += 1;
      await dao.updateGame(game.id, game.roundNum, game.isEnded);

      // 4. Get the next card to be played
      const nextCardRecord = await dao.getGameRecordByGameIdAndRound(
        gameId,
        game.roundNum
      );
      if (!nextCardRecord) {
        return next(
          ErrorDTO.notFound(
            `No card found for game ${gameId} in round ${game.roundNum}`
          )
        );
      }
      const nextCard = await dao.getCardById(nextCardRecord.cardId);
      if (!nextCard) {
        return next(
          ErrorDTO.notFound(`Card with ID ${nextCardRecord.cardId} not found`)
        );
      }

      // 5. Update next card record with drawn datetime
      await dao.updateGameRecord(
        nextCardRecord.id,
        null,
        dayjs().toISOString(),
        null
      );

      // 6. Prepare response with game state and next card
      const response = {
        game: game.toJSON(),
        nextCard: nextCard.toJSONWithoutMiseryIndex()
      }

      res.status(200).json(response);
    } catch (error) {
      next(
        error instanceof ErrorDTO
          ? error
          : ErrorDTO.internalServerError("Failed to retrieve game data")
      );
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
      // saved before all to minimize lag issues with async
      const respondedAt = dayjs();

      // 1. check if game exists
      const game = await dao.getGameWithRecordsAndCards(gameId);
      if (!game || !game.records || game.records.length === 0) {
        return next(ErrorDTO.notFound(`Game with ID ${gameId} not found`));
      }

      // 2. manage game end state
      if (game.isEnded) {
        return next(ErrorDTO.badRequest("Game has already ended"));
      } 

      // 3. Check if the user answered in time
      let response = null;
      const currentRecord = game.records.find(
        (record) => record.round === game.roundNum
      );

      if (!currentRecord) {
        return next(
          ErrorDTO.notFound(
            `No record found for game ${gameId} in round ${game.roundNum}`
          )
        );
      }

      currentRecord.respondedAt = respondedAt.toISOString();

      if (
        dayjs(currentRecord.respondedAt).diff(
          dayjs(currentRecord.requestedAt)
        ) > CONFIG.MAX_RESPONSE_TIME
      ) {
        // 3.1 User did not answer in time
        currentRecord.wasGuessedInTime = false;
        response = {
          isCorrect: false,
        };
      } else {
        // User has answered in time
        // 3.1 Check if the user answer (as cards IDs) matches the true card IDs ordered by misery index
        const evaluationResult = evaluateUserAnswer(game, cardsIds);
        if (evaluationResult.isCorrect) {
          // 3.2 User answer is correct
          currentRecord.wasGuessedInTime = true;
        } else {
          // 3.3 User answer is incorrect
          currentRecord.wasGuessedInTime = false;
        }
        response = evaluationResult;
      }
      // 4. Update game record
      await dao.updateGameRecord(
        currentRecord.id,
        currentRecord.wasGuessedInTime,
        currentRecord.requestedAt,
        currentRecord.respondedAt
      );

      // 5. return response
      res.status(200).json(response);
    } catch (error) {
      next(
        error instanceof ErrorDTO
          ? error
          : ErrorDTO.internalServerError("Failed to retrieve game data")
      );
    }
  }
);

export default router;
