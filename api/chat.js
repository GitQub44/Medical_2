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
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: "Неверный запрос" });
        }

        // Simple medical responses
        const responses = {
            "давление": "Нормальное кровяное давление: 120/80 мм рт.ст.",
            "bmi": "ИМТ рассчитывается как вес (кг) / (рост (м))².",
            "пульс": "Нормальный пульс в покое: 60-100 ударов в минуту.",
            "default": "Я медицинский помощник. Спросите о давлении, ИМТ или пульсе."
        };

        const lowerMsg = message.toLowerCase();
        let reply = responses.default;

        if (lowerMsg.includes("давлен")) reply = responses["давление"];
        if (lowerMsg.includes("bmi") || lowerMsg.includes("имт")) reply = responses["bmi"];
        if (lowerMsg.includes("пульс")) reply = responses["пульс"];

        return res.status(200).json({ 
            success: true,
            reply 
        });

    } catch (error) {
        console.error('Chat error:', error);
        return res.status(500).json({ 
            error: "Ошибка обработки запроса",
            details: error.message 
        });
    }
};