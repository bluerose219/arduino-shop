import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/product/ProductCard";
import type { Category, Product } from "@/types";

export const metadata: Metadata = { title: "상품 목록" };

const SORTS = {
  new: { label: "최신순", column: "created_at", ascending: false },
  low: { label: "낮은 가격순", column: "price", ascending: true },
  high: { label: "높은 가격순", column: "price", ascending: false },
  name: { label: "이름순", column: "name", ascending: true },
} as const;
type SortKey = keyof typeof SORTS;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const { category, sort } = await searchParams;
  const sortKey: SortKey = sort && sort in SORTS ? (sort as SortKey) : "new";
  const { column, ascending } = SORTS[sortKey];

  const supabase = await createClient();
  let query = supabase.from("products").select("*").order(column, { ascending });
  if (category) query = query.eq("category_slug", category);

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("sort"),
    query,
  ]);
  const current = (categories as Category[] | null)?.find((c) => c.slug === category);

  const href = (params: { category?: string; sort?: string }) => {
    const sp = new URLSearchParams();
    const c = "category" in params ? params.category : category;
    const s = "sort" in params ? params.sort : sortKey;
    if (c) sp.set("category", c);
    if (s && s !== "new") sp.set("sort", s);
    const qs = sp.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">{current?.name ?? "전체상품"}</h1>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={href({ category: undefined })}
          className={`rounded-full border px-4 py-1.5 text-sm ${!category ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300 bg-white hover:bg-gray-50"}`}
        >
          전체
        </Link>
        {(categories as Category[] | null)?.map((c) => (
          <Link
            key={c.slug}
            href={href({ category: c.slug })}
            className={`rounded-full border px-4 py-1.5 text-sm ${category === c.slug ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300 bg-white hover:bg-gray-50"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-b border-gray-200 pb-3 text-sm">
        <p className="text-gray-500">
          총 <b className="text-gray-900">{products?.length ?? 0}</b>개
        </p>
        <div className="flex gap-3">
          {(Object.keys(SORTS) as SortKey[]).map((key) => (
            <Link
              key={key}
              href={href({ sort: key })}
              className={key === sortKey ? "font-semibold text-gray-900" : "text-gray-400 hover:text-gray-700"}
            >
              {SORTS[key].label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <ProductGrid products={(products as Product[]) ?? []} />
      </div>
    </div>
  );
}
