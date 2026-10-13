import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { won } from "@/lib/format";
import TossPayment from "./TossPayment";

export const metadata: Metadata = { title: "결제하기" };

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNo?: string }>;
}) {
  const { orderNo } = await searchParams;
  if (!orderNo) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: order } = await supabase
    .from("orders")
    .select("order_no, order_name, total_price, status, recipient")
    .eq("order_no", orderNo)
    .maybeSingle();
  if (!order) notFound();
  if (order.status !== "pending") redirect(`/mypage/orders/${orderNo}`);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">결제하기</h1>
      <div className="card mt-6 flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-gray-500">주문번호 {order.order_no}</p>
          <p className="mt-1 font-medium">{order.order_name}</p>
        </div>
        <p className="text-xl font-extrabold text-brand-700">{won(order.total_price)}</p>
      </div>
      <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
        테스트 결제 환경입니다. 실제로 돈이 빠져나가지 않습니다.
      </p>
      <TossPayment
        clientKey={process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!}
        customerKey={user.id}
        orderNo={order.order_no}
        orderName={order.order_name}
        amount={order.total_price}
        customerName={order.recipient}
        customerEmail={user.email ?? undefined}
      />
    </div>
  );
}
