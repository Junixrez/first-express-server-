# first-express-server — Express + MongoDB API

A secure, modular REST API built with Express 5 and Mongoose 8. It provides Users and Posts resources, JWT authentication, input validation with Joi, security headers via Helmet, rate limiting, and centralized error handling.

Highlights:
- Users: signup, login (JWT), list with pagination, get/update/delete by id
- Posts: CRUD with user reference and population
- Security: CORS, Helmet, HPP, rate limiting
- Validation: Joi-based request body validation
- Error handling: Centralized, friendly messages for common cases

--------------------------------------------------------------------------------

Architecture overview

~~~~text
┌─────────────┐       ┌────────────────────┐        ┌─────────────────┐
│   Client    │  HTTP │   Express Server   │  Mongoose ODM          │
│ (Web/CLI) ──┼──────▶│  Middlewares +     ├────────▶  Models        │
└─────────────┘       │  Routers + Ctrlrs  │        └──────┬─────────┘
                       └──────────┬─────────┘               │
                                  ▼                         │
                      ┌────────────────────┐                │
                      │ Central Error Hdlr │                │
                      └──────────┬─────────┘                │
                                  ▼                         │
                             JSON Responses                 ▼
                                                     ┌──────────────┐
                                                     │  MongoDB     │
                                                     └──────────────┘
~~~~

Request lifecycle (example: GET /users)

~~~~text
Client
  │
  ├─▶ Express.json()        (parse JSON body)
  ├─▶ CORS                  (allow cross-origin)
  ├─▶ RateLimiter           (throttle abusive clients)
  ├─▶ Helmet                (secure headers)
  ├─▶ HPP                   (prevent HTTP param pollution)
  ├─▶ /users route
  │     ├─▶ auth            (verify JWT, attach req.user)
  │     ├─▶ restrictTo      (check role: admin|user)
  │     └─▶ userController.getAllUsers
  │           └─▶ Mongoose: User.find(...).skip().limit().sort()
  │
  └─▶ Response JSON or Error → Centralized errorHandler
~~~~

--------------------------------------------------------------------------------

Folder structure

~~~~text
first-express-server-/
├─ server.js                    # App bootstrap: middlewares, routers, DB connect
├─ Controllers/
│  ├─ userController.js         # Users CRUD + auth (signup/login)
│  └─ postController.js         # Posts CRUD
├─ Routes/
│  ├─ userRoutes.js             # /users routes: signup, login, CRUD
│  └─ postRoutes.js             # /posts routes: CRUD
├─ Models/
│  ├─ userModel.js              # User schema (name, email, password, role, isActive)
│  └─ postModel.js              # Post schema (title, content, userId→User)
├─ middlewares/
│  ├─ auth.js                   # JWT verification → req.user
│  ├─ restrictTo.js             # RBAC by role
│  ├─ validator.js              # Joi body validation
│  ├─ rateLimiter.js            # express-rate-limit config
│  └─ errorHandler.js           # Central error handling
├─ utils/
│  ├─ customError.js            # CustomError(message, statusCode)
│  └─ schemas/
│     ├─ signUpSchema.js        # Joi: name, email, password, passwordConfirm
│     ├─ loginSchema.js         # Joi: email, password
│     └─ index.js               # export schemas
├─ package.json
└─ .gitignore
~~~~

--------------------------------------------------------------------------------

Tech stack

- Runtime: Node.js (recommend 18+)
- Web framework: Express 5
- Database: MongoDB with Mongoose 8
- Auth: JWT (jsonwebtoken)
- Validation: Joi
- Security: Helmet, HPP, CORS
- Stability: express-rate-limit
- Dev: nodemon

--------------------------------------------------------------------------------

Setup

1) Prerequisites
- Node.js 18 or newer
- MongoDB database (local or hosted)

2) Install
- From project root:
  - npm install

3) Environment
Create a .env file in the project root with:

~~~~env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/first-express-server
JWT_SECRET_KEY=replace-with-a-long-random-secret
SALT_ROUNDS=10
~~~~

Notes:
- SALT_ROUNDS controls bcrypt hashing complexity. 10–12 is typical.
- CORS is enabled with permissive defaults. Adjust as needed.

