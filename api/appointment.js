const appointments = [];

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                const data = JSON.parse(body);
                const newAppointment = {
                    id: Date.now().toString(),
                    ...data,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };
                
                appointments.push(newAppointment);
                const queuePosition = appointments.filter(a => 
                    a.doctorId === data.doctorId && a.status === 'pending').length;

                return res.status(201).json({
                    success: true,
                    message: 'Запись создана',
                    appointmentId: newAppointment.id,
                    queuePosition
                });
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Неверный формат данных'
            });
        }
    } else {
        return res.status(405).json({
            success: false,
            message: 'Метод не разрешен'
        });
    }
};