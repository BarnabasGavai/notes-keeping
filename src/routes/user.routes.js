import { Router } from "express";
import {
  getUser,
  loginUser,
  logout,
  registerUser,
} from "../controllers/user.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/signin").post(loginUser);
router.route("/register").post(registerUser);
router.route("/logout").post(verifyJWT, logout);
router.route("/check").get(verifyJWT, getUser);

export default router;
