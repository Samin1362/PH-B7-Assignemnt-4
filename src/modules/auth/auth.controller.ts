import config from "../../config";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const cookieOptions = {
  httpOnly: true,
  secure: config.node_env === "production",
  sameSite: "lax" as const,
};

const register = catchAsync(async (req, res) => {
  const result = await AuthService.register(req.body);
  sendResponse(res, {
    statusCode: 201,
    message: "Registration successful",
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const result = await AuthService.login(req.body);

  res.cookie("accessToken", result.accessToken, cookieOptions);
  res.cookie("refreshToken", result.refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    message: "Login successful",
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const result = await AuthService.getMe(req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    message: "User retrieved successfully",
    data: result,
  });
});

export const AuthController = { register, login, getMe };
