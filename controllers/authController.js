const jwt = require("jsonwebtoken");
const process = require("process");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { promisify } = require("util");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const Email = require("../utils/email");

// FUNCTION TO GENERATE A TOKEN
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// FUNCTION TO CREATE AND SEND TOKEN WITH OTHER ACCURATE RESPONSES
const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      data: user,
    },
  });
};

exports.signup = asyncHandler(async (req, res) => {
  const { name, email, username, password, confirmPassword } = req.body;
  const newUser = new User({
    name,
    email,
    username,
    password,
    confirmPassword,
    role: "user",
  });

  await newUser.save();

  await new Email(
    newUser,
    `${process.env.APP_client}/auth/verification-email`
  ).verifyEmail();

  res.status(200).json({
    status: "success",
    data: {
      message: "We sent a verification to your email.",
    },
  });
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) throw new Error("Email is required");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error("Tokne is invalid or expired");

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  user.save();

  createSendToken(user, 200, res);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // CHECKING IF EMAIL OR PASSWORD EXISTS
  if (!email || !password) {
    throw new Error("Please enter email or password");
  }

  // GET USER
  const user = await User.findOne({ email }).select("+password +isVerified");

  // CHECKING IF EMAIL AND PASSWORD ARE CORRECT
  // const correct = await user.checkPassword(password, user.password);

  if (!user || !(await user.checkPassword(password, user.password))) {
    throw new Error("Username or Password incorrect");
  }
  if (!user.isVerified)
    throw new Error(
      "We sent you a verification email, please confirm your email."
    );
  if (!user.active)
    throw new Error(
      "Your account has been suspended, please reach out to our support team."
    );

  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.status(200).json({});
};

exports.protect = asyncHandler(async (req, res, next) => {
  // CHECK IF A TOKEN EXISTS
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("You are not authorized, please log in");
  }

  // VERIFY TOKEN
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // CHECK IF USER STILL EXISTS
  const freshUser = await User.findById(decode.id);

  if (!freshUser) {
    res.status(401);
    throw new Error("User no longer exists, please login again");
  }

  // CHECK IF USER CHANGED PASSWORD AFTER TOKEN WAS ISSUED
  const changePassword = await freshUser.changePasswordAfter(decode.iat);

  if (changePassword) {
    res.status(401);
    throw new Error("Password changed, please login again");
  }

  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error("You are not allowed to perform this action");
    }
    next();
  };
};

exports.forgotPassword = asyncHandler(async (req, res) => {
  // CHECKING IF EMAIL EXISTS IN THE REQUEST
  const { email } = req.body;
  if (!email) {
    res.status(404);
    throw new Error("Please enter an email");
  }

  // CHECKING IF THERE IS A USER WITH THE EMAIL SUPPLIED
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User with that email does not exist");
  }

  // GENERATE A RANDOM RESET TOKEN
  const resetToken = await user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // SEND TOKEN TO USER'S EMAIL
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/reset-password/${resetToken}`;

  const message = `Forgot your password? submit a 
  PATCH request with your new password and passwordConfirm to: 
  ${resetURL}. \n If you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email,
      subject: "Your email verification link",
      message,
    });
    res.status(200).json({
      status: "success",
      data: "Password reset email has been sent!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });
    res.status(404);
    throw new Error("Email not sent, something went wrong!");
  }
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token) {
    res.status(400);
    throw new Error("Please input a valid token");
  }

  // CONVERT TOKEN TO THE HASHED FORM IN THE DATABASE
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Token is invalid or has expired");
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  const updatedUser = await user.save();

  createSendToken(updatedUser, 200, res);
});

exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, password, confirmPassword } = req.body;

  if (!currentPassword) {
    res.status(400);
    throw new Error("Input current password field");
  }
  if (!password) {
    res.status(400);
    throw new Error("Input password field");
  }
  if (!confirmPassword) {
    res.status(400);
    throw new Error("Input confirm password field");
  }

  const user = await User.findById(req.user.id).select("+password");

  const correctPassword = await user.checkPassword(
    currentPassword,
    user.password
  );

  if (!user || !correctPassword) {
    res.status(403);
    throw new Error("Password is incorrect");
  }

  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordChangedAt = Date.now();
  await user.save();

  createSendToken(user, 200, res);
});
