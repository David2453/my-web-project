const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asigură-te că directorul pentru uploads există
const uploadDir = path.join(__dirname, '../../uploads/bikes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurare storage pentru multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Generează un nume unic pentru fișier
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bike-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtru pentru a accepta doar imagini
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Nu este o imagine validă!'), false);
  }
};

// Configurare multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limitează dimensiunea la 5MB
  }
});

module.exports = upload; 