// api/auth.js
const { connectDB } = require('./db');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            message: 'Метод не разрешен' 
        });
    }

    try {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { name, email, password, role } = JSON.parse(body);

                if (!name || !email || !password || !role) {
                    return res.status(400).json({
                        success: false,
                        message: 'Все поля обязательны'
                    });
                }

                // Connect to MongoDB
                const db = await connectDB();
                const usersCollection = db.collection('users');

                // Check if user exists
                const existingUser = await usersCollection.findOne({ email });
                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        message: 'Пользователь уже существует'
                    });
                }

                // Create new user
                const newUser = { 
                    name, 
                    email, 
                    password, // Note: In production, you should hash this!
                    role,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                // Insert into MongoDB
                const result = await usersCollection.insertOne(newUser);

                return res.status(201).json({
                    success: true,
                    message: 'Регистрация успешна',
                    user: {
                        id: result.insertedId,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role
                    }
                });
            } catch (error) {
                console.error('Error in auth:', error);
                return res.status(400).json({
                    success: false,
                    message: 'Неверный формат данных'
                });
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
};