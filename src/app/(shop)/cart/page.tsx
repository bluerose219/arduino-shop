"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";
import ProductImage from "@/components/product/ProductImage";
import QuantityInput from "@/components/ui/QuantityInput";
import OrderSummary from "@/components/cart/OrderSummary";

export default function CartPage() {
  const hydrated = useHydrated();
  const { items, setQuantity, remove } = useCart();
  const itemsPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!hydrated) return <div className="mx-auto max-w-6xl px-4 py-8" />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">장바구니</h1>

      {items.length === 0 ? (
        <div className="card mt-6 py-20 text-center">
          <p className="text-gray-500">장바구니가 비어 있습니다.</p>
          <Link href="/products" className="btn-primary mt-5">
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <ul className="card divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-4 p-4">
                <Link
                  href={`/products/${item.slug}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white"
                >
                  <ProductImage src={item.imageUrl} alt={item.name} sizes="80px" className="object-contain p-1" />
                </Link>
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <Link href={`/products/${item.slug}`} className="text-sm font-medium hover:underline">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">{item.price.toLocaleString()}원</p>
                  </div>
                  <QuantityInput
                    value={item.quantity}
                    max={item.stock}
                    onChange={(q) => setQuantity(item.productId, q)}
                  />
                  <p className="w-24 font-bold sm:text-right">
                    {(item.price * item.quantity).toLocaleString()}원
                  </p>
                </div>
                <button
                  onClick={() => remove(item.productId)}
                  className="self-start text-sm text-gray-400 hover:text-red-500"
                  aria-label={`${item.name} 삭제`}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>

          <aside className="space-y-3 lg:sticky lg:top-40 lg:self-start">
            <OrderSummary itemsPrice={itemsPrice} />
            <Link href="/checkout" className="btn-primary w-full py-3.5">
              주문하기
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
