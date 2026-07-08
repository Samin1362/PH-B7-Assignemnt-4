import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentController } from "./payment.controller";
import { createPaymentSchema, paymentIdSchema } from "./payment.validation";

const router = Router();

router.post("/confirm", PaymentController.confirm);

router.post(
  "/create",
  authenticate,
  authorize("CUSTOMER"),
  validateRequest(createPaymentSchema),
  PaymentController.create,
);
router.get("/", authenticate, authorize("CUSTOMER"), PaymentController.getMine);
router.get(
  "/:id",
  authenticate,
  authorize("CUSTOMER"),
  validateRequest(paymentIdSchema),
  PaymentController.getById,
);

export default router;
