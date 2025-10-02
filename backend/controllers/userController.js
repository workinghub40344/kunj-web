const admin = require('../config/firebaseAdmin');
const User = require('../models/userModel');
const generateToken = require('../utils//generateTokens');

exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { name, email, picture } = decodedToken;

    let user = await User.findOne({ email });

    if (user) {
      user.name = name;
      user.profilePicture = picture;
      await user.save();
    } else {
      user = new User({
        name,
        email,
        profilePicture: picture,
      });
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      isAdmin: user.isAdmin,
      phone: user.phone,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error('Backend Google login error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
};