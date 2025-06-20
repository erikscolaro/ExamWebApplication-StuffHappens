import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_V1_BASE_URL = "/api/v1";

const CONFIG = {
  DB_NAME: path.join(__dirname, "../../data/database.db"),
  APP_PORT: process.env.PORT || 3001,
  APP_HOST: process.env.HOST || 'localhost', ROUTES_V1: {
    AUTH: APP_V1_BASE_URL + "/sessions",
    DEMO: APP_V1_BASE_URL + "/demos",
    GAME: APP_V1_BASE_URL + "/users/:userId/games",
    IMAGES_PATH: path.join(__dirname, '../public/images'),
    IMAGES_URL: "/images",
  },  CORS_OPTIONS: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://stuffhappens.onrender.com",
        process.env.FRONTEND_URL
      ].filter(Boolean); // Rimuove valori undefined

      // Permetti richieste senza origin (es. app mobile, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    optionsSuccessStatus: 200,
    credentials: true,
  },
  SESSION_OPTIONS: {
    secret: process.env.SESSION_SECRET || "shhhhh... it's a secret!",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true su Render (HTTPS)
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 ore
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // 'none' per cross-domain su Render
    }
  },
  MORGAN_LOG_LEVEL: "dev",
  MAX_RESPONSE_TIME: 30000, // Time in milliseconds 
  HASHED_PASSWORD_KEY_LENGTH: 32, // Length of the hashed password
  HASHED_PASSWORD_SALT_LENGTH: 16, // Length of the salt for hashed password
};

export default CONFIG;
