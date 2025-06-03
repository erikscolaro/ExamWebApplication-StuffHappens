#!/usr/bin/env node

import crypto from 'crypto';

// Get command line arguments
const password = process.argv[2] || "password";
const keylen = 32; // Default key length
const salt = "732b46940d6b4a1cccbba10363c17bef"; ; // Generate a random salt


try {
  // Generate hashed password
  const hashedPassword = crypto
    .scryptSync(password, Buffer.from(salt, "hex"), keylen)
    .toString("hex");
  
  console.log(`Password: ${password}`);
  console.log(`Salt: ${salt.toString('hex')}`);
  console.log(`Key length: ${keylen}`);
  console.log(`Hashed password: ${hashedPassword}`);
} catch (error) {
  console.error("Error generating hash:", error.message);
  process.exit(1);
}

// Usage: node hashedpasswordgen.mjs [password] [salt] [keylen]
// Example: node hashedpasswordgen.mjs mypassword 1234 32