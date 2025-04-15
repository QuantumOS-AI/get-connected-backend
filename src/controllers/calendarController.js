const prisma = require('../config/db');
const AppError = require('../utils/appError');
const { PAGINATION } = require('../config/constants');

// Get calendar events
exports.getEvents = async (req, res, next) => {
  try {
    const { 
      startDate, 
      endDate, 
      eventType, 
      page = PAGINATION.DEFAULT_PAGE, 
      limit = PAGINATION.DEFAULT_LIMIT
    } = req.query;

    // Default to current day if startDate or endDate are not provided
    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date();

    if (!startDate) {
      start.setHours(0, 0, 0, 0); // Set to the beginning of the day
    }
    if (!endDate) {
      end.setHours(23, 59, 59, 999); // Set to the end of the day
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where = {
      createdBy: req.user.id,
      startTime: { gte: start },
      endTime: { lte: end }
    };

    if (eventType) {
      where.eventType = eventType;
    }

    // Count total events matching query
    const total = await prisma.calendarEvent.count({ where });

    // Get events with pagination
    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { startTime: 'asc' },
      skip,
      take: Number(limit)
    });

    res.status(200).json({
      success: true,
      data: events,
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

// Create calendar event
exports.createEvent = async (req, res, next) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user.id
    };

    const event = await prisma.calendarEvent.create({
      data: eventData
    });

    res.status(201).json({
      success: true,
      data: event,
      message: 'Calendar event created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update calendar event
exports.updateEvent = async (req, res, next) => {
  try {
    const eventExists = await prisma.calendarEvent.findFirst({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });

    if (!eventExists) {
      return next(new AppError('Calendar event not found', 404));
    }

    const event = await prisma.calendarEvent.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.status(200).json({
      success: true,
      data: event,
      message: 'Calendar event updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete calendar event
exports.deleteEvent = async (req, res, next) => {
  try {
    const eventExists = await prisma.calendarEvent.findFirst({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });

    if (!eventExists) {
      return next(new AppError('Calendar event not found', 404));
    }

    await prisma.calendarEvent.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Calendar event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get related events
exports.getRelatedEvents = async (req, res, next) => {
  try {
    const { relatedId, eventType } = req.query;

    if (!relatedId || !eventType) {
      return next(new AppError('Please provide related ID and event type', 400));
    }

    const events = await prisma.calendarEvent.findMany({
      where: {
        createdBy: req.user.id,
        relatedId,
        eventType
      },
      orderBy: { startTime: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
};
