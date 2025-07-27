// packages/ui/src/Header.tsx
import React from "react";
const WARM_SAND = "#FFFFFF";

export function Header({ title = "Real Hakuba" }: { title?: string }) {
  return (
    <header
      style={{
        height: 85,
        background: WARM_SAND,
        borderBottom: '1px solid #E4E0D6',
      }}
      className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 text-gray-900 transition-all"
    >
      <span className="text-2xl md:text-2xl font-semibold">{title}</span>
      {/* 右侧可以放菜单/按钮/Logo */}
    </header>
  );
}