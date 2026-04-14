import React, { useEffect } from "react";
import PopupLogoCard from "../components/PopupLogoCard";
import { openBrowserTab } from "../lib/chrome";

export default function Popup() {
  const handleGetStarted = () => {
    openBrowserTab("http://localhost:5173/");
  };

  useEffect(() => {
    const { body } = document;
    const prev = {
      width: body.style.width,
      height: body.style.height,
      margin: body.style.margin,
      display: body.style.display,
      alignItems: body.style.alignItems,
      justifyContent: body.style.justifyContent,
      background: body.style.background,
      fontFamily: body.style.fontFamily,
    };

    body.style.width = "380px";
    body.style.height = "400px";
    body.style.margin = "0";
    body.style.display = "flex";
    body.style.alignItems = "center";
    body.style.justifyContent = "center";
    body.style.background =
      "radial-gradient(circle at center, #0b1220 0%, #05070c 75%)";
    body.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';

    return () => {
      Object.assign(body.style, prev);
    };
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,#0b1220_0%,#05070c_75%)] text-slate-400">
      <div className="flex h-[400px] w-[380px] flex-col items-center justify-evenly p-5 text-center">
        <PopupLogoCard />

        <h1 className="text-[24px] font-semibold text-emerald-500">DevTrack</h1>

        <p className="px-[10px] text-[13px] leading-[1.5] opacity-75">
          DevTrack unifies your competitive coding profiles, tracks your
          progress, and all the tools you need to excel in coding competitions —
          all in one place.
        </p>

        <button
          type="button"
          onClick={handleGetStarted}
          className="inline-block rounded-[8px] bg-emerald-600 px-[50px] py-[15px] text-[15px] font-medium text-white no-underline transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-[0_8px_25px_rgba(34,197,94,0.35)] active:scale-[0.97]"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
