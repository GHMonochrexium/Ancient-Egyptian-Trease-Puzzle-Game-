import React from 'react';
import { GamePlaythroughState } from '../types/game';
import { sound } from '../audio/soundManager';
import { BookOpen, X, KeyRound, Sparkles, ShieldCheck, Gem } from 'lucide-react';

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
      <div className="relative w-full max-w-md h-full stone-panel border-l-2 border-[#b88c3a] p-5 sm:p-6 overflow-y-auto text-[#f1e3cc] shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#725227] pb-4 mb-5">
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

          {/* ACT 1: Hidden Numbers (Levels 1–4, for Level 5) */}
          <div className="mb-5">
            <h3 className="text-xs font-cinzel font-bold text-[#e8c76e] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              Act I: Four Hidden Numbers (Key to Chamber V)
            </h3>
            <p className="text-[11px] text-[#a98f6d] mb-2 font-sans-clean">
              Subterranean numbers carved into the outer chambers to unlock Chamber V.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { lvl: 1, label: 'Chamber I (Slab)', val: gameState.level1.hiddenNumber },
                { lvl: 2, label: 'Chamber II (Stele)', val: gameState.level2.hiddenNumber },
                { lvl: 3, label: 'Chamber III (Storm)', val: gameState.level3.hiddenNumber },
                { lvl: 4, label: 'Chamber IV (Bastet)', val: gameState.level4.hiddenNumber },
              ].map((item) => {
                const isFound = gameState.completedLevels.includes(item.lvl);
                return (
                  <div
                    key={item.lvl}
                    className={`p-2.5 rounded-lg border text-center ${
                      isFound
                        ? 'bg-[#2b1c11] border-[#d4af37]/60 text-[#fcedae] shadow-sm'
                        : 'bg-[#140e0a] border-[#342417] text-[#634e38]'
                    }`}
                  >
                    <span className="text-[10px] font-cinzel block text-[#bca378]">
                      {item.label}
                    </span>
                    <span className="text-base font-mono-clean font-bold text-[#f7e096]">
                      {isFound ? `Seal #${item.lvl}: ${item.val}` : 'Locked in Chamber'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACT 2: Deep Tomb Relics & Hidden Numbers (Levels 6–9, for Level 10) */}
          <div className="mb-5">
            <h3 className="text-xs font-cinzel font-bold text-[#40e0d0] uppercase tracking-wider mb-1.5 flex items-center gap-1.5 turquoise-glow">
              <Gem className="w-4 h-4 text-[#40e0d0]" />
              Act II: Sacred Relics & Numbers (Key to Chamber X)
            </h3>
            <p className="text-[11px] text-[#a98f6d] mb-2 font-sans-clean">
              Sacred relics gathered from the deep tomb trials. Their alignment unseals the Treasure Vault.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { lvl: 6, name: 'Golden Scarab', glyph: '𓆣', val: gameState.level6.hiddenNumber },
                { lvl: 7, name: 'Lapis Cartouche', glyph: '𓊽', val: gameState.level7.hiddenNumber },
                { lvl: 8, name: 'Colossus Core', glyph: '𓅃', val: gameState.level8.hiddenNumber },
                { lvl: 9, name: 'Papyrus Sigil', glyph: '𓋹', val: gameState.level9.hiddenNumber },
              ].map((item) => {
                const isFound = gameState.completedLevels.includes(item.lvl);
                return (
                  <div
                    key={item.lvl}
                    className={`p-2.5 rounded-lg border text-center ${
                      isFound
                        ? 'bg-[#112327] border-[#40e0d0]/60 text-[#d2fbf5] shadow-sm'
                        : 'bg-[#140e0a] border-[#342417] text-[#634e38]'
                    }`}
                  >
                    <div className="text-xl font-bold mb-0.5">{isFound ? item.glyph : '?'}</div>
                    <span className="text-[10px] font-cinzel block text-[#9ce2db] truncate">
                      {item.name}
                    </span>
                    <span className="text-xs font-mono-clean font-bold text-[#40e0d0] mt-0.5 block">
                      {isFound ? `Value: ${item.val}` : 'Locked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Discovered Chamber Gateway Codes */}
          <div className="mb-5">
            <h3 className="text-xs font-cinzel font-bold text-[#e8c76e] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#d4af37]" />
              Discovered Gateway Keys
            </h3>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
                const isSolved = gameState.completedLevels.includes(lvl);
                const code = gameState.levelCodes[lvl];
                return (
                  <div
                    key={lvl}
                    className={`p-2 rounded-lg border flex items-center justify-between text-xs ${
                      isSolved
                        ? 'bg-[#22160d] border-[#8a6835] text-[#f7e096]'
                        : 'bg-[#150f0b] border-[#362618] text-[#7d674f]'
                    }`}
                  >
                    <div>
                      <span className="font-cinzel font-semibold text-[11px]">
                        Chamber {lvl} Key
                      </span>
                    </div>
                    <span className="font-mono-clean font-bold tracking-wider text-xs px-2 py-0.5 rounded bg-[#0d0906] border border-[#5a4224]">
                      {isSolved ? code : '••••'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chamber 10 Wall Clues if unlocked */}
          {gameState.highestDiscoveredLevel >= 10 && (
            <div className="mb-4">
              <h3 className="text-xs font-cinzel font-bold text-[#e8c76e] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                Chamber X Altar Inscriptions
              </h3>
              <div className="space-y-1 text-xs font-sans-clean">
                {gameState.level10.clues.map((clue, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded bg-[#1c130c] border border-[#6b502d] text-[#decab0] text-[11px]"
                  >
                    "{clue.text}"
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Act III: Purgatorium & Dark Realm Notes if discovered */}
          {gameState.act3.isDiscovered && (
            <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-[#200a35] to-[#12051f] border border-[#a855f7]/60">
              <h3 className="text-xs font-cinzel font-bold text-[#f5d0fe] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#e879f9]" />
                Act III: Purgatorium Records
              </h3>
              <p className="text-[11px] text-[#d8b4fe] font-sans-clean mb-2">
                Forbidden route unveiled through Chamber IV's scroll tear.
              </p>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono-clean">
                <div className={`p-1.5 rounded border ${gameState.act3.levelX.isSolved ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-[#1a082b] border-[#6b21a8] text-[#c084fc]'}`}>
                  Level X: {gameState.act3.levelX.isSolved ? 'Sacrificed' : 'Pending'}
                </div>
                <div className={`p-1.5 rounded border ${gameState.act3.levelY.isSolved ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-[#1a082b] border-[#6b21a8] text-[#c084fc]'}`}>
                  Level Y: {gameState.act3.levelY.isSolved ? 'Unwrapped' : 'Pending'}
                </div>
                <div className={`p-1.5 rounded border ${gameState.act3.levelZ.isSolved ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-[#1a082b] border-[#6b21a8] text-[#c084fc]'}`}>
                  Level Z: {gameState.act3.levelZ.isSolved ? 'Breached' : 'Pending'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#725227] text-center">
          <button
            onClick={() => {
              sound.playStoneClick();
              onClose();
            }}
            className="w-full py-2.5 text-xs font-cinzel font-semibold text-[#160f0a] bg-gradient-to-r from-[#e6c46e] to-[#c79c3c] hover:from-[#f3d789] hover:to-[#dfaf4d] rounded-lg transition-all shadow-md active:scale-98 cursor-pointer"
          >
            Close Journal
          </button>
        </div>
      </div>
    </div>
  );
};
