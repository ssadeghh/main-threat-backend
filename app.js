const express = require("express");
const app = express();
const cors = require("cors");
const authRoutes = require("./routes/auth");
const uploadFileRoute = require("./routes/uploadFileRoute");
const userRoute = require("./routes/userRoute");
const { protect } = require("./middleware/authMiddleware");
const userUploadedAnyFileRoute = require("./routes/userUploadedAnyFileRoute");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");

require("dotenv").config();

connectDB();
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", protect, userRoute);
app.use("/upload", uploadFileRoute);
app.use("/user-uploaded-any-file", protect, userUploadedAnyFileRoute);
app.use("/get-uploaded-file", protect, uploadFileRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
