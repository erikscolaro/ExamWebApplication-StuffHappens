import express from 'express';
import passport from 'passport';
import ErrorDTO from '../models/errors.mjs';

const router = express.Router();

// POST /api/sessions
router.post('/', passport.authenticate('local'), function(req, res) {
  return res.status(201).json(req.user);
});

// GET /api/sessions/current
router.get('/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);}
  else
    next(ErrorDTO.unauthorized("Not authenticated user."));
});

// DELETE /api/session/current
router.delete('/current', (req, res) => {
  req.logout(() => {
    res.end();
  });
});

export default router;
