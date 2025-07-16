const { connectDB } = require('../db');

module.exports = async (req, res) => {
  const db = await connectDB();
  
  // Get doctor schedule
  if (req.method === 'GET') {
    const { doctorId, date } = req.query;
    
    const schedule = await db.collection('appointments')
      .find({ 
        doctorId,
        date: { $gte: new Date(date) },
        status: { $ne: 'cancelled' }
      })
      .toArray();
    
    return res.json(schedule);
  }

  res.status(405).end();
};