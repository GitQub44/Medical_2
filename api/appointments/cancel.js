const { connectDB } = require('../db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { appointmentId, userId, role } = req.body;
    const db = await connectDB();

    // Verify appointment exists
    const appointment = await db.collection('appointments').findOne({ 
      _id: new ObjectId(appointmentId) 
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify ownership
    if (
      (role === 'patient' && appointment.patientId !== userId) ||
      (role === 'doctor' && appointment.doctorId !== userId)
    ) {
      return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
    }

    // Update status to cancelled
    await db.collection('appointments').updateOne(
      { _id: new ObjectId(appointmentId) },
      { $set: { status: 'cancelled', cancelledAt: new Date() } }
    );

    // Notify the other party via WebSocket if needed
    // (Would need to implement WebSocket logic)

    return res.json({ 
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (err) {
    console.error('Cancel error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};