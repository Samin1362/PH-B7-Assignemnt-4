import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { GearController } from "./gear.controller";
import {
  createGearSchema,
  gearIdSchema,
  updateGearSchema,
} from "./gear.validation";

const router = Router();

router.use(authenticate, authorize("PROVIDER"));

router.post("/", validateRequest(createGearSchema), GearController.create);
router.get("/", GearController.getMine);
router.patch("/:id", validateRequest(updateGearSchema), GearController.update);
router.delete("/:id", validateRequest(gearIdSchema), GearController.remove);

export default router;
