import { validationResult, body, param } from "express-validator";
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
export const validateUsernameMatchesSession = [
  param("userId").isAlphanumeric().withMessage("Invalid userId format")
    .isLength({ min: 1 }).withMessage("userId cannot be empty")
    .customSanitizer((value) => value.trim()) // sanitize input
    .custom((value, { req }) => {
    if (value !== req.user.username) {
      throw ErrorDTO.forbidden("User ID does not match session user ID");
    }
    return true;
  }),
];

export const validateGameId = [
  param('gameId').isInt().withMessage('Invalid gameId format'),
];

export const validateCardIds = [
  body('cardsIds')
    .isArray({ min: 4, max: 6 })
    .withMessage('cardsIds must be an array with 4 to 6 elements')
    .custom((value) => {
      if (!value.every(id => Number.isInteger(id) && id > 0)) {
        throw ErrorDTO.badRequest("cardsIds must contain only positive integers");
      }
      return true;
    }),
];