import ErrorDTO from "../models/errors.mjs";

function errorHandler(err, req, res, next) {
  if (err instanceof ErrorDTO) {
    return res.status(err.code).json(err);
  }
  res.status(500).json({
    code: 500,
    error: "internalServerError",
    description: err.message || "Internal Server Error",
  });
}

export default errorHandler;
