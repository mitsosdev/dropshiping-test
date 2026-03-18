import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCjOrderDetail } from "@/lib/cj/client";
import { sendCustomerShippingEmail } from "@/lib/email/send";

export async function POST() {
  const processingOrders = await prisma.order.findMany({
    where: { status: "PROCESSING", cjOrderId: { not: null } },
  });

  const results = [];

  for (const order of processingOrders) {
    if (!order.cjOrderId) continue;

    try {
      const detail = await getCjOrderDetail(order.cjOrderId);
      const trackingNumber = detail?.trackNumber || detail?.logisticsId;

      if (trackingNumber) {
        await prisma.order.update({
          where: { id: order.id },
          data: { trackingNumber, status: "SHIPPED" },
        });

        await sendCustomerShippingEmail(order.customerEmail, {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          trackingNumber,
        });

        results.push({ order: order.orderNumber, tracking: trackingNumber });
      }
    } catch (err) {
      console.error(`Tracking check failed for ${order.orderNumber}:`, err);
    }
  }

  return NextResponse.json({ checked: processingOrders.length, updated: results });
}
