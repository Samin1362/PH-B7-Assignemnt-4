import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AdminController } from "./admin.controller";
import { updateUserSchema } from "./admin.validation";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/users", AdminController.getUsers);
router.patch(
  "/users/:id",
  validateRequest(updateUserSchema),
  AdminController.updateUser,
);
router.get("/gear", AdminController.getGear);
router.get("/rentals", AdminController.getRentals);

export default router;
