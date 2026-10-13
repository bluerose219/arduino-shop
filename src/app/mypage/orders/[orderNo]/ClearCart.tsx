"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

// 결제 완료 직후 장바구니 비우기
export default function ClearCart() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
