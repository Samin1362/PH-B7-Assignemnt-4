import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CategoryService } from "./category.service";

const create = catchAsync(async (req, res) => {
  const result = await CategoryService.create(req.body);
  sendResponse(res, {
    statusCode: 201,
    message: "Category created successfully",
    data: result,
  });
});

const getAll = catchAsync(async (_req, res) => {
  const result = await CategoryService.getAll();
  sendResponse(res, {
    statusCode: 200,
    message: "Categories retrieved successfully",
    data: result,
  });
});

const update = catchAsync(async (req, res) => {
  const result = await CategoryService.update(req.params.id as string, req.body);
  sendResponse(res, {
    statusCode: 200,
    message: "Category updated successfully",
    data: result,
  });
});

const remove = catchAsync(async (req, res) => {
  await CategoryService.remove(req.params.id as string);
  sendResponse(res, {
    statusCode: 200,
    message: "Category deleted successfully",
    data: null,
  });
});

export const CategoryController = { create, getAll, update, remove };
