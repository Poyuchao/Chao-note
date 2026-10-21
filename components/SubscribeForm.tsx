"use client";

import { useState } from "react";

// 階段 4 前不送出，只保留 UI
export default function SubscribeForm() {
  const [notice, setNotice] = useState("");

  return (
    <form
      className="flex w-full max-w-md flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setNotice("訂閱功能尚未開放。");
      }}
    >
      <label htmlFor="subscribe-email" className="text-[14px] text-[#C9D2DE]">
        Email 訂閱
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="subscribe-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="h-11 min-w-0 rounded-[10px] border sm:flex-1 border-[#3A4A63] bg-[#1B2B42] px-3 text-[15px] text-white placeholder:text-[#8E9BB0]"
        />
        <button
          type="submit"
          className="h-11 rounded-[10px] bg-accent px-5 text-[15px] font-medium text-white hover:bg-[#1D3BB3]"
        >
          訂閱
        </button>
      </div>
      <p role="status" className="min-h-6 text-[14px] text-[#C9D2DE]">
        {notice}
      </p>
    </form>
  );
}
