var express = require('express');
var router = express.Router();
const User = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', async (req, res, next) => {
  var { email } = req.body;
  var user = await User.find({ email });
  try {
    if (!user) {
      var newuser = await User.create(req.body);
      var token = newuser.jwtToken();
      res.json({ user: newuser.userJSON() });
    } else {
      res.json({ error: 'email already registered' });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  var { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'email/password is required' });
  }
  try {
    var user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Email not registered!' });
    }
    var result = await user.verifyPassword(password);
    if (!result) {
      return res.status(400).json({ error: 'Incorrect Password!' });
    }
    var token = await user.signToken();
    res.json({ user: user.jsonData(token) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
