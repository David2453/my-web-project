const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asigură-te că directorul pentru uploads există
const uploadDir = path.join(__dirname, '../../uploads/bikes');
console.log('Upload directory:', uploadDir);

try {
  if (!fs.existsSync(uploadDir)) {
    console.log('Creating upload directory...');
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Upload directory created successfully');
  } else {
    console.log('Upload directory already exists');
  }
} catch (err) {
  console.error('Error creating upload directory:', err);
}

// Configurare storage pentru multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    console.log('Saving file to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Generează un nume unic pentru fișier
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'bike-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// Filtru pentru a accepta doar imagini
const fileFilter = (req, file, cb) => {
  console.log('Received file:', file);
  if (file.mimetype.startsWith('image/')) {
    console.log('File accepted:', file.originalname);
    cb(null, true);
  } else {
    console.log('File rejected:', file.originalname);
    cb(new Error('Nu este o imagine validă!'), false);
  }
};

// Configurare multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload; 