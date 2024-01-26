const asyncHandler = require("express-async-handler");
const Tasks = require("../models/tasksModel");
const Category = require("../models/categoryModel");

exports.CheckTaskExists = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const docExist = await Tasks.findOne({ slug });

  if (!docExist) {
    throw new Error(`Task does not exist`);
  }
  req.task = docExist;
  next();
});

// exports.checkCategoryExists = asyncHandler(async (req, res) => {
//   const docExists = await Category.findOne({ _id: req.params.id });
// });
