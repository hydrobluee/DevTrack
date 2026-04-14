import React from 'react';
import { getAssetUrl } from '../lib/chrome';

const days = [
  { label: 'M', active: true },
  { label: 'T', active: true },
  { label: 'W', active: true },
  { label: 'T', active: true },
  { label: 'F', active: true },
  { label: 'S', active: false },
  { label: 'S', active: false },
];

export default function WeeklyProgress() {
  return (
    <div className="mt-6 text-left">
      <p className="text-[14px] text-slate-400">Weekly Progress</p>
      <div className="mt-[10px] flex justify-between">
        {days.map((day, index) => (
          <div key={`${day.label}-${index}`} className="flex flex-col items-center gap-[6px]">
            {day.active ? (
              <img src={getAssetUrl('images/streak-nobg.png')} alt="Streak" className="h-[30px] w-[30px]" />
            ) : (
              <span className={`h-[10px] w-[10px] rounded-full ${day.active ? 'bg-emerald-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-800'}`} />
            )}
            <span className="text-[11px] font-medium tracking-[1px] text-slate-400">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
