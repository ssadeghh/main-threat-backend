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

const getUserShorcutAnalysis = async (req, res) => {
  try {
    let shortcutActiveID;
    req.user.map((user) => {
      shortcutActiveID = user.shortcutactiveids;
    });
    return res.status(200).json({ shortcutActiveIDs: shortcutActiveID });
  } catch (error) {
    return res.status(400).json({ error: "Getting Shortcut Analysis Failed!" });
  }
};

const editUserShorcutAnalysis = async (req, res) => {
  try {
    const { shortcutID } = req.body;

    let targetUser = req.user[0];
    const updateShortcutActiveIDs = `
      UPDATE threat."User" SET shortcutActiveIDs = $1 WHERE id = $2;
    `;
    const userResult = await pool.query(updateShortcutActiveIDs, [
      shortcutID,
      targetUser.id,
    ]);

    return res
      .status(200)
      .json({ edit: "Edit Shortcuts were Done Successfully!" });
  } catch (error) {
    return res.status(400).json({ error: "Getting Shortcut Analysis Failed!" });
  }
};

module.exports = {
  getUserShorcutAnalysis,
  editUserShorcutAnalysis,
};
