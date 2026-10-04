import React, { useState } from 'react';
import { sound } from '../audio/soundManager';
import { Compass, BookOpen, Volume2, VolumeX, Sparkles, Play, Shield, Info, X } from 'lucide-react';

interface TitleMenuProps {
  onStartGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isMusicMuted: boolean;
  onToggleMusic: () => void;
}

export const TitleMenu: React.FC<TitleMenuProps> = ({
  onStartGame,
  isMuted,
  onToggleMute,
  isMusicMuted,
  onToggleMusic,
}) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  return (
    <div className="relative min-h-[90vh] w-full flex items-center justify-center p-4">
      {/* Background Temple Chamber Image */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden border-2 border-[#8c6d31]/50 shadow-2xl">
        <img
          src="/src/assets/images/egyptian_temple_chamber_1791117251247.jpg"
          alt="Ancient Egyptian Temple Antechamber"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover scale-102"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0906] via-[#0c0906]/65 to-[#0c0906]/85"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-xl text-center stone-panel rounded-3xl p-6 sm:p-10 border-2 border-[#b88c3a] shadow-2xl text-[#ebd9ba]">
        {/* Sacred Emblem */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-b from-[#2b1b10] to-[#120a06] border-2 border-[#d4af37] flex items-center justify-center text-4xl mb-4 shadow-lg hieroglyph-glow">
          𓂀
        </div>

        <span className="text-xs sm:text-sm font-mono-clean text-[#e8c76e] font-bold tracking-[0.3em] uppercase block mb-1">
          Subterranean Escape Adventure
        </span>

        <h1 className="text-3xl sm:text-5xl font-cinzel font-black text-[#f7e096] hieroglyph-glow tracking-wider mb-4">
          ANCIENT EGYPTIAN TREASURE HUNT
        </h1>

        <p className="text-xs sm:text-sm text-[#ceb896] max-w-md mx-auto leading-relaxed mb-8 font-sans-clean">
          Trapped deep within an unmapped pharaonic necropolis, you must navigate six mysterious chambers, crack shifting ancient ciphers, and claim the lost treasure before time expires.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3 max-w-sm mx-auto mb-8">
          <button
            onClick={() => {
              sound.playStoneSlide();
              onStartGame();
            }}
            className="w-full py-4 px-6 font-cinzel font-bold text-base text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Enter the Tomb (Start Game)</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                sound.playStoneClick();
                setShowInstructions(true);
              }}
              className="py-2.5 px-4 font-cinzel text-xs font-semibold text-[#ebd9ba] bg-[#22160d] hover:bg-[#322013] border border-[#6b502d] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#d4af37]" />
              <span>How to Play</span>
            </button>

            <button
              onClick={() => {
                sound.playStoneClick();
                setShowCredits(true);
              }}
              className="py-2.5 px-4 font-cinzel text-xs font-semibold text-[#ebd9ba] bg-[#22160d] hover:bg-[#322013] border border-[#6b502d] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Info className="w-4 h-4 text-[#d4af37]" />
              <span>Lore & Credits</span>
            </button>
          </div>
        </div>

        {/* Audio Toggles */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-[#6b502d]/60 text-xs font-sans-clean text-[#a98f6d]">
          <button
            onClick={onToggleMusic}
            className="flex items-center gap-1.5 hover:text-[#f7e096] transition-colors"
          >
            {isMusicMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#d4af37]" />}
            <span>Music: {isMusicMuted ? 'Muted' : 'On'}</span>
          </button>
          <span>·</span>
          <button
            onClick={onToggleMute}
            className="flex items-center gap-1.5 hover:text-[#f7e096] transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#d4af37]" />}
            <span>SFX: {isMuted ? 'Muted' : 'On'}</span>
          </button>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl papyrus-panel rounded-2xl p-6 sm:p-8 border-2 border-[#84623a] text-[#ebd9ba] shadow-2xl">
            <button
              onClick={() => {
                sound.playStoneClick();
                setShowInstructions(false);
              }}
              className="absolute top-4 right-4 p-2 text-[#a88252] hover:text-[#f8d486]"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-cinzel font-bold text-[#f8de92] mb-3 text-center">
              Instructions for the Expedition
            </h2>
            <div className="space-y-3 text-xs sm:text-sm font-sans-clean text-[#decab0]">
              <p>
                <strong>1. Six Sacred Chambers:</strong> Progress through 6 consecutive trials: Hall of Glyphs, Crypt of the Cipher, Sandstorm Vault, Shrine of Bastet (Meowdo), the Pharaoh’s Order, and Purgatory.
              </p>
              <p>
                <strong>2. Fully Randomized Puzzles:</strong> Every playthrough generates brand-new cipher shifts, secret numbers, symbol placements, and incantations. No two expeditions are alike!
              </p>
              <p>
                <strong>3. Compass & Field Journal:</strong> Click the Compass in the top bar to inspect chamber bearings. Use the Field Journal to review all unsealed codes and recovered sacred tokens.
              </p>
              <p>
                <strong>4. Peril & Timers:</strong> Chamber III (Sandstorm) gives you 60 seconds; Chamber VI (Purgatory) gives you 10 minutes. If time expires, the temple seals your fate.
              </p>
            </div>

            <button
              onClick={() => {
                sound.playStoneClick();
                setShowInstructions(false);
              }}
              className="mt-6 w-full py-2.5 font-cinzel font-bold text-xs text-[#140e0a] bg-gradient-to-r from-[#e6c46e] to-[#c79c3c] rounded-lg"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Lore & Credits Modal */}
      {showCredits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg stone-panel rounded-2xl p-6 sm:p-8 border-2 border-[#b88c3a] text-[#ebd9ba] shadow-2xl">
            <button
              onClick={() => {
                sound.playStoneClick();
                setShowCredits(false);
              }}
              className="absolute top-4 right-4 p-2 text-[#a88252] hover:text-[#f8d486]"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-cinzel font-bold text-[#f8de92] mb-3 text-center">
              Ancient Lore & Credits
            </h2>
            <div className="space-y-3 text-xs sm:text-sm font-sans-clean text-[#decab0]">
              <p>
                Carved during the Dynasty of the Sun Kings, the Tomb of Eternity was engineered with cryptographic counterweights and astrological mechanisms to protect the sacred ankhs and golden relics of Osiris.
              </p>
              <p className="border-t border-[#6b502d] pt-3 text-xs text-[#a98f6d]">
                Built as a standalone, fully playable escape room game featuring procedural puzzle generation, Web Audio API synthesis, and atmospheric ancient Egyptian art.
              </p>
            </div>

            <button
              onClick={() => {
                sound.playStoneClick();
                setShowCredits(false);
              }}
              className="mt-6 w-full py-2.5 font-cinzel font-bold text-xs text-[#140e0a] bg-gradient-to-r from-[#e6c46e] to-[#c79c3c] rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
