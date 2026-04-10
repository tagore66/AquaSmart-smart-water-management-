const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto');

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        firstName,
        lastName,
        email,
        password
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            name: user.name,
            email: user.email,
            recoveryEmail: user.recoveryEmail,
            role: user.role
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.recoveryEmail = req.body.recoveryEmail || user.recoveryEmail;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            name: updatedUser.name,
            email: updatedUser.email,
            recoveryEmail: updatedUser.recoveryEmail,
            role: updatedUser.role,
            token: generateToken(updatedUser._id)
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Send Password Reset OTP
// @route   POST /api/users/password-reset-otp
// @access  Private
const sendPasswordResetOTP = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        try {
            await sendEmail({
                email: user.email,
                subject: 'AquaSmart - Password Reset OTP',
                message: `Your OTP for password reset is: ${otp}. This OTP will expire in 10 minutes.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #f9f9f9;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #2563eb; margin: 0;">AquaSmart</h1>
                            <p style="color: #64748b; margin-top: 5px;">Secure Smart Water Management</p>
                        </div>
                        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <h2 style="color: #1e293b; margin-top: 0; text-align: center;">Password Reset Verification</h2>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello ${user.firstName},</p>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6;">You requested to change your password. Please use the following One-Time Password (OTP) to complete the process:</p>
                            <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; margin: 30px 0;">
                                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${otp}</span>
                            </div>
                            <p style="color: #64748b; font-size: 14px; text-align: center;">This code is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
                        </div>
                        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 30px;">
                            © 2026 AquaSmart Management System. All rights reserved.
                        </p>
                    </div>
                `
            });
            res.json({ message: 'OTP sent to your email' });
        } catch (error) {
            user.resetPasswordOTP = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            res.status(500).json({ message: 'Error sending email' });
        }
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Verify OTP and Reset Password
// @route   PUT /api/users/reset-password
// @access  Private
const verifyOTPAndResetPassword = async (req, res) => {
    const { otp, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (user && user.resetPasswordOTP === otp && user.resetPasswordExpires > Date.now()) {
        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: 'Password reset successful' });
    } else if (user && user.resetPasswordOTP !== otp) {
        res.status(400).json({ message: 'Invalid OTP' });
    } else if (user && user.resetPasswordExpires <= Date.now()) {
        res.status(400).json({ message: 'OTP expired' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Verify OTP Only (Preliminary check)
// @route   POST /api/users/verify-otp
// @access  Private
const verifyOTPOnly = async (req, res) => {
    const { otp } = req.body;
    const user = await User.findById(req.user._id);

    if (user && user.resetPasswordOTP === otp && user.resetPasswordExpires > Date.now()) {
        res.json({ message: 'OTP verified successfully' });
    } else if (user && user.resetPasswordOTP !== otp) {
        res.status(400).json({ message: 'Invalid OTP' });
    } else if (user && user.resetPasswordExpires <= Date.now()) {
        res.status(400).json({ message: 'OTP expired' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const users = await User.find({});
    res.json(users);
};

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    getUsers,
    updateUserProfile,
    sendPasswordResetOTP,
    verifyOTPAndResetPassword,
    verifyOTPOnly
};
