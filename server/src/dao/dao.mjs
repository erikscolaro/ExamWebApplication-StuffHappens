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
    const query = "SELECT * FROM USER WHERE USERNAME = ?";
    db.get(query, [username], (err, row) => {
      if (err) reject(err);
      else if (row === undefined) resolve(false); // for passport authentication
      else {
        const user = new User(row.ID, row.USERNAME, row.HASHEDPASSWORD, row.SALT);
        crypto.scrypt(password, row.SALT, 16, function(err, hashedPassword) {
          if (err) reject(err);
          if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword)) resolve(false);
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
    const query = "SELECT * FROM GAME WHERE USERID = ? AND ISFINISHED = 1";
    db.all(query, [userid], (err, rows) => {
      if (err) reject(err); // error management done outside
      else {
        // Convert rows to GameDB objects
        const games = rows.map(row => new Game(row.ID, row.USERID, row.CREATEDAT, row.ISENDED, row.ISDEMO));
        resolve(games);
      }
    });
  });
};

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

export const createGameRecord = (gameId, cardId, round=0, wasGuessed=null) => {
  return new Promise((resolve, reject)=> {
    const query = "INSERT INTO GAME_RECORDS (GAMEID, CARDID, ROUND, WASGUESSED) VALUES (?, ?, ?, ?)";
    db.run(query, [gameId, cardId, round, wasGuessed], function(err) {
      if (err) reject(err); // error management done outside
      else {
        resolve(this.lastID);
      }
    });
  });
};

export const updateGameRecord = (gameId, cardId, round=0, wasGuessed=null) => {
  return new Promise((resolve, reject)=> {
    const query = "UPDATE GAME_RECORDS SET WASGUESSED = ? WHERE GAMEID = ? AND CARDID = ? AND ROUND = ?";
    db.run(query, [wasGuessed, gameId, cardId, round], function(err) {
      if (err) reject(err);
      else {
        resolve(this.changes);
      }
    });
  });
}

// Get games with their complete records (composite query)
export const getGamesWithRecords = (userid) => {
  return new Promise(async (resolve, reject) => {
    try {
      // First get all games for user
      const gamesQuery = "SELECT * FROM GAMES WHERE USERID = ? AND ISENDED = 1";
      
      db.all(gamesQuery, [userid], async (err, gameRows) => {
        if (err) {
          reject(err);
          return;
        }
        
        // For each game, get its records
        const gamesWithRecords = await Promise.all(
          gameRows.map(async (gameRow) => {
            const recordsQuery = "SELECT * FROM GAME_RECORDS WHERE GAMEID = ?";
            
            return new Promise((resolveGame, rejectGame) => {
              db.all(recordsQuery, [gameRow.ID], (err, recordRows) => {
                if (err) {
                  rejectGame(err);
                  return;
                }
                
                // Convert record rows to GameRecord objects
                const records = recordRows.map(row => 
                  new GameRecord(row.ID, row.GAMEID, row.CARDID, row.ROUND, row.WASGUESSED)
                );
                
                // Create GameDB with records
                const game = new Game(
                  gameRow.ID, 
                  gameRow.USERID, 
                  gameRow.CREATEDAT, 
                  gameRow.ISENDED, 
                  gameRow.ISDEMO,
                  records // Include the records array
                );
                
                resolveGame(game);
              });
            });
          })
        );
        
        resolve(gamesWithRecords);
      });
    } catch (error) {
      reject(error);
    }
  });
};