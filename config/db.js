const { Pool } = require("pg");

const connectDB = async () => {
  const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT || 5432, // Default PostgreSQL port
  });

  try {
    // Use the pool to connect to PostgreSQL
    const client = await pool.connect();
    console.log(
      `PostgreSQL connected: ${client.connectionParameters.database}`
    );

    // Check if the User table exists
    const userTableQuery = `
     SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'threat'
     AND table_name = 'User';
   `;

    const userTableResult = await client.query(userTableQuery);

    if (userTableResult.rowCount === 0) {
      // User table does not exist, create it
      const createUserTableQuery = `
     CREATE TABLE threat."User" (
       id SERIAL PRIMARY KEY,
       username VARCHAR(255) NOT NULL,
       password VARCHAR(255) NOT NULL,
       shortcutActiveIDs INTEGER[],
       userRole VARCHAR(20) DEFAULT 'newUser' CHECK (userRole IN ('newUser', 'normalUser'))
     );    
     `;

      await client.query(createUserTableQuery);
      console.log("User table created successfully.");
    } else {
      console.log("User table already exists.");
    }

    // Check if the User table exists
    const fileTableQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'threat'
      AND table_name = 'File';
    `;

    const fileTableResult = await client.query(fileTableQuery);

    if (fileTableResult.rowCount === 0) {
      //File table does not exist, create it
      const createFileTableQuery = `
      CREATE TABLE threat."File" (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        serverIP VARCHAR(128) NOT NULL,
        fileStatus VARCHAR(8) DEFAULT 'active' CHECK (fileStatus IN ('active', 'deactive')),
        fileType VARCHAR(8) CHECK (fileType IN ('File', 'Firmware')),
        filesize INTEGER NOT NULL,
        fileDate VARCHAR(20) NOT NULL,
        fileDateUploded TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        userId INTEGER REFERENCES threat."User"(id) ON DELETE SET NULL
      );
      `;

      await client.query(createFileTableQuery);
      console.log("File table created successfully.");
    } else {
      console.log("File table already exists.");
    }

    client.release(); // Release the client back to the pool
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
