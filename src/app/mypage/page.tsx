import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, getProfile } from "@/lib/supabase/server";
import { updateProfile } from "@/app/actions/orders";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import { won, formatDate } from "@/lib/format";
import type { Order } from "@/types";

export const metadata: Metadata = { title: "마이페이지" };

export default async function MyPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/mypage");

  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", profile.id)
    .neq("status", "pending")
    .order("created_at", { ascending: false });
  const orders = (data as Order[]) ?? [];

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[320px_1fr]">
      <section className="card self-start p-5">
        <h2 className="font-bold">내 정보</h2>
        <p className="mt-1 text-sm text-gray-500">{profile.email}</p>
        <form action={updateProfile} className="mt-4 space-y-3">
          <div>
            <label className="label" htmlFor="name">이름</label>
            <input id="name" name="name" className="input" defaultValue={profile.name ?? ""} />
          </div>
          <div>
            <label className="label" htmlFor="phone">연락처</label>
            <input id="phone" name="phone" className="input" defaultValue={profile.phone ?? ""} />
          </div>
          <div>
            <label className="label" htmlFor="address">기본 배송지</label>
            <input id="address" name="address" className="input" defaultValue={profile.address ?? ""} />
          </div>
          <button className="btn-outline w-full">저장</button>
        </form>
      </section>

      <section>
        <h1 className="text-2xl font-bold">주문 내역</h1>
        {orders.length === 0 ? (
          <div className="card mt-4 py-16 text-center text-gray-500">주문 내역이 없습니다.</div>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/mypage/orders/${o.order_no}`}
                  className="card flex flex-wrap items-center gap-3 p-4 transition hover:shadow-md"
                >
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">
                      {formatDate(o.created_at)} · {o.order_no}
                    </p>
                    <p className="mt-1 font-medium">{o.order_name}</p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                  <p className="w-28 text-right font-bold">{won(o.total_price)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
