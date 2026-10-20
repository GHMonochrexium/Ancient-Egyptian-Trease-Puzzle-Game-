import React, { useState, useEffect } from 'react';
import { sound } from '../audio/soundManager';
import { Flame, Sparkles, ArrowRight } from 'lucide-react';

interface DarkRealmEntranceProps {
  onBeginPurgatoriumTrials: () => void;
  onReturnToMainGame: () => void;
}

export const DarkRealmEntrance: React.FC<DarkRealmEntranceProps> = ({
  onBeginPurgatoriumTrials,
  onReturnToMainGame,
}) => {
  const [phase, setPhase] = useState<'black' | 'revealing' | 'text' | 'ready'>('black');

  useEffect(() => {
    sound.playDarkRealmTransition();

    // Cinematic step pacing
    const t1 = setTimeout(() => setPhase('revealing'), 900);
    const t2 = setTimeout(() => setPhase('text'), 2200);
    const t3 = setTimeout(() => setPhase('ready'), 4600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      {/* Background Corrupted Landscape */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          phase === 'black' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <img
          src="/src/assets/images/dark_realm_purgatorium_1791721936328.jpg"
          alt="The Dark Realm Purgatorium"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover scale-105 animate-pulse duration-[8000ms]"
        />
        {/* Sinister dark gradient vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.2),transparent_70%)]" />
      </div>

      {/* Floating Ash & Flickering Corrupted Hieroglyphs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['𓁹', '𓆣', '𓋹', '𓊽', '𓆓', '𓃠', '𓇳', '𓅃'].map((glyph, idx) => (
          <span
            key={idx}
            className="absolute text-2xl sm:text-3xl text-rose-500/40 animate-pulse font-serif"
            style={{
              top: `${15 + ((idx * 23) % 70)}%`,
              left: `${8 + ((idx * 29) % 84)}%`,
              animationDelay: `${idx * 0.4}s`,
              animationDuration: `${3 + (idx % 3)}s`,
            }}
          >
            {glyph}
          </span>
        ))}
      </div>

      {/* Central Dramatic Message & Action */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Exact Required Message */}
        <div
          className={`transition-all duration-1000 transform ${
            phase === 'text' || phase === 'ready'
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-8 scale-95'
          }`}
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-rose-950/80 border border-rose-600/80 text-rose-300 text-xs font-mono-clean uppercase tracking-widest shadow-[0_0_20px_rgba(225,29,72,0.5)]">
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>The Seal of the Living is Broken</span>
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-cinzel font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#fb7185] via-[#f43f5e] to-[#e11d48] drop-shadow-[0_4px_25px_rgba(225,29,72,0.9)] mb-6 uppercase leading-tight">
            YOU HAVE ENTERED A REALM YOU WEREN'T SUPPOSED TO.
          </h1>

          <p className="text-sm sm:text-base font-cinzel italic text-[#fecdd3] max-w-xl mx-auto mb-8 drop-shadow-md">
            The sky is black, the sun is dead, and the ancient spirits weep. Purgatorium awaits those who dare seek the forbidden treasure.
          </p>
        </div>

        {/* Phase Ready: Action Card for Purgatorium */}
        <div
          className={`transition-all duration-700 ${
            phase === 'ready'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 pointer-events-none translate-y-6'
          }`}
        >
          <div className="p-6 rounded-2xl bg-[#1a050f]/90 border-2 border-rose-700 shadow-[0_0_40px_rgba(225,29,72,0.6)] max-w-lg mx-auto backdrop-blur-md">
            <span className="text-xs font-cinzel font-bold text-[#fda4af] uppercase tracking-widest block mb-1">
              THE ULTIMATE TRIAL
            </span>
            <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-[#fff1f2] mb-1">
              PURGATORIUM: THE FORBIDDEN TRIAL
            </h2>
            <p className="text-xs font-mono-clean text-rose-300 mb-6 font-semibold">
              "Ten trials. Seven minutes. One final treasure."
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  sound.playCurseWhisper();
                  onBeginPurgatoriumTrials();
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-cinzel font-bold text-sm tracking-widest text-[#fff1f2] bg-gradient-to-r from-rose-800 via-rose-600 to-rose-800 hover:from-rose-700 hover:to-rose-500 border border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>BEGIN THE 7-MINUTE TRIAL</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  sound.playStoneClick();
                  onReturnToMainGame();
                }}
                className="w-full sm:w-auto px-4 py-3.5 rounded-xl font-cinzel text-xs text-rose-300 hover:text-white bg-black/60 hover:bg-black/90 border border-rose-900 transition-colors cursor-pointer"
              >
                Return to Normal Trek
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
