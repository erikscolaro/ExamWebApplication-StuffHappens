#!/usr/bin/env node

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path relative to server directory
const dbPath = path.join(__dirname, '..', 'data', 'database.db');

console.log('Initializing database at:', dbPath);
console.log('Current directory:', process.cwd());

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Check existing tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
  if (err) {
    console.error('Error checking tables:', err);
    return;
  }
  
  console.log('Existing tables:');
  rows.forEach(row => {
    console.log(' -', row.name);
  });

  // If USERS table doesn't exist, create it (plural convention)
  if (!rows.find(row => row.name === 'USERS')) {
    console.log('Creating USERS table...');
    
    const createUsersTable = `
      CREATE TABLE USERS (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        USERNAME TEXT UNIQUE NOT NULL,
        HASHEDPASSWORD TEXT NOT NULL,
        SALT TEXT NOT NULL
      )
    `;
    
    db.run(createUsersTable, (err) => {
      if (err) {
        console.error('Error creating USERS table:', err);
      } else {
        console.log('USERS table created successfully');
        
        // Insert test users with correct hashes
        const insertUser1 = `
          INSERT INTO USERS (USERNAME, HASHEDPASSWORD, SALT)
          VALUES ('jacksparrow', '5408041faad41553ee776e8b7320d84e998cdf1398d263a7bd3bc21791c7e9ae', '732b46940d6b4a1cccbba10363c17bef')
        `;
        
        const insertUser2 = `
          INSERT INTO USERS (USERNAME, HASHEDPASSWORD, SALT)
          VALUES ('pirataarrabbiato99', 'ed3eb93372fc4173cc6a332dcfae9ea4ef7af0a9eb736b9f94e59f6b4df19930', '2a71df3f9a7a24eb4f57367c95f42bff')
        `;
        
        db.run(insertUser1, (err) => {
          if (err) console.error('Error inserting user 1:', err);
          else console.log('User jacksparrow inserted');
        });
        
        db.run(insertUser2, (err) => {
          if (err) console.error('Error inserting user 2:', err);
          else console.log('User pirataarrabbiato99 inserted');
        });
      }
    });
  }

  // If CARDS table doesn't exist, create it (plural convention)
  if (!rows.find(row => row.name === 'CARDS')) {
    console.log('Creating CARDS table...');
      const createCardsTable = `
      CREATE TABLE CARDS (
        ID INTEGER PRIMARY KEY,
        NAME TEXT NOT NULL,
        IMAGEPATH TEXT NOT NULL,
        MISERYINDEX REAL UNIQUE NOT NULL
      )
    `;
    
    db.run(createCardsTable, (err) => {
      if (err) {
        console.error('Error creating CARDS table:', err);
      } else {
        console.log('CARDS table created successfully');
          // Insert sample cards with misery index equal to their ID (as requested)
        for (let i = 0; i < 50; i++) {
          const insertCard = `
            INSERT INTO CARDS (ID, NAME, IMAGEPATH, MISERYINDEX) 
            VALUES (?, ?, ?, ?)
          `;
          // Misery index equals the card ID (as requested)
          const miseryIndex = i;
          db.run(insertCard, [i, `Card ${i}`, `card${i}.jpg`, miseryIndex], (err) => {
            if (err) console.error(`Error inserting card ${i}:`, err);
          });
        }
        console.log('50 cards inserted with misery index equal to their ID');
      }
    });
  }

  // If GAMES table doesn't exist, create it (plural convention)
  if (!rows.find(row => row.name === 'GAMES')) {
    console.log('Creating GAMES table...');
      const createGamesTable = `
      CREATE TABLE GAMES (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        USERID INTEGER,
        CREATEDAT TEXT NOT NULL,
        ROUND INTEGER DEFAULT 1,
        ISENDED INTEGER DEFAULT 0,
        ISDEMO INTEGER DEFAULT 0,
        LIVESREMAINING INTEGER DEFAULT 3,
        FOREIGN KEY (USERID) REFERENCES USERS(ID)
      )
    `;
    
    db.run(createGamesTable, (err) => {
      if (err) {
        console.error('Error creating GAMES table:', err);
      } else {
        console.log('GAMES table created successfully');
      }
    });
  }

  // If GAME_RECORDS table doesn't exist, create it (plural convention)
  if (!rows.find(row => row.name === 'GAME_RECORDS')) {
    console.log('Creating GAME_RECORDS table...');
      const createGameRecordsTable = `
      CREATE TABLE GAME_RECORDS (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      GAMEID INTEGER NOT NULL,
      CARDID INTEGER NOT NULL,
      ROUND INTEGER NOT NULL,
      WASGUESSED INTEGER,
      REQUESTEDAT TEXT,
      RESPONDEDAT TEXT,
      FOREIGN KEY (GAMEID) REFERENCES GAMES(ID),
      FOREIGN KEY (CARDID) REFERENCES CARDS(ID)
      )
    `;
    
    db.run(createGameRecordsTable, (err) => {
      if (err) {
        console.error('Error creating GAME_RECORDS table:', err);
      } else {
        console.log('GAME_RECORDS table created successfully');
      }
    });
  }

  // Close database after operations
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database initialization complete');
      }
    });
  }, 1000);
});
