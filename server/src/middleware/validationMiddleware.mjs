import { validationResult, body } from "express-validator";
import ErrorDTO from "../models/errors.mjs";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(
      ErrorDTO.badRequest(
        `Validation failed: ${JSON.stringify(errors.array())}`
      )
    );
  }
  next();
};
// custom validator to check if userId matches session
export const validateUserIdMatchesSession = [
  body("userId").isInt().withMessage("Invalid userId format"),
  body("userId").custom((value, { req }) => {
    if (value !== req.user.id) {
      throw new Error("You are not allowed to access another user's data.");
    }
    return true;
  }),
];

export const validateGameCreation = [
  body('createdAt').isISO8601().withMessage('Invalid date format, use iso8601'),
];

export const validateGameStatus = [
  body('gameId').isInt().withMessage('Invalid gameId format'),
];
