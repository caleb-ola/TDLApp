const express = require("express");
const {
  getAllCategories,
  createCategory,
  getCategoriesByCreator,
  getCategoryByCreator,
  updateCategory,
  deleteCategory,
  getCategory,
} = require("../controllers/categoryController");
const { protect } = require("../controllers/authController");

const router = express.Router();

router.route("/").get(getAllCategories).post(protect, createCategory);
router
  .route("/:UFID")
  .get(getCategory)
  .post(protect, createCategory)
  .patch(protect, updateCategory)
  .delete(protect, deleteCategory);
router.get("/creator/categories", protect, getCategoriesByCreator);
router.get("creator-categories/:UFID", protect, getCategoryByCreator);

module.exports = router;
