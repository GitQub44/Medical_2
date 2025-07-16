const { connectDB } = require('../db');

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('joinRoom', async ({ appointmentId }) => {
      socket.join(appointmentId);
      
      const db = await connectDB();
      const messages = await db.collection('messages')
        .find({ appointmentId })
        .sort({ createdAt: 1 })
        .toArray();
      
      socket.emit('previousMessages', messages);
    });

    socket.on('sendMessage', async ({ appointmentId, senderId, content }) => {
      const db = await connectDB();
      const message = {
        appointmentId,
        senderId,
        content,
        createdAt: new Date()
      };
      
      await db.collection('messages').insertOne(message);
      io.to(appointmentId).emit('newMessage', message);
    });

    socket.on('uploadFile', async ({ appointmentId, senderId, file }) => {
      // Handle file upload similar to files API
      // Then emit to room
      io.to(appointmentId).emit('newFile', file);
    });
  });
};