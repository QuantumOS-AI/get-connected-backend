const express = require('express');
const { getCurrentUser, updateProfile, updateCompanyInfo, deleteAccount, getAllUsers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes need authentication
router.use(protect);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', authorize('ADMIN'), getAllUsers);
/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/me', getCurrentUser);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: User profile updated successfully
 */
router.put('/profile', updateProfile);

/**
 * @swagger
 * /api/users/company:
 *   put:
 *     summary: Update company info
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               companyAddress:
 *                 type: string
 *     responses:
 *       200:
 *         description: Company info updated successfully
 */
router.put('/company', updateCompanyInfo);

/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User account deleted successfully
 */
router.delete('/account', deleteAccount);

module.exports = router;
