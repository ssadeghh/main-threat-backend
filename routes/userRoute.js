const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const {
  getUserShorcutAnalysis,
  editUserShorcutAnalysis,
} = require("../controllers/userSettingController");

//user setting
router.get("/setting/get-shortcuts-analysis", getUserShorcutAnalysis);
router.put("/setting/edit-shortcuts-analysis", editUserShorcutAnalysis);

module.exports = router;
