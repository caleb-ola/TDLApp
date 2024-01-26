const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const process = require("process");

const tasksRouter = require("./routes/taskRoutes");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const categoryRouter = require("./routes/categoryRoutes");

const { NotFound, ErrorHandler } = require("./middlewares/errors");

const app = express();

app.use(express.json());

dotenv.config({ path: "./config.env" });
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/tasks", tasksRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use(NotFound);
app.use(ErrorHandler);

module.exports = app;
