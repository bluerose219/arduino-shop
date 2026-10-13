import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 토스페이먼츠 결제 성공 리다이렉트 → 금액 검증 → 결제 승인 → 주문 상태 변경
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = Number(searchParams.get("amount"));

  const fail = (message: string, code = "CONFIRM_FAILED") =>
    NextResponse.redirect(
      `${origin}/checkout/fail?${new URLSearchParams({ code, message, orderId: orderId ?? "" })}`,
    );

  if (!paymentKey || !orderId || !amount) return fail("잘못된 결제 요청입니다.");

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("order_no, total_price, status")
    .eq("order_no", orderId)
    .maybeSingle();

  if (!order) return fail("주문을 찾을 수 없습니다.");
  if (order.status !== "pending") {
    return NextResponse.redirect(`${origin}/mypage/orders/${orderId}`);
  }
  if (order.total_price !== amount) return fail("결제 금액이 주문 금액과 다릅니다.", "AMOUNT_MISMATCH");

  const auth = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64");
  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return fail(body.message ?? "결제 승인에 실패했습니다.", body.code);
  }

  const { error } = await supabase.rpc("mark_order_paid", {
    p_order_no: orderId,
    p_payment_key: paymentKey,
    p_secret: process.env.ORDER_CONFIRM_SECRET,
  });
  if (error) return fail(`주문 처리 중 오류가 발생했습니다: ${error.message}`);

  return NextResponse.redirect(`${origin}/mypage/orders/${orderId}?paid=1`);
}