4) Run
- npm start
- Server logs:
  - Up And running on port <PORT>
  - Connected to MongoDB

The app starts the HTTP server first, then connects to MongoDB (connection success/failure is logged).

--------------------------------------------------------------------------------

Security and middleware

- CORS: Allows cross-origin requests (default: permissive). Configure origin if needed.
- Helmet: Sets common security headers.
- HPP: Prevents HTTP Parameter Pollution.
- Rate Limiting: 200 requests per 15 minutes per IP. Exceeding returns 429 Too Many Requests.
- Validation: Requests validated with Joi schemas (signup/login) via validator middleware (aborts early with first error).
- Auth: Bearer JWT required for protected routes. auth middleware verifies and attaches req.user = { userId, email, role }
- RBAC: restrictTo([...roles]) ensures user’s role is allowed.

--------------------------------------------------------------------------------

Data models

User
- name: String, required
- email: String, required, unique, simple regex validation
- password: String, required, hashed with bcrypt
- role: enum ["admin", "user"], default "user"
- isActive: Boolean, default true
- timestamps: createdAt, updatedAt

Post
- title: String, required
- content: String, required
- userId: ObjectId ref("User"), required

--------------------------------------------------------------------------------

API reference

Base URL: http://localhost:<PORT>

Authentication
- Type: Bearer JWT token in Authorization header (Authorization: Bearer <token>)
- Login returns a token valid for 1 hour.

Users

- POST /users/signup
  - Validates body with Joi
  - Hashes password with bcrypt using SALT_ROUNDS
  - Returns created user without password
  - Body (JSON):
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "password": "StrongPass1",
      "passwordConfirm": "StrongPass1"
    }
  - 201 Created:
    {
      "status": "success",
      "message": "User created successfully",
      "data": {
        "_id": "...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "user",
        "isActive": true,
        "createdAt": "...",
        "updatedAt": "...",
        "__v": 0
      }
    }
  - Notes: Any extra fields (e.g., profilePicture) are currently ignored.

- POST /users/login
  - Validates body with Joi
  - On success returns JWT token
  - Body:
    {
      "email": "jane@example.com",
      "password": "StrongPass1"
    }
  - 200 OK:
    {
      "status": "success",
      "message": "User logged in successfully",
      "data": { "token": "<JWT>" }
    }

- GET /users
  - Protected: requires Authorization Bearer token and role in ["admin", "user"]
  - Pagination via query params: page, limit (both required to avoid NaN behavior)
  - Example: /users?page=1&limit=10
  - 200 OK:
    {
      "status": "success",
      "message": "Users fetched successfully",
      "data": [ { "_id": "...", "name": "...", "email": "...", ... } ],
      "pagenation": {
        "page": 1,
        "total": 42,
        "totalPages": 5,
        "limit": 10
      }
    }

- GET /users/:id
  - Returns user by MongoDB ObjectId (password excluded)
  - 200 OK or 404 if not found
  - Invalid ObjectId triggers a Mongoose CastError handled as 400 with a friendly message.

- PATCH /users/:id
  - Updates name and/or email
  - 200 OK or 404 if not found
  - Note: Currently not protected/validated; consider securing in production.

- DELETE /users/:id
  - Deletes user by id
  - 204 No Content or 404 if not found
  - Note: Currently not protected; consider restricting.

Posts

- GET /posts
  - Lists posts; populates userId with name and email
  - 200 OK:
    {
      "status": "success",
      "data": [
        {
          "_id": "...",
          "title": "...",
          "content": "...",
          "userId": { "_id": "...", "name": "...", "email": "..." }
        }
      ]
    }

- GET /posts/:id
  - Returns a single post by id
  - 200 OK or 404 if not found
  - Note: populate uses "username email" in the controller; since the User model uses "name", "username" is ignored.

- POST /posts
  - Creates a post
  - Body:
    {
      "title": "Hello",
      "content": "World",
      "userId": "<existing-user-id>"
    }
  - 201 Created:
    {
      "status": "success",
      "data": { "_id": "...", "title": "...", "content": "...", "userId": "..." }
    }
  - Note: Currently not protected; consider requiring auth and using req.user.userId.

