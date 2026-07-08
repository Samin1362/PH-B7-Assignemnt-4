import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { RentalController } from "./rental.controller";
import { updateOrderStatusSchema } from "./rental.validation";

const router = Router();

router.use(authenticate, authorize("PROVIDER"));

router.get("/", RentalController.getProviderOrders);
router.patch(
  "/:id",
  validateRequest(updateOrderStatusSchema),
  RentalController.updateStatus,
);

export default router;
