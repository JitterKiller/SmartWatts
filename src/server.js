const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const cors = require('cors');

const app = express();
const port = 5001;

// Enable CORS for all requests from frontend
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from Next.js frontend
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type'
}));

app.use(express.json());

// Ensure the `uploads/` directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.post('/api', upload.single('file'), (req, res) => {
  const formData = req.body;
  const file = req.file;

  // ✅ Prepare input data for the model
  const inputData = [
    Number(formData.numberOfRooms),
    Number(formData.numberOfPersons),
    Number(formData.houseArea),
    formData.isACOn === 'true' ? 1 : 0,
    formData.isTVOn === 'true' ? 1 : 0,
    formData.isFlat === 'true' ? 1 : 0,
    formData.isUrban === 'true' ? 1 : 0,
    Number(formData.numberOfChildren),
  ];

  console.log("Running prediction with input:", inputData);

  // ✅ Call Python script with input data
  execFile('python3', ['./model/prediction.py', ...inputData.map(String)], (error, stdout, stderr) => {
    if (error) {
      console.error("Execution error:", error);
      return res.status(500).json({ message: 'Error executing Python script', error: stderr });
    }

    console.log("Python output:", stdout);
    res.json({ message: 'Success', prediction: stdout.trim() });
  });
});

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
