import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_V1_BASE_URL ="/api/v1"

const CONFIG = {
  DB_NAME: path.join(__dirname, "../../data/database.sqlite"),
  APP_PORT: 3001,
  APP_HOST: "localhost",
  ROUTES_V1: {
    AUTH: APP_V1_BASE_URL + "/sessions",
    DEMO: APP_V1_BASE_URL + "/demos",
    GAME: APP_V1_BASE_URL + "/users/:userId/games",
    IMAGES_PATH: "/public/images",
    IMAGES_URL: "/images",
  },
  CORS_OPTIONS: {
    origin: ["http://localhost:5173", "http://localhost:3000"], // Allow multiple origins for test
    optionsSuccessStatus: 200, // Fixed typo: was optionsSuccessState
    credentials: true,
  },
  MORGAN_LOG_LEVEL: "dev",
  CARDS_NUMBER: 50,
  FULL_ROUNDS: 3, // Total rounds for full game
  DEMO_ROUNDS: 1, // Total rounds for demo game
  MAX_RESPONSE_TIME: 30000, // Time in milliseconds to answer a question
};

export default CONFIG;