const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
// const { ErrorMessage } = require("../utils/errorMessage");

// GET ALL USERS
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-passwordChangedAt");

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      data: users,
    },
  });
});

// GET USER BY USERNAME
exports.getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
});

// GET USER BY EMAIL
exports.getUserByEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const user = await User.findOne({ email });

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
});

// GET CURRENT USER
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const { user } = req;

  const currentUser = await User.findById(user._id);

  res.status(200).json({
    status: "success",
    data: {
      data: currentUser,
    },
  });
});

// UPDATE USER
exports.updateCurrentUser = asyncHandler(async (req, res) => {
  const { user } = req;

  const { name, email, username } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      name,
      email,
      username,
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      data: updatedUser,
    },
  });
});

// DELETE USER
exports.deleteCurrentUser = asyncHandler(async (req, res) => {
  const { user } = req;

  await User.findByIdAndDelete(user._id);

  res.status(204).json({
    status: "success",
  });
});
