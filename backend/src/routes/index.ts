import { Router } from "express";
import healthRoutes from "./health";
import authRoutes from "./auth";
import farmerRoutes from "./farmer";
import listingRoutes from "./listings";
import orderRoutes from "./orders";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/farmers", farmerRoutes);
router.use("/listings", listingRoutes);
router.use("/orders", orderRoutes);

export default router;
