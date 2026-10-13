import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-5xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-gray-500">주소가 바뀌었거나 삭제된 페이지입니다.</p>
      <Link href="/" className="btn-primary mt-8">
        홈으로
      </Link>
    </div>
  );
}
