import React, { useState, ChangeEvent } from "react";
import clsx from "clsx";

interface FloatingInputProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

export default function FloatingInput({ label, value, onChange, type = "text" }: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || value;


  return (
    <div className="relative mt-2">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          block w-full rounded-lg border border-neutral-300
          px-4 pt-7 pb-3
                    focus:border-black
                    focus:ring-1 focus:ring-black
                    focus:outline-none 
                    transition-all duration-400
          text-base
        `}
      />
      <label
        className={clsx(
          "absolute left-3 pointer-events-none bg-white px-1 transition-all duration-200",
          isFloating
            ? "text-xs top-2.5"
            : "text-base top-1/2 -translate-y-1/2"
        )}
        style={{
          color: "#868686",
          fontWeight: isFloating ? 500 : 400,
          // 你也可以用不同灰色，如 "#717171"
        }}
      >
        {label}
      </label>
    </div>
  );
}