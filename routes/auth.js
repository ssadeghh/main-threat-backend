const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getLoggedInUser,
} = require("../controllers/userAuthController");

// User registration
router.post("/register", registerUser);

// User login
router.post("/login", loginUser);

// Get user
router.get("/authorization", protect, getLoggedInUser); 


module.exports = router;
