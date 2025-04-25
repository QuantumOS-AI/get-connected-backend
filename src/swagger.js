const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Get Connected API',
      version: '1.0.0',
      description: 'API documentation for the Get Connected application',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
  components: {
    schemas: {
      Estimate: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'The estimate ID'
          },
          leadName: {
            type: 'string',
            description: 'The name of the lead'
          },
          address: {
            type: 'string',
            description: 'The address of the lead'
          },
          scope: {
            type: 'string',
            description: 'The scope of the estimate'
          },
          bidAmount: {
            type: 'number',
            format: 'float',
            description: 'The bid amount'
          },
          startDate: {
            type: 'string',
            format: 'date-time',
            description: 'The start date'
          },
          status: {
            type: 'string',
            description: 'The status of the estimate (pending, accepted, rejected)'
          },
          notes: {
            type: 'string',
            description: 'The notes for the estimate'
          },
          clientId: {
            type: 'string',
            format: 'uuid',
            description: 'The ID of the client'
          },
          createdBy: {
            type: 'string',
            format: 'uuid',
            description: 'The ID of the user who created the estimate (Only applicable for admin users)'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time the estimate was created'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time the estimate was updated'
          },
          client: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description: 'The ID of the client'
              },
              name: {
                type: 'string',
                description: 'The name of the client'
              },
              phoneNumber: {
                type: 'string',
                description: 'The phone number of the client'
              },
              email: {
                type: 'string',
                format: 'email',
                description: 'The email of the client'
              }
            },
            required: [
              'id',
              'name',
              'phoneNumber'
            ]
          }
        },
        required: [
          'leadName',
          'address',
          'scope',
          'bidAmount',
          'clientId',
          'createdBy'
        ]
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'The user ID'
          },
          name: {
            type: 'string',
            description: 'The name of the user'
          },
          phoneNumber: {
            type: 'string',
            description: 'The phone number of the user'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'The email of the user'
          },
          companyName: {
            type: 'string',
            description: 'The company name of the user'
          },
          logo: {
            type: 'string',
            description: 'The logo of the user'
          },
          timezone: {
            type: 'string',
            description: 'The timezone of the user'
          },
          role: {
            type: 'string',
            description: 'The role of the user (USER, ADMIN)'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time the user was created'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time the user was updated'
          }
        },
        required: [
          'name',
          'phoneNumber'
        ]
      },
      Job: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'The job ID'
          },
          name: {
            type: 'string',
            description: 'The name of the job'
          },
          address: {
            type: 'string',
            description: 'The address of the job'
          },
          price: {
            type: 'number',
            format: 'float',
            description: 'The price of the job'
          },
          status: {
            type: 'string',
            description: 'The status of the job (open, in_progress, completed, cancelled)'
          },
          startDate: {
            type: 'string',
            format: 'date-time',
            description: 'The start date of the job'
          },
          endDate: {
            type: 'string',
            format: 'date-time',
            description: 'The end date of the job'
          },
          clientId: {
            type: 'string',
            format: 'uuid',
            description: 'The ID of the client'
          },
          createdBy: {
            type: 'string',
            format: 'uuid',
            description: 'The ID of the user who created the job (Only applicable for admin users)'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time the job was created'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time the job was updated'
          },
          client: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description: 'The ID of the client'
              },
              name: {
                type: 'string',
                description: 'The name of the client'
              },
              phoneNumber: {
                type: 'string',
                description: 'The phone number of the client'
              },
              email: {
                type: 'string',
                format: 'email',
                description: 'The email of the client'
              }
            },
            required: [
              'id',
              'name',
              'phoneNumber'
            ]
          }
        },
        required: [
          'name',
          'address',
          'price',
          'status',
          'clientId',
          'createdBy'
        ]
      },
      Contact: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'The contact ID'
          },
          name: {
            type: 'string',
            description: 'The name of the contact'
          },
          phoneNumber: {
            type: 'string',
            description: 'The phone number of the contact'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'The email of the contact'
          },
          address: {
            type: 'string',
            description: 'The address of the contact'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'The tags of the contact'
          },
          notes: {
            type: 'string',
            description: 'The notes of the contact'
          },
          status: {
            type: 'string',
            description: 'The status of the contact (lead, client, former_client)'
          },
          pipelineStage: {
            type: 'string',
            description: 'The pipeline stage of the contact'
          },
          createdBy: {
            type: 'string',
            format: 'uuid',
            description: 'The ID of the user who created the contact'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time the contact was created'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time the contact was updated'
          }
        },
        required: [
          'name',
          'phoneNumber',
          'createdBy'
        ]
      },
      CalendarEvent: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'The calendar event ID'
          },
          title: {
            type: 'string',
            description: 'The title of the calendar event'
          },
          description: {
            type: 'string',
            description: 'The description of the calendar event'
          },
          startTime: {
            type: 'string',
            format: 'date-time',
            description: 'The start time of the calendar event'
          },
          endTime: {
            type: 'string',
            format: 'date-time',
            description: 'The end time of the calendar event'
          },
          location: {
            type: 'string',
            description: 'The location of the calendar event'
          },
          eventType: {
            type: 'string',
            description: 'The event type of the calendar event (job, estimate, meeting, other)'
          },
          relatedId: {
            type: 'string',
            format: 'uuid',
            description: 'The ID of the related job or estimate'
          },
          createdBy: {
            type: 'string',
            format: 'uuid',
            description: 'The ID of the user who created the calendar event'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time the calendar event was created'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time the calendar event was updated'
          }
        },
        required: [
          'title',
          'startTime',
          'endTime',
          'eventType',
          'createdBy'
        ]
      },
      AiMessage: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'The unique identifier for the AI message'
          },
          message: {
            type: 'string',
            description: 'The content of the message'
          },
          senderType: {
            type: 'string',
            enum: ['AI', 'USER'],
            description: 'Indicates whether the message was sent by the AI or the User'
          },
          userId: {
            type: 'string',
            format: 'uuid',
            description: 'The ID of the user associated with this conversation thread'
          },
          contactId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description: 'The ID of the contact this message relates to'
          },
          estimateId: {
            type: 'string',
            format: 'uuid',
            nullable: true,
            description: 'The ID of the estimate this message relates to (optional)'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date and time the message was created'
          },
          // Optional: Include related data if returned by API endpoints
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' }
            },
            description: 'Basic info of the associated user (if included in response)'
          },
          contact: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' }
            },
            description: 'Basic info of the associated contact (if included in response)'
          },
          estimate: {
             type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' }
            },
            description: 'Basic info of the associated estimate (if included in response)'
          }
        },
        required: [
          'id',
          'message',
          'senderType',
          'userId',
          'createdAt'
          // contactId is required for saving, but might be null in some contexts? Adjust if needed.
          // estimateId is optional
        ]
      }
    }
  }
};

const specs = swaggerJsdoc(options);

module.exports = specs;
