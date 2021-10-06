const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new Schema(
  {
    name: String,
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: String,
    image: String,
    followers: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: true },
    useType: String,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
      next();
    } catch (error) {
      next(error);
    }
  }
  next();
});

userSchema.methods.verifyPassword = async function (password) {
  try {
    var result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    return error;
  }
};

userSchema.methods.signToken = async function () {
  var payload = { id: this.id, email: this.email, username: this.username };
  try {
    var token = await jwt.sign(payload, 'somesecretcode');
    return token;
  } catch (error) {
    return error;
  }
};

userSchema.methods.jsonData = async function (token) {
  return {
    username: this.username,
    email: this.email,
    token: token,
  };
};

userSchema.methods.profileData = async function () {
  return {
    username: this.username,
    name: this.name,
    email: this.email,
    bio: this.bio,
    image: this.image,
  };
};

module.exports = mongoose.model('User', userSchema);