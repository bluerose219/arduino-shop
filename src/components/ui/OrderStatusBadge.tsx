import { ORDER_STATUS_LABEL, ORDER_STATUS_STYLE } from "@/lib/format";
import type { OrderStatus } from "@/types";

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_STYLE[status]}`}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
