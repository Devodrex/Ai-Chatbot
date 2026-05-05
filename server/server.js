import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import chatRoutes from "./routes/chat.js";

const app = express();

// 🔥 CORS (important for Vercel)
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// DB
connectDB();

// Routes
app.use("/", chatRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🚀`);
});