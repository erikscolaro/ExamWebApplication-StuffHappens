import { validationResult, body, param } from "express-validator";
import ErrorDTO from "../models/errors.mjs";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      ErrorDTO.badRequest(
        `Validation failed: ${JSON.stringify(errors.array())}`
      )
    );
  }
  return next();
};
// custom validator to check if userId matches session
export const validateUsernameMatchesSession = [
  param("userId")
    .isInt()
    .withMessage("Invalid userId format")
    .custom((value, { req }) => {
      if (parseInt(value) !== parseInt(req.user.id)) {
        throw ErrorDTO.forbidden("User ID does not match session user ID");
      }
      return true;
    }),
];

export const validateGameId = [
  param("gameId").isInt().withMessage("Invalid gameId format"),
];

export const validateRoundId = [
  param("roundId").isInt().withMessage("Invalid roundId format"),
];

export const validateCardIds = [
  body("cardsIds")
    .isArray({ min: 3, max: 6 })
    .withMessage("cardsIds must be an array with 3 to 6 elements")
    .custom((value) => {
      if (!value.every((id) => Number.isInteger(id) && id >= 0)) {
        throw ErrorDTO.badRequest(
          "cardsIds must contain only positive integers"
        );
      }
      return true;
    }),
];
