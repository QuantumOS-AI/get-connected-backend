const prisma = require('../config/db');
const AppError = require('../utils/appError');
const { PAGINATION } = require('../config/constants');
const { createCalendarEvent } = require('../utils/createCalendarEvent');

// Get all jobs
exports.getAllJobs = async (req, res, next) => {
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

    // Count total jobs matching query
    const total = await prisma.job.count({ where });

    // Determine sort order
    const orderBy = {};
    orderBy[sortBy] = order === 'asc' ? 'asc' : 'desc';

    // Get jobs with pagination
    const jobs = await prisma.job.findMany({
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
      data: jobs,
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

// Get job by ID
exports.getJobById = async (req, res, next) => {
  try {
    let where = {
      id: req.params.id,
    };

    if (req.user.role === 'USER') {
      where.createdBy = req.user.id;
    }

    const job = await prisma.job.findFirst({
      where: where,
      include: {
        client: true
      }
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// Create a new job
exports.createJob = async (req, res, next) => {
  try {
    const jobData = {
      ...req.body,
      createdBy: req.user.role === 'ADMIN' ? req.body.createdBy : req.user.id,
    };

    const job = await prisma.job.create({
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
    });

    res.status(201).json({
      success: true,
      data: job,
      message: 'Job created successfully'
    });

    // Create calendar event
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

// Update a job
exports.updateJob = async (req, res, next) => {
  try {
    const jobExists = await prisma.job.findFirst({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });

    if (!jobExists) {
      return next(new AppError('Job not found', 404));
    }

    const job = await prisma.job.update({
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
      data: job,
      message: 'Job updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete a job
exports.deleteJob = async (req, res, next) => {
  try {
    const jobExists = await prisma.job.findFirst({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });

    if (!jobExists) {
      return next(new AppError('Job not found', 404));
    }

    await prisma.job.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get job metrics
exports.getJobMetrics = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    let daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(days));

    // Ensure daysAgo is not in the future
    if (daysAgo > new Date()) {
      daysAgo = new Date();
    }

    // Get completed jobs in the specified period
    const completedJobs = await prisma.job.findMany({
      where: {
        createdBy: req.user.id,
        status: 'completed',
        createdAt: { gte: daysAgo }
      }
    });

    // Sum the total price of completed jobs
    const grossClosedDealsAmount = completedJobs.reduce((sum, job) => sum + job.price, 0);

    // Count open jobs
    const openJobsCount = await prisma.job.count({
      where: {
        createdBy: req.user.id,
        status: 'open'
      }
    });

    // Count jobs behind schedule (in_progress with endDate in the past)
    const behindScheduleJobsCount = await prisma.job.count({
      where: {
        createdBy: req.user.id,
        status: 'in_progress',
        endDate: { lt: new Date() }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        completedJobsCount: completedJobs.length,
        grossClosedDealsAmount,
        openJobsCount,
        behindScheduleJobsCount
      }
    });
  } catch (error) {
    next(error);
  }
};
