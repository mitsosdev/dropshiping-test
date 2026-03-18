import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/db/orders";
import { OrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") as OrderStatus | null;
  const orders = await getOrders(status || undefined);
  return NextResponse.json(orders);
}
