import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createOrder } from "@/lib/db/orders";
import {
  sendAdminNewOrderEmail,
  sendCustomerConfirmationEmail,
} from "@/lib/email/send";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET || !sig) {
      event = JSON.parse(body) as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const shipping = JSON.parse(session.metadata?.shipping || "{}");
      const items = JSON.parse(session.metadata?.items || "[]");

      const subtotal =
        (session.amount_total || 0) / 100 -
        (session.total_details?.amount_shipping || 0) / 100;
      const shippingCost =
        (session.total_details?.amount_shipping || 0) / 100;

      const order = await createOrder({
        customerName: shipping.fullName || shipping.name || "",
        customerEmail: session.customer_details?.email || shipping.email || "",
        customerPhone: shipping.phone || "",
        shippingAddress: shipping.address || "",
        shippingCity: shipping.city || "",
        shippingPostalCode: shipping.postalCode || "",
        shippingCountry: shipping.country || "Greece",
        subtotal,
        shippingCost,
        total: (session.amount_total || 0) / 100,
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : undefined,
        items: items.map(
          (i: {
            slug: string;
            name: string;
            price: number;
            quantity: number;
            cjProductId?: string;
            cjSku?: string;
          }) => ({
            productSlug: i.slug,
            productName: i.name,
            price: i.price,
            quantity: i.quantity,
            cjProductId: i.cjProductId || null,
            cjSku: i.cjSku || null,
          })
        ),
      });

      console.log("Order created:", order.orderNumber);

      const emailData = {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
        shippingCity: order.shippingCity,
        shippingPostalCode: order.shippingPostalCode,
        shippingCountry: order.shippingCountry,
        total: order.total.toString(),
        items: order.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          price: i.price.toString(),
        })),
      };

      await Promise.allSettled([
        sendAdminNewOrderEmail(emailData),
        sendCustomerConfirmationEmail(order.customerEmail, emailData),
      ]);
    } catch (err) {
      console.error("Error processing order:", err);
    }
  }

  return NextResponse.json({ received: true });
}
