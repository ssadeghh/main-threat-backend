const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
require("dotenv").config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
});

const registerUser = async (req, res) => {
  try {
    const { username, password, confirmPassword, shortcutActiveIDs } = req.body;
    if (!username || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ error: "Please fill in all the required fields" });
    }

    //verify username
    const usernameRegex = /^(?![_\d])[\w]{5,20}$/;
    if (!usernameRegex.test(username)) {
      // Username does not meet requirements
      return res
        .status(401)
        .json({ error: "Username does not meet requirements!" });
    }

    // check if user exists
    const userExistsQuery = `
        SELECT * FROM threat."User" WHERE username = $1;
      `;

    const userExistsResult = await pool.query(userExistsQuery, [username]);
    if (userExistsResult.rowCount > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    //verify password
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    if (!passwordRegex.test(password)) {
      // Password does not meet requirements
      return res
        .status(401)
        .json({ error: "Password does not meet requirements!" });
    }

    // check if password and confirm password are the same
    if (password !== confirmPassword) {
      return res.status(401).json({
        error:
          "Passwords do not match. Please make sure your password and confirmation password are identical.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into the database
    const insertUserQuery = `
       INSERT INTO threat."User" (username, password, shortcutActiveIDs) VALUES ($1, $2, $3) RETURNING *;
     `;
    const insertedUser = await pool.query(insertUserQuery, [
      username,
      hashedPassword,
      shortcutActiveIDs,
    ]);

    const newUser = insertedUser.rows[0];

    console.log("newUser: ", newUser);

    if (newUser) {
      return res.status(201).json({
        _id: newUser.id, // Assuming "id" is the primary key column
        username: newUser.username,
        token: generateToken(newUser.id, newUser.username),
      });
    } else {
      res.status(401);
      throw new Error("Failed to insert user data");
    }
  } catch (error) {
    return res.status(500).json({ error: "Registration failed" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Check if user exists in PostgreSQL
    const userQuery = `
      SELECT * FROM threat."User" WHERE username = $1;
    `;
    const userResult = await pool.query(userQuery, [username]);

    if (userResult.rowCount === 0) {
      return res
        .status(401)
        .json({
          error: "Authentication failed! Username or password is wrong",
        });
    }

    const user = userResult.rows[0];
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({
          error: "Authentication failed! Username or password is wrong",
        });
    }
    const token = generateToken(user.id, user.username);
    return res.status(200).json({ token, username });
  } catch (error) {
    return res.status(500).json({ error: "Login failed" });
  }
};

// Generate JWT
const generateToken = (id, username) => {
  return jwt.sign({ id, username }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const getLoggedInUser = async (req, res) => {
  const users = req.user;
  let username;
  users.map((user) => {
    username = user.username;
  });
  return res.status(200).json({ username });
};

module.exports = {
  registerUser,
  loginUser,
  getLoggedInUser,
};
