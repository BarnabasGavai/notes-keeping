import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit"; // Import rate limiter
import { ApiError } from "./utils/ApiError.js";

const app = express();

// CORS Middleware (Must be first)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// 🚨 Apply rate limiting BEFORE other middlewares
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter); // 🚨 Rate limiting applied globally

// Common Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Import routes
import userRouter from "./routes/user.routes.js";
import noteRouter from "./routes/note.routes.js";
import labelRouter from "./routes/label.routes.js";

// Routes (Must be above static files)
app.use("/api/v1/users", userRouter);
app.use("/api/v1/notes", noteRouter);
app.use("/api/v1/labels", labelRouter);

// Serve static files (AFTER API routes)
app.use(express.static("dist"));

// Error Handling Middleware (Always last)
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors || [],
      data: err.data,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

export { app };
