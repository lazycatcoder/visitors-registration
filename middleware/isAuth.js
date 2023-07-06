const User = require('../models/user');


const isAuth = async (req, res, next) => {
  const userId = req.cookies.userId;
  const authenticated = req.cookies.authenticated;
  const accessToken = req.cookies.accessToken;

  if (userId && authenticated && accessToken) {
    try {
      const user = await User.findById(userId);
      if (user && user.accessToken && await user.compareToken(accessToken)) {
        return res.redirect('/');
      }
    } catch (err) {
      console.error(err);
    }
  }

  next();
};


module.exports = isAuth;