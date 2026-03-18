import fs from "fs";
import path from "path";

const BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";
const TOKEN_FILE = path.join(process.cwd(), "scripts", "cj-token.json");

async function getAccessToken(): Promise<string> {
  try {
    const cached = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
    if (new Date(cached.expiryDate) > new Date()) {
      return cached.accessToken;
    }
  } catch {}

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

  return data.data;
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
