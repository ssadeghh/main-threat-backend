const fs = require("fs");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const axios = require("axios");
require("dotenv").config();
const { exec } = require("child_process");

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
});

const uploadFile = async (req, res) => {
  // Retrieve the server IP from the request object
  const serverIP = req.connection.remoteAddress;

  // Handle the uploaded files
  const file = req.file;

  const UploadedType = req.UploadedType;

  let targetUser = req.user[0];

  // Process and store the files as required
  if (file && file.path && file.filename) {
    const userDirectory = `uploads/${targetUser.username}`;
    if (!fs.existsSync(userDirectory)) {
      fs.mkdirSync(userDirectory);
      fs.mkdirSync(`${userDirectory}/file`);
      fs.mkdirSync(`${userDirectory}/firmware`);
    }
    const fileDate = req.fileDate;
    let filePath;
    if (UploadedType === "File") {
      fs.mkdirSync(`${userDirectory}/file/${fileDate}`);
      filePath = `${userDirectory}/file/${fileDate}/${file.filename}`;
    } else if (UploadedType === "Firmware") {
      fs.mkdirSync(`${userDirectory}/firmware/${fileDate}`);
      filePath = `${userDirectory}/firmware/${fileDate}/${file.filename}`;
    }
    fs.rename(file.path, filePath, (err) => {
      if (err) {
        // Handle error appropriately and send an error response
        return res.status(500).json({ error: "Failed to store the file" });
      }
    });
    exec(`md5sum ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`Command encountered an error: ${stderr}`);
        return;
      }

      console.log("Command output:", stdout);
    });
    const updateUploadedFiles = `
    UPDATE threat."User" SET userrole = $1 WHERE id = $2;
  `;

    const userResult = await pool.query(updateUploadedFiles, [
      "normalUser",
      targetUser.id,
    ]);

    // Insert the file details into the File table
    const insertFileQuery = `
      INSERT INTO threat."File" (filename, serverIP, fileStatus, fileType, filesize, userId, fileDate)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;
    const fileValues = [
      file.filename,
      serverIP,
      "active",
      UploadedType,
      file.size,
      targetUser.id,
      fileDate,
    ];
    await pool.query(insertFileQuery, fileValues);

    // Send an appropriate response to the client
    res.status(200).json({ message: "File upload successful" });
  } else {
    res.status(400).json({ message: "No file has been uploaded!" });
  }
};

const getUploadedFiles = async (req, res) => {
  try {
    const targetUser = req.user[0];

    // Retrieve files associated with the user
    const getFilesQuery = `
      SELECT filename, filetype, filestatus, filesize, id, filedateuploded, filedate
      FROM threat."File"
      WHERE userId = $1;
    `;

    const filesResult = await pool.query(getFilesQuery, [targetUser.id]);
    const uploadedFiles = filesResult.rows;

    res.status(200).json({ uploadedFiles });
  } catch (error) {
    console.error("Error fetching uploaded files:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteUploadedFile = async (req, res) => {
  try {
    const { rowId } = req.body;
    const queryDeleteFile = `DELETE FROM threat."File"
      WHERE id = $1;
    `;
    await pool.query(queryDeleteFile, [rowId]);
    res.status(200).json({ message: "File deleted successfully" });
  } catch {
    res.status(500).json({ error: "Internal Server Error!" });
  }
};

const updateFilename = async (req, res) => {
  try {
    const targetUser = req.user[0];
    console.log(req.body.params);
    const queryUpdateFilename = `UPDATE threat."File" SET filename = $1 WHERE id = $2;`;
    await pool.query(queryUpdateFilename, [
      req.body.params.filename,
      req.body.params.id,
    ]);
    fs.rename(
      `uploads/${
        targetUser.username
      }/${req.body.originalRow.filetype.toLowerCase()}/${
        req.body.originalRow.filedate
      }/${req.body.originalRow.filename}`,
      `uploads/${
        targetUser.username
      }/${req.body.params.filetype.toLowerCase()}/${req.body.params.filedate}/${
        req.body.params.filename
      }`,
      (err) => {
        if (err) {
          console.error("Error renaming file:", err);
        } else {
          console.log("File renamed successfully.");
        }
      }
    );
    return res.status(200).json({ message: "updated filename successfully!" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

module.exports = {
  uploadFile,
  getUploadedFiles,
  deleteUploadedFile,
  updateFilename,
};
