# Checkout + Orders + CJ Dropshipping Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete e-commerce flow — Stripe payment → Order in database → Admin panel → CJ fulfillment → Email notifications.

**Architecture:** Stripe Checkout handles payment, webhook saves Order to Supabase via Prisma, admin panel at /admin/orders manages fulfillment, CJ Dropshipping API creates supplier orders, Resend sends transactional emails.

**Tech Stack:** Stripe, Prisma (Supabase PostgreSQL), Resend (email), CJ Dropshipping API v2, Next.js API routes.

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install stripe, resend**

```bash
pnpm add stripe resend
```

**Step 2: Update .env.local with placeholders**

Add to `.env.local`:
```
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=

# Admin email
ADMIN_EMAIL=handcraftsnona@gmail.com
```

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml .env.template
git commit -m "chore: add stripe and resend dependencies"
```

---

### Task 2: Add Order + OrderItem Prisma Models

**Files:**
- Modify: `lib/db/schema.prisma`

**Step 1: Add models after existing Todo model (line 41)**

```prisma
enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model Order {
  id                    String      @id @default(cuid())
  orderNumber           String      @unique
  status                OrderStatus @default(PENDING)

  // Customer info
  customerName          String
  customerEmail         String
  customerPhone         String

  // Shipping
  shippingAddress       String
  shippingCity          String
  shippingPostalCode    String
  shippingCountry       String

  // Totals
  subtotal              Decimal     @db.Decimal(10, 2)
  shippingCost          Decimal     @db.Decimal(10, 2)
  total                 Decimal     @db.Decimal(10, 2)

  // Stripe
  stripeSessionId       String?     @unique
  stripePaymentIntentId String?

  // CJ Dropshipping
  cjOrderId             String?
  trackingNumber        String?

  // Admin
  notes                 String?

  // Relations
  items                 OrderItem[]

  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([status])
  @@index([customerEmail])
}

model OrderItem {
  id            String   @id @default(cuid())
  orderId       String
  order         Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  productSlug   String
  productName   String
  price         Decimal  @db.Decimal(10, 2)
  quantity      Int

  cjProductId   String?
  cjSku         String?

  createdAt     DateTime @default(now())

  @@index([orderId])
}
```

**Step 2: Generate Prisma client and push to database**

```bash
pnpm prisma generate
pnpm prisma db push
```

**Step 3: Commit**

```bash
git add lib/db/schema.prisma
git commit -m "feat: add Order and OrderItem prisma models"
```

---

### Task 3: Create Order Helper Functions

**Files:**
- Create: `lib/db/orders.ts`

**Step 1: Create the orders module**

```typescript
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
```

**Step 2: Verify Prisma client exists**

Check that `lib/db/prisma.ts` exists with a singleton pattern. If not, create it:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Step 3: Commit**

```bash
git add lib/db/orders.ts lib/db/prisma.ts
git commit -m "feat: add order helper functions"
```

---

### Task 4: Create Email Templates + Resend Integration

**Files:**
- Create: `lib/email/send.ts`
- Create: `lib/email/templates.ts`

**Step 1: Create email sender**

`lib/email/send.ts`:
```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "onboarding@resend.dev"; // Use Resend default until custom domain
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "handcraftsnona@gmail.com";

