import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { registerRules, loginRules } from "../validators";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/register", validate(registerRules), asyncHandler(register));
router.post("/login", validate(loginRules), asyncHandler(login));
router.get("/me", authenticate, asyncHandler(getMe));

export default router;
