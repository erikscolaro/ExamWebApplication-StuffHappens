import ErrorDTO from "../models/errors.mjs";

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return next(ErrorDTO.unauthorized("Authentication failed."));
}

export default isLoggedIn;