const { connectDB } = require('../db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const db = await connectDB();
    
    // Check if user exists
    const exists = await db.collection('users').findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists" });

    // Hash password
    const hashedPass = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await db.collection('users').insertOne({
      name,
      email,
      password: hashedPass,
      role,
      createdAt: new Date()
    });

    res.status(201).json({
      user: {
        id: result.insertedId,
        name,
        email,
        role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};