export async function sendAdminNewOrderEmail(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  total: number | string;
  items: { productName: string; quantity: number; price: number | string }[];
}) {
  const itemsList = order.items
    .map((i) => `• ${i.productName} x${i.quantity} — €${i.price}`)
    .join("\n");

  await resend.emails.send({
    from: `Nestio Orders <${FROM_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: `🛒 New Order ${order.orderNumber}`,
    text: `New order received!

Order: ${order.orderNumber}
Customer: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone}

Shipping:
${order.shippingAddress}
${order.shippingCity}, ${order.shippingPostalCode}
${order.shippingCountry}

Items:
${itemsList}

Total: €${order.total}

Go to admin panel to fulfill this order.`,
  });
}

export async function sendCustomerConfirmationEmail(
  to: string,
  order: {
    orderNumber: string;
    customerName: string;
    total: number | string;
    items: { productName: string; quantity: number; price: number | string }[];
  }
) {
  const itemsList = order.items
    .map((i) => `• ${i.productName} x${i.quantity} — €${i.price}`)
    .join("\n");

  await resend.emails.send({
    from: `Nestio <${FROM_EMAIL}>`,
    to,
    subject: `Order Confirmed - ${order.orderNumber}`,
    text: `Hi ${order.customerName},

Thank you for your order!

Order Number: ${order.orderNumber}

Items:
${itemsList}

Total: €${order.total}

We're preparing your order and will send you a tracking number once it ships.

Estimated delivery: 7-15 business days.

Thank you for shopping with Nestio!`,
  });
}

export async function sendCustomerShippingEmail(
  to: string,
  order: {
    orderNumber: string;
    customerName: string;
    trackingNumber: string;
  }
) {
  await resend.emails.send({
    from: `Nestio <${FROM_EMAIL}>`,
    to,
    subject: `Your Order Has Shipped - ${order.orderNumber}`,
    text: `Hi ${order.customerName},

Great news! Your order ${order.orderNumber} has been shipped!

Tracking Number: ${order.trackingNumber}

You can track your package using this number on the carrier's website.

Estimated delivery: 5-10 business days.

Thank you for shopping with Nestio!`,
  });
}
```

**Step 2: Commit**

```bash
git add lib/email/send.ts
git commit -m "feat: add email templates with Resend"
```

---

### Task 5: Update Stripe Checkout API Route

**Files:**
- Modify: `app/api/checkout/route.ts`

**Step 1: Rewrite the checkout route**

Replace full contents of `app/api/checkout/route.ts`:

```typescript
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
              type: "fixed_amount",
              fixed_amount: { amount: Math.round(shippingCost * 100), currency: "eur" },
              display_name: "Standard Shipping",
              delivery_estimate: {
                minimum: { unit: "business_day", value: 7 },
                maximum: { unit: "business_day", value: 15 },
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
```

**Step 2: Commit**

```bash
git add app/api/checkout/route.ts
git commit -m "feat: update checkout route with metadata for orders"
```

---

### Task 6: Update Stripe Webhook to Save Orders + Send Emails

**Files:**
- Modify: `app/api/webhook/stripe/route.ts`

**Step 1: Rewrite webhook handler**

Replace full contents:

```typescript
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
      // Dev mode: parse body as JSON
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

      // Send emails (non-blocking)
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
```

**Step 2: Commit**

```bash
git add app/api/webhook/stripe/route.ts
git commit -m "feat: webhook saves orders to DB and sends emails"
```

---

### Task 7: Create CJ Dropshipping API Client

**Files:**
- Create: `lib/cj/client.ts`

**Step 1: Create CJ API client**

```typescript
import fs from "fs";
import path from "path";

const BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";
const TOKEN_FILE = path.join(process.cwd(), "scripts", "cj-token.json");

async function getAccessToken(): Promise<string> {
  // Try cached token
  try {
    const cached = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
    if (new Date(cached.expiryDate) > new Date()) {
      return cached.accessToken;
    }
  } catch {}

  // Refresh or get new token
  const apiKey = process.env.CJ_API_KEY;
  if (!apiKey) throw new Error("CJ_API_KEY not configured");

  const res = await fetch(`${BASE_URL}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  });
  const data = await res.json();
  if (data.code !== 200) throw new Error(`CJ auth failed: ${data.message}`);

  fs.writeFileSync(
    TOKEN_FILE,
    JSON.stringify({
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
      expiryDate: data.data.accessTokenExpiryDate,
    })
  );

  return data.data.accessToken;
}

