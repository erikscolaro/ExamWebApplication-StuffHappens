import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passportConfig.mjs';
import authRouter from './src/routes/authRoutes.mjs';
import gameRouter from './src/routes/gameRoutes.mjs';
import demoRouter from './src/routes/demoRoutes.mjs';
import errorHandler from './src/middleware/errorMiddleware.mjs';
import isLoggedIn from './src/middleware/authMiddleware.mjs';
import CONFIG from './src/config/config';
import ErrorDTO from './src/models/errors.mjs';

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
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/demos", demoRouter);
app.use("/api/v1/users/:userId", isLoggedIn, gameRouter);
app.use('/images', express.static('public/images'));

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