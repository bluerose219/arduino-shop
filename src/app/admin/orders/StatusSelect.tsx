"use client";

import { useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/orders";
import { ORDER_STATUS_LABEL } from "@/lib/format";
import type { OrderStatus } from "@/types";

const OPTIONS: OrderStatus[] = ["paid", "shipping", "delivered", "cancelled"];

export default function StatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm disabled:opacity-50"
      defaultValue={status}
      disabled={pending}
      aria-label="주문 상태"
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        startTransition(async () => {
          await updateOrderStatus(orderId, next);
        });
      }}
    >
      {OPTIONS.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
