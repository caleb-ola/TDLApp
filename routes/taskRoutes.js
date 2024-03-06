const express = require("express");
const {
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  toggleTaskCompleted,
  getTasksByCreator,
} = require("../controllers/taskController");
const { protect, restrictTo } = require("../controllers/authController");
const { CheckTaskExists } = require("../utils/utilMiddlewares");

const router = express.Router();

router.route("/").get(getAllTasks).post(protect, createTask);
router.get("/tasks-by-creator", protect, getTasksByCreator);
router
  .route("/:slug")
  .get(getTask)
  .patch(CheckTaskExists, updateTask)
  .delete(CheckTaskExists, deleteTask);
router.patch(
  "/:slug/toggle-completed",
  protect,
  restrictTo("user"),
  CheckTaskExists,
  toggleTaskCompleted
);
module.exports = router;
