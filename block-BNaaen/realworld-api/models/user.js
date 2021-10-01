var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String },
    avatar: { type: String },
    following: { type: Boolean },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  try {
    if (this.password && this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.verifyPassword = async function (password) {
  try {
    let result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    return error;
  }
};

userSchema.methods.signToken = async function () {
  let payload = {
    userId: this.id,
    email: this.email,
    username: this.username,
    name: this.name,
  };
  try {
    let token = await jwt.sign(payload, process.env.SECRET);
    return token;
  } catch (error) {
    return error;
  }
};

userSchema.methods.userJSON = function (token) {
  return {
    name: this.name,
    username: this.username,
    email: this.email,
    bio: this.bio,
    avatar: this.avatar,
    token: token,
  };
};

module.exports = mongoose.model('User', userSchema);
