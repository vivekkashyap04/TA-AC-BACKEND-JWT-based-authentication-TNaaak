var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/dashboard', auth.verifyToken, (req, res, next) => {
  res.json({ message: 'Protected Route' });
});

module.exports = router;
