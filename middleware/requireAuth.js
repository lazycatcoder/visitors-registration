const User = require('../models/user');


const requireAuth = async (req, res, next) => {
  const userId = req.cookies.userId;
  const authenticated = req.cookies.authenticated;
  const accessToken = req.cookies.accessToken;

  try {
    if (!userId || !authenticated || !accessToken) {
      return res.status(401).end();
    }

    next();
  } catch (err) {
    res.status(500).json({ message: 'Authentication check failed' });
  }
};


module.exports = requireAuth;