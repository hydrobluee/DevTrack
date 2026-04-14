import React from 'react';
import { getAssetUrl } from '../lib/chrome';

export default function PopupLogoCard() {
  return (
    <div className="relative rounded-full p-2 transition duration-300 hover:scale-[1.05]">
      <div className="absolute -inset-1.5 rounded-full border border-emerald-400/15 transition duration-300 hover:border-emerald-400/60 hover:shadow-[0_0_30px_rgba(74,222,128,0.25)]" />
      <img
        src={getAssetUrl('images/devtrack-logo.jpeg')}
        alt="DevTrack logo"
        className="h-[120px] w-[120px] rounded-full"
      />
    </div>
  );
}
