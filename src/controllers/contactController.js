const prisma = require('../config/db');
const AppError = require('../utils/appError');
const { PAGINATION } = require('../config/constants');

// Get all contacts
exports.getAllContacts = async (req, res, next) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      status,
      pipelineStage,
      search,
      sortBy = 'name',
      order = 'asc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    let where = {};
    if (req.user.role === 'USER') {
      where = { createdBy: req.user.id };
    }
    if (status) {
      where.status = status;
    }
    if (pipelineStage) {
      where.pipelineStage = pipelineStage;
    }

    // Add search functionality if provided

    // Add search functionality if provided
    if (search) {
      where = {
        ...where,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    // Count total contacts matching query
    const total = await prisma.contact.count({ where });

    // Determine sort order
    const orderBy = {};
    orderBy[sortBy] = order === 'asc' ? 'asc' : 'desc';

    // Get contacts with pagination
    const contacts = await prisma.contact.findMany({
      where,
      orderBy,
      skip,
      take: Number(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: contacts,
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

// Get contact by ID
exports.getContactById = async (req, res, next) => {
  try {
    let where = {
      id: req.params.id,
    };

    if (req.user.role === 'USER') {
      where.createdBy = req.user.id;
    }

    const contact = await prisma.contact.findFirst({
      where: where
    });

    if (!contact) {
      return next(new AppError('Contact not found', 404));
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

// Create a new contact
exports.createContact = async (req, res, next) => {
  try {
    const contactData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Ensure tags is an array
    if (contactData.tags && !Array.isArray(contactData.tags)) {
      contactData.tags = [];
    }

    const contact = await prisma.contact.create({
      data: contactData
    });

    res.status(201).json({
      success: true,
      data: contact,
      message: 'Contact created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update a contact
exports.updateContact = async (req, res, next) => {
  try {
    const contactExists = await prisma.contact.findFirst({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });

    if (!contactExists) {
      return next(new AppError('Contact not found', 404));
    }

    // Ensure tags is an array if provided
    if (req.body.tags && !Array.isArray(req.body.tags)) {
      req.body.tags = [];
    }

    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.status(200).json({
      success: true,
      data: contact,
      message: 'Contact updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete a contact
exports.deleteContact = async (req, res, next) => {
  try {
    const contactExists = await prisma.contact.findFirst({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });

    if (!contactExists) {
      return next(new AppError('Contact not found', 404));
    }

    await prisma.contact.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Add tags to contact
exports.addTags = async (req, res, next) => {
  try {
    const { tags } = req.body;

    if (!tags || !Array.isArray(tags)) {
      return next(new AppError('Please provide tags as an array', 400));
    }

    const contact = await prisma.contact.findFirst({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });

    if (!contact) {
      return next(new AppError('Contact not found', 404));
    }

    // Add new tags without duplicates
    const updatedTags = [...new Set([...contact.tags, ...tags])];

    // Update contact with new tags
    const updatedContact = await prisma.contact.update({
      where: { id: req.params.id },
      data: { tags: updatedTags }
    });

    res.status(200).json({
      success: true,
      data: updatedContact,
      message: 'Tags added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Remove tags from contact
exports.removeTags = async (req, res, next) => {
  try {
    const { tags } = req.body;

    if (!tags || !Array.isArray(tags)) {
      return next(new AppError('Please provide tags as an array', 400));
    }

    const contact = await prisma.contact.findFirst({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });

    if (!contact) {
      return next(new AppError('Contact not found', 404));
    }

    // Remove specified tags
    const updatedTags = contact.tags.filter(tag => !tags.includes(tag));

    // Update contact with new tags
    const updatedContact = await prisma.contact.update({
      where: { id: req.params.id },
      data: { tags: updatedTags }
    });

    res.status(200).json({
      success: true,
      data: updatedContact,
      message: 'Tags removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update contact pipeline stage
exports.updatePipelineStage = async (req, res, next) => {
  try {
    const { pipelineStage } = req.body;

    if (!pipelineStage) {
      return next(new AppError('Please provide a pipeline stage', 400));
    }

    const contactExists = await prisma.contact.findFirst({
      where: {
        id: req.params.id,
        createdBy: req.user.id
      }
    });

    if (!contactExists) {
      return next(new AppError('Contact not found', 404));
    }

    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data: { pipelineStage }
    });

    res.status(200).json({
      success: true,
      data: contact,
      message: 'Pipeline stage updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
