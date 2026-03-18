# Checkout + Orders + CJ Dropshipping Integration Design

## Date: 2026-03-18

## Overview

Complete e-commerce order flow: Stripe checkout → Order persistence → Admin management → CJ Dropshipping fulfillment → Customer email notifications.

## Order Flow

```
Customer → Checkout (form + Stripe) → Payment →
Order saved to DB (status: PAID) →
Email to admin + confirmation email to customer →
Admin sees order in panel → Clicks "Send to CJ" →
CJ API creates order (status: PROCESSING) →
Tracking number from CJ (status: SHIPPED) →
Tracking email to customer
```

## Database Models (Prisma)

### Order
- id, orderNumber (auto-generated NES-XXXXX)
- status: PENDING | PAID | PROCESSING | SHIPPED | DELIVERED | CANCELLED
- customerName, customerEmail, customerPhone
- shippingAddress, shippingCity, shippingPostalCode, shippingCountry
- subtotal, shippingCost, total (Decimal)
- stripeSessionId, stripePaymentIntentId
- cjOrderId (set when sent to CJ)
- trackingNumber (set when CJ ships)
- notes (admin notes)
- createdAt, updatedAt

### OrderItem
- id, orderId (relation)
- productSlug, productName
- price, quantity
- cjProductId, cjSku
- createdAt

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| /api/checkout | POST | Create Stripe checkout session |
| /api/webhook/stripe | POST | Handle payment → save order + send emails |
| /api/admin/orders | GET | List all orders for admin |
| /api/admin/orders/[id] | GET | Get single order details |
| /api/admin/orders/[id]/send-to-cj | POST | Send order to CJ Dropshipping API |
| /api/admin/orders/[id]/status | PATCH | Update order status manually |
| /api/cron/check-tracking | POST | Check CJ for tracking numbers |

## Admin Panel

- Page: /admin/orders
- Order list with filters (status, date)
- Status badges with colors
- "Send to CJ" button on PAID orders
- Order detail modal/page with full info
- Tracking number display

## Email System (Resend)

### Admin notification (to handcraftsnona@gmail.com)
- Subject: "New Order #NES-XXXXX"
- Content: Customer details, products, total, shipping address

### Customer confirmation
- Subject: "Order Confirmed - #NES-XXXXX"
- Content: Order summary, products, estimated delivery

### Customer shipping update
- Subject: "Your Order Has Shipped - #NES-XXXXX"
- Content: Tracking number, estimated delivery

## CJ Dropshipping API Integration

### Create Order
- Endpoint: POST /api2.0/v1/shopping/order/createOrderV2
- Maps our OrderItems to CJ line items using cjProductId
- Stores returned cjOrderId on our Order

### Check Tracking
- Endpoint: GET /api2.0/v1/shopping/order/getOrderDetail
- Polls for tracking numbers on PROCESSING orders
- Updates Order with trackingNumber when available
- Sends shipping email to customer

## Tech Stack Additions

- **stripe** (npm) - Payment processing
- **resend** (npm) - Email delivery (free 100/day)
- **Prisma** - Order/OrderItem models added to existing schema

## Decisions

- Manual CJ fulfillment (admin clicks "Send to CJ") for control
- Resend for emails (free tier, simple API, works with gmail)
- Order numbers format: NES-XXXXX (5 digit sequential)
- Shipping: Free over €30, €3.50 under (existing logic)
- Countries: Greece + Cyprus only
