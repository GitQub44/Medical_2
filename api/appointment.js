// In-memory storage (replace with DB)
const appointments = [];
const doctorSchedules = {
    // Example structure
    'dr-smith': {
        available: ['09:00', '10:00', '14:00'],
        specialty: 'cardiology'
    }
};

module.exports = async (req, res) => {
    // CORS and method handling as before...
    
    if (req.method === 'POST') {
        const { patientId, doctorId, category, symptoms, urgency } = req.body;
        
        // Validate
        if (!doctorSchedules[doctorId]) {
            return res.status(400).json({ error: 'Доктор не найден' });
        }
        
        // Create appointment
        const appointment = {
            id: Date.now(),
            patientId,
            doctorId,
            category,
            symptoms,
            urgency,
            status: 'waiting',
            createdAt: new Date().toISOString()
        };
        
        appointments.push(appointment);
        
        // Find next available slot
        const schedule = doctorSchedules[doctorId];
        const nextSlot = schedule.available.shift(); // Remove first available slot
        
        return res.json({
            success: true,
            appointment,
            queuePosition: appointments.filter(a => 
                a.doctorId === doctorId && a.status === 'waiting').length,
            estimatedTime: nextSlot || 'Сегодня'
        });
    }
    
    // Other methods...
};