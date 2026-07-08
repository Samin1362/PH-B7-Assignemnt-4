import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { GearController } from "./gear.controller";
import { gearIdSchema } from "./gear.validation";

const router = Router();

router.get("/", GearController.getAll);
router.get("/:id", validateRequest(gearIdSchema), GearController.getById);

export default router;
