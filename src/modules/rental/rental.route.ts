import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { RentalController } from "./rental.controller";
import { createRentalSchema, rentalIdSchema } from "./rental.validation";

const router = Router();

router.use(authenticate, authorize("CUSTOMER"));

router.post("/", validateRequest(createRentalSchema), RentalController.create);
router.get("/", RentalController.getMine);
router.get("/:id", validateRequest(rentalIdSchema), RentalController.getById);
router.patch(
  "/:id/cancel",
  validateRequest(rentalIdSchema),
  RentalController.cancel,
);

export default router;
