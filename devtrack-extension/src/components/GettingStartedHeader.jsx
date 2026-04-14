import React from 'react';
import { getAssetUrl } from '../lib/chrome';

export default function GettingStartedHeader() {
  return (
    <div className="flex items-center justify-between">
      <img src={getAssetUrl('images/devtrack-nobg.png')} alt="DevTrack" className="h-[60px] w-[60px]" />
      <div className="flex items-center">
        <h2 className="ml-[10px] mr-[10px] text-[18px] font-medium text-emerald-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]">
          Boost your STREAK
        </h2>
      </div>
      <div className="flex justify-center">
        <img src={getAssetUrl('images/settings.png')} alt="Settings" className="h-5 w-5" />
      </div>
    </div>
  );
}
