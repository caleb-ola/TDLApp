const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");
const crypto = require("crypto");

const CategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    UFID: {
      type: String,
      // required: true,
    },
    slug: String,
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      max: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lower: true,
      validate: [validator.isEmail, "Enter a valid email"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lower: true,
    },
    photo: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      min: [5, "Password cannot be less than 5 characters"],
      max: [20, "Passwords cannot be more than 20 characters"],
      required: [true, "Password is required"],
      select: false,
    },
    confirmPassword: {
      type: String,
      min: [5, "Password cannot be less than 5 characters"],
      max: [20, "Password cannot be more than 20 characters"],
      // required: [true, "Password confirmation is required"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords must be the same",
      },
    },
    // categories: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: "Category",
    //   },
    // ],
    slug: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    verificationToken: String,
    verificationTokenExpires: Date,
    isVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

UserSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

UserSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

// VERIFY USER CATEGORY
UserSchema.methods.verifyUserCategory = function (categoryId) {
  return this.categories.some((category) => category._id.equals(categoryId));
};

UserSchema.methods.checkPassword = async function (
  inputPassword,
  userPassword
) {
  return await bcrypt.compare(inputPassword, userPassword);
};

UserSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime(), 10);
    return JWTTimestamp < changedTimestamp / 1000;
    // console.log(changedTimestamp, JWTTimestamp);
  }
  return false;
};

UserSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // console.log(resetToken, this.passwordResetToken);

  return resetToken;
};

UserSchema.methods.createVerificationToken = function () {
  const verificationToken = crypto.randomBytes(18).toString("hex");

  this.verificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;

  return verificationToken;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
