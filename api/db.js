// api/db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

// api/db.js
const { db } = require('@vercel/postgres');
module.exports = db;

// Verify env var is loaded
if (!process.env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in .env file");
}

const uri = process.env.MONGODB_URI;

// Connection settings
const client = new MongoClient(uri, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Successfully connected to MongoDB!");
    return client.db("medical");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

module.exports = { connectDB };