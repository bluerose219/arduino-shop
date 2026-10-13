import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductImage from "@/components/product/ProductImage";
import { won } from "@/lib/format";
import type { Product } from "@/types";
import DeleteProductButton from "./DeleteProductButton";

export const metadata: Metadata = { title: "상품 관리" };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("category_slug")
    .order("name");
  const products = (data as (Product & { categories: { name: string } | null })[]) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">상품 관리 ({products.length})</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + 상품 등록
        </Link>
      </div>
      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">상품</th>
              <th className="px-4 py-3 font-medium">카테고리</th>
              <th className="px-4 py-3 text-right font-medium">가격</th>
              <th className="px-4 py-3 text-right font-medium">재고</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-gray-100">
                      <ProductImage src={p.image_url} alt={p.name} sizes="40px" className="object-contain" />
                    </div>
                    <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-gray-500">{p.categories?.name}</td>
                <td className="px-4 py-2.5 text-right">{won(p.price)}</td>
                <td className={`px-4 py-2.5 text-right ${p.stock < 10 ? "font-semibold text-red-600" : ""}`}>
                  {p.stock}
                </td>
                <td className="px-4 py-2.5">
                  {p.is_active ? (
                    <span className="text-emerald-600">판매중</span>
                  ) : (
                    <span className="text-gray-400">숨김</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  <Link href={`/admin/products/${p.id}`} className="mr-3 text-brand-700 hover:underline">
                    수정
                  </Link>
                  <DeleteProductButton id={p.id} name={p.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
