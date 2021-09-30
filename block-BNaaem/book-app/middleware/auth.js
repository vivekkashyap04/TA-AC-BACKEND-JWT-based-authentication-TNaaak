const jwt = require('jsonwebtoken');

module.exports = {
  verifyToken: async (req, res, next) => {
    var token = req.headers.authorization;
    try {
      if (token) {
        var payload = jwt.verify(token, 'somesecretcode');
        req.user = payload;
        next();
      } else {
        res.status(400).json({ error: 'token required' });
      }
    } catch (error) {
      next(error);
    }
  },
};
