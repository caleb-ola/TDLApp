const mongoose = require("mongoose");
const { default: slugify } = require("slugify");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A task must have a title"],
      trim: true,
    },
    description: String,
    priority: {
      type: String,
      required: [true, "A task must have a priority"],
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority can only be low, medium and high",
      },
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["completed", "pending", "failed"],
        message: "Status can only be completed, pending, or failed",
      },
      default: "pending",
    },
    dueDate: {
      type: Date,
    },
    slug: String,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    // category: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: "Category",
    //   required: true,
    // },
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

taskSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

taskSchema.pre("findOneAndUpdate", function (next) {
  if (this._update.title) {
    this._update.slug = slugify(this._update.title, { lower: true });
  }
  next();
});

taskSchema.pre(/^find/, function (next) {
  this.select("-__v");
  next();
});

const Tasks = mongoose.model("Tasks", taskSchema);

module.exports = Tasks;
