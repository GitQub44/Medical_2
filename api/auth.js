// api/auth.js
const users = []; // Temporary storage

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            message: 'Только POST запросы разрешены' 
        });
    }

    try {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { name, email, password, role } = JSON.parse(body);

                // Validate input
                if (!email || !password) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email и пароль обязательны'
                    });
                }

                // Check if user exists
                if (users.some(u => u.email === email)) {
                    return res.status(409).json({
                        success: false,
                        message: 'Пользователь уже существует'
                    });
                }

                // Create user
                const newUser = { 
                    id: Date.now(), 
                    name, 
                    email, 
                    password, 
                    role 
                };
                users.push(newUser);

                return res.status(201).json({
                    success: true,
                    message: 'Регистрация успешна',
                    user: { id: newUser.id, name, email, role }
                });

            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Неверный формат данных'
                });
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
};