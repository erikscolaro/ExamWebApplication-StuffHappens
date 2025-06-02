#!/usr/bin/env node

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path relative to server directory
const dbPath = path.join(__dirname, '..', 'data', 'database.sqlite');

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

  // If USER table doesn't exist, create it
  if (!rows.find(row => row.name === 'USER')) {
    console.log('Creating USER table...');
    
    const createUserTable = `
      CREATE TABLE USER (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        USERNAME TEXT UNIQUE NOT NULL,
        HASHEDPASSWORD TEXT NOT NULL,
        SALT TEXT NOT NULL
      )
    `;
    
    db.run(createUserTable, (err) => {
      if (err) {
        console.error('Error creating USER table:', err);
      } else {
        console.log('USER table created successfully');
        
        // Insert test users
        const insertUser1 = `
          INSERT INTO USER (USERNAME, HASHEDPASSWORD, SALT)
          VALUES ('jacksparrow', 'ef661d309d6e55c4dce1719d72d85bdb3a7f0460b31e0664e5ad485138401749', 'salt1')
        `;
        
        const insertUser2 = `
          INSERT INTO USER (USERNAME, HASHEDPASSWORD, SALT)
          VALUES ('pirataarrabbiato99', 'c6ff3fc2178b7d4c6aa6a6bf0e5b95e6f44d1a5bd04a45a1b8a1e7c5d7e8f9a0', 'salt2')
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

  // If CARD table doesn't exist, create it
  if (!rows.find(row => row.name === 'CARD')) {
    console.log('Creating CARD table...');
    
    const createCardTable = `
      CREATE TABLE CARD (
        ID INTEGER PRIMARY KEY,
        NAME TEXT NOT NULL,
        IMAGE TEXT NOT NULL
      )
    `;
    
    db.run(createCardTable, (err) => {
      if (err) {
        console.error('Error creating CARD table:', err);
      } else {
        console.log('CARD table created successfully');
        
        // Insert sample cards
        for (let i = 0; i < 50; i++) {
          const insertCard = `
            INSERT INTO CARD (ID, NAME, IMAGE) 
            VALUES (?, ?, ?)
          `;
          db.run(insertCard, [i, `Card ${i}`, `card${i}.jpg`], (err) => {
            if (err) console.error(`Error inserting card ${i}:`, err);
          });
        }
        console.log('50 cards inserted');
      }
    });
  }

  // If GAME table doesn't exist, create it
  if (!rows.find(row => row.name === 'GAME')) {
    console.log('Creating GAME table...');
    
    const createGameTable = `
      CREATE TABLE GAME (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        USER_ID INTEGER NOT NULL,
        CREATED_AT TEXT NOT NULL,
        STATUS TEXT NOT NULL DEFAULT 'ongoing',
        CURRENT_ROUND INTEGER DEFAULT 1,
        SCORE INTEGER DEFAULT 0,
        FOREIGN KEY (USER_ID) REFERENCES USER(ID)
      )
    `;
    
    db.run(createGameTable, (err) => {
      if (err) {
        console.error('Error creating GAME table:', err);
      } else {
        console.log('GAME table created successfully');
      }
    });
  }

  // If GAME_RECORD table doesn't exist, create it
  if (!rows.find(row => row.name === 'GAME_RECORD')) {
    console.log('Creating GAME_RECORD table...');
    
    const createGameRecordTable = `
      CREATE TABLE GAME_RECORD (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        GAME_ID INTEGER NOT NULL,
        ROUND_NUMBER INTEGER NOT NULL,
        CARD_ID INTEGER NOT NULL,
        USER_POSITION INTEGER,
        CORRECT_POSITION INTEGER,
        IS_CORRECT BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (GAME_ID) REFERENCES GAME(ID),
        FOREIGN KEY (CARD_ID) REFERENCES CARD(ID)
      )
    `;
    
    db.run(createGameRecordTable, (err) => {
      if (err) {
        console.error('Error creating GAME_RECORD table:', err);
      } else {
        console.log('GAME_RECORD table created successfully');
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
