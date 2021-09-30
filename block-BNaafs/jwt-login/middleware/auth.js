var jwt = require('jsonwebtoken');

module.exports = {
  verifyToken: async (req, res, next) => {
    var token = req.headers.authorization;
    try {
      if (token) {
        var payload = await jwt.sign(token, 'somesecretcode');
        req.users = payload;
      } else {
        res.status(400).json({ error: 'Token required' });
      }
    } catch (error) {
      return error;
    }
  },
};
