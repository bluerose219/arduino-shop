"use client";

import { useEffect, useRef, useState } from "react";
import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";

type Props = {
  clientKey: string;
  customerKey: string;
  orderNo: string;
  orderName: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
};

export default function TossPayment(props: Props) {
  const { clientKey, customerKey, amount } = props;
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const widgets = tossPayments.widgets({ customerKey });
        await widgets.setAmount({ currency: "KRW", value: amount });
        if (cancelled) return;
        await Promise.all([
          widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
          widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
        ]);
        widgetsRef.current = widgets;
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "결제 위젯을 불러오지 못했습니다.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clientKey, customerKey, amount]);

  async function pay() {
    if (!widgetsRef.current) return;
    try {
      await widgetsRef.current.requestPayment({
        orderId: props.orderNo,
        orderName: props.orderName,
        customerName: props.customerName,
        customerEmail: props.customerEmail,
        successUrl: `${window.location.origin}/api/payments/confirm`,
        failUrl: `${window.location.origin}/checkout/fail`,
      });
    } catch (e) {
      // 사용자가 결제창을 닫은 경우 등
      setError(e instanceof Error ? e.message : "결제를 진행하지 못했습니다.");
    }
  }

  return (
    <div className="mt-6">
      <div className="card overflow-hidden">
        <div id="payment-method" />
        <div id="agreement" />
      </div>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <button className="btn-primary mt-4 w-full py-3.5" disabled={!ready} onClick={pay}>
        {ready ? `${amount.toLocaleString()}원 결제하기` : "결제 수단 불러오는 중..."}
      </button>
    </div>
  );
}
