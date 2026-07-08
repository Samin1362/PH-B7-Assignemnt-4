import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";

const create = catchAsync(async (req, res) => {
  const result = await PaymentService.createPaymentIntent(
    req.user!.userId,
    req.body.rentalOrderId,
  );
  sendResponse(res, {
    statusCode: 201,
    message: "Payment intent created successfully",
    data: result,
  });
});

const confirm = catchAsync(async (req, res) => {
  const signature = req.headers["stripe-signature"] as string | undefined;
  const result = await PaymentService.handleWebhook(signature, req.body);
  res.status(200).json(result);
});

const getMine = catchAsync(async (req, res) => {
  const result = await PaymentService.getMine(req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    message: "Payments retrieved successfully",
    data: result,
  });
});

const getById = catchAsync(async (req, res) => {
  const result = await PaymentService.getById(
    req.params.id as string,
    req.user!.userId,
  );
  sendResponse(res, {
    statusCode: 200,
    message: "Payment retrieved successfully",
    data: result,
  });
});

export const PaymentController = { create, confirm, getMine, getById };
