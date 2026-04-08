const express = require('express');
const passport = require('passport');
const generateToken = require('../utils/generateToken');
const router = express.Router();
const {
    registerUser,
    authUser,
    getUserProfile,
    getUsers,
    updateUserProfile,
    sendPasswordResetOTP,
    verifyOTPAndResetPassword
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);

// Google OAuth Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, generate token and redirect
        const token = generateToken(req.user._id);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login-success?token=${token}`);
    }
);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.post('/password-reset-otp', protect, sendPasswordResetOTP);
router.put('/reset-password', protect, verifyOTPAndResetPassword);

router.get('/', protect, admin, getUsers);

module.exports = router;
