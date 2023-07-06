const User = require('../models/user');


const matchToken = async (req, res, next) => {
  const userId = req.cookies.userId;
  const authenticated = req.cookies.authenticated;
  const accessToken = req.cookies.accessToken;

  if (userId && authenticated) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return logout(req, res);
      }

      const isTokenMatch = user.accessToken === accessToken;
      if (!isTokenMatch) {
        return logout(req, res);
      }

      next();
    } catch (error) {
      console.error(error);
      return logout(req, res);
    }
  } else {
    next();
  }
};


const logout = (req, res) => {
  if (!req.cookies.userId || !req.cookies.authenticated) {
    // If you have already logged out, redirect to the login page
    return res.redirect('/auth/login');
  }

  // Clearing cookies
  res.clearCookie('userId');
  res.clearCookie('authenticated');
  res.clearCookie('accessToken');

  // Clearing the session
  req.session.destroy((err) => {
    if (err) {
      console.log('Session destroy error.');
      throw err;
    }

    res.redirect('/auth/login');
  });
};


module.exports = matchToken;