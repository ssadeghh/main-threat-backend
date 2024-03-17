const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  userUploadedAnyFileController,
} = require("../controllers/userUploadedAnyFileController");
const {
  uploadedAnyFileMiddleware,
} = require("../middleware/uploadedAnyFileMiddleware");

//user setting
router.get("/", userUploadedAnyFileController);

module.exports = router;
