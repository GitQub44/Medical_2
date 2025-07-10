// Temporary storage (replace with database)
const pressureReadings = [];

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // Handle OPTIONS for CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    try {
        // Handle POST
        if (req.method === 'POST') {
            const { systolic, diastolic, pulse } = req.body;

            if (!systolic || !diastolic) {
                return res.status(400).json({ 
                    error: "Необходимо указать верхнее и нижнее давление" 
                });
            }

            const reading = {
                systolic: parseInt(systolic),
                diastolic: parseInt(diastolic),
                pulse: pulse ? parseInt(pulse) : null,
                date: new Date().toISOString()
            };

            pressureReadings.push(reading);
            return res.status(201).json({ 
                success: true,
                message: "Данные давления сохранены",
                data: reading
            });
        }

        // Handle GET
        if (req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: pressureReadings
            });
        }

        // Other methods
        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Health API error:', error);
        return res.status(500).json({ 
            error: "Внутренняя ошибка сервера",
            details: error.message 
        });
    }
};