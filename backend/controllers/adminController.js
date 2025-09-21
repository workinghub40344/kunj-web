const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// JWT token generate
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
exports.registerAdmin = async (req, res) => {
    const { username, password } = req.body; // change here
    try {
        const adminExists = await Admin.findOne({ username }); // change here
        if (adminExists) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const admin = await Admin.create({ username, password }); // change here

        res.status(201).json({
            _id: admin._id,
            username: admin.username,
            token: generateToken(admin._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login
exports.loginAdmin = async (req, res) => {
    const { username, password } = req.body; // change here
    try {
        const admin = await Admin.findOne({ username }); // change here
        if (admin && await admin.matchPassword(password)) {
            res.json({
                _id: admin._id,
                username: admin.username,
                token: generateToken(admin._id)
            });
        } else {
            res.status(401).json({ message: "Invalid username or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
