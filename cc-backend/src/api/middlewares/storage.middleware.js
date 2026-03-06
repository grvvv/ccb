const multer = require('multer');

const imageFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

const storage = multer.memoryStorage(); // store files in memory (buffer)

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Optional: limit to 5MB
  },
});

module.exports = upload;
