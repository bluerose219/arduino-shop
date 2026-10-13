import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/product/ProductCard";
import type { Product } from "@/types";

export const metadata: Metadata = { title: "검색" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = ((await searchParams).q ?? "").trim();
  let products: Product[] = [];

  if (q) {
    const supabase = await createClient();
    // PostgREST or 필터 문법을 깨뜨리는 문자는 제거
    const term = q.replace(/[,()%*]/g, " ").trim();
    const { data } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
      .order("name");
    products = (data as Product[]) ?? [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <form action="/search" className="flex gap-2">
        <input name="q" type="search" defaultValue={q} placeholder="상품명으로 검색" className="input" />
        <button className="btn-primary shrink-0">검색</button>
      </form>
      {q ? (
        <>
          <p className="mt-6 text-sm text-gray-500">
            <b className="text-gray-900">&apos;{q}&apos;</b> 검색 결과 {products.length}개
          </p>
          <div className="mt-4">
            <ProductGrid products={products} />
          </div>
        </>
      ) : (
        <p className="mt-10 text-center text-gray-500">검색어를 입력해 주세요.</p>
      )}
    </div>
  );
}
