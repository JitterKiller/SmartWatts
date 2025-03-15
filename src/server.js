const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors'); // ✅ Import CORS

const app = express();
const port = 5001;

// ✅ Enable CORS for all requests
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from Next.js frontend
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type'
}));

app.use(express.json());

// ✅ Ensure the `uploads/` directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ✅ Serve static files (uploaded files will be accessible via URL)
app.use('/uploads', express.static(uploadDir));

// ✅ API route for file upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
  res.json({ message: 'File uploaded successfully', fileUrl });
});

// ✅ Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
