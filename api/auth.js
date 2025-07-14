const { connectDB } = require('./db');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

module.exports = async (req, res) => {
    // Устанавливаем заголовки CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Обработка OPTIONS запроса
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Проверяем метод запроса
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            message: 'Разрешены только POST-запросы' 
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
                message: 'Все поля обязательны для заполнения'
            });
        }

        // Проверка формата email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Неверный формат email'
            });
        }

        // Проверка длины пароля
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Пароль должен содержать минимум 6 символов'
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
                message: 'Пользователь с таким email уже существует'
            });
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Создаем нового пользователя
        const newUser = { 
            name, 
            email, 
            password: hashedPassword,
            role,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Сохраняем пользователя
        const result = await usersCollection.insertOne(newUser);

        // Успешный ответ
        return res.status(201).json({
            success: true,
            message: 'Регистрация успешно завершена',
            user: {
                id: result.insertedId,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        
        if (error instanceof SyntaxError) {
            return res.status(400).json({
                success: false,
                message: 'Неверный формат данных'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        });
    }
};