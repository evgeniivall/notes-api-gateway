# Notes API Gateway

`notes-api-gateway` is a key component of the Notes Application system, responsible for routing requests, handling authorization, and forwarding them to the appropriate microservices. It is implemented in a generic manner, allowing for reuse in other projects.

![System architcture](https://github.com/evgeniivall/notes-api-gateway/blob/main/images/notes-app-system-design-api-gateway.png)

## Features

- **Routing Configuration:** Uses a configurable `routes.json` file to define routes for each microservice.
- **Authentication & Authorization:** Relies on JWT tokens and communicates with the `Auth Service` to authenticate requests using the `/introspect` route.
- **Role-based Access Control (RBAC):** Routes can define roles and permissions for users (e.g., admin, self) to ensure access is controlled.
- **Timeout Management:** Configurable request timeout to prevent long-running or stuck requests.
- **Generic Implementation:** Can be adapted and reused for different services and environments.

## Tech Stack

- **Node.js** with **Express** for server-side logic.
- **MongoDB** for storing user data.
- **JWT** for authentication.
- **Docker** for containerization.

## API

### Authentication Routes

| **Method** | **Route**                        | Access      | **Description**                         |
| ---------- | -------------------------------- | ----------- | --------------------------------------- |
| POST       | `/api/v1/signup`                 | Public      | Register a new user                     |
| POST       | `/api/v1/login`                  | Public      | Log in an existing user                 |
| POST       | `/api/v1/logout`                 | Public      | Log out the current user                |
| POST       | `/api/v1/forgetPassword`         | Public      | Request a password reset link           |
| PATCH      | `/api/v1/resetPassword/:token`   | Public      | Reset the password using a token        |
| PATCH      | `/api/v1/changePassword/:userID` | Self, Admin | Change the password for a specific user |

### User Routes

| **Method** | **Route**               | Access      | **Description**                     |
| ---------- | ----------------------- | ----------- | ----------------------------------- |
| GET        | `/api/v1/users/`        | Admin       | Retrieve a list of all users        |
| POST       | `/api/v1/users/`        | Admin       | Create a new user                   |
| GET        | `/api/v1/users/:userID` | Self, Admin | Retrieve details of a specific user |
| PATCH      | `/api/v1/users/:userID` | Self, Admin | Update details of a specific user   |
| DELETE     | `/api/v1/users/:userID` | Self, Admin | Delete a specific user              |

## Service Design

### Routes configuration

The `routes.json` file defines the routes handled by the API Gateway and the services to which requests are forwarded. Each route is defined as an object in an array, with properties specifying the HTTP method, path, and other configurations.

#### Route Object Format

```json
{
  "method": "HTTP_METHOD",
  "path": "ROUTE_PATH",
  "serviceUrl": "SERVICE_URL",
  "public": true | false,
  "rolesAllowed": {
    "ROLE_NAME": { "access": "self" | "all" }
  }
}
```

- **method** (string): The HTTP method for the route (e.g., GET, POST, PATCH).
- **path** (string): The path for the route, which can include dynamic parameters (e.g., `:userID`).
- **serviceUrl** (string): The URL of the microservice to which the request should be forwarded, often using environment variables (e.g., `${AUTH_SERVICE_HOST}`).
- **public** (boolean): Indicates whether the route is accessible without authentication (`true` for public routes, `false` for protected routes).
- **rolesAllowed** (object, optional): Specifies which roles are allowed to access the route and what level of access they have.
  - **ROLE_NAME** (string): The name of the role (e.g., `admin`, `user`).
    - **access** (string): Defines the access level for the role, either `self` (user can only access their own data) or `all` (admin can access all users' data).

### Authentication & Authorization Flow

The following diagram outlines the request flow through the API Gateway:
![Auth flow diagram](https://github.com/evgeniivall/notes-api-gateway/blob/main/images/notes-app-authorization-flow.png)

1. A request is sent to the **API Gateway** (e.g., `GET /api/v1/data`) with a JWT token.
2. The **API Gateway** authenticates the request by calling the `/introspect` route of the **Auth Service**.
3. The **Auth Service** validates the JWT token and responds with the user's claims (e.g., role, userID).
4. The **API Gateway** authorizes the request based on the user's role and userID, as defined in the `routes.json` configuration.
5. If the user has the appropriate permissions, the **API Gateway** forwards the request to the relevant microservice.
6. The microservice processes the request and returns a response to the **API Gateway**, which is then forwarded back to the client.
7. If the user is unauthorized, the gateway responds with a `403 Access Denied` status.

### Environment Variables

To run this service, configure the following environment variables in your `.env` file:

| **Variable**         | **Description**                                             |
| -------------------- | ----------------------------------------------------------- |
| `NODE_ENV`           | Node environment (e.g., `development`, `production`).       |
| `PORT`               | Port on which the service will run (default: `3000`).       |
| `REQUEST_TIMEOUT_MS` | Timeout in milliseconds for requests made to microservices. |
| `AUTH_SERVICE_HOST`  | URL for the Auth Service                                    |

## Setup & Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/notes-api-gateway.git
cd notes-api-gateway
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables by creating a `.env` file in the root directory with the required settings (as outlined in the [Environment Variables](#environment-variables) section).

4. Run the application:

```bash
npm start
```

6. The service will be available at `http://localhost:3000` by default.
