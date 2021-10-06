var express = require('express');
var router = express.Router();
var User = require('../models/user');
var auth = require('../middleware/auth');

/* GET users listing. */
router.get('/', auth.verifyToken, function (req, res, next) {
  res.send('respond with a resource');
  console.log(req.user);
});

//register

router.post('/register', async (req, res, next) => {
  var { email } = req.body;
  try {
    var user = await User.findOne({ email });
    console.log(user.username);
    if (user) {
      res.status(400).json({ error: 'email is already registered' });
    } else {
      var newUser = await User.create(req.body);
      var token = newUser.signToken();
      res.status(200).json({ user: newUser.jsonData(token) });
    }
  } catch (error) {
    next(error);
  }
});

//login

router.post('/login', async (req, res, next) => {
  var { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email/Password required' });
    }

    let user = await User.findOne({ email });
    console.log(user);

    if (!user) {
      return res.status(400).json({ error: 'User is not registered' });
    }

    let result = await user.verifyPassword(password);

    if (!result) {
      return res.status(400).json({ error: 'Incorrect password' });
    }
    if (user.isBlocked === false) {
      res.status(400).json({ error: 'Please contact admin' });
    }

    let token = await user.signToken();
    user = await user.jsonData(token);
    console.log(user);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

//get current-user

router.get('/current-user', auth.verifyToken, async (req, res, next) => {
  var token = req.headers.authorization;
  var id = req.user.id;
  try {
    var user = await User.findById(id);
    var userData = await user.jsonData(token);
    res.json({ userData });
  } catch (error) {
    next(error);
  }
});

//edit
router.get('/profile/:username', async (req, res, next) => {
  var username = req.params.username;
  try {
    var user = await User.findOne({ username });
    if (user) {
      var data = await user.profileData();
      res.json({ data });
    } else {
      res.json({ error: 'username is not matched with any user' });
    }
  } catch (error) {
    next(error);
  }
});

//update profile
router.put('/profile/:username', auth.verifyToken, async (req, res, next) => {
  var uername = req.params.username;
  try {
    var user = await User.findOneAndUpdate({ username }, req.body);
    res.json({ user: user.profileData() });
  } catch (error) {
    next(error);
  }
});

//follow
router.get('/follow/:id', async (req, res, next) => {
  var randomUser = req.params.id;
  var userId = req.user.id;
  try {
    if (randomUser === userId) {
      res.json({ error: 'you cannot follow yourself' });
    } else {
      let follower = await User.findByIdAndUpdate(randomUser, {
        $push: { followers: userId },
      });
      let following = await User.findByIdAndUpdate(userId, {
        $push: { following: randomUser },
      });
      res.json({ follower, following });
    }
  } catch (error) {
    next(error);
  }
});

//unfollow
router.get('/unfollow/:id', async (req, res, next) => {
  var randomUser = req.params.id;
  var userId = req.user.id;
  try {
    if (randomUser === userId) {
      res.json({ error: 'you cannot follow yourself' });
    } else {
      let follower = await User.findByIdAndUpdate(randomUser, {
        $pull: { followers: userId },
      });
      let following = await User.findByIdAndUpdate(userId, {
        $pull: { following: randomUser },
      });
      res.json({ follower, following });
    }
  } catch (error) {
    next(error);
  }
});

//block

router.get('/block/:username', async (req, res, next) => {
  let username = req.params.username;
  try {
    let blockUser = await User.findOneAndUpdate(
      { username },
      { isBlocked: false }
    );
    res.json({ blockUser });
  } catch (error) {
    next(error);
  }
});

router.get('/unblock/:username', async (req, res, next) => {
  let username = req.params.username;
  try {
    let unblockUser = await User.findOneAndUpdate(
      { username },
      { isBlocked: true }
    );
    res.json({ unblockUser });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
