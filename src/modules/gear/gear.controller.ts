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

const create = catchAsync(async (req, res) => {
  const result = await GearService.create(req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: 201,
    message: "Gear created successfully",
    data: result,
  });
});

const getMine = catchAsync(async (req, res) => {
  const result = await GearService.getProviderGear(req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    message: "Gear retrieved successfully",
    data: result,
  });
});

const update = catchAsync(async (req, res) => {
  const result = await GearService.update(
    req.params.id as string,
    req.user!.userId,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    message: "Gear updated successfully",
    data: result,
  });
});

const remove = catchAsync(async (req, res) => {
  await GearService.remove(req.params.id as string, req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    message: "Gear deleted successfully",
    data: null,
  });
});

export const GearController = { getAll, getById, create, getMine, update, remove };
