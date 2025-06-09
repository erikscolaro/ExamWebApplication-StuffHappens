import { Game } from "../models/game.mjs";

const SERVER_URL = "http://localhost:3001";

// ricorda di dover gestire meglio gli erorri in qualche modo

// =================== DEMO API CALLS ===================
/**
 * Creates a new demo game by sending a POST request to the server.
 * The demo game does not require user authentication and is used for testing purposes.
 *
 * @async
 * @function createDemoGame
 * @returns {Promise<Game>} A promise that resolves to the created demo game object
 * @throws {Error} Throws an error with message "Internal server error" if the request fails
 */
const createDemoGame = async () => {
  const response = await fetch(SERVER_URL + "/api/v1/demos", {
    method: "POST",
  });

  if (response.ok) {
    const gameJson = await response.json();
    return Game.fromJSON(gameJson);
  } else throw new Error("Internal server error");
};

/**
 * Proceeds to the next round of a demo game by drawing new cards.
 * This function sends a POST request to the server to advance the demo game.
 * @async
 * @function nextRoundDemo
 * @param {string} gameId - The unique identifier of the demo game
 * @return {Promise<Game>} A promise that resolves to the updated demo game object
 * @throws {Error} Throws an error with message "Internal server error" if the request fails
 * */
const nextRoundDemo = async (gameId) => {
  const response = await fetch(
    SERVER_URL + "/api/v1/demos/" + gameId + "/draw",
    {
      method: "POST",
    }
  );

  if (response.ok) {
    const gameJson = await response.json();
    return Game.fromJSON(gameJson);
  } else throw new Error("Internal server error");
};

/**
 * Saves the user's answer for a demo game round by submitting selected card IDs.
 * This function sends a PUT request to check the user's answer against the correct solution.
 * @async
 * @function saveAnswerDemo
 * @param {string} gameId - The unique identifier of the demo game
 * @param {string[]} cardIds - Array of card IDs representing the user's answer
 * @return {Promise<Game>} A promise that resolves to the updated demo game object with results
 * @throws {Error} Throws an error with message "Internal server error" if the request fails
 */
const saveAnswerDemo = async (gameId, cardIds) => {
  const response = await fetch(
    SERVER_URL + "/api/v1/demos/" + gameId + "/check",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardsIds: cardIds,
      }),
    }
  );

  if (response.ok) {
    const gameJson = await response.json();
    return Game.fromJSON(gameJson);
  } else throw new Error("Internal server error");
}

// =================== FULL GAME API CALLS ===================

/**
 * Retrieves the games history from the server for a specific user.
 * Makes a GET request to fetch all historical game records for the specified user.
 *
 * @async
 * @function getGamesHistory
 * @param {string} userId - The unique identifier of the user whose games history to retrieve
 * @returns {Promise<Game[]>} A promise that resolves to an array of Game objects containing game history data
 * @throws {Error} Throws an error with message "Internal server error" if the request fails
 */
const getGamesHistory = async (userId) => {
  const response = await fetch(
    SERVER_URL + "/api/v1/users/" + userId + "/games",
    {
      method: "GET",
      credentials: "include",
    }
  );
  if (response.ok) {
    const gamesJson = await response.json();
    return gamesJson.map((g) => Game.fromJSON(g));
  } else throw new Error("Internal server error");
};

/**
 * Creates a new game for the specified user by sending a POST request to the server.
 *
 * @async
 * @function createNewGame
 * @param {string} userId - The unique identifier of the user creating the game
 * @returns {Promise<Game>} A promise that resolves to the created game object from the server response
 * @throws {Error} Throws an error with message "Internal server error" if the request fails
 */
const createGame = async (userId) => {
  const response = await fetch(
    SERVER_URL + "/api/v1/users/" + userId + "/games",
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (response.ok) {
    const gameJson = await response.json();
    return Game.fromJSON(gameJson);
  } else throw new Error("Internal server error");
};

/**
 * Proceeds to the next round of a game by drawing new cards.
 * Makes a POST request to advance the game to the next round.
 *
 * @async
 * @function nextRoundGame
 * @param {string} userId - The unique identifier of the user
 * @param {string} gameId - The unique identifier of the game
 * @returns {Promise<Game>} A promise that resolves to the updated game object
 * @throws {Error} Throws an error with message "Internal server error" if the request fails
 */
const nextRoundGame = async (userId, gameId) => {
  const response = await fetch(
    SERVER_URL + "/api/v1/users/" + userId + "/games/" + gameId + "/draw",
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (response.ok) {
    const gameJson = await response.json();
    return Game.fromJSON(gameJson);
  } else throw new Error("Internal server error");
};

/**
 * Saves the user's answer for a game round by submitting selected card IDs.
 * Makes a PUT request to check the user's answer against the correct solution.
 *
 * @async
 * @function saveAnswer
 * @param {string} userId - The unique identifier of the user
 * @param {string} gameId - The unique identifier of the game
 * @param {string[]} cardIds - Array of card IDs representing the user's answer
 * @returns {Promise<Game>} A promise that resolves to the updated game object with results
 * @throws {Error} Throws an error with message "Internal server error" if the request fails
 */
const saveAnswer = async (userId, gameId, cardIds) => {
  const response = await fetch(
    SERVER_URL + "/api/v1/users/" + userId + "/games/" + gameId + "/check",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: {
        cardsIds: cardIds,
      },
    }
  );

  if (response.ok) {
    const gameJson = await response.json();
    return Game.fromJSON(gameJson);
  } else throw new Error("Internal server error");
};

/**
 * Authenticates a user by sending login credentials to the server.
 * Creates a new user session upon successful authentication.
 *
 * @async
 * @function logIn
 * @param {Object} credentials - The user's login credentials
 * @param {string} credentials.username - The user's username
 * @param {string} credentials.password - The user's password
 * @returns {Promise<Object>} A promise that resolves to the authenticated user object
 * @throws {string} Throws error details as a string if authentication fails
 */
const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + "/api/v1/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

/**
 * Retrieves information about the currently authenticated user.
 * Makes a GET request to fetch the current user's session data.
 *
 * @async
 * @function getUserInfo
 * @returns {Promise<Object>} A promise that resolves to the current user's information
 * @throws {Object} Throws the error response object if the request fails
 */
const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + "/api/v1/sessions/current", {
    credentials: "include",
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user;
  }
};

/**
 * Logs out the current user by terminating their session.
 * Makes a DELETE request to destroy the current user session.
 *
 * @async
 * @function logOut
 * @returns {Promise<null>} A promise that resolves to null upon successful logout
 */
const logOut = async () => {
  const response = await fetch(SERVER_URL + "/api/v1/sessions/current", {
    method: "DELETE",
    credentials: "include",
  });
  if (response.ok) return null;
};

const API = {
  getGamesHistory,
  createGame,
  nextRoundGame,
  saveAnswer,
  logIn,
  getUserInfo,
  logOut,
};
export default API;
