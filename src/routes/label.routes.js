import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  createLabel,
  deleteLabel,
  getLabels,
  updateLabel,
} from "../controllers/label.controllers.js";

const router = Router();

router.route("/create").post(verifyJWT, createLabel);
router.route("/update/:labelId").put(verifyJWT, updateLabel);
router.route("/delete/:labelId").delete(verifyJWT, deleteLabel);
router.route("/").get(verifyJWT, getLabels);

export default router;
