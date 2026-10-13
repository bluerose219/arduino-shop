import type { OrderStatus } from "@/types";

export const FREE_SHIPPING_THRESHOLD = 30000;
export const SHIPPING_FEE = 3000;

export function won(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function shippingFee(itemsPrice: number) {
  return itemsPrice === 0 || itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "결제대기",
  paid: "결제완료",
  shipping: "배송중",
  delivered: "배송완료",
  cancelled: "주문취소",
};

export const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-gray-100 text-gray-600",
  paid: "bg-teal-50 text-teal-700",
  shipping: "bg-blue-50 text-blue-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-600",
};
