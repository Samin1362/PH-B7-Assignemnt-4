import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReviewService } from "./review.service";

const create = catchAsync(async (req, res) => {
  const result = await ReviewService.create(req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: 201,
    message: "Review submitted successfully",
    data: result,
  });
});

const getForGear = catchAsync(async (req, res) => {
  const result = await ReviewService.getForGear(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    message: "Reviews retrieved successfully",
    data: result,
  });
});

export const ReviewController = { create, getForGear };
