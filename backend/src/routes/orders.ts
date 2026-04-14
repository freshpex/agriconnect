import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { createOrderRules, updateOrderStatusRules } from "../validators";
import {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
} from "../controllers/order.controller";

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.post("/", validate(createOrderRules), asyncHandler(createOrder));
router.get("/", asyncHandler(getMyOrders));
router.get("/:id", asyncHandler(getOrder));
router.patch(
  "/:id/status",
  validate(updateOrderStatusRules),
  asyncHandler(updateOrderStatus)
);

export default router;
