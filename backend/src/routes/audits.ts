import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { getVerificationAudits } from "../controllers/audit.controller";

const router = Router();

router.use(authenticate);
router.get("/", requireRole("admin"), asyncHandler(getVerificationAudits));

export default router;
