import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductImage from "@/components/product/ProductImage";
import AddToCart from "@/components/product/AddToCart";
import { ProductGrid } from "@/components/product/ProductCard";
import { won, FREE_SHIPPING_THRESHOLD } from "@/lib/format";
import type { Product } from "@/types";

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("slug", slug)
    .maybeSingle();
  return data as (Product & { categories: { name: string } | null }) | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  return { title: product?.name ?? "상품을 찾을 수 없음", description: product?.description };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const supabase = await createClient();
  const { data: related } = await supabase
    .from("products")
    .select("*")
    .eq("category_slug", product.category_slug)
    .neq("id", product.id)
    .limit(4);

  const specs = Object.entries(product.specs ?? {});

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-sm text-gray-500">
        <Link href="/products" className="hover:text-gray-800">
          전체상품
        </Link>
        <span className="mx-2">›</span>
        <Link href={`/products?category=${product.category_slug}`} className="hover:text-gray-800">
          {product.categories?.name}
        </Link>
      </nav>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="card relative aspect-square overflow-hidden">
          <ProductImage
            src={product.image_url}
            alt={product.name}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain p-8"
            priority
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold leading-snug">{product.name}</h1>
          <p className="mt-2 text-gray-600">{product.description}</p>
          <p className="mt-5 text-3xl font-extrabold">{won(product.price)}</p>

          <dl className="mt-6 space-y-2 border-y border-gray-200 py-4 text-sm">
            <div className="flex">
              <dt className="w-24 text-gray-500">배송비</dt>
              <dd>3,000원 ({won(FREE_SHIPPING_THRESHOLD)} 이상 무료)</dd>
            </div>
            <div className="flex">
              <dt className="w-24 text-gray-500">재고</dt>
              <dd className={product.stock === 0 ? "text-red-600" : ""}>
                {product.stock === 0 ? "품절" : `${product.stock}개`}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <AddToCart product={product} />
          </div>
        </div>
      </div>

      {specs.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold">상품 사양</h2>
          <table className="mt-3 w-full overflow-hidden rounded-xl border border-gray-200 bg-white text-sm">
            <tbody>
              {specs.map(([key, value]) => (
                <tr key={key} className="border-b border-gray-100 last:border-0">
                  <th className="w-1/3 bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">
                    {key}
                  </th>
                  <td className="px-4 py-3">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {related && related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold">같은 카테고리 상품</h2>
          <div className="mt-4">
            <ProductGrid products={related as Product[]} />
          </div>
        </section>
      )}
    </div>
  );
}
