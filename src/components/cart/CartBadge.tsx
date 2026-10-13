"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import { useHydrated } from "@/hooks/useHydrated";

export default function CartBadge() {
  const hydrated = useHydrated();
  const count = useCart((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  return (
    <Link href="/cart" className="relative rounded-md px-2.5 py-1.5 font-semibold hover:bg-gray-100">
      장바구니
      {hydrated && count > 0 && (
        <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
