const { connectDB } = require('./db');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            message: 'Only POST requests allowed' 
        });
    }

    try {
        // Read request body
        let body = '';
        for await (const chunk of req) {
            body += chunk.toString();
        }

        const { name, email, password, role } = JSON.parse(body);

        // Validate fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Connect to DB
        const db = await connectDB();
        const usersCollection = db.collection('users');

        // Check if user exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = { 
            name, 
            email, 
            password: hashedPassword,
            role,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Insert user
        const result = await usersCollection.insertOne(newUser);

        // Return success (without password)
        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: {
                id: result.insertedId,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Auth error:', error);
        
        if (error instanceof SyntaxError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid JSON format'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};