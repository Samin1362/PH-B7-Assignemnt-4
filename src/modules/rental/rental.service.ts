import type { RentalStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import type { CreateRentalInput } from "./rental.interface";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const gearSummary = { select: { id: true, name: true, brand: true } };
const customerSummary = { select: { id: true, name: true, email: true } };

const providerTransitions: Record<string, RentalStatus[]> = {
  PLACED: ["CONFIRMED"],
  PAID: ["PICKED_UP"],
  PICKED_UP: ["RETURNED"],
};

const create = async (customerId: string, payload: CreateRentalInput) => {
  const days = Math.ceil(
    (payload.endDate.getTime() - payload.startDate.getTime()) / MS_PER_DAY,
  );
  if (days < 1) {
    throw new AppError(400, "Rental must span at least one day");
  }

  const gearIds = payload.items.map((item) => item.gearItemId);
  if (new Set(gearIds).size !== gearIds.length) {
    throw new AppError(400, "Duplicate gear items are not allowed in one order");
  }

  const gearItems = await prisma.gearItem.findMany({
    where: { id: { in: gearIds } },
  });
  const gearMap = new Map(gearItems.map((gear) => [gear.id, gear]));

  const items = payload.items.map((item) => {
    const gear = gearMap.get(item.gearItemId);
    if (!gear) {
      throw new AppError(404, "One or more gear items were not found");
    }
    if (!gear.isAvailable) {
      throw new AppError(400, `${gear.name} is not available for rent`);
    }
    if (gear.stock < item.quantity) {
      throw new AppError(400, `Insufficient stock for ${gear.name}`);
    }
    const subtotal = Number(gear.pricePerDay) * item.quantity * days;
    return {
      gearItemId: gear.id,
      quantity: item.quantity,
      days,
      pricePerDay: gear.pricePerDay,
      subtotal,
    };
  });

  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

  return prisma.rentalOrder.create({
    data: {
      customerId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      totalPrice,
      items: { create: items },
    },
    include: { items: { include: { gearItem: gearSummary } } },
  });
};

const getMine = async (customerId: string) => {
  return prisma.rentalOrder.findMany({
    where: { customerId },
    include: { items: { include: { gearItem: gearSummary } }, payment: true },
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id: string, customerId: string) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id },
    include: { items: { include: { gearItem: gearSummary } }, payment: true },
  });
  if (!order) {
    throw new AppError(404, "Rental order not found");
  }
  if (order.customerId !== customerId) {
    throw new AppError(403, "You can only view your own rental orders");
  }
  return order;
};

const cancel = async (id: string, customerId: string) => {
  const order = await prisma.rentalOrder.findUnique({ where: { id } });
  if (!order) {
    throw new AppError(404, "Rental order not found");
  }
  if (order.customerId !== customerId) {
    throw new AppError(403, "You can only cancel your own rental orders");
  }
  if (order.status !== "PLACED") {
    throw new AppError(409, "Only orders that are still placed can be cancelled");
  }

  return prisma.rentalOrder.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: { items: { include: { gearItem: gearSummary } } },
  });
};

const getProviderOrders = async (providerId: string) => {
  return prisma.rentalOrder.findMany({
    where: { items: { some: { gearItem: { providerId } } } },
    include: {
      items: { include: { gearItem: gearSummary } },
      customer: customerSummary,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateStatus = async (
  id: string,
  providerId: string,
  status: RentalStatus,
) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id },
    include: { items: { select: { gearItem: { select: { providerId: true } } } } },
  });
  if (!order) {
    throw new AppError(404, "Rental order not found");
  }

  const ownsItem = order.items.some(
    (item) => item.gearItem.providerId === providerId,
  );
  if (!ownsItem) {
    throw new AppError(403, "You can only manage orders that include your gear");
  }

  const allowed = providerTransitions[order.status] ?? [];
  if (!allowed.includes(status)) {
    throw new AppError(
      409,
      `Cannot change status from ${order.status} to ${status}`,
    );
  }

  return prisma.rentalOrder.update({
    where: { id },
    data: { status },
    include: { items: { include: { gearItem: gearSummary } } },
  });
};

export const RentalService = {
  create,
  getMine,
  getById,
  cancel,
  getProviderOrders,
  updateStatus,
};
