import sqlite from 'sqlite3'
import crypto from 'crypto';
import CONFIG from '../config/config.mjs';
import User from '../models/user.mjs';
import { Card } from '../models/card.mjs';
import { Game, GameRecord } from '../models/game.mjs';
import {Buffer} from 'buffer';

// open the database
const db = new sqlite.Database(CONFIG.DB_NAME, (err) => {
  if (err) throw err;
});

// USER QUERY

/**
 * Autentica un utente verificando username e password
 * @param {string} username - Username dell'utente
 * @param {string} password - Password in chiaro
 * @returns {Promise<User|false>} User object se autenticazione OK, false altrimenti
 * @throws {Error} Errori database o di crittografia
 */
export const getUserByUsername = (username, password) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM USERS WHERE USERNAME = ?";
    db.get(query, [username], (err, row) => {
      if (err) reject(err);
      else if (row === undefined) resolve(false); // for passport authentication
      else {        
        const user = new User(row.ID, row.USERNAME, row.HASHEDPASSWORD, row.SALT);
        const salt = Buffer.from(row.SALT, "hex");
        crypto.scrypt(password, salt , CONFIG.HASHED_PASSWORD_KEY_LENGTH, function(err, hashedPassword) {
          if (err) reject(err);
          
          console.log('DB Hash length:', row.HASHEDPASSWORD.length);
          console.log('DB Hash:', row.HASHEDPASSWORD);
          console.log('Calculated Hash length:', hashedPassword.toString('hex').length);
          console.log('Calculated Hash:', hashedPassword.toString('hex'));
          
          if (!crypto.timingSafeEqual(Buffer.from(row.HASHEDPASSWORD, 'hex'), hashedPassword)) resolve(false);
          else resolve(user);
        });
      }
    });
  });
};

// GAME QUERY

/**
 * Ottiene tutti i giochi di un utente filtrati per stato
 * @param {number} userid - ID dell'utente
 * @param {boolean} areEnded - true per giochi finiti, false per attivi (default: true)
 * @returns {Promise<Game[]>} Array di oggetti Game ordinati per data creazione DESC
 * @throws {Error} Errori database
 */
export const getGamesByUser = (userid, areEnded = true) => {
  return new Promise((resolve, reject)=> {
    const query = "SELECT * FROM GAMES WHERE USERID = ? AND ISENDED = ? ORDER BY CREATEDAT DESC";
    db.all(query, [userid, areEnded?1:0], (err, rows) => {
      if (err) reject(err); // error management done outside
      else {
        // Convert rows to GameDB objects
        const games = rows.map(row => new Game(row.ID, row.USERID, row.CREATEDAT, row.ROUND, row.ISENDED, row.ISDEMO));
        resolve(games);
      }
    });
  });
};

/**
 * Crea un nuovo gioco nel database
 * @param {number|null} userId - ID utente (null per demo)
 * @param {string} createdAt - Data/ora creazione
 * @param {boolean} isDemo - true se è un gioco demo
 * @returns {Promise<number>} ID del nuovo gioco creato
 * @throws {Error} Errori database
 */
export const createGame = (userId, createdAt, isDemo) => {
  return new Promise((resolve, reject)=> {
    const query = "INSERT INTO GAMES (USERID, CREATEDAT, ROUND, ISENDED, ISDEMO) VALUES (?, ?, ?, ?, ?)";
    const userIdValue = isDemo ? null : userId;
    db.run(query, [userIdValue, createdAt, 0, 0, isDemo?1:0], function(err) {
      if (err) reject(err); // error management done outside
      else {
        resolve(this.lastID);
      }
    });
  });
};

/**
 * Aggiorna round e stato di un gioco
 * @param {number} gameId - ID del gioco
 * @param {number} roundNum - Numero del round
 * @param {boolean} isEnded - true se il gioco è finito
 * @returns {Promise<number>} Numero di righe modificate
 * @throws {Error} Errori database
 */
