var express = require('express');
var router = express.Router();
var User = require('../models/User');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.json({ message: 'user information' });
});

router.post('/register', async (req, res, next) => {
  try {
    var user = await User.create(req.body);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  var { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: ' email/password requrired' });
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
    return res.status(200).json({ message: 'User logged in sucessfully!' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
