import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewController } from "../review/review.controller";
import { gearReviewsSchema } from "../review/review.validation";
import { GearController } from "./gear.controller";
import { gearIdSchema } from "./gear.validation";

const router = Router();

router.get("/", GearController.getAll);
router.get("/:id", validateRequest(gearIdSchema), GearController.getById);
router.get(
  "/:id/reviews",
  validateRequest(gearReviewsSchema),
  ReviewController.getForGear,
);

export default router;
