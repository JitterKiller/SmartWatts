const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 5000;

// Configurez le stockage de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.use(express.json());

app.post('/api', upload.single('file'), (req, res) => {
  const formData = req.body;
  const file = req.file;

  // Ajoutez le chemin du fichier au formData
  formData.filePath = file.path;

  console.log('Form Data:', formData);
  res.json({ message: 'Success', data: formData });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});