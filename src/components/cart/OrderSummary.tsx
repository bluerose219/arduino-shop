import { won, shippingFee, FREE_SHIPPING_THRESHOLD } from "@/lib/format";

export default function OrderSummary({ itemsPrice }: { itemsPrice: number }) {
  const shipping = shippingFee(itemsPrice);
  const remaining = FREE_SHIPPING_THRESHOLD - itemsPrice;

  return (
    <div className="card space-y-3 p-5 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500">상품금액</span>
        <span>{won(itemsPrice)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">배송비</span>
        <span>{shipping === 0 ? "무료" : won(shipping)}</span>
      </div>
      {remaining > 0 && itemsPrice > 0 && (
        <p className="rounded-md bg-brand-50 px-3 py-2 text-xs text-brand-700">
          {won(remaining)} 더 담으면 무료배송!
        </p>
      )}
      <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold">
        <span>결제 예정 금액</span>
        <span className="text-brand-700">{won(itemsPrice + shipping)}</span>
      </div>
    </div>
  );
}
