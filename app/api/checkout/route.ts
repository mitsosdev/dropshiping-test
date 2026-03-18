import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/general/constants";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shipping } = body;

    if (!items?.length || !shipping) {
      return NextResponse.json(
        { error: "Missing items or shipping info" },
        { status: 400 }
      );
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

    if (!stripe) {
      console.log("Stripe not configured. Fallback order:", {
        items,
        shipping,
        subtotal,
        shippingCost,
      });
      return NextResponse.json({ fallback: true });
    }

    const locale = req.headers.get("x-locale") || "en";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map(
        (item: { name: string; price: number; quantity: number }) => ({
          price_data: {
            currency: "eur",
            product_data: { name: item.name },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })
      ),
      ...(shippingCost > 0 && {
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount" as const,
              fixed_amount: { amount: Math.round(shippingCost * 100), currency: "eur" },
              display_name: "Standard Shipping",
              delivery_estimate: {
                minimum: { unit: "business_day" as const, value: 7 },
                maximum: { unit: "business_day" as const, value: 15 },
              },
            },
          },
        ],
      }),
      metadata: {
        shipping: JSON.stringify(shipping),
        items: JSON.stringify(
          items.map((i: { slug: string; price: number; quantity: number; name: string; cjProductId?: string; cjSku?: string }) => ({
            slug: i.slug,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            cjProductId: i.cjProductId || "",
            cjSku: i.cjSku || "",
          }))
        ),
      },
      success_url: `${req.nextUrl.origin}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/${locale}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
