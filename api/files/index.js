const { connectDB } = require('../db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage }).array('files');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    upload(req, res, async (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const db = await connectDB();
      const files = req.files.map(file => ({
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        sender: req.body.senderId,
        receiver: req.body.receiverId,
        createdAt: new Date()
      }));
      
      await db.collection('files').insertMany(files);
      res.json({ message: 'Files uploaded successfully' });
    });
  } else if (req.method === 'GET') {
    const db = await connectDB();
    const files = await db.collection('files')
      .find({ $or: [{ sender: req.query.userId }, { receiver: req.query.userId }] })
      .toArray();
    res.json(files);
  } else {
    res.status(405).end();
  }
};