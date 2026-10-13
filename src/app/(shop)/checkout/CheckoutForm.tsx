"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";
import { createOrder } from "@/app/actions/orders";
import OrderSummary from "@/components/cart/OrderSummary";
import ProductImage from "@/components/product/ProductImage";
import { won } from "@/lib/format";

type Defaults = { recipient: string; phone: string; address: string };

export default function CheckoutForm({ defaults }: { defaults: Defaults }) {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const itemsPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <div className="card mt-6 py-20 text-center">
        <p className="text-gray-500">주문할 상품이 없습니다.</p>
        <Link href="/products" className="btn-primary mt-5">
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  function onSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await createOrder({
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        recipient: String(formData.get("recipient") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        address: String(formData.get("address") ?? ""),
        memo: String(formData.get("memo") ?? ""),
        saveAddress: formData.get("saveAddress") === "on",
      });
      if (result.error || !result.orderNo) {
        setError(result.error ?? "주문 생성에 실패했습니다.");
        return;
      }
      router.push(`/checkout/payment?orderNo=${result.orderNo}`);
    });
  }

  return (
    <form action={onSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="card p-5">
          <h2 className="font-bold">배송 정보</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="recipient">받는 분</label>
              <input id="recipient" name="recipient" className="input" defaultValue={defaults.recipient} required />
            </div>
            <div>
              <label className="label" htmlFor="phone">연락처</label>
              <input
                id="phone"
                name="phone"
                className="input"
                placeholder="010-0000-0000"
                defaultValue={defaults.phone}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="address">주소</label>
              <input id="address" name="address" className="input" defaultValue={defaults.address} required />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="memo">배송 메모 (선택)</label>
              <input id="memo" name="memo" className="input" placeholder="예: 문 앞에 놓아주세요" />
            </div>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="saveAddress" defaultChecked className="accent-brand-600" />
            이 배송 정보를 내 정보에 저장
          </label>
        </section>

        <section className="card p-5">
          <h2 className="font-bold">주문 상품 {items.length}개</h2>
          <ul className="mt-3 divide-y divide-gray-100">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center gap-3 py-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded border border-gray-100">
                  <ProductImage src={i.imageUrl} alt={i.name} sizes="56px" className="object-contain p-1" />
                </div>
                <p className="flex-1 text-sm">
                  {i.name} <span className="text-gray-400">× {i.quantity}</span>
                </p>
                <p className="text-sm font-semibold">{won(i.price * i.quantity)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-3 lg:sticky lg:top-40 lg:self-start">
        <OrderSummary itemsPrice={itemsPrice} />
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full py-3.5" disabled={pending}>
          {pending ? "주문 생성 중..." : "결제하기"}
        </button>
      </aside>
    </form>
  );
}
