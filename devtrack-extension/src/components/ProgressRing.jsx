import React from "react";

export default function ProgressRing({ value = 0 }) {
  return (
    <div className="flex justify-center">
      <div
        className="flex h-[140px] w-[140px] items-center justify-center rounded-full border-2 border-emerald-500/40 shadow-[0_0_25px_rgba(34,197,94,0.4),inset_0_0_20px_rgba(34,197,94,0.2)]"
        style={{
          background:
            "radial-gradient(circle, #020617 60%, transparent 61%), conic-gradient(#22c55e 0deg, #1e293b 0deg)",
        }}
      >
        <span className="text-[28px] font-bold text-emerald-500">{value}</span>
      </div>
    </div>
  );
}
