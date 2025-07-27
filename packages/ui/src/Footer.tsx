import React from "react";

const WARM_SAND = "#FFFFFF";

export function Footer() {
  return (
    <footer
      style={{
        background: WARM_SAND,
        color: "#222",
        height: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="fixed left-0 right-0 bottom-0 z-40 transition-transform duration-500"
    >
      <div className="max-w-6xl mx-auto px-6 text-center w-full">
        Real Hakuba © 2025. All rights reserved.
      </div>
    </footer>
  );
}