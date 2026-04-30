import { Router } from "express";
import healthRoutes from "./health";
import authRoutes from "./auth";
import farmerRoutes from "./farmer";
import listingRoutes from "./listings";
import orderRoutes from "./orders";
import reportRoutes from "./reports";
import auditRoutes from "./audits";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/farmers", farmerRoutes);
router.use("/listings", listingRoutes);
router.use("/orders", orderRoutes);
router.use("/reports", reportRoutes);
router.use("/audits", auditRoutes);

export default router;
