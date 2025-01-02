import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/ApiError.js";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//common middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use(cookieParser());

app.use(express.static("dist"));

//import routes
import userRouter from "./routes/user.routes.js";
import noteRouter from "./routes/note.routes.js";
import labelRouter from "./routes/label.routes.js";

//routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/notes", noteRouter);
app.use("/api/v1/labels", labelRouter);

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    // Handle custom API errors
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors || [],
      data: err.data,
    });
  }

  // Handle generic errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

export { app };
