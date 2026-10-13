import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";
import CartBadge from "@/components/cart/CartBadge";
import type { Category } from "@/types";

export default async function Header() {
  const supabase = await createClient();
  const [{ data: categories }, { data: userData }] = await Promise.all([
    supabase.from("categories").select("*").order("sort"),
    supabase.auth.getUser(),
  ]);
  const user = userData.user;
  let isAdmin = false;
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    isAdmin = data?.role === "admin";
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="bg-brand-900 text-xs text-brand-100">
        <div className="mx-auto max-w-6xl px-4 py-1.5 text-center sm:text-left">
          30,000원 이상 구매 시 무료배송 · 오후 3시 이전 결제 시 당일 출고
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="shrink-0 text-xl font-extrabold tracking-tight text-brand-700">
          아두<span className="text-gray-900">마켓</span>
        </Link>
        <form action="/search" className="hidden flex-1 sm:block">
          <input
            name="q"
            type="search"
            placeholder="찾으시는 부품을 검색하세요 (예: 초음파, 서보)"
            className="input rounded-full bg-gray-50"
          />
        </form>
        <nav className="ml-auto flex items-center gap-1 text-sm sm:ml-0">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-md px-2.5 py-1.5 font-semibold text-brand-700 hover:bg-brand-50"
                >
                  관리자
                </Link>
              )}
              <Link href="/mypage" className="rounded-md px-2.5 py-1.5 hover:bg-gray-100">
                마이페이지
              </Link>
              <form action={logout}>
                <button className="rounded-md px-2.5 py-1.5 text-gray-500 hover:bg-gray-100">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-2.5 py-1.5 hover:bg-gray-100">
                로그인
              </Link>
              <Link href="/signup" className="hidden rounded-md px-2.5 py-1.5 hover:bg-gray-100 sm:block">
                회원가입
              </Link>
            </>
          )}
          <CartBadge />
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-3 sm:hidden">
        <form action="/search">
          <input name="q" type="search" placeholder="부품 검색" className="input rounded-full bg-gray-50" />
        </form>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 text-sm font-medium">
        <Link href="/products" className="shrink-0 rounded-md px-3 py-1.5 hover:bg-gray-100">
          전체상품
        </Link>
        {(categories as Category[] | null)?.map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className="shrink-0 rounded-md px-3 py-1.5 hover:bg-gray-100"
          >
            {c.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
