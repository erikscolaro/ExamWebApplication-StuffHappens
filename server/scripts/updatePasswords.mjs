#!/usr/bin/env node

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'database.sqlite');

console.log('Updating users with correct password hashes...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Database connected for password update');
});

// Update jacksparrow with correct hash
const updateJack = `
  UPDATE USERS 
  SET HASHEDPASSWORD = ?, SALT = ?
  WHERE USERNAME = ?
`;

db.run(
  updateJack,
  [
    "5408041faad41553ee776e8b7320d84e998cdf1398d263a7bd3bc21791c7e9ae",
    "732b46940d6b4a1cccbba10363c17bef",
    "jacksparrow",
  ],
  (err) => {
    if (err) {
      console.error("Error updating jacksparrow:", err);
    } else {
      console.log("Updated jacksparrow password");
    }
  }
);

// Update pirataarrabbiato99 with correct hash
db.run(
  updateJack,
  [
    "ed3eb93372fc4173cc6a332dcfae9ea4ef7af0a9eb736b9f94e59f6b4df19930",
    "2a71df3f9a7a24eb4f57367c95f42bff",
    "pirataarrabbiato99",
  ],
  (err) => {
    if (err) {
      console.error("Error updating pirataarrabbiato99:", err);
    } else {
      console.log("Updated pirataarrabbiato99 password");
    }
  }
);

// Close database
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Password update complete');
    }
  });
}, 500);
