"use client";

import { useState, useTransition } from "react";
import { deleteProduct } from "../actions";

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button className="text-gray-400 hover:text-red-600" onClick={() => setConfirming(true)}>
        삭제
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        className="font-semibold text-red-600 hover:underline"
        disabled={pending}
        aria-label={`${name} 삭제 확인`}
        onClick={() =>
          startTransition(async () => {
            await deleteProduct(id);
          })
        }
      >
        {pending ? "삭제 중" : "정말 삭제"}
      </button>
      <button className="text-gray-400" onClick={() => setConfirming(false)}>
        취소
      </button>
    </span>
  );
}
