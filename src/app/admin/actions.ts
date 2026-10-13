"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProductFormState = { error?: string } | undefined;

function parseSpecs(text: string) {
  // "키: 값" 형식의 줄을 객체로 변환
  const specs: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && value) specs[key] = value;
  }
  return specs;
}

export async function saveProduct(_: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");

  let imageUrl = String(formData.get("image_url") ?? "") || null;
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type });
    if (error) return { error: `이미지 업로드 실패: ${error.message}` };
    imageUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  const product = {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    category_slug: String(formData.get("category_slug") ?? ""),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    description: String(formData.get("description") ?? "").trim(),
    specs: parseSpecs(String(formData.get("specs") ?? "")),
    is_active: formData.get("is_active") === "on",
    image_url: imageUrl,
  };

  if (!product.name || !/^[a-z0-9-]+$/.test(product.slug)) {
    return { error: "상품명과 URL용 영문 슬러그(소문자, 숫자, -)를 입력해 주세요." };
  }
  if (!Number.isInteger(product.price) || product.price < 0 || !Number.isInteger(product.stock) || product.stock < 0) {
    return { error: "가격과 재고는 0 이상의 정수여야 합니다." };
  }

  const { error } = id
    ? await supabase.from("products").update(product).eq("id", id)
    : await supabase.from("products").insert(product);
  if (error) {
    return { error: error.code === "23505" ? "이미 사용 중인 슬러그입니다." : error.message };
  }

  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  // 주문 이력이 있는 상품도 order_items에 이름/가격이 남아 있으므로 삭제 가능
  const { error } = await supabase.from("products").delete().eq("id", id);
  revalidatePath("/", "layout");
  return { error: error?.message };
}
