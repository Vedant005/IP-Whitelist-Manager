# IP Whitelist Manager Backend

## Project Objective

The **IP Whitelist Manager** is a robust, backend-only application designed to provide a secure and efficient way to manage and enforce IP-based access restrictions for various services and endpoints. Built with Node.js and Express.js, it exposes a suite of RESTful APIs to handle IP whitelist CRUD operations, associate IPs with specific services, and control access based on client IP addresses.

## Features

This project implements all core requirements and several bonus features to deliver a comprehensive IP management solution.

### Core Features

1.  **User Authentication (JWT-based):**

    - Securely registers and authenticates users using JSON Web Tokens (JWT).
    - Implements a robust authentication flow with both short-lived **Access Tokens** and long-lived **Refresh Tokens** for enhanced security and seamless user experience.
    - Endpoints protected by `verifyJWT` middleware.

2.  **IP Whitelist CRUD:**

    - **Create:** Add new IP addresses or CIDR ranges.
    - **Read:** Retrieve single or multiple whitelisted entries with pagination and filtering.
    - **Update:** Modify existing whitelist entries.
    - **Delete:** Remove whitelist entries.

3.  **Service Association:**

    - Whitelisted IPs can be explicitly associated with specific `serviceName` identifiers, allowing granular control over which IPs can access which parts of your system.

4.  **Access Middleware:**

    - A custom middleware (`enforceIpWhitelist`) restricts API access based on the client's IP address and its association with a requested service, ensuring only authorized IPs can reach sensitive endpoints.

5.  **Audit Logging:**

    - Comprehensive logging of all critical events, including:
      - Whitelist modifications (create, update, delete).
      - Access attempts (granted or denied).
      - User authentication events (login, register, failed attempts).
    - Logs include timestamps, user information, IP addresses, and detailed context.

6.  **Pagination and Filtering:**

    - The `GET /api/v1/whitelist` endpoint supports pagination (`page`, `limit`) and filtering (`search`, `serviceName`) for efficient data retrieval.

7.  **API Documentation (OpenAPI/Swagger):**

    - Comprehensive and interactive API documentation is generated using `swagger-jsdoc` and served via `swagger-ui-express`.

8.  **Environment Configuration:**
    - Sensitive configuration parameters (e.g., MongoDB URI, JWT secrets, email credentials) are managed securely using environment variables (`dotenv`).

### Bonus Features

1.  **Rate Limiting:**

    - Implemented using `express-rate-limit` for sensitive endpoints like user login and general API access. This helps protect against brute-force attacks and API abuse.

2.  **Role-based Access Control (RBAC):**

    - Differentiates permissions between `admin` and `user` roles.
    - The `authorizeRoles` middleware ensures that only `admin` users can perform critical operations like creating, updating, or deleting whitelist entries. New user registrations default to `user` role unless explicitly set.

## Technical Stack

