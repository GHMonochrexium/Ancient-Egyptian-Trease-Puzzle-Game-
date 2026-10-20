import React, { useState, useEffect } from 'react';
import { sound } from '../audio/soundManager';
import { Trophy, Sparkles, RotateCcw, Crown, Shield, Eye, Flame, Compass } from 'lucide-react';

interface SecretTreasureEndingProps {
  onReplayAct3: () => void;
  onReturnToMainGame: () => void;
  onFullRestart: () => void;
}

export const SecretTreasureEnding: React.FC<SecretTreasureEndingProps> = ({
  onReplayAct3,
  onReturnToMainGame,
  onFullRestart,
}) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    sound.playVictoryFanfare();
    try {
      localStorage.setItem('egyptian_hunt_secret_ending_unlocked', 'true');
    } catch {
      // ignore
    }

    // Dramatic staged reveals
    const s1 = setTimeout(() => setStage(1), 2200);
    const s2 = setTimeout(() => setStage(2), 5000);
    const s3 = setTimeout(() => setStage(3), 8000);
    const s4 = setTimeout(() => setStage(4), 11200);
    const s5 = setTimeout(() => setStage(5), 14500);

    return () => {
      clearTimeout(s1);
      clearTimeout(s2);
      clearTimeout(s3);
      clearTimeout(s4);
      clearTimeout(s5);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-y-auto px-4 py-8">
      {/* Background Dark Celestial Realm Ambiance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.25),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      </div>

      <div className="relative z-10 max-w-3xl w-full mx-auto text-center">
        {/* STAGES 0 to 4: DRAMATIC NARRATIVE REVEAL */}
        {stage < 5 && (
          <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header discovery quote */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#270b3b] border-2 border-[#a855f7] text-[#f5d0fe] text-xs font-mono-clean uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(168,85,247,0.7)]">
              <Sparkles className="w-4 h-4 text-[#e879f9]" />
              <span>THE FORBIDDEN TREASURE HAS BEEN FOUND.</span>
              <Sparkles className="w-4 h-4 text-[#e879f9]" />
            </div>

            {/* Stage Quotes */}
            <div className="min-h-[160px] flex flex-col items-center justify-center space-y-4">
              {stage >= 1 && (
                <p className="text-xl sm:text-2xl md:text-3xl font-cinzel font-bold text-[#faf5ff] tracking-wider animate-in fade-in duration-700 drop-shadow-[0_2px_12px_rgba(192,132,252,0.8)]">
                  "YOU HAVE FOUND WHAT WAS NEVER MEANT TO BE DISCOVERED."
                </p>
              )}
              {stage >= 2 && (
                <p className="text-lg sm:text-xl font-cinzel text-[#c084fc] italic tracking-wide animate-in fade-in duration-700">
                  "THE ANCIENT SEALS HAVE FALLEN."
                </p>
              )}
              {stage >= 3 && (
                <p className="text-xl sm:text-2xl font-cinzel text-[#e879f9] font-semibold tracking-wide animate-in fade-in duration-700">
                  "THE PHARAOH WAS NOT GUARDING THE TREASURE."
                </p>
              )}
              {stage >= 4 && (
                <p className="text-2xl sm:text-3xl md:text-4xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f43f5e] tracking-widest animate-in zoom-in-95 duration-1000 drop-shadow-[0_0_25px_rgba(244,63,94,0.9)]">
                  "HE WAS GUARDING THE WORLD FROM YOU."
                </p>
              )}
            </div>

            <button
              onClick={() => setStage(5)}
              className="text-xs font-cinzel text-[#d8b4fe]/70 hover:text-[#faf5ff] underline underline-offset-4 cursor-pointer mt-4"
            >
              Skip to Finale →
            </button>
          </div>
        )}

        {/* STAGE 5: DEDICATED SECRET ENDING SCREEN */}
        {stage >= 5 && (
          <div className="p-6 sm:p-10 rounded-2xl bg-gradient-to-b from-[#180927] via-[#0d0416] to-black border-2 border-[#a855f7] shadow-[0_0_60px_rgba(168,85,247,0.5)] text-center animate-in zoom-in-95 duration-700">
            {/* Crown Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#3b0764] border border-[#c084fc] text-[#f5d0fe] text-xs font-cinzel font-bold mb-4 shadow-[0_0_20px_rgba(192,132,252,0.5)]">
              <Crown className="w-4 h-4 text-[#f5d0fe]" />
              <span>SECRET ENDING UNLOCKED</span>
              <Crown className="w-4 h-4 text-[#f5d0fe]" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-cinzel font-black tracking-widest text-[#faf5ff] mb-2 uppercase">
              THE FORBIDDEN COSMIC CROWN OF APEP
            </h1>
            <p className="text-xs sm:text-sm font-cinzel italic text-[#c084fc] max-w-lg mx-auto mb-6">
              "Ten trials conquered in seven minutes. The Dark Realm awakens under your dominion."
            </p>

            {/* Treasure Artifact Image Presentation */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 mx-auto rounded-2xl overflow-hidden border-2 border-[#e879f9] shadow-[0_0_40px_rgba(232,121,249,0.7)] mb-6 bg-black">
              <img
                src="/src/assets/images/forbidden_cosmic_treasure_1791721952385.jpg"
                alt="The Forbidden Cosmic Crown of Apep"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover animate-pulse duration-[5000ms]"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            {/* Lore Revelation */}
            <div className="p-4 rounded-xl bg-[#200a35]/90 border border-[#7e22ce] text-xs sm:text-sm text-[#e9d5ff] font-sans-clean leading-relaxed max-w-xl mx-auto mb-8">
              The ten chambers of the pyramid were never built to bury gold. They were an eternal cosmic lock binding the Dark Realm. By conquering Purgatorium in seven minutes, you shattered the final seal. The celestial Pharaoh's crown is yours, and the cosmos itself bends to your name.
            </div>

            {/* Badges */}
            <div className="flex items-center justify-center gap-3 flex-wrap mb-8 text-xs font-mono-clean font-bold">
              <span className="px-3.5 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300 shadow">
                ★ 7-Minute Purgatorium Cleared
              </span>
              <span className="px-3.5 py-1.5 rounded-lg bg-[#3b0764] border border-[#c084fc] text-[#f5d0fe] shadow">
                ★ All 10 Enhanced Trials Surpassed
              </span>
              <span className="px-3.5 py-1.5 rounded-lg bg-rose-950 border border-rose-500 text-rose-300 shadow">
                ★ Sovereign of the Dark Realm
              </span>
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                onClick={() => {
                  sound.playCurseWhisper();
                  onReplayAct3();
                }}
                className="w-full sm:w-auto flex-1 py-3.5 px-6 font-cinzel font-bold text-xs tracking-wider text-[#12071f] bg-gradient-to-r from-[#e9d5ff] to-[#c084fc] hover:from-[#f5d0fe] hover:to-[#e879f9] rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.5)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay Purgatorium</span>
              </button>

              <button
                onClick={() => {
                  sound.playStoneClick();
                  onReturnToMainGame();
                }}
                className="w-full sm:w-auto py-3.5 px-5 font-cinzel text-xs font-semibold text-[#d8b4fe] hover:text-[#faf5ff] bg-[#1d0e2f] hover:bg-[#2b1445] border border-[#7e22ce] rounded-xl transition-all cursor-pointer"
              >
                Return to Main Game
              </button>

              <button
                onClick={() => {
                  sound.playStoneSlide();
                  onFullRestart();
                }}
                className="w-full sm:w-auto py-3.5 px-4 font-cinzel text-xs text-[#a855f7] hover:text-[#e9d5ff] bg-black/60 border border-[#4c1d95] rounded-xl transition-colors cursor-pointer"
              >
                Fresh Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
