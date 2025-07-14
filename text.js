// test-db.js
const { connectDB } = require('./api/db');

(async () => {
  try {
    const db = await connectDB();
    console.log("Success! Database connected.");
    process.exit();
  } catch (err) {
    console.error("Connection failed:", err);
  }
})();