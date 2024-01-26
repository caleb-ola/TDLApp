const express = require("express");
const {
  getAllUsers,
  getUserByUsername,
  getCurrentUser,
  getUserByEmail,
  updateCurrentUser,
  deleteCurrentUser,
} = require("../controllers/userController");
const { protect } = require("../controllers/authController");

const router = express.Router();

router.route("/").get(getAllUsers);
router
  .route("/current-user")
  .get(protect, getCurrentUser)
  .patch(protect, updateCurrentUser)
  .delete(protect, deleteCurrentUser);
router.get("/profile/:email", getUserByEmail);
router.get("/username/:username", getUserByUsername);

module.exports = router;
