const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");
const { ErrorMessage } = require("../utils/errorMessage");
const User = require("../models/userModel");

// GET ALL CATEGLRIES
exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: {
      data: categories,
    },
  });
});

// GET SINGLE CATEGORY
exports.getCategory = asyncHandler(async (req, res) => {
  const { UFID } = req.params;

  const category = await Category.findOne({ UFID });
  if (!category) {
    ErrorMessage("Category does not exist", 400, res);
  }

  res.status(200).json({
    status: "success",
    data: {
      data: category,
    },
  });
});

// GET ALL CATEGORIES FOR A USER
exports.getCategoriesByCreator = asyncHandler(async (req, res) => {
  const { user } = req;

  const categories = await Category.find({ user: user._id });

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: {
      data: categories,
    },
  });
});

// GET A SINGLE CATEGORY FOR A USER
exports.getCategoryByCreator = asyncHandler(async (req, res) => {
  const { UFID } = req.params;
  const { user } = req;

  const categoryExists = await Category.findOne({ UFID, user: user._id });
  if (!categoryExists) {
    ErrorMessage("Category does not exist for this user", 400, res);
  }

  const updatedCategory = Category.findOneAndUpdate({ UFID });
  res.status({
    status: "success",
    data: {
      data: updatedCategory,
    },
  });
});

// CREATE A CATEGORY
exports.createCategory = asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title) {
    res.status(400);
    throw new Error("Title is required");
  }

  const { user } = req;
  if (!user) {
    res.status(403);
    throw new Error("You are not allowed to perform this action");
  }

  const existingCategory = await Category.findOne({ title, user: user._id });
  if (existingCategory) {
    res.status(400);
    throw new Error("A category of the same name already exist");
  }

  const newCategory = await Category.create({ title, user: user._id });

  await User.findOneAndUpdate(
    { _id: user._id },
    {
      categories: [...user.categories, newCategory],
    },
    { new: true }
  );
  // console.log(currentUser);

  res.status(201).json({
    status: "success",
    data: {
      data: newCategory,
    },
  });
});

// UPDATE A CATEGORY
exports.updateCategory = asyncHandler(async (req, res) => {
  const { UFID } = req.params;
  const { user } = req;

  const categoryExist = await Category.findOne({ UFID, user: user._id });

  if (!categoryExist) {
    ErrorMessage("Category does not exist", 404, res);
  }

  const { title } = req.body;
  if (!title) {
    ErrorMessage("Title is required", 400, res);
  }

  const checkCategory = await Category.findOne({ title, user: user._id });
  if (checkCategory) {
    ErrorMessage("Category with the same title already exists", 400, res);
  }

  const updatedCategory = await Category.findOneAndUpdate(
    { UFID },
    { title },
    {
      new: true,
      runValidators: true,
    }
  );

  await User.findOneAndUpdate(
    { _id: user._id },
    {
      categories: [
        ...user.categories.filter((category) => category.UFID !== UFID),
        updatedCategory,
      ],
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      data: updatedCategory,
    },
  });
});

// REMOVE A CATEGORY
exports.deleteCategory = asyncHandler(async (req, res) => {
  const { user } = req;
  const { UFID } = req.params;

  const deleteCategory = await Category.findOneAndDelete({
    UFID,
    user: user._id,
  });

  if (!deleteCategory) {
    ErrorMessage("You are not authorised to delete this category", 401, res);
  }

  await User.findOneAndUpdate(
    { _id: user._id },
    {
      categories: [
        ...user.categories.filter((category) => category.UFID !== UFID),
      ],
    },
    { new: true }
  );
  res.status(204).json({
    status: "success",
  });
});
