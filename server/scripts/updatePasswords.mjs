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

db.run(updateJack, ['3c8e325569c54efa9e8e37ec34047e1a', '1234', 'jacksparrow'], (err) => {
  if (err) {
    console.error('Error updating jacksparrow:', err);
  } else {
    console.log('Updated jacksparrow password');
  }
});

// Update pirataarrabbiato99 with correct hash
db.run(updateJack, ['0cec3c1f9ceefb3cf6a8adea00f02f71ab7f00f871bf0d797ebee7119e123e57e', '16', 'pirataarrabbiato99'], (err) => {
  if (err) {
    console.error('Error updating pirataarrabbiato99:', err);
  } else {
    console.log('Updated pirataarrabbiato99 password');
  }
});

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
