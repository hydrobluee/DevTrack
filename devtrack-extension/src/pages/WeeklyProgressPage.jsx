import React, { useEffect } from "react";
import DifficultyCards from "../components/DifficultyCards";
import GettingStartedHeader from "../components/GettingStartedHeader";
import ProgressRing from "../components/ProgressRing";
import WeeklyProgress from "../components/WeeklyProgress";
import { openExtensionPage } from "../lib/chrome";

export default function WeeklyProgressPage() {
  useEffect(() => {
    const { body } = document;
    const prev = {
      margin: body.style.margin,
      background: body.style.background,
      fontFamily: body.style.fontFamily,
      width: body.style.width,
      minHeight: body.style.minHeight,
    };

    body.style.margin = "0";
    body.style.width = "380px";
    body.style.minHeight = "520px";
    body.style.background = "radial-gradient(circle at top, #020617, #020617, #000)";
    body.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';

    return () => {
      Object.assign(body.style, prev);
    };
  }, []);

  return (
    <div className="min-h-full w-full bg-[radial-gradient(circle_at_top,#020617,#020617,#000)] text-slate-200">
      <div className="w-[380px] px-6 py-5 text-center">
        <GettingStartedHeader settingsHref={openExtensionPage("settings.html")} />

        <div className="mb-[25px] mt-[20px]">
          <ProgressRing value={17} />
        </div>

        <DifficultyCards />
        <WeeklyProgress />
      </div>
    </div>
  );
}
