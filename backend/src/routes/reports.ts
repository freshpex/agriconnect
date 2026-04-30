import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createReport,
  getReports,
  updateReportStatus,
} from "../controllers/report.controller";
import { createReportRules, updateReportRules } from "../validators";

const router = Router();

router.use(authenticate);

router.post("/", validate(createReportRules), asyncHandler(createReport));
router.get("/", requireRole("admin"), asyncHandler(getReports));
router.patch(
  "/:id",
  requireRole("admin"),
  validate(updateReportRules),
  asyncHandler(updateReportStatus)
);

export default router;
