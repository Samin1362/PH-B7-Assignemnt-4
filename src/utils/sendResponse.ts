import type { Response } from "express";

type Meta = {
  page: number;
  limit: number;
  total: number;
};

type ResponsePayload<T> = {
  statusCode: number;
  message: string;
  meta?: Meta;
  data: T;
};

const sendResponse = <T>(res: Response, payload: ResponsePayload<T>) => {
  res.status(payload.statusCode).json({
    success: true,
    message: payload.message,
    meta: payload.meta,
    data: payload.data,
  });
};

export default sendResponse;
