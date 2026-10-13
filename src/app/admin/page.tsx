import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import { won, formatDate } from "@/lib/format";
import type { Order } from "@/types";

export const metadata: Metadata = { title: "관리자" };

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [{ data: orders }, { count: productCount }, { data: lowStock }] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .neq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("products").select("id, name, stock").lt("stock", 10).order("stock"),
  ]);

  const paidOrders = ((orders as Order[]) ?? []).filter((o) => o.status !== "cancelled");
  const revenue = paidOrders.reduce((sum, o) => sum + o.total_price, 0);
  const toShip = paidOrders.filter((o) => o.status === "paid").length;

  const stats = [
    ["누적 매출", won(revenue)],
    ["주문 수", `${paidOrders.length}건`],
    ["배송 대기", `${toShip}건`],
    ["등록 상품", `${productCount ?? 0}개`],
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">최근 주문</h2>
            <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-gray-800">
              전체 보기 →
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-gray-100 text-sm">
            {(orders as Order[] | null)?.slice(0, 6).map((o) => (
              <li key={o.id} className="flex items-center gap-3 py-2.5">
                <div className="flex-1">
                  <p className="font-medium">{o.order_name}</p>
                  <p className="text-xs text-gray-400">
                    {o.recipient} · {formatDate(o.created_at)}
                  </p>
                </div>
                <OrderStatusBadge status={o.status} />
                <p className="w-24 text-right font-semibold">{won(o.total_price)}</p>
              </li>
            ))}
            {!orders?.length && <li className="py-6 text-center text-gray-400">아직 주문이 없습니다.</li>}
          </ul>
        </section>

        <section className="card self-start p-5">
          <h2 className="font-bold">재고 부족 (10개 미만)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {lowStock?.map((p) => (
              <li key={p.id} className="flex justify-between gap-2">
                <Link href={`/admin/products/${p.id}`} className="truncate hover:underline">
                  {p.name}
                </Link>
                <span className={p.stock === 0 ? "font-semibold text-red-600" : "text-amber-600"}>
                  {p.stock}개
                </span>
              </li>
            ))}
            {!lowStock?.length && <li className="text-gray-400">모든 상품 재고가 충분합니다.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
