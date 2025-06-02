#!/usr/bin/env node

import crypto from 'crypto';

// Get command line arguments
const password = process.argv[2] || "password";
const salt = process.argv[3] || "16";
const keylen = parseInt(process.argv[4]) || 32;

// Validate inputs
if (!salt || salt.length === 0) {
  console.error("Error: Salt cannot be empty");
  process.exit(1);
}

if (isNaN(keylen) || keylen <= 0) {
  console.error("Error: Key length must be a positive number");
  process.exit(1);
}

try {
  // Generate hashed password
  const hashedPassword = crypto.scryptSync(password, salt.toString(), keylen).toString('hex');
  
  console.log(`Password: ${password}`);
  console.log(`Salt: ${salt}`);
  console.log(`Key length: ${keylen}`);
  console.log(`Hashed password: ${hashedPassword}`);
} catch (error) {
  console.error("Error generating hash:", error.message);
  process.exit(1);
}

// Usage: node hashedpasswordgen.mjs [password] [salt] [keylen]
// Example: node hashedpasswordgen.mjs mypassword 1234 32