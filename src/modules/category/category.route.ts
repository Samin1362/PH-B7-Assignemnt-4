import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryController } from "./category.controller";
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation";

const router = Router();

router.get("/", CategoryController.getAll);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validateRequest(createCategorySchema),
  CategoryController.create,
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest(updateCategorySchema),
  CategoryController.update,
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest(categoryIdSchema),
  CategoryController.remove,
);

export default router;
