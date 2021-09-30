const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: String,
    email: String,
    password: String,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
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
  var payload = { id: this.id, email: this.email };
  try {
    var token = await jwt.sign(payload, 'somesecretcode');
    return token;
  } catch (error) {
    return error;
  }
};

userSchema.methods.jsonData = function (token) {
  return {
    name: this.name,
    email: this.email,
    token: token,
  };
};
module.exports = mongoose.model('User', userSchema);