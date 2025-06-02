import express from 'express';
import passport from 'passport';
import ErrorDTO from '../models/errors.mjs';

const router = express.Router();

// POST /api/v1/auth/login
router.post('/', passport.authenticate('local'), function(req, res) {
  return res.status(201).json(req.user);
});

// GET /api/v1/auth/current - Get current user session
router.get('/current', (req, res, next) => {  if(req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username
      }
    });
  } else {
    next(ErrorDTO.unauthorized("Not authenticated user."));
  }
});

// POST /api/v1/auth/logout - Logout user
router.delete('/current', (req, res, next) => {
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
