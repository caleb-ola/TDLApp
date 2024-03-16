const asyncHandler = require("express-async-handler");
const Tasks = require("../models/tasksModel");
const { ErrorMessage } = require("../utils/errorMessage");

// GET ALL TASKS
exports.getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await Tasks.find();
  //   console.log(tasks);
  res.status(200).json({
    status: "success",
    results: tasks.length,
    data: {
      data: tasks,
    },
  });
});

// GET SINGLE TASK
exports.getTask = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const task = await Tasks.findOne({ slug });

  if (task) {
    res.status(200).json({
      status: "success",
      data: {
        data: task,
      },
    });
  } else {
    throw new Error("Task not found");
  }
});

// GET TASKS BY CREATOR
exports.getTasksByCreator = asyncHandler(async (req, res) => {
  const { user } = req;

  const task = await Tasks.find({ user: user.id });

  res.status(200).json({
    status: "success",
    results: task.length,
    data: {
      data: task,
    },
  });
});

// CREATE A TASK
exports.createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, status, dueDate, category } = req.body;
  if (!req.user) {
    res.status(405);
    throw new Error("User does not exist");
  }

  // VERIFY USER'S CATEGORY
  // const user = await User.findOne({ _id: req.user._id });
  // if (!req.user.verifyUserCategory(category)) {
  //   ErrorMessage("The category does not belong to this user", 403, res);
  // }

  // const taskExist = await Tasks.findOne({ title });
  // if (taskExist) {
  //   throw new Error("Task already exists");
  // } else {
  // const newTask = await Tasks.create(req.body);
  const task = new Tasks({
    title,
    description,
    priority,
    status,
    dueDate,
    category,
    user: req.user._id,
  });

  if (task) {
    const createdTask = await task.save();
    res.status(201).json({
      status: "success",
      data: {
        data: createdTask,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid task data");
  }
  // }
});

// UPDATE A TASK
exports.updateTask = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  // const taskExist = await Tasks.findOne({ slug });
  // if (!taskExist) {
  //   throw new Error("Task does not exist");
  // }

  const { title, description, priority, status, dueDate } = req.body;

  const updatedTask = await Tasks.findOneAndUpdate(
    { slug },
    { title, description, priority, status, dueDate },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      data: updatedTask,
    },
  });
});

// DELETE A TASK
exports.deleteTask = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  // const taskExist = await Tasks.findOne({ slug });
  // if (!taskExist) {
  //   throw new Error("Task does not exist");
  // }

  const task = await Tasks.findOneAndDelete({ slug });

  res.status(204).json({
    status: "success",
    data: {
      data: task,
    },
  });
});

// TOGGLE TASK AS COMPLETED OR UNCOMPLETED
exports.toggleTaskCompleted = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const { user } = req;

  const task = await Tasks.findOne({ slug, user: user._id });
  if (!task) {
    res.status(403);
    return new Error("You are not allowed to perform this action");
  }

  task.status = task.status === "pending" ? "completed" : "pending";

  const updatedTask = await task.save();

  res.status(200).json({
    status: "success",
    data: {
      data: updatedTask,
    },
  });
});
