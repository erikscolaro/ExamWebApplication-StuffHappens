import sqlite from 'sqlite3'
import crypto from 'crypto';
import CONFIG from '../config/config.mjs';
import User from '../models/user.mjs';
import { Card } from '../models/card.mjs';
import { Game, GameRecord } from '../models/game.mjs';

// open the database
const db = new sqlite.Database(CONFIG.DB_NAME, (err) => {
  if (err) throw err;
});

// USER QUERY
export const getUserByUsername = (username, password) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM USERS WHERE USERNAME = ?";
    db.get(query, [username], (err, row) => {
      if (err) reject(err);
      else if (row === undefined) resolve(false); // for passport authentication
      else {        const user = new User(row.ID, row.USERNAME, row.HASHEDPASSWORD, row.SALT);
        crypto.scrypt(password, row.SALT, 16, function(err, hashedPassword) {
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

//return the past games that are ended (not the partial ones)
export const getGamesByUser = (userid) => {
  return new Promise((resolve, reject)=> {
    const query = "SELECT * FROM GAMES WHERE USERID = ? AND ISENDED = 1 ORDER BY CREATEDAT DESC";
    db.all(query, [userid], (err, rows) => {
      if (err) reject(err); // error management done outside
      else {
        // Convert rows to GameDB objects
        const games = rows.map(row => new Game(row.ID, row.USERID, row.CREATEDAT, row.ROUND, row.ISENDED, row.ISDEMO));
        resolve(games);
      }
    });
  });
};

export const createGame = (userId, createdAt, isDemo) => {
  return new Promise((resolve, reject)=> {
    const query = "INSERT INTO GAMES (USERID, CREATEDAT, ROUND, ISENDED, ISDEMO) VALUES (?, ?, ?, ?, ?)";
    const userIdValue = isDemo ? null : userId;
    db.run(query, [userIdValue, createdAt, 1, 0, isDemo?1:0], function(err) {
      if (err) reject(err); // error management done outside
      else {
        resolve(this.lastID);
      }
    });
  });
};

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

export const getGameById = (gameId) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM GAMES WHERE ID = ?";
    db.get(query, [gameId], (err, row) => {
      if (err) reject(err);
      else if (row === undefined) resolve(false);
      else {
        const game = new Game(row.ID, row.USERID, row.ROUND, row.CREATEDAT, row.ISENDED, row.ISDEMO);
        resolve(game);
      }
    });
  });
};

// CARDS QUERY
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

export const getCardById = (cardId) => {
  return new Promise((resolve, reject)=> {
    const query = "SELECT * FROM CARDS WHERE ID = ?";
    db.all(query, [cardId], (err, rows) => {
      if (err) reject(err); // error management done outside
      else {
        // Convert row to Card object (expecting single result)
        if (rows.length > 0) {
          const card = new Card(rows[0].ID, rows[0].NAME, rows[0].IMAGEPATH, rows[0].MISERYINDEX);
          resolve(card);
        } else {
          resolve(null); // No card found
        }
      }
    });
  });
};

// GAME HISTORY QUERY
export const getGameRecordsByGameId = (gameId) => {
  return new Promise((resolve, reject)=> {
    const query = "SELECT * FROM GAME_RECORDS WHERE GAMEID = ?";
    db.all(query, [gameId], (err, rows) => {
      if (err) reject(err); // error management done outside
      else {
        // Convert rows to GameRecord objects
        const records = rows.map(row => new GameRecord(row.ID, row.GAMEID, row.CARDID, row.ROUND, row.WASGUESSED));
        resolve(records);
      }
    });
  });
};

export const createGameRecord = (gameId, cardId, round=0, wasGuessed=null, wasConsidered=null) => {
  return new Promise((resolve, reject)=> {
    const query = "INSERT INTO GAME_RECORDS (GAMEID, CARDID, ROUND, WASGUESSED, WASCONSIDERED) VALUES (?, ?, ?, ?, ?)";
    db.run(
      query,
      [gameId, cardId, round, wasGuessed, wasConsidered],
      function (err) {
        if (err) reject(err); // error management done outside
        else {
          resolve(this.lastID);
        }
      }
    );
  });
};

export const updateGameRecord = (gameId, round, wasGuessed, wasConsidered) => {
  return new Promise((resolve, reject)=> {
    const query = "UPDATE GAME_RECORDS SET WASGUESSED = ?, WASCONSDIERED= ? WHERE GAMEID = ? AND ROUND = ?";
    db.run(query, [wasGuessed?1:0, wasConsidered?1:0, gameId, round], function(err) {
      if (err) reject(err);
      else {
        resolve(this.changes);
      }
    });
  });
}

// Get games with their complete records (composite query)
export const getGamesWithRecords = async (userid) => {
  try {
    const gameRows = await getGamesByUser(userid);
    const cards = await getCards();

    const gamesWithRecords = await Promise.all(
      gameRows.map(async (gameRow) => {
        const recordRows = await getGameRecordsByGameId(gameRow.ID);
        const records = recordRows.map(
          (row) =>
            new GameRecord(
              row.ID,
              row.GAMEID,
              cards.find((card) => card.ID === row.CARDID),
              row.ROUND,
              row.WASGUESSED
            )
        );

        return new Game(
          gameRow.ID,
          gameRow.USERID,
          gameRow.CREATEDAT,
          gameRow.ISENDED,
          gameRow.ISDEMO,
          records
        );
      })
    );

    return gamesWithRecords;
  } catch (error) {
    throw error;
  }
};
