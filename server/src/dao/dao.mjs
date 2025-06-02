import sqlite from 'sqlite3'
import crypto from 'crypto';
import CONFIG from '../config/config';

// open the database
const db = new sqlite.Database(CONFIG.DB_NAME, (err) => {
  if (err) throw err;
});

// USER QUERY
export const getUser = (username) => {
  return new Promise((resolve, reject)=> {
    const query = "SELECT * FROM USER WHERE USERNAME = ?";
    db.all(query, [username], (err, rows) => {
      if (err) reject(err); // error management done outside
      else {
        resolve(rows); //to do
      }
    });
  });
};

// GAME QUERY

//return the past games that are ended (not the partial ones)
export const listGames = (userid) => {
  return new Promise((resolve, reject)=> {
    const query = "SELECT * FROM GAME WHERE USERID = ? AND ISFINISHED = 1";
    db.all(query, [userid], (err, rows) => {
      if (err) reject(err); // error management done outside
      else {
        resolve(rows); //to do
      }
    });
  });
};

export const createGame = () => {
  return new Promise((resolve, reject)=> {
    const query = "";
    db.all(query, [/*arguments of sql query */], (err, rows) => {
      if (err) reject(err); // error management done outside
      else {
        resolve(rows); //to do
      }
    });
  });
};

// CARDS QUERY
export const listCards = () => {
  return new Promise((resolve, reject)=> {
    const query = "";
    db.all(query, [/*arguments of sql query */], (err, rows) => {
      if (err) reject(err); // error management done outside
      else {
        resolve(rows); //to do
      }
    });
  });
};

export const getCard = (cardId) => {
  return new Promise((resolve, reject)=> {
    const query = "";
    db.all(query, [/*arguments of sql query */], (err, rows) => {
      if (err) reject(err); // error management done outside
      else {
        resolve(rows); //to do
      }
    });
  });
};

// GAME HISTORY QUERY
export const listGameRecords = (gameId) => {
  return new Promise((resolve, reject)=> {
    const query = "";
    db.all(query, [/*arguments of sql query */], (err, rows) => {
      if (err) reject(err); // error management done outside
      else {
        resolve(rows); //to do
      }
    });
  });
};

export const createGameRecord = () => {
  return new Promise((resolve, reject)=> {
    const query = "";
    db.all(query, [/*arguments of sql query */], (err, rows) => {
      if (err) reject(err); // error management done outside
      else {
        resolve(rows); //to do
      }
    });
  });
};