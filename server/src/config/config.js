
const imageUrl = "images/"

const APP_V1_BASE_URL ="api/v1"
const AUTH = "/auth";
const USER = "/user";
const DEMO = "/demo";
const GAME = "/game";

const CONFIG = {
  DB_NAME: "nomedatabase.sqlite", 
  CARDS_NUMBER: 50,
  APP_PORT: 3001,
  APP_HOST: "localhost",
  ROUTES_V1: {
    AUTH: {
      LOGIN: APP_V1_BASE_URL+"/auth", // POST con username e password
    },
    DEMO:{
      CREATE: APP_V1_BASE_URL + "/demos", // POST per creare una partita demo
      STATUS: APP_V1_BASE_URL + "/demos/:demoId", // GET per stato partita demo
      ANSWER: APP_V1_BASE_URL + "/demos/:demoId/rounds/:roundId", // PUT per inviare risposta
    },
    GAME: {
      HISTORY: APP_V1_BASE_URL + "/users/:userId/games", // GET per storico partite
      CREATE: APP_V1_BASE_URL + "/users/:userId/games", // POST per creare una partita
      STATUS: APP_V1_BASE_URL + "/users/:userId/games/:gameId", // GET per stato partita
      ANSWER: APP_V1_BASE_URL + "/users/:userId/games/:gameId/rounds/:roundId", // PUT per inviare risposta
    }
  },
  CORS_OPTIONS: {
    origin: 'http://localhost:5173',
    optionsSuccessState: 200,
    credentials: true
  },
  MORGAN_LOG_LEVEL: "dev"

};

export default CONFIG;