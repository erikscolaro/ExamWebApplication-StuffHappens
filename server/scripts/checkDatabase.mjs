#!/usr/bin/env node

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'database.sqlite');

console.log('Checking database contents...');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Database opened successfully');
});

// Check users table
db.all("SELECT * FROM USERS", [], (err, rows) => {
  if (err) {
    console.error('Error querying USERS:', err);
    return;
  }
  
  console.log('USERS table contents:');
  rows.forEach(row => {
    console.log('ID:', row.ID);
    console.log('USERNAME:', row.USERNAME);
    console.log('HASHEDPASSWORD:', row.HASHEDPASSWORD);
    console.log('HASHEDPASSWORD length:', row.HASHEDPASSWORD ? row.HASHEDPASSWORD.length : 'null');
    console.log('SALT:', row.SALT);
    console.log('---');
  });

  db.close();
});
