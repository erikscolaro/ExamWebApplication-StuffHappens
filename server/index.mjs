import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import passport from './src/config/passportConfig.mjs';
import authRouter from './src/routes/authRoutes.mjs';
import gameRouter from './src/routes/gameRoutes.mjs';
import demoRouter from './src/routes/demoRoutes.mjs';
import errorHandler from './src/middleware/errorMiddleware.mjs';
import isLoggedIn from './src/middleware/authMiddleware.mjs';
import CONFIG from './src/config/config.mjs';
import ErrorDTO from './src/models/errors.mjs';
import { validateUserIdMatchesSession } from './src/middleware/validationMiddleware.mjs';

// init express
const app = new express();
const port = CONFIG.APP_PORT;

// middleware
app.use(express.json());
app.use(morgan(CONFIG.MORGAN_LOG_LEVEL));
app.use(cors(CONFIG.CORS_OPTIONS));
app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

//ROUTES
// API root endpoint
app.get('/api/v1/', (req, res) => {
  res.json({
    message: "Gioco Sfortuna API v1",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/sessions",
      games: "/api/v1/users/:userId/games",
      demos: "/api/v1/demos"
    }
  });
});

app.use(CONFIG.ROUTES_V1.AUTH, authRouter);
app.use(CONFIG.ROUTES_V1.DEMO, demoRouter);
app.use(CONFIG.ROUTES_V1.GAME, isLoggedIn, validateUserIdMatchesSession, gameRouter);
app.use(CONFIG.ROUTES_V1.IMAGES_URL, express.static(CONFIG.ROUTES_V1.IMAGES_PATH));

// default route - catch all unmatched routes
app.use('*', (req, res, next) => {
  next(ErrorDTO.notFound("Warning: the url does not exist."));
});

// error handler middleware after routes
app.use(errorHandler);

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});