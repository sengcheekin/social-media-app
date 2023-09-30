import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url); // to get filename, specific to type="module"
const __dirname = path.dirname(__filename); // to get directory name
dotenv.config(); // load .env file
const app = express(); // initialize express app to use middlewares
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets"))); // set local directory for assets. In real world, we use actual storage/cloud storage for this

/* FILE STORAGE */
// Gotten from the multer documentation. This is to locally store files people upload.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register); // this route is placed here because we want to use the upload middleware
app.post("/posts", verifyToken, upload.single("picture"), createPost); // this route is placed here because we want to use the upload middleware

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* MONGOOSE */
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
  });
