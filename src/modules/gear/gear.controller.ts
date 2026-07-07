import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { GearService } from "./gear.service";
import { getGearQuerySchema } from "./gear.validation";

const getAll = catchAsync(async (req, res) => {
  const query = getGearQuerySchema.parse(req.query);
  const result = await GearService.getAll(query);
  sendResponse(res, {
    statusCode: 200,
    message: "Gear retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req, res) => {
  const result = await GearService.getById(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    message: "Gear retrieved successfully",
    data: result,
  });
});

export const GearController = { getAll, getById };
