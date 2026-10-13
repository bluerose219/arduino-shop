import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { won, formatDate, ORDER_STATUS_LABEL } from "@/lib/format";
import type { Order, OrderStatus } from "@/types";
import StatusSelect from "./StatusSelect";

export const metadata: Metadata = { title: "주문 관리" };

const FILTERS: OrderStatus[] = ["paid", "shipping", "delivered", "cancelled"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .neq("status", "pending")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data } = await query;
  const orders = (data as Order[]) ?? [];

  return (
    <div>
      <h1 className="text-xl font-bold">주문 관리</h1>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/orders"
          className={`rounded-full border px-3 py-1 ${!status ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300 bg-white"}`}
        >
          전체
        </Link>
        {FILTERS.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full border px-3 py-1 ${status === s ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300 bg-white"}`}
          >
            {ORDER_STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <ul className="mt-4 space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="card p-4 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-400">
                  {o.order_no} · {formatDate(o.created_at)}
                </p>
                <p className="mt-0.5 font-semibold">{o.order_name}</p>
              </div>
              <p className="font-bold">{won(o.total_price)}</p>
              <StatusSelect orderId={o.id} status={o.status} />
            </div>
            <div className="mt-3 grid gap-3 border-t border-gray-100 pt-3 text-gray-600 sm:grid-cols-2">
              <p>
                {o.recipient} · {o.phone}
                <br />
                {o.address}
                {o.memo && <span className="block text-gray-400">메모: {o.memo}</span>}
              </p>
              <ul className="space-y-0.5">
                {o.order_items?.map((i) => (
                  <li key={i.id}>
                    {i.product_name} × {i.quantity}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
        {orders.length === 0 && <li className="card py-16 text-center text-gray-400">주문이 없습니다.</li>}
      </ul>
    </div>
  );
}
