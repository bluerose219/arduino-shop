"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import QuantityInput from "@/components/ui/QuantityInput";
import { won } from "@/lib/format";
import type { Product } from "@/types";

export default function AddToCart({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);
  const router = useRouter();
  const soldOut = product.stock === 0;

  function addToCart() {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        imageUrl: product.image_url,
        stock: product.stock,
      },
      quantity,
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
        <QuantityInput
          value={quantity}
          max={Math.max(product.stock, 1)}
          onChange={setQuantity}
          disabled={soldOut}
        />
        <p className="text-xl font-bold">{won(product.price * quantity)}</p>
      </div>
      {soldOut ? (
        <button className="btn-primary w-full py-3.5" disabled>
          품절된 상품입니다
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            className="btn-outline py-3.5"
            onClick={() => {
              addToCart();
              setAdded(true);
            }}
          >
            장바구니 담기
          </button>
          <button
            className="btn-primary py-3.5"
            onClick={() => {
              addToCart();
              router.push("/cart");
            }}
          >
            바로 구매
          </button>
        </div>
      )}
      {added && (
        <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
          장바구니에 담았습니다.{" "}
          <button className="font-semibold underline" onClick={() => router.push("/cart")}>
            장바구니 보기
          </button>
        </p>
      )}
    </div>
  );
}
