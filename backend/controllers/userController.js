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