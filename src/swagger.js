// swagger.js
import swaggerJsdoc from "swagger-jsdoc";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IP Whitelist Manager API",
      version: "1.0.0",
      description:
        "API documentation for the backend IP Whitelist Manager. This system allows managing and enforcing IP-based access restrictions for various services.",
      contact: {
        name: "AI Assistant",
        email: "support@example.com",
      },
    },

    servers: [
      {
        url: "http://localhost:8000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token in the format: `Bearer <token>`",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", description: "User ID" },
            name: {
              type: "string",
              description: "User's name",
            },
            email: {
              type: "string",
              format: "email",
              description: "User's email address",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              description: "User role",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp of creation",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp of updation",
            },
          },
          example: {
            _id: "60c72b2f9c1a4d0015f8a3d4",
            name: "myname",
            email: "test@example.com",
            role: "user",
            createdAt: "2023-10-26T10:00:00.000Z",
          },
        },
        WhitelistEntry: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Whitelist entry ID" },
            ipAddress: {
              type: "string",
              description: "IP address or CIDR range",
            },
            serviceName: {
              type: "string",
              description: "Name of the service/endpoint",
            },
            description: {
              type: "string",
              description: "Optional description",
            },
            createdBy: {
              type: "object",
              properties: {
                _id: { type: "string" },
                email: { type: "string" },
              },
              description: "User who created this entry",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp of creation",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp of last update",
            },
          },
          example: {
            _id: "60c72b2f9c1a4d0015f8a3d5",
            ipAddress: "192.168.1.100",
            serviceName: "api-gateway",
            description: "Office main IP",
            createdBy: {
              _id: "60c72b2f9c1a4d0015f8a3d4",
              email: "admin@example.com",
            },
            createdAt: "2023-10-26T10:00:00.000Z",
            updatedAt: "2023-10-26T10:00:00.000Z",
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Authentication token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: {
                    type: "string",
                    example: "Not authorized, token failed",
                  },
                },
              },
            },
          },
        },
        ForbiddenError: {
          description:
            "User does not have the necessary permissions (e.g., not an admin)",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: {
                    type: "string",
                    example:
                      "User role user is not authorized to access this route",
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [
    path.resolve(__dirname, "./routes/user.js"),
    path.resolve(__dirname, "./routes/whitelist.js"),
    path.resolve(__dirname, "./routes/serviceTest.js"),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
