const express = require('express');
const router = express.Router();
const { googleLogin } = require('../controllers/userController'); // Path sahi karein

// ... aapke doosre routes ...
router.post('/google-login', googleLogin);

module.exports = router;