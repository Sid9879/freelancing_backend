const express = require('express');
const router = express.Router();
const { registerUser, LoginUSer, getSingleUser, logoutUser, checkAuth, sendemail, googleLogin, setRole } = require('../controllers/authControllers');
const { body} = require('express-validator');
const { authMiddleware, me } = require('../middlewares/authMiddleware');


router.post('/register',[
body('name').notEmpty().withMessage('Name is required'),
  // body('role').notEmpty().withMessage('Role is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  // body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  // body('phone')
  // .notEmpty().withMessage('Phone number is required')
  // .isLength({ min: 10, max: 10 }).withMessage('Phone number must be 10 digits')

] ,registerUser);

router.post('/login', LoginUSer);
router.get('/me',authMiddleware, me);
router.get('/getUser',authMiddleware,getSingleUser);
router.post('/logout',authMiddleware,logoutUser);
router.get('/check',authMiddleware,checkAuth)
router.post('/contact',sendemail)
router.post("/google-login", googleLogin);
router.post('/set-role', authMiddleware, setRole);


module.exports = router;