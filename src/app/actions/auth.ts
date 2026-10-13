"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string } | undefined;

function safeNext(next: FormDataEntryValue | null) {
  const value = typeof next === "string" ? next : "";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) {
    return {
      error:
        error.message === "Email not confirmed"
          ? "이메일 인증이 완료되지 않았습니다. 메일함을 확인해 주세요."
          : "이메일 또는 비밀번호가 올바르지 않습니다.",
    };
  }
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signup(_: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: "비밀번호는 6자 이상이어야 합니다." };
  if (password !== formData.get("passwordConfirm")) {
    return { error: "비밀번호 확인이 일치하지 않습니다." };
  }

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email") ?? ""),
    password,
    options: {
      data: { name: String(formData.get("name") ?? "") },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) {
    return {
      error: error.message.includes("already registered")
        ? "이미 가입된 이메일입니다."
        : `회원가입에 실패했습니다: ${error.message}`,
    };
  }
  if (!data.session) {
    return { message: "가입 확인 메일을 보냈습니다. 메일의 링크를 누르면 가입이 완료됩니다." };
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
