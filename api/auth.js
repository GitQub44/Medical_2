const users = [];

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
        req.on('end', () => {
            try {
                const { name, email, password, role } = JSON.parse(body);

                if (!name || !email || !password || !role) {
                    return res.status(400).json({
                        success: false,
                        message: 'Все поля обязательны'
                    });
                }

                if (users.some(u => u.email === email)) {
                    return res.status(409).json({
                        success: false,
                        message: 'Пользователь уже существует'
                    });
                }

                const newUser = { 
                    id: Date.now().toString(),
                    name, 
                    email, 
                    password, 
                    role,
                    createdAt: new Date().toISOString()
                };
                users.push(newUser);

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