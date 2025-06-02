import express from 'express';
import * as dao from '../dao/dao.mjs';
import ErrorDTO from '../models/errors.mjs';

const router = express.Router();

// POST /api/v1/demos - Create a new demo game
router.post('/', async (req, res, next) => {
  try {
    // TODO: Implement demo game creation logic
    // - Create temporary game session
    // - Initialize cards and game state
    // - Return demo game ID and initial state
    
    const demoId = Math.random().toString(36).substring(7); // Temporary ID generation
    
    res.status(201).json({
      message: "Demo game created successfully",
      data: {
        demoId: demoId,
        status: "created",
        currentRound: 1,
        totalRounds: 5, // TODO: Get from config
        cards: [] // TODO: Initialize card deck
      }
    });

  } catch (error) {
    next(ErrorDTO.internalServerError("Failed to create demo game"));
  }
});

// GET /api/v1/demos/:demoId - Get demo game status
router.get('/:demoId', async (req, res, next) => {
  try {
    const { demoId } = req.params;
    
    // Validate demoId parameter
    if (!demoId) {
      return next(ErrorDTO.badRequest("Demo ID is required"));
    }

    // TODO: Implement demo game status retrieval
    // - Validate demo exists
    // - Get current game state
    // - Return game progress and current card
    
    res.json({
      message: "Demo game status retrieved successfully",
      data: {
        demoId: demoId,
        status: "in_progress", // TODO: Get actual status
        currentRound: 1, // TODO: Get current round
        totalRounds: 5, // TODO: Get from config
        currentCard: null, // TODO: Get current card
        score: 0, // TODO: Calculate score
        isGameOver: false // TODO: Check if game is over
      }
    });

  } catch (error) {
    next(ErrorDTO.internalServerError("Failed to retrieve demo game status"));
  }
});

// PUT /api/v1/demos/:demoId/rounds/:roundId - Submit answer for demo round
router.put('/:demoId/rounds/:roundId', async (req, res, next) => {
  try {
    const { demoId, roundId } = req.params;
    const { answer } = req.body;
    
    // Validate parameters
    if (!demoId) {
      return next(ErrorDTO.badRequest("Demo ID is required"));
    }
    if (!roundId || isNaN(parseInt(roundId))) {
      return next(ErrorDTO.badRequest("Invalid round ID provided"));
    }
    if (answer === undefined || answer === null) {
      return next(ErrorDTO.badRequest("Answer is required"));
    }
    
    // Validate answer format (should be "higher", "lower", or "equal")
    const validAnswers = ["higher", "lower", "equal"];
    if (!validAnswers.includes(answer.toLowerCase())) {
      return next(ErrorDTO.badRequest("Answer must be 'higher', 'lower', or 'equal'"));
    }

    // TODO: Implement demo answer submission logic
    // - Validate demo exists and round is valid
    // - Process the answer against current and next card
    // - Update demo game state
    // - Return result and next state
    
    res.json({
      message: "Answer submitted successfully",
      data: {
        demoId: demoId,
        roundId: parseInt(roundId),
        answer: answer.toLowerCase(),
        isCorrect: null, // TODO: Calculate if answer is correct
        currentCard: null, // TODO: Current card value
        nextCard: null, // TODO: Next card value (if round continues)
        score: 0, // TODO: Updated score
        nextRound: parseInt(roundId) + 1, // TODO: Calculate next round
        isGameOver: false // TODO: Check if game is over
      }
    });

  } catch (error) {
    next(ErrorDTO.internalServerError("Failed to submit demo answer"));
  }
});

export default router;
