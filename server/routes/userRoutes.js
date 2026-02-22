import express from "express";
import { registerUser, authUser, allUsers, updateProfile } from "../controllers/userControllers.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers);
router.route("/profile").put(protect, updateProfile);
router.post("/login", authUser);

export default router;
