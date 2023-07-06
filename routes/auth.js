const express = require('express');
const authController = require('../controllers/authController');
const isAuth = require('../middleware/isAuth');
const router = express.Router();


router.get('/login', isAuth, authController.showLoginPage);
router.post('/login', authController.login);
router.get('/signup', isAuth, authController.showSignupPage);
router.post('/signup', authController.signup);
router.post('/checkuser', authController.checkUser);
router.get('/logout', authController.logout);


module.exports = router;