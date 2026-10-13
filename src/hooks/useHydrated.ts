"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// localStorage에 저장된 장바구니를 서버 렌더와 어긋나지 않게 읽기 위한 훅
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
