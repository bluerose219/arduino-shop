import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/admin");
  if (profile.role !== "admin") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-xl font-bold">접근 권한이 없습니다</h1>
        <p className="mt-2 text-gray-500">관리자 계정으로 로그인해 주세요.</p>
      </div>
    );
  }

  const links = [
    ["/admin", "대시보드"],
    ["/admin/products", "상품 관리"],
    ["/admin/orders", "주문 관리"],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="flex gap-1 border-b border-gray-200 pb-3 text-sm font-medium">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="rounded-md px-3 py-1.5 hover:bg-gray-100">
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
