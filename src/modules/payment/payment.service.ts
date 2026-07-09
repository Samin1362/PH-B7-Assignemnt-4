import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import AppError from "../../utils/AppError";

const orderSummary = {
  select: { id: true, status: true, startDate: true, endDate: true, totalPrice: true },
};

const createPaymentIntent = async (customerId: string, rentalOrderId: string) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
  });
  if (!order) {
    throw new AppError(404, "Rental order not found");
  }
  if (order.customerId !== customerId) {
    throw new AppError(403, "You can only pay for your own orders");
  }
  if (order.status !== "CONFIRMED") {
    throw new AppError(409, "Order must be confirmed before it can be paid");
  }

  const existing = await prisma.payment.findUnique({ where: { rentalOrderId } });
  if (existing?.status === "COMPLETED") {
    throw new AppError(409, "This order has already been paid");
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(Number(order.totalPrice) * 100),
    currency: "usd",
    metadata: { rentalOrderId, customerId },
    automatic_payment_methods: { enabled: true, allow_redirects: "never" },
  });

  const payment = await prisma.payment.upsert({
    where: { rentalOrderId },
    create: {
      rentalOrderId,
      customerId,
      amount: order.totalPrice,
      provider: "STRIPE",
      status: "PENDING",
      transactionId: intent.id,
    },
    update: {
      amount: order.totalPrice,
      status: "PENDING",
      transactionId: intent.id,
    },
  });

  return { clientSecret: intent.client_secret, payment };
};

const handleWebhook = async (signature: string | undefined, rawBody: Buffer) => {
  if (!signature) {
    throw new AppError(400, "Missing stripe signature");
  }

  let event: import("stripe").Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripe_webhook_secret as string,
    );
  } catch {
    throw new AppError(400, "Invalid webhook signature");
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const rentalOrderId = intent.metadata?.rentalOrderId;
    if (rentalOrderId) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { rentalOrderId },
          data: { status: "COMPLETED", paidAt: new Date(), transactionId: intent.id },
        }),
        prisma.rentalOrder.update({
          where: { id: rentalOrderId },
          data: { status: "PAID" },
        }),
      ]);
    }
  } else if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object;
    const rentalOrderId = intent.metadata?.rentalOrderId;
    if (rentalOrderId) {
      await prisma.payment.updateMany({
        where: { rentalOrderId },
        data: { status: "FAILED" },
      });
    }
  }

  return { received: true };
};

const getMine = async (customerId: string) => {
  return prisma.payment.findMany({
    where: { customerId },
    include: { rentalOrder: orderSummary },
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id: string, customerId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { rentalOrder: orderSummary },
  });
  if (!payment) {
    throw new AppError(404, "Payment not found");
  }
  if (payment.customerId !== customerId) {
    throw new AppError(403, "You can only view your own payments");
  }
  return payment;
};

export const PaymentService = {
  createPaymentIntent,
  handleWebhook,
  getMine,
  getById,
};
