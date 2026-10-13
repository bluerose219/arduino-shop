"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types";

type CreateOrderInput = {
  items: { product_id: string; quantity: number }[];
  recipient: string;
  phone: string;
  address: string;
  memo: string;
  saveAddress: boolean;
};

export async function createOrder(
  input: CreateOrderInput,
): Promise<{ orderNo?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  if (!input.recipient.trim() || !input.phone.trim() || !input.address.trim()) {
    return { error: "받는 분, 연락처, 주소를 모두 입력해 주세요." };
  }

  const { data, error } = await supabase.rpc("create_order", {
    p_items: input.items,
    p_recipient: input.recipient.trim(),
    p_phone: input.phone.trim(),
    p_address: input.address.trim(),
    p_memo: input.memo.trim() || null,
  });
  if (error) return { error: error.message };

  if (input.saveAddress) {
    await supabase
      .from("profiles")
      .update({ name: input.recipient.trim(), phone: input.phone.trim(), address: input.address.trim() })
      .eq("id", user.id);
  }

  return { orderNo: data as string };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("profiles")
    .update({
      name: String(formData.get("name") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
    })
    .eq("id", user.id);
  revalidatePath("/mypage");
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { error: error?.message };
}
