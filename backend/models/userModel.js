const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    profilePicture: {
      type: String,
      default: 'https://i.pravatar.cc/150', 
    },
    password: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);

userSchema.index({ phone: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;