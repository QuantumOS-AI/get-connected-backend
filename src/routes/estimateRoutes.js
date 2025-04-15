const express = require('express');
const { 
  getAllEstimates, 
  getEstimateById, 
  createEstimate, 
  updateEstimate, 
  deleteEstimate, 
  changeStatus, 
  getEstimateMetrics,
  convertToJob
} = require('../controllers/estimateController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes need authentication
router.use(protect);

/**
 * @swagger
 * /api/estimates:
 *   get:
 *     summary: Get all estimates
 *     tags: [Estimates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Estimate'
 *   post:
 *     summary: Create a new estimate
 *     tags: [Estimates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leadName:
 *                 type: string
 *               address:
 *                 type: string
 *               scope:
 *                 type: string
 *               bidAmount:
 *                 type: number
 *                 format: float
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *               clientId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Estimate created successfully
 */
/**
 * @swagger
 * /api/estimates/metrics:
 *   get:
 *     summary: Get estimate metrics
 *     tags: [Estimates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/metrics', getEstimateMetrics);

router.route('/')
  .get(getAllEstimates)
  .post(createEstimate);

/**
 * @swagger
 * /api/estimates/{id}:
 *   get:
 *     summary: Get estimate by ID
 *     tags: [Estimates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Estimate ID
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Estimate'
 *   put:
 *     summary: Update estimate by ID
 *     tags: [Estimates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Estimate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leadName:
 *                 type: string
 *               address:
 *                 type: string
 *               scope:
 *                 type: string
 *               bidAmount:
 *                 type: number
 *                 format: float
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *               clientId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Estimate updated successfully
 *   delete:
 *     summary: Delete estimate by ID
 *     tags: [Estimates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Estimate ID
 *     responses:
 *       204:
 *         description: Estimate deleted successfully
 */
router.route('/:id')
  .get(getEstimateById)
  .put(updateEstimate)
  .delete(deleteEstimate);


/**
 * @swagger
 * /api/estimates/{id}/status:
 *   put:
 *     summary: Change estimate status
 *     tags: [Estimates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Estimate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estimate status changed successfully
 */
router.put('/:id/status', changeStatus);

/**
 * @swagger
 * /api/estimates/{id}/convert-to-job:
 *   post:
 *     summary: Convert estimate to job
 *     tags: [Estimates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Estimate ID
 *     responses:
 *       201:
 *         description: Estimate converted to job successfully
 */
router.post('/:id/convert-to-job', convertToJob);

/**
 * @swagger
 * /api/estimates/metrics:
 *   get:
 *     summary: Get estimate metrics
 *     tags: [Estimates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/metrics', getEstimateMetrics);

module.exports = router;
