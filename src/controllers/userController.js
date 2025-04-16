const prisma = require('../config/db');
const AppError = require('../utils/appError');

// Get current user profile
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, companyName, logo, timezone } = req.body;

    // Create object with allowed fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (companyName) updateData.companyName = companyName;
    if (logo) updateData.logo = logo;
    if (timezone) updateData.timezone = timezone;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update company info
exports.updateCompanyInfo = async (req, res, next) => {
  try {
    const { companyName, logo } = req.body;

    if (!companyName && !logo) {
      return next(new AppError('Please provide company name or logo', 400));
    }

    const updateData = {};
    if (companyName) updateData.companyName = companyName;
    if (logo) updateData.logo = logo;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
      message: 'Company information updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete user account
exports.deleteAccount = async (req, res, next) => {
  try {
    // Note: In a real application, you would need to handle cascading deletes
    // or have proper foreign key constraints in place
    await prisma.user.delete({
      where: { id: req.user.id }
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();

    // Remove password from response
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.status(200).json({
      success: true,
      data: usersWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};
