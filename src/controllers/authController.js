const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const AppError = require('../utils/appError');

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Register user
exports.register = async (req, res, next) => {
  try {
    const { name, phoneNumber, email, password, companyName, logo, timezone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (existingUser) {
      return next(new AppError('User with this phone number already exists', 400));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        phoneNumber,
        email,
        password: hashedPassword,
        companyName,
        logo,
        timezone: timezone || 'UTC',
        role: 'USER'
      }
    });

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;

    // Check if phone and password are provided
    if (!phoneNumber || !password) {
      return next(new AppError('Please provide phone number and password', 400));
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (!user) {
      return next(new AppError('Invalid phone number or password', 401));
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return next(new AppError('Invalid phone number or password', 401));
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide current password and new password', 400));
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Check if current password is correct
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordCorrect) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};
