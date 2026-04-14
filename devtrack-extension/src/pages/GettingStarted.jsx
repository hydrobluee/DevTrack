import React, { useEffect } from 'react';
import GettingStartedHeader from '../components/GettingStartedHeader';
import ProgressRing from '../components/ProgressRing';
import DifficultyCards from '../components/DifficultyCards';
import WeeklyProgress from '../components/WeeklyProgress';
import { openExtensionPage } from '../lib/chrome';

export default function GettingStarted() {
  useEffect(() => {
    const { body } = document;
    const prev = {
      margin: body.style.margin,
      background: body.style.background,
      fontFamily: body.style.fontFamily,
    };

    body.style.margin = '0';
    body.style.background = 'radial-gradient(circle at top, #020617, #020617, #000)';
    body.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';

    return () => {
      Object.assign(body.style, prev);
    };
  }, []);

  return (
    <div className="min-h-full w-full bg-[radial-gradient(circle_at_top,#020617,#020617,#000)] text-slate-200">
      <div className="w-[380px] px-6 py-5 text-center">
        <GettingStartedHeader />

        <div className="mb-[25px] mt-[20px]">
          <ProgressRing value={17} />
        </div>

        <DifficultyCards />
        <WeeklyProgress />

        <a
          href={openExtensionPage('popup.html')}
          className="mt-[10px] mb-[20px] block text-center text-[16px] text-emerald-500 no-underline transition duration-300 hover:text-emerald-400 hover:shadow-[0_0_8px_#22c55e]"
        >
          Check full summary ↗
        </a>
      </div>
    </div>
  );
}
