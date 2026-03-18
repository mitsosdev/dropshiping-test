import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderCjInfo, updateOrderStatus } from "@/lib/db/orders";
import { createCjOrder } from "@/lib/cj/client";
import { getProductBySlug } from "@/lib/data/products";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.cjOrderId) {
    return NextResponse.json(
      { error: "Already sent to CJ" },
      { status: 400 }
    );
  }

  try {
    const products = order.items.map((item) => {
      const product = getProductBySlug(item.productSlug);
      return {
        vid: item.cjProductId || product?.cjProductId || "",
        quantity: item.quantity,
      };
    });

    const cjResult = await createCjOrder({
      shippingCustomerName: order.customerName,
      shippingPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingPostalCode: order.shippingPostalCode,
      shippingCountry: order.shippingCountry,
      products,
    });

    await updateOrderCjInfo(id, {
      cjOrderId: cjResult?.orderId || cjResult?.orderNum || String(cjResult),
    });
    await updateOrderStatus(id, "PROCESSING");

    return NextResponse.json({ success: true, cjOrderId: cjResult });
  } catch (error) {
    console.error("CJ order error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "CJ order failed" },
      { status: 500 }
    );
  }
}
