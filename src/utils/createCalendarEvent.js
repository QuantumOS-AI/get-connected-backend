const prisma = require('../config/db');

const createCalendarEvent = async (data) => {
  try {
    const event = await prisma.calendarEvent.create({
      data
    });
    return event;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

module.exports = { createCalendarEvent };
