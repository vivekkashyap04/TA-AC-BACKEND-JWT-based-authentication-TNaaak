var jwt = require('jsonwebtoken');

module.exports = {
  verifyToken: async (req, res, next) => {
    var token = req.headers.authorization;
    try {
      if (token) {
        var payload = jwt.verify(token, process.env.SECRET);
        req.user = payload;
        return next();
      } else {
        return res.status(401).json({ error: { body: ['Token Required'] } });
      }
    } catch (error) {
      next(error);
    }
  },
};