export const updateGame = (gameId, roundNum, isEnded) => {
  return new Promise((resolve, reject)=> {
    const query = "UPDATE GAMES SET ROUND = ?, ISENDED = ? WHERE ID = ?";
    db.run(query, [roundNum, isEnded?1:0, gameId], function(err) {
      if (err) reject(err);
      else {
        resolve(this.changes);
      }
    });
  });
};

/**
 * Ottiene un gioco specifico tramite ID
 * @param {number} gameId - ID del gioco
 * @returns {Promise<Game|false>} Oggetto Game se trovato, false altrimenti
 * @throws {Error} Errori database
 */
export const getGameById = (gameId) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM GAMES WHERE ID = ?";
    db.get(query, [gameId], (err, row) => {
      if (err) reject(err);
      else if (row === undefined) resolve(false);
      else {
        const game = new Game(row.ID, row.USERID, row.CREATEDAT, row.ROUND, row.ISENDED, row.ISDEMO);
        resolve(game);
      }
    });
  });
};

// CARDS QUERY

/**
 * Ottiene tutte le carte dal database
 * @returns {Promise<Card[]>} Array di tutti gli oggetti Card
 * @throws {Error} Errori database
 */
export const getCards = () => {
  return new Promise((resolve, reject)=> {
    const query = "SELECT * FROM CARDS";
    db.all(query, [], (err, rows) => {
      if (err) reject(err); // error management done outside
      else {
        // Convert rows to Card objects
        const cards = rows.map(row => new Card(row.ID, row.NAME, row.IMAGEPATH, row.MISERYINDEX));
        resolve(cards);
      }
    });
  });
};

/**
 * Ottiene una carta specifica tramite ID
 * @param {number} cardId - ID della carta
 * @returns {Promise<Card|null>} Oggetto Card se trovato, null altrimenti
 * @throws {Error} Errori database
 */
export const getCardById = (cardId) => {
  return new Promise((resolve, reject)=> {
    const query = "SELECT * FROM CARDS WHERE ID = ?";
    db.get(query, [cardId], (err, row) => {
      if (err) reject(err); // error management done outside
      else if (row === undefined) resolve(null); // No card found
      else {
        const card = new Card(row.ID, row.NAME, row.IMAGEPATH, row.MISERYINDEX);
        resolve(card);
      }
    });
  });
};

// GAME HISTORY QUERY

/**
 * Ottiene tutti i record di un gioco specifico
 * @param {number} gameId - ID del gioco
 * @returns {Promise<GameRecord[]>} Array di oggetti GameRecord per il gioco
 * @throws {Error} Errori database
 */
export const getGameRecordsByGameId = (gameId) => {
  return new Promise((resolve, reject)=> {
    const query = "SELECT * FROM GAME_RECORDS WHERE GAMEID = ?";
    db.all(query, [gameId], (err, rows) => {
      if (err) reject(err); // error management done outside
      else {
        // Convert rows to GameRecord objects
        const records = rows.map(
          (row) =>
            new GameRecord(
              row.ID,
              row.GAMEID,
              row.CARDID,
              null,
              row.ROUND,
              row.WASGUESSED,
              row.TIMEDOUT,
              row.REQUESTEDAT,
              row.RESPONDEDAT
            )
        );
        resolve(records);
      }
    });
  });
};

/**
 * Ottiene il record di un gioco per round specifico
 * @param {number} gameId - ID del gioco
 * @param {number} round - Numero del round
 * @returns {Promise<GameRecord|null>} Oggetto GameRecord se trovato, null altrimenti
 * @throws {Error} Errori database
 */
export const getGameRecordByGameIdAndRound = (gameId, round) => {
  return new Promise((resolve, reject)=> {
    const query = "SELECT * FROM GAME_RECORDS WHERE GAMEID = ? AND ROUND = ?";
    db.get(query, [gameId, round], (err, row) => {
      if (err) reject(err); // error management done outside
      else if (row === undefined) resolve(null); // No record found
      else {
        const record = new GameRecord(
          row.ID,
          row.GAMEID,
          row.CARDID,
          null,
          row.WASGUESSED,
          row.TIMEDOUT,
          row.REQUESTEDAT,
          row.RESPONDEDAT
        );
        resolve(record);
      }
    });
  });
}

