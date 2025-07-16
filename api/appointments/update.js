const { connectDB } = require('../db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { appointmentId, userId, updates } = req.body;
    const db = await connectDB();

    // Verify appointment exists
    const appointment = await db.collection('appointments').findOne({ 
      _id: new ObjectId(appointmentId) 
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Verify ownership (patient can only update their own appointments)
    if (appointment.patientId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this appointment' });
    }

    // Check if trying to change date/time
    if (updates.date) {
      // Verify new time is available
      const existing = await db.collection('appointments').findOne({
        doctorId: appointment.doctorId,
        date: new Date(updates.date),
        status: { $ne: 'cancelled' },
        _id: { $ne: new ObjectId(appointmentId) }
      });

      if (existing) {
        return res.status(400).json({ 
          error: 'Doctor not available at the new time' 
        });
      }
    }

    // Prepare update object
    const updateObj = {
      ...updates,
      updatedAt: new Date()
    };

    // Perform update
    await db.collection('appointments').updateOne(
      { _id: new ObjectId(appointmentId) },
      { $set: updateObj }
    );

    // Notify doctor via WebSocket if needed
    // (Would need to implement WebSocket logic)

    return res.json({ 
      success: true,
      message: 'Appointment updated successfully'
    });

  } catch (err) {
    console.error('Update error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};