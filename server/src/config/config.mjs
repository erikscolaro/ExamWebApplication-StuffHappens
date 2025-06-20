import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_V1_BASE_URL = "/api/v1";

const CONFIG = {
  DB_NAME: path.join(__dirname, "../../data/database.db"),
  APP_PORT: process.env.PORT || 3001,
  APP_HOST: process.env.HOST || 'localhost',  ROUTES_V1: {
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
  MORGAN_LOG_LEVEL: "dev",
  MAX_RESPONSE_TIME: 30000, // Time in milliseconds 
  HASHED_PASSWORD_KEY_LENGTH: 32, // Length of the hashed password
  HASHED_PASSWORD_SALT_LENGTH: 16, // Length of the salt for hashed password
};

export default CONFIG;
