const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { response } = require('express');
const csrf = require('csurf');
const bcrypt = require('bcryptjs');


let globalCsrfToken;


exports.showLoginPage = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  globalCsrfToken = req.csrfToken();
  res.render('auth', { csrfToken: globalCsrfToken });
};


exports.showSignupPage = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  globalCsrfToken = req.csrfToken();
  res.render('auth', { csrfToken: globalCsrfToken });
};


exports.signup = async function (req, res) {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const csrfToken = req.body._csrf;

    if (!req.session || csrfToken !== globalCsrfToken) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    globalCsrfToken = null;

    const existingUser = await User.findOne({ username: username });

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const user = new User({
      username: username,
      email: email,
      password: password,
    });

    await user.save();

    res.status(200).json({ message: 'The user is successfully registered' });
  } catch (err) {
    res.status(500).json({ message: 'Registration error' });
  }
};


exports.checkUser = async function(req, res) {
  try {
    var username = req.body.username;
    var user = await User.findOne({ username: username });

    res.status(200).json({ exists: !!user });
  } catch (err) {
    res.status(500).send(err);
  }
};


exports.login = async function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const csrfToken = req.body._csrf;

    if (!req.session || csrfToken !== globalCsrfToken) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Incorrect username or password" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect username or password" });
    }

    const accessToken = user.accessToken;

    if (accessToken) {
      user.accessToken = '';
      await user.save();

      res.clearCookie('userId');
      res.clearCookie('authenticated');
      res.clearCookie('accessToken');

      req.session.destroy((err) => {
        if (err) {
          console.log('Session destroy error')
          throw err;
        }
      });
    }

    const token = jwt.sign({ userId: user._id }, 'your-secret-key');

    user.accessToken = token;
    await user.save();

    res.cookie('accessToken', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    res.cookie('userId', user._id.toString(), {
      httpOnly: false,
      sameSite: 'strict',
      secure: true,
    });

    res.cookie('authenticated', true, {
      httpOnly: false,
      sameSite: 'strict',
      secure: true,
    });

    res.json({ redirectTo: '/' });
  } catch (err) {
    res.status(500).json({ message: 'Authentication failed' });
  }
};


exports.logout = async function (req, res) {
  try {
    const userId = req.cookies.userId;

    const user = await User.findById(userId);
    user.accessToken = '';
    await user.save();

    res.clearCookie('userId');
    res.clearCookie('authenticated');
    res.clearCookie('accessToken');

    req.session.destroy((err) => {
      if (err) {
        console.log('Session destroy error')
        throw err;
      }
      res.redirect('/');
    });
  } catch (err) {
    res.status(500).json({ message: 'Logout error' });
  }
};