- PUT /posts/:id
  - Updates a post (title/content/userId)
  - 200 OK or 404 if not found

- DELETE /posts/:id
  - Deletes a post
  - 204 No Content (controller currently responds with a JSON body on 204)

Errors

- Not found route → 404: { "status": "error", "message": "Route not found" }
- JWT errors → 401: Invalid or expired token
- Duplicate key (e.g., email) → 400: Duplicate value for field: email
- ValidationError (Mongoose/Joi) → 400
- CastError (invalid ObjectId) → 400 with friendly field/model message
- CustomError → status code as provided
- Unhandled → 500 with error message

--------------------------------------------------------------------------------

Auth flow visualization (login + authorized request)

~~~~text
+-----------+        +----------------+           +------------------+
|  Client   |        |  /users/login  |           | Protected route  |
| (email/pw)|        | (issues token) |           |  (e.g., /users)  |
+-----+-----+        +-------+--------+           +---------+--------+
      |                       |                              |
      | POST email/password   |                              |
      |──────────────────────▶| Verify user + sign JWT       |
      |                       |──────────────┐               |
      |◀──────────────────────| 200 {token}  │               |
      |  Save token           |              │               |
      |                       |              │ Authorization: Bearer <token>
      | GET /users            |              │──────────────▶ auth middleware
      | with Authorization    |              │               (verify token → req.user)
      | header                |              │               restrictTo(["admin","user"])
      |─────────────────────────────────────────────────────▶ controller
      |◀──────────────────────────────────────────────────── response JSON
~~~~

--------------------------------------------------------------------------------

cURL examples

- Signup
  curl -i -X POST http://localhost:3000/users/signup \
    -H "Content-Type: application/json" \
    -d '{"name":"Jane Doe","email":"jane@example.com","password":"StrongPass1","passwordConfirm":"StrongPass1"}'

- Login
  TOKEN=$(curl -s -X POST http://localhost:3000/users/login \
    -H "Content-Type: application/json" \
    -d '{"email":"jane@example.com","password":"StrongPass1"}' | jq -r '.data.token')

- Get Users (page 1, limit 10)
  curl -i "http://localhost:3000/users?page=1&limit=10" \
    -H "Authorization: Bearer $TOKEN"

- Create Post
  curl -i -X POST http://localhost:3000/posts \
    -H "Content-Type: application/json" \
    -d '{"title":"Hello","content":"World","userId":"<USER_ID>"}'

- Update Post
  curl -i -X PUT http://localhost:3000/posts/<POST_ID> \
    -H "Content-Type: application/json" \
    -d '{"title":"Updated","content":"Post"}'

- Delete Post
  curl -i -X DELETE http://localhost:3000/posts/<POST_ID>

--------------------------------------------------------------------------------

Configuration notes and tips

- Pagination: Provide page and limit for GET /users to avoid NaN in skip/limit.
- CORS: For production, restrict origins via CORS options.
- Rate limiting: Adjust windowMs and limit in middlewares/rateLimiter.js.
- Password rules: See utils/schemas/signUpSchema.js (must include upper+lower+digit; 8–20 chars).
- JWT expiry: 1h (configurable in userController via jwt.sign options).
- Indexes: Unique index on email is defined by userModel; ensure MongoDB builds it.

--------------------------------------------------------------------------------

Extending the API (suggestions)

- Secure user update/delete routes with auth + ownership/admin checks.
- Add refresh tokens + token rotation.
- Add request logging (e.g., morgan) with correlation IDs.
- Add Post validations and ownership checks.
- Add OpenAPI/Swagger docs.
- Add testing (Jest, supertest) and CI workflow.
- Add environment-specific configs and stricter CORS in production.

--------------------------------------------------------------------------------

License

MIT (or your preferred license)

--------------------------------------------------------------------------------

Appendix: Packages and versions (from package.json)

- express: ^5.1.0
- mongoose: ^8.19.1
- jsonwebtoken: ^9.0.2
- bcrypt: ^6.0.0
- joi: ^18.0.1
- cors: ^2.8.5
- helmet: ^8.1.0
- hpp: ^0.2.3
- express-rate-limit: ^8.1.0
- dotenv: ^17.2.3
- nodemon: ^3.1.10