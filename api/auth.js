// Temporary storage (replace with database in production)
const users = [];

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Метод не разрешен',
            allowedMethods: ['POST']
        });
    }

    try {
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                error: 'Все поля обязательны',
                details: {
                    missing_fields: {
                        name: !name,
                        email: !email,
                        password: !password,
                        role: !role
                    }
                }
            });
        }

        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                error: 'Некорректный email'
            });
        }

        // Check if user exists
        if (users.some(user => user.email === email)) {
            return res.status(409).json({
                error: 'Пользователь с этим email уже зарегистрирован'
            });
        }

        // Create user (in production: hash password!)
        const newUser = {
            id: Date.now(),
            name,
            email,
            password, // In production: store hashed password only
            role,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        // Return success (excluding password in response)
        return res.status(201).json({
            success: true,
            message: 'Регистрация успешна',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            details: error.message
        });
    }
};