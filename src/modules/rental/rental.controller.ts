import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { RentalService } from "./rental.service";

const create = catchAsync(async (req, res) => {
  const result = await RentalService.create(req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: 201,
    message: "Rental order placed successfully",
    data: result,
  });
});

const getMine = catchAsync(async (req, res) => {
  const result = await RentalService.getMine(req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    message: "Rental orders retrieved successfully",
    data: result,
  });
});

const getById = catchAsync(async (req, res) => {
  const result = await RentalService.getById(
    req.params.id as string,
    req.user!.userId,
  );
  sendResponse(res, {
    statusCode: 200,
    message: "Rental order retrieved successfully",
    data: result,
  });
});

const cancel = catchAsync(async (req, res) => {
  const result = await RentalService.cancel(
    req.params.id as string,
    req.user!.userId,
  );
  sendResponse(res, {
    statusCode: 200,
    message: "Rental order cancelled successfully",
    data: result,
  });
});

const getProviderOrders = catchAsync(async (req, res) => {
  const result = await RentalService.getProviderOrders(req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    message: "Orders retrieved successfully",
    data: result,
  });
});

const updateStatus = catchAsync(async (req, res) => {
  const result = await RentalService.updateStatus(
    req.params.id as string,
    req.user!.userId,
    req.body.status,
  );
  sendResponse(res, {
    statusCode: 200,
    message: "Order status updated successfully",
    data: result,
  });
});

export const RentalController = {
  create,
  getMine,
  getById,
  cancel,
  getProviderOrders,
  updateStatus,
};
