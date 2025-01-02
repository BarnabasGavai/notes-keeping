import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./DB/index.js";

dotenv.config();
const PORT = process.env.PORT || 8001;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongodb Connection error", err);
  });
