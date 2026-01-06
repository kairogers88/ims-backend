const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Storage (Where to save the temp file)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Save with timestamp to prevent overwriting
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter & Limit Configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1 * 1024 * 1024, // 1 MB in bytes (Strict Limit)
    },
    // Optional: First line of defense (Extension check). 
    // Real security happens in your Controller with Magic Numbers.
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
});

// Helper to check extension (Optional but recommended)
function checkFileType(file, cb) {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Files of this type are not allowed!'));
    }
}

module.exports = upload;