import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white text-sm text-gray-500">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold text-brand-700">
            아두<span className="text-gray-900">마켓</span>
          </p>
          <p className="mt-2">아두이노 부품 전문 쇼핑몰 (포트폴리오용 데모 사이트)</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800">고객센터</p>
          <p className="mt-2">평일 10:00 – 17:00 · 점심 12:00 – 13:00</p>
          <p>주말·공휴일 휴무</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800">배송 안내</p>
          <p className="mt-2">배송비 3,000원 (30,000원 이상 무료)</p>
          <p>결제는 토스페이먼츠 테스트 모드로 동작합니다.</p>
        </div>
      </div>
      <p className="border-t border-gray-100 py-4 text-center text-xs">
        © 2026 아두마켓 · 상품 정보와 가격은 디바이스마트 기준입니다 ·{" "}
        <Link href="/credits" className="underline hover:text-gray-800">
          이미지 출처
        </Link>
      </p>
    </footer>
  );
}
