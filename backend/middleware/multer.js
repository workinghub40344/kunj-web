const multer = require("multer");

// Memory storage for multer (we upload directly to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
