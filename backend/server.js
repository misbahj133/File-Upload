const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5001; // Port 5001 avoids macOS AirPlay receiver conflicts

// 1. Enable CORS for all cross-origin requests
app.use(cors());

// 2. Ensure 'uploads' directory exists automatically
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 3. Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// 4. Configure Multer File Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// 5. Test Root Route
app.get('/', (req, res) => {
  res.send('Backend upload server is active on port 5001!');
});

// 6. File Upload Endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    console.log('✅ File received and saved:', req.file.filename);

    return res.status(200).json({
      message: 'File uploaded successfully!',
      fileUrl,
      filename: req.file.originalname,
    });
  } catch (err) {
    console.error('❌ Server processing error:', err);
    return res.status(500).json({ error: 'Server failed to process file.' });
  }
});

// 7. Start Server on Port 5001
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Backend running on http://127.0.0.1:${PORT}`);
});