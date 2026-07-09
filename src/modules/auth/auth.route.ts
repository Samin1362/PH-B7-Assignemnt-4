import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import rateLimit from "../../middlewares/rateLimit";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

const router = Router();

const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

router.post(
  "/register",
  authLimiter,
  validateRequest(registerSchema),
  AuthController.register,
);
router.post(
  "/login",
  authLimiter,
  validateRequest(loginSchema),
  AuthController.login,
);
router.get("/me", authenticate, AuthController.getMe);
router.post("/logout", authenticate, AuthController.logout);

export default router;
