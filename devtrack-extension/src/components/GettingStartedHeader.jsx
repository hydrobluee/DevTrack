import React from 'react';
import { getAssetUrl } from '../lib/chrome';

export default function GettingStartedHeader({ settingsHref = null }) {
  return (
    <div className="flex items-center justify-between">
      <img src={getAssetUrl('images/devtrack-nobg.png')} alt="DevTrack" className="h-[60px] w-[60px]" />
      <div className="flex flex-1 items-center justify-center px-2">
        <h2 className="text-[18px] font-medium text-emerald-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]">
          Boost your STREAK
        </h2>
      </div>
      {settingsHref ? (
        <a
          href={settingsHref}
          aria-label="Open settings"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/15 bg-emerald-500/5 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
        >
          <img src={getAssetUrl('images/settings.png')} alt="Settings" className="h-5 w-5" />
        </a>
      ) : (
        <div aria-hidden="true" className="h-8 w-8" />
      )}
    </div>
  );
}
