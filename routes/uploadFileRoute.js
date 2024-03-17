const express = require("express");
const router = express.Router();
const {
  uploadFile,
  getUploadedFiles,
  deleteUploadedFile,
  updateFilename,
} = require("../controllers/uploadFilesController");
const { protect } = require("../middleware/authMiddleware");
const { uploadMiddleware } = require("../middleware/uploadMiddleware");

router.post("/", uploadMiddleware, protect, uploadFile);
router.get("/get-uploaded-files", protect, getUploadedFiles);
router.delete("/delete-uploaded-file/:id", protect, deleteUploadedFile);
router.put("/update-filename", protect, updateFilename);

module.exports = router;
