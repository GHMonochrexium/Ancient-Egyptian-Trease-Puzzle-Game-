import React from 'react';
import { GamePlaythroughState } from '../types/game';
import { sound } from '../audio/soundManager';
import { BookOpen, X, KeyRound, Sparkles, ShieldCheck } from 'lucide-react';

interface JournalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GamePlaythroughState;
}

export const JournalDrawer: React.FC<JournalDrawerProps> = ({
  isOpen,
  onClose,
  gameState,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full stone-panel border-l-2 border-[#b88c3a] p-6 overflow-y-auto text-[#f1e3cc] shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#725227] pb-4 mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#d4af37]" />
              <h2 className="text-lg font-cinzel font-bold text-[#f7df94] tracking-wider">
                Explorer’s Field Journal
              </h2>
            </div>
            <button
              onClick={() => {
                sound.playStoneClick();
                onClose();
              }}
              className="p-1.5 text-[#bca378] hover:text-[#f8d486] transition-colors rounded-lg hover:bg-[#342416]"
              aria-label="Close journal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Discovered Chamber Gateway Codes */}
          <div className="mb-6">
            <h3 className="text-xs font-cinzel font-bold text-[#e8c76e] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#d4af37]" />
              Discovered Chamber Codes
            </h3>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((lvl) => {
                const isSolved = gameState.completedLevels.includes(lvl);
                const code = gameState.levelCodes[lvl];
                return (
                  <div
                    key={lvl}
                    className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                      isSolved
                        ? 'bg-[#22160d] border-[#8a6835] text-[#f7e096]'
                        : 'bg-[#150f0b] border-[#362618] text-[#7d674f]'
                    }`}
                  >
                    <div>
                      <span className="font-cinzel font-semibold">Chamber {lvl} Key</span>
                      <p className="text-[10px] text-[#9c8263]">
                        {lvl === 1 && 'Unlocks Chamber II (Crypt)'}
                        {lvl === 2 && 'Unlocks Chamber III (Sandstorm)'}
                        {lvl === 3 && 'Unlocks Chamber IV (Shrine)'}
                        {lvl === 4 && 'Unlocks Chamber V (Sanctum)'}
                      </p>
                    </div>
                    <span className="font-mono-clean font-bold tracking-widest text-sm px-2.5 py-1 rounded bg-[#0d0906] border border-[#5a4224]">
                      {isSolved ? code : '••••'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sacred Number Tokens Gathered (For Level 5) */}
          <div className="mb-6">
            <h3 className="text-xs font-cinzel font-bold text-[#e8c76e] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              Sacred Number Tokens (Altar Stones)
            </h3>
            <p className="text-[11px] text-[#a98f6d] mb-2 font-sans-clean">
              Inscribed stones recovered from your trials. Their alignment unlocks Purgatory.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {gameState.sacredTokens.map((token) => {
                const isFound = gameState.completedLevels.includes(token.originLevel);
                return (
                  <div
                    key={token.id}
                    className={`p-2.5 rounded-lg border text-center ${
                      isFound
                        ? 'bg-[#2b1c11] border-[#d4af37]/60 text-[#fcedae] shadow-sm'
                        : 'bg-[#140e0a] border-[#342417] text-[#634e38]'
                    }`}
                  >
                    <div className="text-2xl font-bold mb-0.5 hieroglyph-glow">
                      {isFound ? token.glyphChar : '?'}
                    </div>
                    <div className="text-[10px] font-cinzel font-medium text-[#bca378] truncate">
                      {token.glyphName}
                    </div>
                    <div className="text-xs font-mono-clean font-bold text-[#e8c76e] mt-1">
                      {isFound ? `Value: ${token.value}` : 'Locked in Chamber'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Level 5 Clue Inscriptions (if Chamber 5 discovered) */}
          {gameState.highestDiscoveredLevel >= 5 && (
            <div className="mb-6">
              <h3 className="text-xs font-cinzel font-bold text-[#e8c76e] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                Chamber V Wall Inscriptions
              </h3>
              <div className="space-y-1.5 text-xs font-sans-clean">
                {gameState.level5.clues.map((clue, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-[#1c130c] border border-[#6b502d] text-[#decab0]"
                  >
                    "{clue.text}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#725227] text-center">
          <button
            onClick={() => {
              sound.playStoneClick();
              onClose();
            }}
            className="w-full py-2.5 text-xs font-cinzel font-semibold text-[#160f0a] bg-gradient-to-r from-[#e6c46e] to-[#c79c3c] hover:from-[#f3d789] hover:to-[#dfaf4d] rounded-lg transition-all shadow-md active:scale-98"
          >
            Close Journal
          </button>
        </div>
      </div>
    </div>
  );
};