/**
 * Crea un nuovo record di gioco
 * @param {number} gameId - ID del gioco * @param {number} cardId - ID della carta
 * @param {number} round - Numero del round (default: 0)
 * @param {boolean|null} wasGuessed - true/false se carta indovinata, null se non ancora giocato
 * @param {boolean|null} timedOut - true/false se è scaduto il tempo, null se non ancora giocato
 * @param {string|null} requestedAt - Timestamp richiesta carta
 * @param {string|null} respondedAt - Timestamp risposta utente
 * @returns {Promise<number>} ID del nuovo record creato
 * @throws {Error} Errori database
 */
export const createGameRecord = (gameId, cardId, round=0, wasGuessed= null, timedOut = null, requestedAt = null, respondedAt = null) => {
  return new Promise((resolve, reject)=> {
    const query =
      "INSERT INTO GAME_RECORDS (GAMEID, CARDID, ROUND, WASGUESSED, TIMEDOUT,REQUESTEDAT, RESPONDEDAT) VALUES (?, ?, ?, ?, ?, ?, ?)";    db.run(
      query,
      [gameId, cardId, round, wasGuessed, timedOut, requestedAt, respondedAt],
      function (err) {
        if (err) reject(err); // error management done outside
        else {
          resolve(this.lastID);
        }
      }
    );
  });
};

/**
 * Aggiorna un record di gioco esistente * @param {number} recordId - ID del record da aggiornare
 * @param {boolean} wasGuessed - true se carta indovinata, false altrimenti
 * @param {boolean} timedOut - true se è scaduto il tempo, false altrimenti
 * @param {string} requestedAt - Timestamp richiesta carta
 * @param {string} respondedAt - Timestamp risposta utente
 * @returns {Promise<number>} Numero di righe modificate
 * @throws {Error} Errori database
 */
export const updateGameRecord = (recordId, wasGuessed, timedOut, requestedAt, respondedAt) => {
  return new Promise((resolve, reject)=> {
    const query = "UPDATE GAME_RECORDS SET WASGUESSED = ?, TIMEDOUT = ?, REQUESTEDAT = ?, RESPONDEDAT = ? WHERE ID = ?";
    db.run(query, [wasGuessed, timedOut, requestedAt, respondedAt, recordId], function(err) {
      if (err) reject(err);
      else {
        resolve(this.changes);
      }
    });
  });
}

//COMPLEX QUERIES

/**
 * Ottiene un gioco completo con tutti i suoi record e carte associate
 * @param {number} gameId - ID del gioco
 * @returns {Promise<Game|null>} Oggetto Game con proprietà records contenente GameRecord[] con carte, null se non trovato
 * @throws {Error} Errori database o delle query composte
 */
export const getGameWithRecordsAndCards = async (gameId) => {
  try {
    const [game, records, cards] = await Promise.all([
      getGameById(gameId),
      getGameRecordsByGameId(gameId),
      getCards()
    ]);

    if (!game) return null; 

    const cardMap = new Map(cards.map(card => [card.id, card]));

    records.forEach((record) => {
      const card = cardMap.get(record.cardId);
      if (card) {
        record.card = card; 
      }
    });

    game.records = records;
    return game;
  } catch (error) {
    throw error;
  }
}

/**
 * Ottiene tutti i giochi di un utente con record e carte complete (query composita)
 * @param {number} userid - ID dell'utente
 * @returns {Promise<Game[]>} Array di oggetti Game con proprietà records contenente GameRecord[] con carte
 * @throws {Error} Errori database o delle query composte
 */
export const getGamesWithRecordsAndCards = async (userid) => {
  try {
    const games = await getGamesByUser(userid);
    const cards = await getCards();

    await Promise.all(
      games.map(async (game) => {
      const records = await getGameRecordsByGameId(game.id);        
      records.forEach((record) => {
        const card = cards.find((card) => card.id == record.cardId);
        if (card) {
        record.card = card; // Attach the card object to the record
        }
      });
      game.records = records; // Attach records to the game object
      return game;
      })
    );

    return games;
  } catch (error) {
    throw error;
  }
};
