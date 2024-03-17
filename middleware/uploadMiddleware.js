const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Configure multer storage and file name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Create multer upload instance
const upload = multer({ storage: storage });

// Custom file upload middleware
const uploadMiddleware = (req, res, next) => {
  // Use multer upload instance
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const FileDate = Date.now();
    // Retrieve uploaded files
    const file = req.file;
    const UploadedType = req.body.UploadedType;
    const errors = [];

    // Validate file types and sizes
    // files.forEach((file) => {
    // const allowedTypes = ["image/jpeg", "image/png"];
    // const maxSize = 5 * 1024 * 1024; // 5MB

    // if (!allowedTypes.includes(file.mimetype)) {
    //   errors.push(`Invalid file type: ${file.originalname}`);
    // }

    // if (file.size > maxSize) {
    //   errors.push(`File too large: ${file.originalname}`);
    // }
    // });

    // Handle validation errors
    if (errors.length > 0) {
      // Remove uploaded files
      fs.unlinkSync(file.path);

      return res.status(400).json({ errors });
    }

    // Attach files to the request object
    req.file = file;
    req.UploadedType = UploadedType;
    req.fileDate = FileDate;

    // Proceed to the next middleware or route handler
    next();
  });
};

module.exports = { uploadMiddleware };
