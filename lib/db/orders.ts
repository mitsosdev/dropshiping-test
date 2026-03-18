import { prisma } from "@/lib/db/prisma";
import { OrderStatus } from "@prisma/client";

export async function generateOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  const number = (count + 1).toString().padStart(5, "0");
  return `NES-${number}`;
}

export async function createOrder(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  items: {
    productSlug: string;
    productName: string;
    price: number;
    quantity: number;
    cjProductId?: string;
    cjSku?: string;
  }[];
}) {
  const orderNumber = await generateOrderNumber();

  return prisma.order.create({
    data: {
      orderNumber,
      status: "PAID",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      shippingAddress: data.shippingAddress,
      shippingCity: data.shippingCity,
      shippingPostalCode: data.shippingPostalCode,
      shippingCountry: data.shippingCountry,
      subtotal: data.subtotal,
      shippingCost: data.shippingCost,
      total: data.total,
      stripeSessionId: data.stripeSessionId,
      stripePaymentIntentId: data.stripePaymentIntentId,
      items: {
        create: data.items,
      },
    },
    include: { items: true },
  });
}

export async function getOrders(status?: OrderStatus) {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
}

export async function updateOrderCjInfo(
  id: string,
  data: { cjOrderId?: string; trackingNumber?: string }
) {
  return prisma.order.update({
    where: { id },
    data,
  });
}
