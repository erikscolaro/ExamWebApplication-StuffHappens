#!/usr/bin/env node

import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path relative to server directory
const dbPath = path.join(__dirname, "..", "data", "database.db");

console.log("Initializing database at:", dbPath);
console.log("Current directory:", process.cwd());

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err);
    process.exit(1);
  }
  console.log("Connected to SQLite database");
});

// Check existing tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
  if (err) {
    console.error("Error checking tables:", err);
    return;
  }

  console.log("Existing tables:");
  rows.forEach((row) => {
    console.log(" -", row.name);
  });

  // If USERS table doesn't exist, create it (plural convention)
  if (!rows.find((row) => row.name === "USERS")) {
    console.log("Creating USERS table...");

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
        console.error("Error creating USERS table:", err);
      } else {
        console.log("USERS table created successfully");

        // Insert test users with correct hashes
        const insertUser1 = `
          INSERT INTO USERS (USERNAME, HASHEDPASSWORD, SALT)
          VALUES ('noobplayer', '5408041faad41553ee776e8b7320d84e998cdf1398d263a7bd3bc21791c7e9ae', '732b46940d6b4a1cccbba10363c17bef')
        `;

        const insertUser2 = `
          INSERT INTO USERS (USERNAME, HASHEDPASSWORD, SALT)
          VALUES ('progamer', 'ed3eb93372fc4173cc6a332dcfae9ea4ef7af0a9eb736b9f94e59f6b4df19930', '2a71df3f9a7a24eb4f57367c95f42bff')
        `;

        db.run(insertUser1, (err) => {
          if (err) console.error("Error inserting user 1:", err);
          else console.log("User noobplayer inserted");
        });

        db.run(insertUser2, (err) => {
          if (err) console.error("Error inserting user 2:", err);
          else console.log("User proplayer inserted");
        });
      }
    });
  }

  // If CARDS table doesn't exist, create it (plural convention)
  if (!rows.find((row) => row.name === "CARDS")) {
    console.log("Creating CARDS table...");
    const createCardsTable = `
      CREATE TABLE CARDS (
        ID INTEGER PRIMARY KEY,
        NAME TEXT NOT NULL,
        IMAGEPATH TEXT NOT NULL,
        MISERYINDEX REAL UNIQUE NOT NULL
      )
    `;

    db.run(createCardsTable, (err) => {
      const cards = [
        {
          name: "Lose your pen during the written exam",
          miseryIndex: 1.0,
        },
        {
          name: "Printer runs out of ink before the thesis",
          miseryIndex: 2.5,
        },
        {
          name: "The cafeteria ran out of everything, even bread",
          miseryIndex: 5.0,
        },
        {
          name: "You realize you were in the wrong classroom and missed the exam",
          miseryIndex: 7.5,
        },
        {
          name: "You're asked about the chapter you didn't study",
          miseryIndex: 10.0,
        },
        {
          name: "You fall asleep during an important lecture",
          miseryIndex: 12.5,
        },
        {
          name: "You're called for attendance while you're in the bathroom",
          miseryIndex: 15.0,
        },
        {
          name: "The professor forgets to record your grade",
          miseryIndex: 17.5,
        },
        {
          name: "Wi-Fi drops during an online exam",
          miseryIndex: 20.0,
        },
        {
          name: "You slip on the stairs in front of everyone",
          miseryIndex: 22.5,
        },
        {
          name: "Your project gets accidentally deleted from the server",
          miseryIndex: 25.0,
        },
        {
          name: "You finish the thesis and you find out your advisor retired",
          miseryIndex: 27.5,
        },
        {
          name: "Your roommate steals food from the fridge",
          miseryIndex: 30.0,
        },
        {
          name: "The microphone doesn't work during your presentation",
          miseryIndex: 32.5,
        },
        {
          name: "Your water bottle explodes in your bag, soaking everything",
          miseryIndex: 35.0,
        },
        {
          name: "Professor stares at you for 30 minutes during the exam",
          miseryIndex: 37.5,
        },
        {
          name: "You forget to submit the project before the deadline",
          miseryIndex: 40.0,
        },
        {
          name: "One of your shoes breaks in the middle of campus",
          miseryIndex: 42.5,
        },
        {
          name: "You embarrass yourself during the oral exam",
          miseryIndex: 45.0,
        },
        {
          name: "You find out you left the gas on at home",
          miseryIndex: 47.5,
        },
        {
          name: "Stuck in a project group where nobody does anything",
          miseryIndex: 50.0,
        },
        {
          name: "You lose your university ID badge before an exam",
          miseryIndex: 52.5,
        },
        {
          name: "Your university ID photo looks awful",
          miseryIndex: 55.0,
        },
        {
          name: "You have a cold during the written exam",
          miseryIndex: 57.5,
        },
        {
          name: "Your wireless mouse freezes mid-project",
          miseryIndex: 60.0,
        },
        {
          name: "You drop your phone in the university bathroom",
          miseryIndex: 62.5,
        },
        {
          name: "Prof’s done, but the blackboard’s full of hieroglyphics",
          miseryIndex: 65.0,
        },
        {
          name: "You drop your pizza on the floor in front of everyone",
          miseryIndex: 67.5,
        },
        {
          name: "You arrive in class and find out the exam was online",
          miseryIndex: 70.0,
        },
        {
          name: "You hand in the exam but forget to sign it",
          miseryIndex: 72.5,
        },
        {
          name: "You lose connection during the online graduation",
          miseryIndex: 75.0,
        },
        {
          name: "A pigeon hits you entering the university",
          miseryIndex: 77.5,
        },
        {
          name: "You nap in the library and snore in front of everyone",
          miseryIndex: 80.0,
        },
        {
          name: "Your classmate claims your project as theirs",
          miseryIndex: 82.5,
        },
        {
          name: "Advisor makes you redo everything a week before graduation",
          miseryIndex: 85.0,
        },
        {
          name: "You drop your laptop down the stairs",
          miseryIndex: 87.5,
        },
        {
          name: "You get caught cheating and your exam is canceled",
          miseryIndex: 90.0,
        },
        {
          name: "Your zipper breaks during the presentation",
          miseryIndex: 92.5,
        },
        {
          name: "A stranger insults you during your thesis defense",
          miseryIndex: 95.0,
        },
        {
          name: "You fail exams and lose your scholarship",
          miseryIndex: 97.5,
        },
        {
          name: "You find out the course you need was canceled",
          miseryIndex: 99.0,
        },
        {
          name: "Your professor skips your graduation session",
          miseryIndex: 100.0,
        },
        {
          name: "You get hiccups during the oral exam",
          miseryIndex: 61.0,
        },
        {
          name: "You realize you took the wrong exam",
          miseryIndex: 63.5,
        },
        {
          name: "Your name is pronounced wrong at graduation",
          miseryIndex: 66.0,
        },
        {
          name: "our alarm breaks and you miss the year's only exam",
          miseryIndex: 68.5,
        },
        {
          name: "You're recorded singing in the bathroom without knowing",
          miseryIndex: 71.0,
        },
        {
          name: "You confuse “mute” and “unmute” during video lessons",
          miseryIndex: 73.5,
        },
        {
          name: "Webcam freezes on a ridiculous face during presentation",
          miseryIndex: 78.5,
        },
        {
          name: "The 12-credit course you attended was not in your plan",
          miseryIndex: 81.0,
        },
      ];

      if (err) {
        console.error("Error creating CARDS table:", err);
      } else {
        console.log("CARDS table created successfully");
        // Insert sample cards with misery index equal to their ID (as requested)
        for (let i = 0; i < 50; i++) {
          const insertCard = `
            INSERT INTO CARDS (ID, NAME, IMAGEPATH, MISERYINDEX) 
            VALUES (?, ?, ?, ?)
          `;
          
          db.run(
            insertCard,
            [i, cards[i].name, `card${i}.jpg`, cards[i].miseryIndex],
            (err) => {
              if (err) console.error(`Error inserting card ${i}:`, err);
            }
          );
        }
        console.log("50 cards inserted with misery index equal to their ID");
      }
    });
  }

  // If GAMES table doesn't exist, create it (plural convention)
  if (!rows.find((row) => row.name === "GAMES")) {
    console.log("Creating GAMES table...");
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
        console.error("Error creating GAMES table:", err);
      } else {
        console.log("GAMES table created successfully");
      }
    });
  }

  // If GAME_RECORDS table doesn't exist, create it (plural convention)
  if (!rows.find((row) => row.name === "GAME_RECORDS")) {
    console.log("Creating GAME_RECORDS table...");
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
        console.error("Error creating GAME_RECORDS table:", err);
      } else {
        console.log("GAME_RECORDS table created successfully");
      }
    });
  }

  // Close database after operations
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err);
      } else {
        console.log("Database initialization complete");
      }
    });
  }, 1000);
});
