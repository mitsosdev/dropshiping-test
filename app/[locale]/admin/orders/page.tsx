import { setRequestLocale } from "next-intl/server";

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