export async function createCjOrder(order: {
  shippingCustomerName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  products: { vid: string; quantity: number }[];
}) {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/shopping/order/createOrderV2`, {
    method: "POST",
    headers: {
      "CJ-Access-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderNumber: `NES-${Date.now()}`,
      shippingCustomerName: order.shippingCustomerName,
      shippingPhone: order.shippingPhone,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingZip: order.shippingPostalCode,
      shippingCountry: order.shippingCountry === "Greece" ? "GR" : "CY",
      products: order.products,
    }),
  });

  const data = await res.json();
  if (data.code !== 200) {
    throw new Error(`CJ order creation failed: ${data.message}`);
  }

  return data.data; // Contains CJ order ID
}

export async function getCjOrderDetail(cjOrderId: string) {
  const token = await getAccessToken();

  const res = await fetch(
    `${BASE_URL}/shopping/order/getOrderDetail?orderId=${cjOrderId}`,
    { headers: { "CJ-Access-Token": token } }
  );

  const data = await res.json();
  if (data.code !== 200) return null;
  return data.data;
}
```

**Step 2: Commit**

```bash
git add lib/cj/client.ts
git commit -m "feat: add CJ Dropshipping API client"
```

---

### Task 8: Create Admin Order API Routes

**Files:**
- Create: `app/api/admin/orders/route.ts`
- Create: `app/api/admin/orders/[id]/route.ts`
- Create: `app/api/admin/orders/[id]/send-to-cj/route.ts`

**Step 1: GET /api/admin/orders**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/db/orders";
import { OrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") as OrderStatus | null;
  const orders = await getOrders(status || undefined);
  return NextResponse.json(orders);
}
```

**Step 2: GET/PATCH /api/admin/orders/[id]**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/db/orders";
import { OrderStatus } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await req.json();
  if (!Object.values(OrderStatus).includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const order = await updateOrderStatus(id, status);
  return NextResponse.json(order);
}
```

**Step 3: POST /api/admin/orders/[id]/send-to-cj**

```typescript
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

    await updateOrderCjInfo(id, { cjOrderId: cjResult.orderId || cjResult.orderNum || String(cjResult) });
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
```

**Step 4: Commit**

```bash
git add app/api/admin/orders/
git commit -m "feat: add admin order API routes"
```

---

### Task 9: Create Admin Orders Page

**Files:**
- Create: `app/[locale]/admin/orders/page.tsx`
- Create: `components/admin/orders-table.tsx`

**Step 1: Create admin orders page (Server Component)**

`app/[locale]/admin/orders/page.tsx`:
```typescript
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OrdersTable } from "@/components/admin/orders-table";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">Orders</h1>
      <OrdersTable />
    </div>
  );
}
```

**Step 2: Create OrdersTable client component**

`components/admin/orders-table.tsx` — Full client component with:
- Fetch orders from `/api/admin/orders`
- Display table with columns: Order#, Customer, Items, Total, Status, Date, Actions
- Status filter tabs (All, Paid, Processing, Shipped)
- "Send to CJ" button on PAID orders
- Status badges with colors (PAID=green, PROCESSING=yellow, SHIPPED=blue)
- Order detail expand/modal showing full shipping info
- Refresh button

This is a large component (~300 lines). Build it using shadcn/ui Table, Badge, Button, and Dialog components.

**Step 3: Add "Orders" link to admin sidebar**

Modify `components/admin/admin-sidebar.tsx` to add Orders link with ShoppingBag icon.

**Step 4: Commit**

```bash
git add app/[locale]/admin/orders/ components/admin/orders-table.tsx components/admin/admin-sidebar.tsx
git commit -m "feat: add admin orders page with CJ fulfillment"
```

---

### Task 10: Update Checkout Form to Send CJ Product IDs

**Files:**
- Modify: `components/checkout/checkout-form.tsx`

**Step 1: Update the checkout form to include cjProductId and cjSku in items sent to API**

In the form submission handler, ensure items array includes:
```typescript
items: cartItems.map((item) => ({
  id: item.product.id,
  slug: item.product.slug,
  name: t(`${item.product.slug}.name`),
  price: item.product.price,
  quantity: item.quantity,
  cjProductId: item.product.cjProductId || "",
  cjSku: item.product.cjSku || "",
}))
```

**Step 2: Commit**

```bash
git add components/checkout/checkout-form.tsx
git commit -m "feat: include CJ product data in checkout submission"
```

---

### Task 11: Add Tracking Check Endpoint

**Files:**
- Create: `app/api/admin/orders/check-tracking/route.ts`

**Step 1: Create tracking checker**

```typescript
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
```

**Step 2: Commit**

```bash
git add app/api/admin/orders/check-tracking/route.ts
git commit -m "feat: add tracking number check endpoint"
```

---

### Task 12: Update .env.template and Constants

**Files:**
- Modify: `.env.template`
- Modify: `lib/general/constants.ts`

**Step 1: Update .env.template with all required env vars**

**Step 2: Add ADMIN_EMAIL to constants or keep in env**

**Step 3: Final build check**

```bash
pnpm tsc --noEmit
pnpm build
```

**Step 4: Commit**

```bash
git add .env.template lib/general/constants.ts
git commit -m "chore: update env template and constants"
```

---

## Execution Notes

- Tasks 1-6 are the core flow (must be sequential)
- Tasks 7-8 can be done in parallel with Task 9
- Task 10 is a small modification to existing code
- Task 11 is independent and can be done last
- Stripe keys are needed only for live testing — fallback mode works without them
- Resend free tier: 100 emails/day, enough for starting out
- CJ API token is already cached in `scripts/cj-token.json`
