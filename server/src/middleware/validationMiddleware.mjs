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
      next(
        ErrorDTO.forbidden("User ID does not match session user ID")
      );
    }
    return true;
  }),
];

export const validateGameId = [
  body('gameId').isInt().withMessage('Invalid gameId format'),
];

export const validateCardIds = [
  body('cardsIds')
    .isArray({ min: 4, max: 6 })
    .withMessage('cardsIds must be an array with 4 to 6 elements')
    .custom((value) => {
      if (!value.every(id => Number.isInteger(id) && id > 0)) {
        next(
          ErrorDTO.badRequest("cardsIds must contain only positive integers")
        );
      }
      return true;
    }),
];