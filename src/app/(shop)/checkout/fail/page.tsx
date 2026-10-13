import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "결제 실패" };

export default async function PaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; message?: string; orderId?: string }>;
}) {
  const { code, message, orderId } = await searchParams;
  const canceled = code === "PAY_PROCESS_CANCELED";

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">{canceled ? "결제를 취소했습니다" : "결제에 실패했습니다"}</h1>
      <p className="mt-3 text-gray-500">{message ?? "알 수 없는 오류가 발생했습니다."}</p>
      {code && <p className="mt-1 text-xs text-gray-400">오류 코드: {code}</p>}
      <div className="mt-8 flex justify-center gap-2">
        {orderId && (
          <Link href={`/checkout/payment?orderNo=${orderId}`} className="btn-primary">
            다시 결제하기
          </Link>
        )}
        <Link href="/cart" className="btn-outline">
          장바구니로
        </Link>
      </div>
    </div>
  );
}
