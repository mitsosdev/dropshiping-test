"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
  Package,
  RefreshCw,
  Send,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

interface OrderItem {
  id: string;
  productSlug: string;
  productName: string;
  price: string;
  quantity: number;
  cjProductId: string | null;
  cjSku: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  subtotal: string;
  shippingCost: string;
  total: string;
  stripeSessionId: string | null;
  cjOrderId: string | null;
  trackingNumber: string | null;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_TABS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Paid", value: "PAID" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string; icon: typeof Package }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-gray-100 text-gray-700",
    icon: Package,
  },
  PAID: {
    label: "Paid",
    className: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-amber-100 text-amber-700",
    icon: Package,
  },
  SHIPPED: {
    label: "Shipped",
    className: "bg-blue-100 text-blue-700",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: string) {
  return `€${parseFloat(amount).toFixed(2)}`;
}

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | "ALL">("ALL");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [sendingToCj, setSendingToCj] = useState<string | null>(null);
  const [checkingTracking, setCheckingTracking] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders =
    activeTab === "ALL"
      ? orders
      : orders.filter((o) => o.status === activeTab);

  const handleSendToCj = async (orderId: string) => {
    setSendingToCj(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/send-to-cj`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send to CJ");
      }
    } catch (err) {
      console.error("Failed to send to CJ:", err);
      alert("Failed to send to CJ");
    } finally {
      setSendingToCj(null);
    }
  };

  const handleCheckTracking = async () => {
    setCheckingTracking(true);
    try {
      const res = await fetch("/api/admin/orders/check-tracking", {
        method: "POST",
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch (err) {
      console.error("Failed to check tracking:", err);
    } finally {
      setCheckingTracking(false);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status tabs */}
        <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-300 ${
                activeTab === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.value !== "ALL" && (
                <span className="ml-1.5 text-xs opacity-60">
                  {orders.filter((o) => o.status === tab.value).length}
                </span>
              )}
              {tab.value === "ALL" && (
                <span className="ml-1.5 text-xs opacity-60">
                  {orders.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCheckTracking}
            disabled={checkingTracking}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-muted disabled:opacity-50"
          >
            {checkingTracking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Truck className="size-4" />
            )}
            Check Tracking
          </button>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-muted"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <ShoppingBag className="mb-3 size-10 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            No orders found
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {activeTab === "ALL"
              ? "Orders will appear here once customers make purchases."
              : `No orders with status "${activeTab}".`}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                    Items
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    expanded={expandedOrder === order.id}
                    onToggle={() => toggleExpand(order.id)}
                    onSendToCj={() => handleSendToCj(order.id)}
                    sendingToCj={sendingToCj === order.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderRow({
  order,
  expanded,
  onToggle,
  onSendToCj,
  sendingToCj,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onSendToCj: () => void;
  sendingToCj: boolean;
}) {
  return (
    <>
      <tr className="border-b border-border transition-colors duration-300 hover:bg-muted/30">
        <td className="px-4 py-3 font-medium">#{order.orderNumber}</td>
        <td className="px-4 py-3">
          <div>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-xs text-muted-foreground">
              {order.customerEmail}
            </p>
          </div>
        </td>
        <td className="px-4 py-3 text-center">{order.items.length}</td>
        <td className="px-4 py-3 text-right font-medium">
          {formatCurrency(order.total)}
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={order.status} />
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
          {formatDate(order.createdAt)}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            {order.status === "PAID" && (
              <button
                onClick={onSendToCj}
                disabled={sendingToCj}
                className="inline-flex items-center gap-1 rounded-md bg-terracotta px-2.5 py-1 text-xs font-medium text-white transition-colors duration-300 hover:bg-terracotta/90 disabled:opacity-50"
              >
                {sendingToCj ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Send className="size-3" />
                )}
                Send to CJ
              </button>
            )}
            <button
              onClick={onToggle}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors duration-300 hover:bg-muted"
            >
              <Eye className="size-3" />
              View
              {expanded ? (
                <ChevronUp className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="border-b border-border">
          <td colSpan={7} className="bg-muted/20 px-4 py-4">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Customer info */}
              <div>
                <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Customer Info
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    {order.customerName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {order.customerEmail}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    {order.customerPhone}
                  </p>
                </div>
              </div>

              {/* Shipping address */}
              <div>
                <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Shipping Address
                </h4>
                <div className="space-y-1 text-sm">
                  <p>{order.shippingAddress}</p>
                  <p>
                    {order.shippingCity}, {order.shippingPostalCode}
                  </p>
                  <p>{order.shippingCountry}</p>
                </div>
              </div>

              {/* Order meta */}
              <div>
                <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Order Details
                </h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Subtotal:</span>{" "}
                    {formatCurrency(order.subtotal)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Shipping:</span>{" "}
                    {formatCurrency(order.shippingCost)}
                  </p>
                  <p className="font-medium">
                    <span className="text-muted-foreground">Total:</span>{" "}
                    {formatCurrency(order.total)}
                  </p>
                  {order.cjOrderId && (
                    <p>
                      <span className="text-muted-foreground">
                        CJ Order ID:
                      </span>{" "}
                      <span className="font-mono text-xs">
                        {order.cjOrderId}
                      </span>
                    </p>
                  )}
                  {order.trackingNumber && (
                    <p>
                      <span className="text-muted-foreground">Tracking:</span>{" "}
                      <span className="font-mono text-xs">
                        {order.trackingNumber}
                      </span>
                    </p>
                  )}
                  {order.notes && (
                    <p>
                      <span className="text-muted-foreground">Notes:</span>{" "}
                      {order.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Items table */}
            <div className="mt-4">
              <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Items
              </h4>
              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                        Product
                      </th>
                      <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                        Qty
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                        Price
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-3 py-2">
                          <p className="font-medium">{item.productName}</p>
                          {item.cjSku && (
                            <p className="font-mono text-xs text-muted-foreground">
                              SKU: {item.cjSku}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatCurrency(
                            (parseFloat(item.price) * item.quantity).toString()
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
