import React from 'react';
import { sound } from '../audio/soundManager';
import { Skull, ShieldAlert, Flame, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface Act3TitleScreenProps {
  onBeginTrials: () => void;
  onReturnToMainGame: () => void;
}

export const Act3TitleScreen: React.FC<Act3TitleScreenProps> = ({
  onBeginTrials,
  onReturnToMainGame,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Sinister Egyptian Dark Container */}
      <div className="relative rounded-2xl p-6 sm:p-10 border-2 border-[#9333ea] bg-gradient-to-b from-[#150a21] via-[#0d0615] to-[#08030d] shadow-[0_0_50px_rgba(147,51,234,0.35)] text-center overflow-hidden">
        {/* Ambient Dark Realm Fog & Glow Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.18),transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c084fc] to-transparent opacity-80" />

        {/* Cursed Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#270e3d] border border-[#a855f7]/60 text-[#e9d5ff] text-xs font-mono-clean uppercase tracking-widest mb-4 shadow-sm">
          <Flame className="w-3.5 h-3.5 text-[#e879f9] animate-pulse" />
          <span>The Forbidden Threshold Discovered</span>
          <Flame className="w-3.5 h-3.5 text-[#e879f9] animate-pulse" />
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-3xl sm:text-5xl font-cinzel font-black tracking-widest text-[#f5d0fe] mb-3 drop-shadow-[0_4px_16px_rgba(192,132,252,0.5)]">
          ACT III — PURGATORIUM
        </h1>
        <p className="text-sm sm:text-base font-cinzel italic text-[#c084fc] max-w-2xl mx-auto mb-6">
          Three trials stand between you and the realm beyond the living.
        </p>

        {/* Warning Banner */}
        <div className="p-4 rounded-xl bg-[#220d36]/90 border border-[#7e22ce] max-w-2xl mx-auto mb-8 text-left flex items-start gap-3.5 shadow-inner">
          <ShieldAlert className="w-6 h-6 text-[#e879f9] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#f3e8ff] leading-relaxed font-sans-clean">
            <strong className="text-[#f5d0fe] font-cinzel block mb-1">
              Ancient Warning of the High Priests:
            </strong>
            You have peeled away the sacred wards of Chamber IV. Beyond this threshold lie the three gateway trials. If you fail any trial, your soul will be cast back to the beginning of the secret route. However, your progress across Acts I &amp; II remains untouched.
          </div>
        </div>

        {/* The 3 Gateway Levels Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto text-left">
          {/* Level X */}
          <div className="p-4 rounded-xl bg-[#190b28] border border-[#6b21a8] hover:border-[#c084fc] transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono-clean text-[#c084fc] uppercase tracking-wider">
                Trial I
              </span>
              <span className="text-xl text-[#e879f9]">𓋹</span>
            </div>
            <h3 className="text-sm font-cinzel font-bold text-[#faf5ff] mb-1 group-hover:text-[#f5d0fe] transition-colors">
              Level X — The Sacrifice
            </h3>
            <p className="text-xs text-[#d8b4fe] font-sans-clean leading-relaxed">
              An ancient Pharaoh demands three sacred relics. Offer them in the divine cosmic order. You have exactly 3 lives.
            </p>
          </div>

          {/* Level Y */}
          <div className="p-4 rounded-xl bg-[#190b28] border border-[#6b21a8] hover:border-[#c084fc] transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono-clean text-[#c084fc] uppercase tracking-wider">
                Trial II
              </span>
              <span className="text-xl text-[#e879f9]">𓊽</span>
            </div>
            <h3 className="text-sm font-cinzel font-bold text-[#faf5ff] mb-1 group-hover:text-[#f5d0fe] transition-colors">
              Level Y — The Mummy
            </h3>
            <p className="text-xs text-[#d8b4fe] font-sans-clean leading-relaxed">
              Unfold the sacred burial scroll. Overcome one of three randomized trials, then peel away the mummy’s bandages.
            </p>
          </div>

          {/* Level Z */}
          <div className="p-4 rounded-xl bg-[#190b28] border border-[#6b21a8] hover:border-[#c084fc] transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono-clean text-[#c084fc] uppercase tracking-wider">
                Trial III
              </span>
              <span className="text-xl text-[#e879f9]">𓆣</span>
            </div>
            <h3 className="text-sm font-cinzel font-bold text-[#faf5ff] mb-1 group-hover:text-[#f5d0fe] transition-colors">
              Level Z — The Final Challenge
            </h3>
            <p className="text-xs text-[#d8b4fe] font-sans-clean leading-relaxed">
              A forbidden intellect tests your perception. Guess the secret number (1–50) in 60 seconds to breach the Dark Realm.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={() => {
              sound.playCurseWhisper();
              onBeginTrials();
            }}
            className="w-full sm:w-auto flex-1 py-3.5 px-6 font-cinzel font-bold text-sm tracking-wider text-[#12071f] bg-gradient-to-r from-[#e9d5ff] via-[#d8b4fe] to-[#c084fc] hover:from-[#f5d0fe] hover:to-[#e879f9] rounded-xl shadow-[0_0_25px_rgba(233,213,255,0.4)] transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Enter Gateway Trials</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playStoneClick();
              onReturnToMainGame();
            }}
            className="w-full sm:w-auto py-3.5 px-5 font-cinzel text-xs font-semibold text-[#d8b4fe] hover:text-[#faf5ff] bg-[#1d0e2f] hover:bg-[#2b1445] border border-[#7e22ce] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Main Trek</span>
          </button>
        </div>
      </div>
    </div>
  );
};
