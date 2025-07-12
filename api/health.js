// api/health.js
const pressureData = [];

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        return res.status(200).end();
    }

    try {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                const { systolic, diastolic, pulse } = JSON.parse(body);
                
                if (!systolic || !diastolic) {
                    return res.status(400).json({
                        success: false,
                        message: 'Укажите давление'
                    });
                }

                const record = {
                    systolic: Number(systolic),
                    diastolic: Number(diastolic),
                    pulse: pulse ? Number(pulse) : null,
                    date: new Date().toISOString()
                };
                
                pressureData.push(record);
                return res.json({ success: true, data: record });
            });
        }
        else if (req.method === 'GET') {
            return res.json({ success: true, data: pressureData });
        }
        else {
            return res.status(405).json({
                success: false,
                message: 'Метод не разрешен'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
};