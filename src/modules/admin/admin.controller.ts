import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AdminService } from "./admin.service";
import {
  listGearQuerySchema,
  listRentalsQuerySchema,
  listUsersQuerySchema,
} from "./admin.validation";

const getUsers = catchAsync(async (req, res) => {
  const query = listUsersQuerySchema.parse(req.query);
  const result = await AdminService.getUsers(query);
  sendResponse(res, {
    statusCode: 200,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const result = await AdminService.updateUserStatus(
    req.user!.userId,
    req.params.id as string,
    req.body.status,
  );
  sendResponse(res, {
    statusCode: 200,
    message: "User updated successfully",
    data: result,
  });
});

const getGear = catchAsync(async (req, res) => {
  const query = listGearQuerySchema.parse(req.query);
  const result = await AdminService.getGear(query);
  sendResponse(res, {
    statusCode: 200,
    message: "Gear retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getRentals = catchAsync(async (req, res) => {
  const query = listRentalsQuerySchema.parse(req.query);
  const result = await AdminService.getRentals(query);
  sendResponse(res, {
    statusCode: 200,
    message: "Rentals retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const AdminController = { getUsers, updateUser, getGear, getRentals };
