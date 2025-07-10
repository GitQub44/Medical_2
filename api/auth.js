// In-memory "database" (replace with real DB in production)
const users = [];

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // Handle OPTIONS for CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({ 
                error: "Все поля обязательны для заполнения",
                missing: {
                    name: !name,
                    email: !email,
                    password: !password,
                    role: !role
                }
            });
        }

        // Check if user exists
        if (users.some(u => u.email === email)) {
            return res.status(409).json({ 
                error: "Пользователь с этим email уже существует" 
            });
        }

        // In production: Hash password before saving!
        const newUser = { id: Date.now(), name, email, password, role };
        users.push(newUser);

        return res.status(201).json({
            success: true,
            message: "Регистрация успешна!",
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
            error: "Внутренняя ошибка сервера",
            details: error.message 
        });
    }
};