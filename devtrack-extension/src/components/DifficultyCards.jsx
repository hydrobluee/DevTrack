import React from "react";

const cards = [
  { label: "Easy", value: 0, className: "border-b-2 border-emerald-500" },
  { label: "Medium", value: 0, className: "border-b-2 border-emerald-400" },
  { label: "Hard", value: 0, className: "border-b-2 border-emerald-600" },
];

export default function DifficultyCards() {
  return (
    <div className="mt-5 flex gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`flex-1 rounded-[14px] border border-white/5 bg-slate-800/60 p-[15px] backdrop-blur-[10px] transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] ${card.className}`}
        >
          <p className="text-[13px] text-slate-400">{card.label}</p>
          <h3 className="mt-[5px] text-[16px] font-semibold text-emerald-500">
            {card.value}
          </h3>
        </div>
      ))}
    </div>
  );
}
