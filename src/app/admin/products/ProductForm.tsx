"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveProduct } from "../actions";
import type { Category, Product } from "@/types";

export default function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const [state, action, pending] = useActionState(saveProduct, undefined);
  const specsText = Object.entries(product?.specs ?? {})
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  return (
    <form action={action} className="card grid gap-4 p-6 sm:grid-cols-2">
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <input type="hidden" name="image_url" value={product?.image_url ?? ""} />
      <div className="sm:col-span-2">
        <label className="label" htmlFor="name">상품명</label>
        <input id="name" name="name" className="input" defaultValue={product?.name} required />
      </div>
      <div>
        <label className="label" htmlFor="slug">슬러그 (URL, 영문 소문자/숫자/-)</label>
        <input
          id="slug"
          name="slug"
          className="input"
          defaultValue={product?.slug}
          pattern="[a-z0-9-]+"
          placeholder="arduino-uno-r3"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="category_slug">카테고리</label>
        <select
          id="category_slug"
          name="category_slug"
          className="input"
          defaultValue={product?.category_slug ?? categories[0]?.slug}
        >
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="price">가격 (원)</label>
        <input id="price" name="price" type="number" min={0} className="input" defaultValue={product?.price} required />
      </div>
      <div>
        <label className="label" htmlFor="stock">재고</label>
        <input id="stock" name="stock" type="number" min={0} className="input" defaultValue={product?.stock ?? 0} required />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="description">설명</label>
        <textarea id="description" name="description" rows={3} className="input" defaultValue={product?.description} />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="specs">사양 (한 줄에 하나씩 &quot;항목: 값&quot;)</label>
        <textarea
          id="specs"
          name="specs"
          rows={5}
          className="input font-mono"
          defaultValue={specsText}
          placeholder={"동작전압: 5V\n크기: 45 x 20 mm"}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="image">
          이미지 {product?.image_url && <span className="font-normal text-gray-400">(비워두면 기존 이미지 유지)</span>}
        </label>
        <input id="image" name="image" type="file" accept="image/*" className="input" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} className="accent-brand-600" />
        판매중 (체크 해제 시 쇼핑몰에서 숨김)
      </label>
      {state?.error && <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button className="btn-primary" disabled={pending}>
          {pending ? "저장 중..." : "저장"}
        </button>
        <Link href="/admin/products" className="btn-outline">
          취소
        </Link>
      </div>
    </form>
  );
}
