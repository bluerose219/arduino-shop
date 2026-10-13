import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/server";
import CheckoutForm from "./CheckoutForm";

export const metadata: Metadata = { title: "주문서 작성" };

export default async function CheckoutPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/checkout");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">주문서 작성</h1>
      <CheckoutForm
        defaults={{
          recipient: profile.name ?? "",
          phone: profile.phone ?? "",
          address: profile.address ?? "",
        }}
      />
    </div>
  );
}
