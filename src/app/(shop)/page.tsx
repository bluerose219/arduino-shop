import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/product/ProductCard";
import type { Category, Product } from "@/types";

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("sort"),
    supabase.from("products").select("*").order("created_at", { ascending: false }).limit(8),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-900">
        <Image
          src="/images/hero.jpg"
          alt="아두이노 보드와 전자 부품"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-white sm:py-28">
          <p className="text-sm font-semibold tracking-widest text-brand-100">ARDUINO PARTS STORE</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">
            아이디어를 만드는
            <br />
            모든 부품, 한 곳에서
          </h1>
          <p className="mt-4 max-w-md text-brand-100">
            보드부터 센서, 모듈, 입문 키트까지. 첫 프로젝트에 필요한 부품을 바로 받아보세요.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/products" className="btn-primary px-6 py-3">
              전체 상품 보기
            </Link>
            <Link
              href="/products?category=kits"
              className="inline-flex items-center rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              입문 키트
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <h2 className="text-xl font-bold">카테고리</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {(categories as Category[] | null)?.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="group card overflow-hidden text-center transition hover:shadow-md"
            >
              <div className="relative aspect-[4/3] bg-white">
                {c.image_url && (
                  <Image
                    src={c.image_url}
                    alt={c.name}
                    fill
                    sizes="(min-width: 640px) 20vw, 33vw"
                    className="object-cover transition group-hover:scale-105"
                  />
                )}
              </div>
              <p className="border-t border-gray-100 py-2.5 text-sm font-semibold">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold">추천 상품</h2>
          <Link href="/products" className="text-sm text-gray-500 hover:text-gray-800">
            더보기 →
          </Link>
        </div>
        <div className="mt-4">
          <ProductGrid products={(products as Product[]) ?? []} />
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl gap-3 px-4 sm:grid-cols-3">
        {[
          ["무료배송", "30,000원 이상 구매 시 배송비 무료"],
          ["당일출고", "평일 오후 3시 이전 결제 건"],
          ["안전결제", "토스페이먼츠 간편결제 지원"],
        ].map(([title, desc]) => (
          <div key={title} className="card p-5">
            <p className="font-bold text-brand-700">{title}</p>
            <p className="mt-1 text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
