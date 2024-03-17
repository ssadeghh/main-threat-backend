const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const asyncHandler = require("express-async-handler");
require("dotenv").config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
});

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // get token from header
      token = req.headers.authorization.split(" ")[1];

      // verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // get user from the token
      const userQuery = `
        SELECT * FROM threat."User" WHERE username = $1;
     `;

      const userResult = await pool.query(userQuery, [decoded.username]);

      // userResult.rows return user's data that get from database like password, username, id, shortcutactiveids and ... like below
      // req.user:  [
      //   {
      //     id: 2,
      //     username: 'test2',
      //     password: '$2b$10$Yr6s7D45Q90j7B19u8Zt1uHrT8eR2kTX3QsC1TAEEDAb6j0MIXxPm',
      //     shortcutactiveids: [ 1, 2, 3, 4, 5, 6 ]
      //   }
      // ]
      req.user = userResult.rows;

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not Authorized");
    }
  } else if (!token) {
    res.status(401);
    throw new Error("Not Authorized, no token");
  }
});

module.exports = { protect };
