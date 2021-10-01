var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', async (req, res, next) => {
  var { email } = req.body;
  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ error: 'email already exist' });
    }

    let newUser = await User.create(data);
    var token = await newUser.signToken();
    res.status(200).json({ user: newUser.userJSON(token) });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: ' Email/Password is required.' });
  }
  try {
    var user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: ' Email not registered.' });
    }
    var result = await user.verifyPassword(password);
    if (!result) {
      return res.status(400).json({ error: 'Password is wrong.' });
    }
    var token = await user.signToken();
    res.status(200).json({ user: user.userJSON(token) });
  } catch (error) {
    return error;
  }
});

router.get('/:username', async (req, res, next) => {
  var username = req.params.username;
  try {
    var user = await User.findOne({ username: username });
    if (user) {
      return res.status(201).json({ profile: user });
    } else {
      return res.status(400).json({ error: 'No such user exists' });
    }
  } catch (error) {
    next(error);
  }
});

router.use(auth.verifyToken);

router.get('/', async (req, res, next) => {
  let id = req.user.userId;
  try {
    let user = await User.findById(id);
    res.status(200).json({ displayUser });
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  let id = req.user.userId;
  try {
    user = await User.findByIdAndUpdate(id, req.body.user, { new: true });
    return res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
