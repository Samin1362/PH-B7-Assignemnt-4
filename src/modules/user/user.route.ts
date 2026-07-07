import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { updateProfileSchema } from "./user.validation";

const router = Router();

router.get("/me", authenticate, UserController.getProfile);
router.patch(
  "/me",
  authenticate,
  validateRequest(updateProfileSchema),
  UserController.updateProfile,
);

export default router;
