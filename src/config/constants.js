module.exports = {
    // Pagination defaults
    PAGINATION: {
      DEFAULT_PAGE: 1,
      DEFAULT_LIMIT: 10,
      MAX_LIMIT: 100,
    },
    
    // Job status options
    JOB_STATUS: {
      OPEN: 'open',
      IN_PROGRESS: 'in_progress',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    },
    
    // Estimate status options
    ESTIMATE_STATUS: {
      PENDING: 'pending',
      ACCEPTED: 'accepted',
      REJECTED: 'rejected',
    },
    
    // Contact status options
    CONTACT_STATUS: {
      LEAD: 'lead',
      CLIENT: 'client',
      FORMER_CLIENT: 'former_client',
    },
    
    // Event types
    EVENT_TYPE: {
      JOB: 'job',
      ESTIMATE: 'estimate',
      MEETING: 'meeting',
      OTHER: 'other',
    },
  };