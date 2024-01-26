const { default: mongoose } = require("mongoose");
const { default: slugify } = require("slugify");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890abcdef", 20);

const CategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    UFID: {
      type: String,
      unique: true,
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

CategorySchema.pre(/^find/, function (next) {
  this.select("-__v");
  this.id = this._id;
  next();
});

CategorySchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  this.UFID = nanoid();
  next();
});

CategorySchema.pre("findOneAndUpdate", function (next) {
  if (this._update.title) {
    this._update.slug = slugify(this._update.title, { lower: true });
  }
  next();
});
const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;
