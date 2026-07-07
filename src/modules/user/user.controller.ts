import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./user.service";

const getProfile = catchAsync(async (req, res) => {
  const result = await UserService.getProfile(req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    message: "Profile retrieved successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const result = await UserService.updateProfile(req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: 200,
    message: "Profile updated successfully",
    data: result,
  });
});

export const UserController = { getProfile, updateProfile };
