const prisma = require('../config/db');
const AppError = require('../utils/appError');
const { PAGINATION } = require('../config/constants');
const { createCalendarEvent } = require('../utils/createCalendarEvent');

// Get all estimates
exports.getAllEstimates = async (req, res, next) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      status,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

   // Build where clause
    let where = {};
    if (req.user.role === 'USER') {
      where.createdBy = req.user.id;
    }
    if (status) where.status = status;

    // Count total estimates matching query
    const total = await prisma.estimate.count({ where });

    // Determine sort order
    const orderBy = {};
    orderBy[sortBy] = order === 'asc' ? 'asc' : 'desc';

    // Get estimates with pagination
    const estimates = await prisma.estimate.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true
          }
        }
      },
      orderBy,
      skip,
      take: Number(limit)
    });

    res.status(200).json({
      success: true,
      data: estimates,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get estimate by ID
exports.getEstimateById = async (req, res, next) => {
  try {
    let where = {
      id: req.params.id,
    };

    if (req.user.role === 'USER') {
      where.createdBy = req.user.id;
    }
    const estimate = await prisma.estimate.findFirst({
      where: where,
      include: {
        client: true
      }
    });

    if (!estimate) {
      return next(new AppError('Estimate not found', 404));
    }

    res.status(200).json({
      success: true,
      data: estimate
    });
  } catch (error) {
    next(error);
  }
};

// Create a new estimate
exports.createEstimate = async (req, res, next) => {
  try {
    const estimateData = {
      ...req.body,
      createdBy:
        req.user.role === 'ADMIN' ? req.body.createdBy : req.user.id,
    };

    const estimate = await prisma.estimate.create({
      data: estimateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: estimate,
      message: 'Estimate created successfully'
    });

    // Create calendar event
    await createCalendarEvent({
      title: estimate.leadName,
      description: `Address: ${estimate.address}, Scope: ${estimate.scope}`,
      startTime: estimate.createdAt,
      endTime: estimate.createdAt,
      location: estimate.address,
      eventType: 'estimate',
      relatedId: null,
      createdBy: req.user.id
    });

  } catch (error) {
    next(error);
  }
};

// Update an estimate
exports.updateEstimate = async (req, res, next) => {
  try {
    const estimateExists = await prisma.estimate.findFirst({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });

    if (!estimateExists) {
      return next(new AppError('Estimate not found', 404));
    }

    const estimate = await prisma.estimate.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: estimate,
      message: 'Estimate updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete an estimate
exports.deleteEstimate = async (req, res, next) => {
  try {
    const estimateExists = await prisma.estimate.findFirst({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });

    if (!estimateExists) {
      return next(new AppError('Estimate not found', 404));
    }

    await prisma.estimate.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Estimate deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Change estimate status
exports.changeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return next(new AppError('Please provide a status', 400));
    }

    const estimateExists = await prisma.estimate.findFirst({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });

    if (!estimateExists) {
      return next(new AppError('Estimate not found', 404));
    }

    const estimate = await prisma.estimate.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: estimate,
      message: 'Estimate status changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get estimate metrics
exports.getEstimateMetrics = async (req, res, next) => {
  try {
    console.log('getEstimateMetrics function called');
    const { days = 30 } = req.query;
    let daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(days));

    // Ensure daysAgo is not in the future
    if (daysAgo > new Date()) {
      daysAgo = new Date();
    }

    // Get all estimates in the specified period
    const estimates = await prisma.estimate.findMany({
      where: {
        createdBy: req.user.id,
        createdAt: { gte: daysAgo }
      }
    });

    // Count accepted estimates
    const acceptedEstimates = estimates.filter(estimate => estimate.status === 'accepted').length;

    // Calculate total bid amount
    const totalGrossBids = estimates.reduce((sum, estimate) => sum + estimate.bidAmount, 0);

    // Calculate close rate
    const closeRate = estimates.length > 0
      ? (acceptedEstimates / estimates.length) * 100
      : 0;

    const closeRateFormatted = estimates.length > 0 ? parseFloat(closeRate.toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      data: {
        estimatesCreated: estimates.length,
        acceptedEstimates,
        totalGrossBids,
        closeRate: closeRateFormatted
      }
    });
  } catch (error) {
    next(error);
  }
};

// Convert estimate to job
exports.convertToJob = async (req, res, next) => {
  try {
    // Find the estimate
    const estimate = await prisma.estimate.findFirst({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      },
      include: {
        client: true
      }
    });

    if (!estimate) {
      return next(new AppError('Estimate not found', 404));
    }

    // Create job from estimate
    const jobData = {
      name: req.body.name || `Job from estimate: ${estimate.leadName}`,
      address: estimate.address,
      price: estimate.bidAmount,
      startDate: req.body.startDate || estimate.startDate,
      endDate: req.body.endDate || null,
      status: 'open',
      clientId: estimate.clientId,
      createdBy: req.user.role === 'ADMIN' ? req.body.createdBy : req.user.id
    };

    // Use a transaction to ensure both operations succeed or fail together
    const [job, updatedEstimate] = await prisma.$transaction([
      // Create the job
      prisma.job.create({
        data: jobData,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              email: true
            }
          }
        }
      }),
      
      // Update estimate status if not already accepted
      prisma.estimate.update({
        where: { id: estimate.id },
        data: { 
          status: estimate.status !== 'accepted' ? 'accepted' : estimate.status 
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        job,
        estimate: updatedEstimate
      },
      message: 'Estimate converted to job successfully'
    });

    // Create calendar event for the new job
    await createCalendarEvent({
      title: job.name,
      description: `Address: ${job.address}, Price: ${job.price}`,
      startTime: job.createdAt,
      endTime: job.createdAt,
      location: job.address,
      eventType: 'job',
      relatedId: null,
      createdBy: req.user.id
    });

  } catch (error) {
    next(error);
  }
};
