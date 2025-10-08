const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const usersRouter = require("./Routes/userRoutes");
const postRouter = require("./Routes/postRoutes");
const errorHandler = require("./middlewares/errorHandler");
const rateLimiter = require("./middlewares/rateLimiter");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅✅ Connected to MongoDB"))
  .catch((err) => console.error("❌❌ Error connecting to MongoDB ", err));

// app midleewares
app.use(express.json());
app.use(rateLimiter);

//endpoints
app.use("/users", usersRouter);
app.use("/posts", postRouter);

//error handler
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("up and runinng ╰(*°▽°*)╯");
});
