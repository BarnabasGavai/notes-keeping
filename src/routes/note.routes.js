import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../controllers/note.controllers.js";

const router = Router();

router.route("/delete/:noteId").delete(verifyJWT, deleteNote);
router.route("/create").post(verifyJWT, createNote);
router.route("/update/:noteId").put(verifyJWT, updateNote);
router.route("/").get(verifyJWT, getNotes);

export default router;
