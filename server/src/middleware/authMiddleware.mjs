import ErrorDTO from "../models/errors.mjs";

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return ErrorDTO.unauthorized("Not authenticated.");
}

export default isLoggedIn;