const { connectDB } = require('../db');

module.exports = async (req, res) => {
  const db = await connectDB();
  
  // Create appointment
  if (req.method === 'POST') {
    const { patientId, doctorId, type, date, duration, notes } = req.body;
    
    // Check doctor availability
    const existing = await db.collection('appointments').findOne({ 
      doctorId, 
      date,
      status: { $ne: 'cancelled' }
    });
    
    if (existing) {
      return res.status(400).json({ error: "Doctor not available at this time" });
    }

    const result = await db.collection('appointments').insertOne({
      patientId,
      doctorId,
      type, // 'in-person', 'video', 'chat'
      date,
      duration,
      notes,
      status: 'pending',
      createdAt: new Date()
    });

    return res.status(201).json(result.ops[0]);
  }

  // Get appointments
  if (req.method === 'GET') {
    const { userId, role } = req.query;
    let query = {};
    
    if (role === 'patient') query.patientId = userId;
    if (role === 'doctor') query.doctorId = userId;
    
    const appointments = await db.collection('appointments')
      .find(query)
      .sort({ date: 1 })
      .toArray();
    
    return res.json(appointments);
  }

  res.status(405).end();
};