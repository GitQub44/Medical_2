const { connectDB } = require('./db');

module.exports = async (req, res) => {
    // Устанавливаем заголовки CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // Обработка OPTIONS запроса для CORS
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    // Проверяем метод запроса
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            message: 'Метод не разрешен' 
        });
    }

    try {
        // Читаем тело запроса
        let body = '';
        for await (const chunk of req) {
            body += chunk.toString();
        }

        const { name, email, password, role } = JSON.parse(body);

        // Валидация полей
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Все поля обязательны'
            });
        }

        // Подключаемся к базе данных
        const db = await connectDB();
        const usersCollection = db.collection('users');

        // Проверяем существование пользователя
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Пользователь уже существует'
            });
        }

        // Создаем нового пользователя
        const newUser = { 
            name, 
            email, 
            password, // В реальном проекте нужно хешировать!
            role,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Сохраняем пользователя в базу данных
        const result = await usersCollection.insertOne(newUser);

        // Возвращаем успешный ответ
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
        console.error('Ошибка в auth:', error);
        
        // Обрабатываем разные типы ошибок
        if (error instanceof SyntaxError) {
            return res.status(400).json({
                success: false,
                message: 'Неверный формат JSON'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};