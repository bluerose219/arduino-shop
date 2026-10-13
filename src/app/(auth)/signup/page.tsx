"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/app/actions/auth";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  if (state?.message) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">메일을 확인해 주세요</h1>
        <p className="mt-4 text-gray-600">{state.message}</p>
        <Link href="/login" className="btn-primary mt-8">
          로그인하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-center text-2xl font-bold">회원가입</h1>
      <form action={action} className="card mt-8 space-y-4 p-6">
        <div>
          <label className="label" htmlFor="name">이름</label>
          <input id="name" name="name" className="input" autoComplete="name" required />
        </div>
        <div>
          <label className="label" htmlFor="email">이메일</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" required />
        </div>
        <div>
          <label className="label" htmlFor="password">비밀번호 (6자 이상)</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="passwordConfirm">비밀번호 확인</label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            className="input"
            autoComplete="new-password"
            required
          />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button className="btn-primary w-full py-3" disabled={pending}>
          {pending ? "가입 중..." : "가입하기"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        이미 회원이신가요?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
