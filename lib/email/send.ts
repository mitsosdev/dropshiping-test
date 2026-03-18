import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = "onboarding@resend.dev";
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

  await getResend().emails.send({
    from: `Nestio Orders <${FROM_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: `New Order ${order.orderNumber}`,
    text: `New order received!\n\nOrder: ${order.orderNumber}\nCustomer: ${order.customerName}\nEmail: ${order.customerEmail}\nPhone: ${order.customerPhone}\n\nShipping:\n${order.shippingAddress}\n${order.shippingCity}, ${order.shippingPostalCode}\n${order.shippingCountry}\n\nItems:\n${itemsList}\n\nTotal: €${order.total}\n\nGo to admin panel to fulfill this order.`,
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

  await getResend().emails.send({
    from: `Nestio <${FROM_EMAIL}>`,
    to,
    subject: `Order Confirmed - ${order.orderNumber}`,
    text: `Hi ${order.customerName},\n\nThank you for your order!\n\nOrder Number: ${order.orderNumber}\n\nItems:\n${itemsList}\n\nTotal: €${order.total}\n\nWe're preparing your order and will send you a tracking number once it ships.\n\nEstimated delivery: 7-15 business days.\n\nThank you for shopping with Nestio!`,
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
  await getResend().emails.send({
    from: `Nestio <${FROM_EMAIL}>`,
    to,
    subject: `Your Order Has Shipped - ${order.orderNumber}`,
    text: `Hi ${order.customerName},\n\nGreat news! Your order ${order.orderNumber} has been shipped!\n\nTracking Number: ${order.trackingNumber}\n\nYou can track your package using this number on the carrier's website.\n\nEstimated delivery: 5-10 business days.\n\nThank you for shopping with Nestio!`,
  });
}
