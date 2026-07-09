import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import type { CreateReviewInput } from "./review.interface";

const customerSelect = { select: { id: true, name: true } };

const create = async (customerId: string, payload: CreateReviewInput) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: payload.rentalOrderId },
    include: { items: true },
  });
  if (!order) {
    throw new AppError(404, "Rental order not found");
  }
  if (order.customerId !== customerId) {
    throw new AppError(403, "You can only review your own rentals");
  }
  if (order.status !== "RETURNED") {
    throw new AppError(409, "You can only review gear from a returned rental");
  }

  const rented = order.items.some((item) => item.gearItemId === payload.gearItemId);
  if (!rented) {
    throw new AppError(400, "This gear was not part of the rental order");
  }

  const existing = await prisma.review.findUnique({
    where: {
      gearItemId_customerId_rentalOrderId: {
        gearItemId: payload.gearItemId,
        customerId,
        rentalOrderId: payload.rentalOrderId,
      },
    },
  });
  if (existing) {
    throw new AppError(409, "You have already reviewed this gear for this rental");
  }

  return prisma.review.create({
    data: {
      gearItemId: payload.gearItemId,
      customerId,
      rentalOrderId: payload.rentalOrderId,
      rating: payload.rating,
      comment: payload.comment,
    },
    include: { customer: customerSelect },
  });
};

const getForGear = async (gearItemId: string) => {
  const gear = await prisma.gearItem.findUnique({ where: { id: gearItemId } });
  if (!gear) {
    throw new AppError(404, "Gear not found");
  }

  const [reviews, aggregate] = await Promise.all([
    prisma.review.findMany({
      where: { gearItemId },
      include: { customer: customerSelect },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.aggregate({
      where: { gearItemId },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  return {
    averageRating: aggregate._avg.rating ?? 0,
    totalReviews: aggregate._count,
    reviews,
  };
};

export const ReviewService = { create, getForGear };
