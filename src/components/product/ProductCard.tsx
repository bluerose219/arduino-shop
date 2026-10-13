import Link from "next/link";
import ProductImage from "@/components/product/ProductImage";
import { won } from "@/lib/format";
import type { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock === 0;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square bg-white">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-contain p-4 transition group-hover:scale-105"
        />
        {soldOut && (
          <span className="absolute left-3 top-3 rounded bg-gray-900/80 px-2 py-0.5 text-xs font-semibold text-white">
            품절
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col border-t border-gray-100 p-4">
        <p className="line-clamp-2 text-sm font-medium text-gray-800">{product.name}</p>
        <p className="mt-auto pt-2 text-base font-bold text-gray-900">{won(product.price)}</p>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="card py-20 text-center text-gray-500">조건에 맞는 상품이 없습니다.</div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
