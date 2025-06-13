import express from 'express';
import passport from 'passport';
import ErrorDTO from '../models/errors.mjs';
import isLoggedIn from '../middleware/authMiddleware.mjs';

const router = express.Router();

// POST /api/v1/auth/login
router.post('/', passport.authenticate('local'), function(req, res) {
  return res.json({
    authenticated: true,
    user: {
      username: req.user.username,
      id: req.user.id
    },
  });
});

// GET /api/v1/auth/current - Check if user is logged in
router.get('/current', isLoggedIn, (req, res, next) => {
    res.json({
      authenticated: true,
      user: {
        username: req.user.username,
        id: req.user.id
      }
    });
});

// POST /api/v1/auth/logout - Logout user
router.delete('/current', isLoggedIn, (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(ErrorDTO.internalServerError("Logout error"));
    }
    res.json({
      message: "Logout successful"
    });
  });
});

export default router;
