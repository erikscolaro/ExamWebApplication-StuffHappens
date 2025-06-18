import { Game } from "../models/game.mjs";
import { Card } from "../models/card.mjs";
import User from "../models/user.mjs";
import ErrorDTO from "../models/errors.mjs";

const SERVER_URL = "http://localhost:3001";

const handleApiError = async (response) => {
  if (response.ok) {
    return await response.json();
  }

  return response
    .json()
    .then((errorData) => {
      if (errorData.code && errorData.error && errorData.description) {
        throw ErrorDTO.fromJSON(errorData);
      } else {
        throw new Error(errorData.message || "Internal server error");
      }
    })
    .catch(() => {
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`
      );
    });
};

const createDemoGame = async () => {
  const response = await fetch(`${SERVER_URL}/api/v1/demos/new`, {
    method: "POST",
  });

  const data = await handleApiError(response);
  return Game.fromJSON(data);
};

/**
 * Proceeds to the next round of a demo game by drawing new cards.
 * This function sends a POST request to the server to advance the demo game.
 * @async
 * @function nextRoundDemo
 * @param {string} gameId - The unique identifier of the demo game
 * @param {string} roundId - The unique identifier of the round
 * @return {Promise<{game: Game, nextCard: Card}>} A promise that resolves to the updated demo game object and next card (without misery index)
 * @throws {ErrorDTO} Throws structured error from server
 * */
const nextRoundDemo = async (gameId, roundId) => {
  const response = await fetch(
    `${SERVER_URL}/api/v1/demos/${gameId}/round/${roundId}/begin`,
    {
      method: "POST",
    }
  );

  const data = await handleApiError(response);
  return {
    game: Game.fromJSON(data.game),
    nextCard: Card.fromJSON(data.nextCard),
  };
};

/**
 * Saves the user's answer for a demo game round by submitting selected card IDs.
 * This function sends a POST request to check the user's answer against the correct solution.
 * @async
 * @function checkAnswerDemo
 * @param {string} gameId - The unique identifier of the demo game
 * @param {string} roundId - The unique identifier of the round
 * @param {string[]} cardIds - Array of card IDs representing the user's answer
 * @return {Promise<{gameRecord: object, isEnded: boolean, livesRemaining: number}>} A promise that resolves to the answer verification result with GameRecord, end status and lives
 * @throws {ErrorDTO} Throws structured error from server
 */
const checkAnswerDemo = async (gameId, roundId, cardIds) => {
  const response = await fetch(
    `${SERVER_URL}/api/v1/demos/${gameId}/round/${roundId}/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardsIds: cardIds,
      }),
    }
  );

  return await handleApiError(response);
};

const getGamesHistory = async (userId) => {
  const response = await fetch(`${SERVER_URL}/api/v1/users/${userId}/games`, {
    method: "GET",
    credentials: "include",
  });
  const data = await handleApiError(response);
  return data.history.map((g) => Game.fromJSON(g));
};

/**
 * Creates a new game for the authenticated user by sending a POST request to the server.
 *
 * @async
 * @function createGame
 * @returns {Promise<Game>} A promise that resolves to the created game object from the server response
 * @throws {ErrorDTO} Throws structured error from server
 */
const createGame = async (userId) => {
  const response = await fetch(
    `${SERVER_URL}/api/v1/users/${userId}/games/new`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  const data = await handleApiError(response);
  return Game.fromJSON(data);
};

/**
 * Proceeds to the next round of a game by drawing new cards.
 * Makes a POST request to advance the game to the next round.
 *
 * @async
 * @function nextRoundGame
 * @param {string} gameId - The unique identifier of the game
 * @param {string} roundId - The unique identifier of the round
 * @returns {Promise<{game: Game, nextCard: Card}>} A promise that resolves to the updated game object and next card (without misery index)
 * @throws {ErrorDTO} Throws structured error from server
 */
const nextRoundGame = async (userId, gameId, roundId) => {
  const response = await fetch(
    `${SERVER_URL}/api/v1/users/${userId}/games/${gameId}/round/${roundId}/begin`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  const data = await handleApiError(response);
  return {
    game: Game.fromJSON(data.game),
    nextCard: Card.fromJSON(data.nextCard),
  };
};

/**
 * Saves the user's answer for a game round by submitting selected card IDs. * Makes a POST request to check the user's answer against the correct solution.
 *
 * @async
 * @function checkAnswerGame
 * @param {string} gameId - The unique identifier of the game
 * @param {string} roundId - The unique identifier of the round
 * @param {string[]} cardIds - Array of card IDs representing the user's answer
 * @returns {Promise<{gameRecord: object, isEnded: boolean, livesRemaining: number}>} A promise that resolves to the answer verification result with GameRecord, end status and lives
 * @throws {ErrorDTO} Throws structured error from server
 */
const checkAnswerGame = async (userId, gameId, roundId, cardIds) => {
  const response = await fetch(
    `${SERVER_URL}/api/v1/users/${userId}/games/${gameId}/round/${roundId}/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        cardsIds: cardIds,
      }),
    }
  );

  return await handleApiError(response);
};

/**
 * Authenticates a user by sending login credentials to the server.
 * Creates a new user session upon successful authentication.
 *
 * @async
 * @function logIn
 * @param {Object} credentials - The user's login credentials
 * @returns {Promise<{authenticated: boolean, user: User}>} A promise that resolves to authentication status and user object
 * @throws {ErrorDTO} Throws structured error from server
 */
const logIn = async (credentials) => {
  const response = await fetch(`${SERVER_URL}/api/v1/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  const data = await handleApiError(response);
  return {
    authenticated: data.authenticated,
    user: User.fromJSON(data.user),
  };
};

/**
 * Retrieves information about the currently authenticated user.
 * Makes a GET request to fetch the current user's session data.
 *
 * @async
 * @function getUserInfo
 * @returns {Promise<{authenticated: boolean, user: User}>} A promise that resolves to authentication status and user object
 * @throws {ErrorDTO} Throws structured error from server
 */
const getUserInfo = async () => {
  const response = await fetch(`${SERVER_URL}/api/v1/sessions/current`, {
    credentials: "include",
  });

  // 401 is expected when no session exists, don't treat as error
  if (response.status === 401) {
    return {
      authenticated: false,
      user: null,
    };
  }

  const data = await handleApiError(response);
  return {
    authenticated: data.authenticated,
    user: User.fromJSON(data.user),
  };
};

/**
 * Logs out the current user by terminating their session.
 * Makes a DELETE request to destroy the current user session.
 *
 * @async
 * @function logOut
 * @returns {Promise<Object>} A promise that resolves to logout confirmation
 * @throws {ErrorDTO} Throws structured error from server
 */
const logOut = async () => {
  const response = await fetch(`${SERVER_URL}/api/v1/sessions/current`, {
    method: "DELETE",
    credentials: "include",
  });

  return await handleApiError(response);
};

const API = {
  createDemoGame,
  nextRoundDemo,
  checkAnswerDemo,
  getGamesHistory,
  createGame,
  nextRoundGame,
  checkAnswerGame,
  logIn,
  getUserInfo,
  logOut,
};

export default API;
