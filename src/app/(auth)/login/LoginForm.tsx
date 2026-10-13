"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-center text-2xl font-bold">로그인</h1>
      <form action={action} className="card mt-8 space-y-4 p-6">
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="label" htmlFor="email">이메일</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" required />
        </div>
        <div>
          <label className="label" htmlFor="password">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            autoComplete="current-password"
            required
          />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button className="btn-primary w-full py-3" disabled={pending}>
          {pending ? "로그인 중..." : "로그인"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        아직 회원이 아니신가요?{" "}
        <Link href="/signup" className="font-semibold text-brand-700 hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