- **Runtime:** Node.js (v14+)
- **Web Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT (JSON Web Tokens), `bcryptjs` for password hashing
- **Environment Variables:** `dotenv`
- **Validation:** `express-validator`, `ip` (for IP/CIDR validation)
- **API Documentation:** `swagger-jsdoc`, `swagger-ui-express`, `yamljs`
- **Error Handling:** Custom `ApiError` class and global error handling middleware for consistent responses.
- **Asynchronous Operations:** `asyncHandler` utility for cleaner `async/await` error handling.

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js:** v14 or higher ([nodejs.org](https://nodejs.org/))
- **npm:** (Comes with Node.js)
- **MongoDB:** A running instance of MongoDB ([mongodb.com/try/download/community](https://www.mongodb.com/try/download/community))
- **Postman/Insomnia (Optional):** For API testing.

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    gh repo clone Vedant005/IP-Whitelist-Manager
    cd ip-whitelist-manager
    ```

2.  **Install Node.js dependencies:**

    ```bash
    npm install
    ```

3.  **Create and Configure `.env` file:**

    - Create a file named `.env` in the root directory of the project.
    - Copy the contents from `.env.example` into your new `.env` file.
    - **Crucially, update the placeholder values:**
      ```env
      PORT=8000
      MONGO_URI=mongodb://localhost:27017/ipwhitelistdb
      JWT_SECRET=YOUR_SUPER_STRONG_JWT_SECRET_HERE # Make this very long and random
      JWT_EXPIRES_IN=1h # Access token expiry
      JWT_REFRESH_SECRET=YOUR_VERY_STRONG_REFRESH_SECRET # Make this very long and random
      JWT_REFRESH_EXPIRES_IN=7d # Refresh token expiry
      ADMIN_NOTIFICATION_EMAIL=alerts@yourdomain.com # Email to send security alerts


4.  **Ensure MongoDB is running:**
    The application will attempt to connect to the MongoDB instance specified in `MONGO_URI`.

## Running the Application

1.  **Start the server:**
    ```bash
    npm start
    ```
    For development with automatic restarts on file changes:
    ```bash
    npm run dev
    ```

The server will start on the port specified in your `.env` file (default: `8000`).

## API Documentation (Swagger UI)

Once the server is running, you can access the interactive API documentation at:

`http://localhost:8000/api-docs`

This documentation provides details on all available endpoints, their request/response formats, security requirements, and allows you to test them directly within your browser.

## Authentication Flow and Key Endpoints

### 1. Register a User (Optional, Admin is seeded)

- **Method:** `POST`
- **Path:** `/api/v1/auth/register`
- **Body:** `{ "email": "testuser@example.com", "password": "password123", "role": "user" }`
- **Response:** `201 Created` with `accessToken` and `refreshToken`.

### 2. Login User (Obtain Tokens)

- **Method:** `POST`
- **Path:** `/api/v1/auth/login`
- **Body:** `{ "email": "admin@example.com", "password": "adminpassword" }` (or your registered user)
- **Response:** `200 OK` with `accessToken` and `refreshToken`.
  - **IMPORTANT:** Copy the `accessToken`. You will use this in the `Authorization: Bearer <accessToken>` header for all protected endpoints.

### 3. Refresh Access Token

- **Method:** `POST`
- **Path:** `/api/v1/auth/refresh-token`
- **Body:** `{ "refreshToken": "YOUR_REFRESH_TOKEN" }`
- **Response:** `200 OK` with a new `accessToken` (and potentially a new `refreshToken`).

### 4. Whitelist Management

- **Get All Entries:**
  - **Method:** `GET`
  - **Path:** `/api/v1/whitelist`
  - **Query Params:** `page`, `limit`, `search`, `serviceName`
  - **Auth:** `Bearer Token` (any role)
- **Create Entry (Admin Only):**
  - **Method:** `POST`
  - **Path:** `/api/v1/whitelist`
  - **Body:** `{ "ipAddress": "192.168.1.100", "serviceName": "api-gateway", "description": "Office IP" }`
  - **Auth:** `Bearer Token` (`admin` role)
- **Update Entry (Admin Only):**
  - **Method:** `PUT`
  - **Path:** `/api/v1/whitelist/:id`
  - **Body:** `{ "ipAddress": "192.168.1.101" }`
  - **Auth:** `Bearer Token` (`admin` role)
- **Delete Entry (Admin Only):**
  - **Method:** `DELETE`
  - **Path:** `/api/v1/whitelist/:id`
  - **Auth:** `Bearer Token` (`admin` role)

### 5. Protected Service Test Endpoints

These endpoints demonstrate the `enforceIpWhitelist` middleware in action.

- **Protected Resource 1:**
  - **Method:** `GET`
  - **Path:** `/api/v1/service/verifyJWTed-resource-1`
  - **Auth:** `Bearer Token` + **Client IP must be whitelisted for `service-1`**
- **Protected Resource 2:**
  - **Method:** `GET`
  - **Path:** `/api/v1/service/verifyJWTed-resource-2`
  - **Auth:** `Bearer Token` + **Client IP must be whitelisted for `service-2`**

## Error Handling and Responses

The API follows a consistent response structure:

- **Success:**
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": {
      /* response data */
    }
  }
  ```
- **Error:**
  ```json
  {
    "success": false,
    "message": "Descriptive error message",
    "errors": [
      /* optional: array of specific validation errors */
    ]
  }
  ```
  Appropriate HTTP status codes are used (e.g., `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`).

Custom `ApiError` and `ApiResponse` classes ensure standardization, while a global error handling middleware catches unhandled exceptions, providing clean responses and preventing server crashes.

## Auditing

- All critical system events, access attempts, and modifications are meticulously logged to the MongoDB `AuditLog` collection.


## Testing the API

Refer to the interactive Swagger UI (`http://localhost:8000/api-docs`) for details on each endpoint. Use a tool like Postman or Insomnia to send requests.

**Basic Testing Flow:**

1.  **Login:** `POST /api/v1/auth/login` with `admin@example.com` and `adminpassword` to get an `accessToken`.
2.  **Create Whitelist Entry:** `POST /api/v1/whitelist` using the `accessToken` in the `Authorization: Bearer <token>` header. Add your current testing machine's IP for `service-1`.
3.  **Test Access Granted:** `GET /api/v1/service/verifyJWTed-resource-1` with your `accessToken`.
4.  **Test Access Denied:** Delete the whitelist entry for your IP and `service-1`, then retry `GET /api/v1/service/verifyJWTed-resource-1`.
5.  **Explore other endpoints** for CRUD, bulk operations, and token refresh.
6.  **Check MongoDB:** Verify `auditlogs` collection to see all recorded events.

## Potential Future Enhancements

- **Advanced Rate Limiting:** Implement dynamic rate limiting based on user role or subscription tier.
- **Webhooks for Alerts:** Send alerts to messaging platforms (e.g., Slack, Teams) instead of/in addition to email.
- **Admin Dashboard (Frontend):** Develop a simple UI for managing whitelist entries and viewing audit logs.
- **IP Geolocation:** Integrate a geolocation service to provide more context for IP addresses in audit logs.
- **Database Indexes:** Add appropriate indexes to MongoDB collections (especially `AuditLog` and `WhitelistEntry`) for performance optimization.
