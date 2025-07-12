const doctors = [
    { id: 'd1', name: 'Доктор Иванова', specialty: 'cardiology', schedule: ['Пн', 'Ср', 'Пт'] },
    { id: 'd2', name: 'Доктор Петров', specialty: 'ophthalmology', schedule: ['Вт', 'Чт'] },
    { id: 'd3', name: 'Доктор Сидорова', specialty: 'traumatology', schedule: ['Пн-Пт'] }
];

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false,
            message: 'Метод не разрешен' 
        });
    }

    try {
        const { specialty } = req.query;
        const filteredDoctors = specialty 
            ? doctors.filter(d => d.specialty === specialty)
            : doctors;

        return res.status(200).json({
            success: true,
            data: filteredDoctors
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
};