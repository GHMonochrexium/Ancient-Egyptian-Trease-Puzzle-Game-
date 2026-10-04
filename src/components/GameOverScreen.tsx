import React from 'react';
import { sound } from '../audio/soundManager';
import { RotateCcw, Skull, Wind } from 'lucide-react';

interface GameOverScreenProps {
  reason: string;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ reason, onRestart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-[#2b170c] via-[#140b06] to-[#0a0503] animate-in fade-in duration-500 text-center">
      {/* Engulfed sand background dunes */}
      <div className="absolute inset-0 bg-[#d9a85c]/25 pointer-events-none mix-blend-overlay"></div>

      <div className="relative z-10 w-full max-w-lg stone-panel rounded-2xl p-8 border-2 border-rose-800 shadow-2xl">
        <div className="w-20 h-20 mx-auto rounded-full bg-rose-950/80 border-2 border-rose-600 flex items-center justify-center text-rose-400 mb-6 shadow-lg">
          <Skull className="w-10 h-10" />
        </div>

        <span className="text-xs font-mono-clean text-rose-400 tracking-[0.25em] uppercase block mb-1">
          Tomb Catastrophe
        </span>

        <h1 className="text-2xl sm:text-3xl font-cinzel font-black text-[#f7e096] hieroglyph-glow mb-4">
          THE TEMPLE HAS CLAIMED YOU
        </h1>

        <p className="text-xs sm:text-sm text-[#e0cfb8] leading-relaxed mb-6 font-sans-clean">
          {reason || 'The ancient sands have swallowed your path, sealing the eternal pharaoh’s tomb forever.'}
        </p>

        <div className="p-4 rounded-xl bg-[#1a0f0a] border border-[#52251a] mb-6 text-xs text-[#a98f6d] font-sans-clean flex items-center justify-center gap-2">
          <Wind className="w-4 h-4 text-amber-500" />
          <span>The desert winds sweep clean all tracks. A new trial awaits.</span>
        </div>

        <button
          onClick={() => {
            sound.playStoneClick();
            onRestart();
          }}
          className="w-full py-4 px-6 font-cinzel font-bold text-sm text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart Adventure from Beginning</span>
        </button>
      </div>
    </div>
  );
};
