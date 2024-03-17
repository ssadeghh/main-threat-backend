const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
});

const userUploadedAnyFileController = async (req, res) => {
  let targetUser = req.user[0];

  if (targetUser.userrole !== "newUser") {
    res
      .status(200)
      .json({
        message: "you're navigating to dashboard successfully!",
        userrole: targetUser.userrole,
      });
  } else {
    res.status(400).json({ message: "No file has been uploaded yet!" });
  }
};

module.exports = { userUploadedAnyFileController };
