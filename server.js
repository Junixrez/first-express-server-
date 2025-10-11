const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");

const usersRouter = require("./Routes/userRoutes");
const postsRouter = require("./Routes/postRoutes");

const errorHandler = require("./middlewares/errorHandler");
const rateLimiter = require("./middlewares/rateLimiter");

const CustomError = require("./utils/customError");

require("dotenv").config();

const app = express();

// middleware to parse json body
app.use(express.json());
app.use(cors());
app.use(rateLimiter);
app.use(helmet());
app.use(hpp());
// routes
app.use(`/users`, usersRouter);
app.use(`/posts`, postsRouter);

// not found route
app.use((req, res) => {
  throw new CustomError("Route not found", 404);
});

// error middleware
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Up And running on port ${PORT} ╰(*°▽°*)╯`);
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅✅ Connected to MongoDB"))
    .catch((err) => console.error("❌❌ Error connecting to MongoDB", err));
});
