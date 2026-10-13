import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import ProductImage from "@/components/product/ProductImage";
import { won, formatDate } from "@/lib/format";
import type { Order } from "@/types";
import ClearCart from "./ClearCart";

export const metadata: Metadata = { title: "주문 상세" };

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNo: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const { orderNo } = await params;
  const { paid } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_no", orderNo)
    .maybeSingle();
  if (!data) notFound();
  const order = data as Order;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {paid && order.status === "paid" && (
        <>
          <ClearCart />
          <div className="mb-6 rounded-xl bg-brand-600 p-6 text-white">
            <p className="text-xl font-bold">결제가 완료되었습니다!</p>
            <p className="mt-1 text-sm text-brand-100">주문해 주셔서 감사합니다. 빠르게 준비해서 보내드릴게요.</p>
          </div>
        </>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">주문 상세</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-gray-500">
        {order.order_no} · {formatDate(order.created_at)}
      </p>

      <section className="card mt-6 p-5">
        <h2 className="font-bold">주문 상품</h2>
        <ul className="mt-3 divide-y divide-gray-100">
          {order.order_items?.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded border border-gray-100">
                <ProductImage src={item.image_url} alt={item.product_name} sizes="56px" className="object-contain p-1" />
              </div>
              <p className="flex-1 text-sm">
                {item.product_name}
                <span className="block text-gray-400">
                  {won(item.price)} × {item.quantity}
                </span>
              </p>
              <p className="text-sm font-semibold">{won(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">상품금액</dt>
            <dd>{won(order.items_price)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">배송비</dt>
            <dd>{order.shipping_fee === 0 ? "무료" : won(order.shipping_fee)}</dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt>결제금액</dt>
            <dd className="text-brand-700">{won(order.total_price)}</dd>
          </div>
        </dl>
      </section>

      <section className="card mt-4 p-5 text-sm">
        <h2 className="font-bold">배송 정보</h2>
        <dl className="mt-3 space-y-1.5">
          <div className="flex">
            <dt className="w-20 text-gray-500">받는 분</dt>
            <dd>{order.recipient}</dd>
          </div>
          <div className="flex">
            <dt className="w-20 text-gray-500">연락처</dt>
            <dd>{order.phone}</dd>
          </div>
          <div className="flex">
            <dt className="w-20 shrink-0 text-gray-500">주소</dt>
            <dd>{order.address}</dd>
          </div>
          {order.memo && (
            <div className="flex">
              <dt className="w-20 text-gray-500">메모</dt>
              <dd>{order.memo}</dd>
            </div>
          )}
        </dl>
      </section>

      <div className="mt-6 flex gap-2">
        {order.status === "pending" && (
          <Link href={`/checkout/payment?orderNo=${order.order_no}`} className="btn-primary">
            결제하기
          </Link>
        )}
        <Link href="/mypage" className="btn-outline">
          주문 목록
        </Link>
        <Link href="/products" className="btn-outline">
          쇼핑 계속하기
        </Link>
      </div>
    </div>
  );
}
