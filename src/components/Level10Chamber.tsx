import React, { useState } from 'react';
import { GamePlaythroughState, GameStateUpdater } from '../types/game';
import { sound } from '../audio/soundManager';
import { ArrowLeftRight, CheckCircle2, Lock, KeyRound, Scroll, Sparkles } from 'lucide-react';

interface Level10ChamberProps {
  gameState: GamePlaythroughState;
  onUpdateState: (update: GameStateUpdater) => void;
  onVictory: () => void;
  onOpenScroll: () => void;
}

export const Level10Chamber: React.FC<Level10ChamberProps> = ({
  gameState,
  onUpdateState,
  onVictory,
  onOpenScroll,
}) => {
  const { level10, level9 } = gameState;
  const isGateUnlocked = gameState.completedLevels.includes(9);
  const [enteredGateCode, setEnteredGateCode] = useState('');
  const [isGateOpen, setIsGateOpen] = useState(isGateUnlocked);
  const [gateError, setGateError] = useState(false);

  // Selected stone index for click-to-swap
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [currentOrder, setCurrentOrder] = useState<number[]>(level10.currentOrder);
  const [feedback, setFeedback] = useState<string | null>(level10.feedbackMessage);

  const handleUnlockGate = (codeToTest: string) => {
    sound.playStoneClick();
    const cleanCode = codeToTest.trim().replace(/\s+/g, '-');
    if (cleanCode === level9.unlockedCode || cleanCode.replace(/-/g, '') === level9.unlockedCode.replace(/-/g, '')) {
      sound.playStoneSlide();
      setIsGateOpen(true);
      setGateError(false);
    } else {
      sound.playMismatchThud();
      setGateError(true);
    }
  };

  const handleSlotClick = (index: number) => {
    if (level10.isSolved) return;
    sound.playStoneClick();

    if (selectedSlotIndex === null) {
      setSelectedSlotIndex(index);
    } else if (selectedSlotIndex === index) {
      setSelectedSlotIndex(null);
    } else {
      // SWAP relics at selectedSlotIndex and index!
      const newOrder = [...currentOrder];
      const temp = newOrder[selectedSlotIndex];
      newOrder[selectedSlotIndex] = newOrder[index];
      newOrder[index] = temp;

      setCurrentOrder(newOrder);
      setSelectedSlotIndex(null);
      setFeedback(null);
    }
  };

  const handleCheckOrder = () => {
    sound.playStoneClick();
    let correctCount = 0;
    for (let i = 0; i < 4; i++) {
      if (currentOrder[i] === level10.correctOrder[i]) {
        correctCount++;
      }
    }

    if (correctCount === 4) {
      // ALL 4 HARMONIZED!
      sound.playStoneSlide();
      sound.playTreasureVictory();
      const msg = 'All four sacred relics align in cosmic harmony! The Last Seal of the Lost Pharaoh shatters forever!';
      setFeedback(msg);

      onUpdateState((prev) => ({
        ...prev,
        level10: {
          ...prev.level10,
          currentOrder,
          feedbackMessage: msg,
          isSolved: true,
        },
        completedLevels: !prev.completedLevels.includes(10)
          ? [...prev.completedLevels, 10]
          : prev.completedLevels,
      }));

      // Trigger victory sequence
      setTimeout(() => {
        onVictory();
      }, 900);
    } else {
      sound.playMismatchThud();
      const err = `The golden altar rumbles in rejection — ${correctCount} of the 4 sacred relics resonate in alignment. Consult the wall inscriptions!`;
      setFeedback(err);
      onUpdateState((prev) => ({
        ...prev,
        level10: {
          ...prev.level10,
          currentOrder,
          feedbackMessage: err,
        },
      }));
    }
  };

  const pedestalLabels = [
    { title: 'I. Pedestal of Dawn', desc: 'First Station of the Morning Sun' },
    { title: 'II. Pedestal of Winds', desc: 'Second Station of Desert Winds' },
    { title: 'III. Basin of the Nile', desc: 'Third Station of Sacred Waters' },
    { title: 'IV. Portal of the Duat', desc: 'Final Station of the Underworld' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Chamber Header */}
      <div className="w-full stone-panel rounded-xl p-5 mb-6 text-center border-t-2 border-[#d4af37]">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="text-left">
            <span className="text-[11px] font-mono-clean text-[#40e0d0] uppercase tracking-widest turquoise-glow">
              Chamber X · Neb-Amenti
            </span>
            <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-[#f7e096]">
              The Last Seal: The Lost Pharaoh
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-cinzel text-[#d4af37] bg-[#1a120c] px-3 py-1.5 rounded-lg border border-[#8c6d31]">
              Status: {level10.isSolved ? 'Seal Shattered' : 'Cosmic Alignment Required'}
            </span>
            <button
              onClick={onOpenScroll}
              className="text-xs font-cinzel text-[#f3e6cf] hover:text-[#f8d486] underline underline-offset-4 decoration-[#8c6d31] transition-colors"
            >
              Read Scroll
            </button>
          </div>
        </div>
        <p className="text-xs text-[#bda482] font-sans-clean max-w-2xl mx-auto">
          The ultimate sanctum of eternity. You have recovered the four sacred relics and their hidden numbers across Chambers VI to IX. Place them on the golden altar pedestals in divine mythological alignment!
        </p>
      </div>

      {/* If Chamber Portal is Still Sealed */}
      {!isGateOpen ? (
        <div className="w-full max-w-md stone-panel rounded-2xl p-6 border-2 border-[#b88c3a] text-center my-8 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#20150d] border border-[#8c6d31] flex items-center justify-center text-[#d4af37] mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-cinzel font-bold text-[#f7e096] mb-2">
            The Golden Sarcophagus Gate is Sealed
          </h2>
          <p className="text-xs text-[#a98f6d] mb-4">
            Enter the 4-digit code recovered from Chamber IX (The Papyrus Cipher) to enter the Final Altar Sanctum.
          </p>

          <div className="flex items-center justify-center gap-2 mb-3">
            <input
              type="text"
              value={enteredGateCode}
              onChange={(e) => setEnteredGateCode(e.target.value)}
              placeholder="e.g. 7-2-9-4"
              className="px-4 py-2.5 bg-[#120d09] border border-[#6b502d] rounded-lg text-center font-mono-clean font-bold tracking-widest text-lg text-[#f7e096] focus:outline-none focus:border-[#d4af37] w-48"
            />
            <button
              onClick={() => handleUnlockGate(enteredGateCode)}
              className="px-4 py-2.5 font-cinzel text-xs font-bold text-[#140e0a] bg-gradient-to-r from-[#e6c46e] to-[#c79c3c] rounded-lg hover:from-[#f5d78a] hover:to-[#dbaf4c] shadow transition-all cursor-pointer"
            >
              Unseal
            </button>
          </div>

          {gateError && (
            <p className="text-xs text-rose-400 font-sans-clean mb-3">
              The lock mechanism resists. Verify the code from Chamber IX.
            </p>
          )}

          {level9.isSolved && (
            <button
              onClick={() => {
                setEnteredGateCode(level9.unlockedCode);
                handleUnlockGate(level9.unlockedCode);
              }}
              className="text-xs font-sans-clean text-[#d4af37] hover:underline flex items-center justify-center gap-1.5 mx-auto mt-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Use Code from Journal: {level9.unlockedCode}
            </button>
          )}
        </div>
      ) : (
        /* The Active Cosmic Altar Alignment */
        <div className="w-full max-w-3xl stone-panel rounded-2xl p-6 sm:p-8 border-2 border-[#b88c3a] shadow-2xl mb-8">
          {/* Wall Inscription Clues */}
          <div className="bg-[#120c08] border border-[#6b502d] rounded-xl p-5 mb-8">
            <div className="flex items-center gap-2 mb-3 text-[#d4af37]">
              <Scroll className="w-4 h-4" />
              <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider">
                Temple Wall Inscriptions (The Four Cosmic Stations)
              </h3>
            </div>
            <p className="text-xs text-[#a98f6d] font-sans-clean mb-3">
              Study the divine inscriptions preserved upon the golden columns to deduce each sacred relic’s true station:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {level10.clues.map((clue, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#1c130b] border border-[#523d24] text-xs font-sans-clean text-[#ebd9ba] flex items-start gap-2.5"
                >
                  <span className="text-[#d4af37] text-sm">𓇳</span>
                  <span className="leading-relaxed">"{clue.text}"</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Pedestals & Relics */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-cinzel font-bold text-[#f7e096]">
                The Four Golden Altar Pedestals:
              </span>
              <span className="text-[11px] text-[#a98f6d] flex items-center gap-1">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Click two stones to swap their positions
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {currentOrder.map((relicId, slotIdx) => {
                const relic = level10.relics.find((r) => r.id === relicId)!;
                const isSelected = selectedSlotIndex === slotIdx;
                const isCorrect = level10.isSolved && level10.correctOrder[slotIdx] === relicId;

                return (
                  <div
                    key={slotIdx}
                    onClick={() => handleSlotClick(slotIdx)}
                    className={`rounded-xl p-4 flex flex-col items-center justify-between text-center transition-all cursor-pointer border-2 min-h-[175px] ${
                      isCorrect
                        ? 'bg-gradient-to-b from-[#112a21] to-[#0c1a15] border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
                        : isSelected
                        ? 'bg-gradient-to-b from-[#422f1b] to-[#25170d] border-[#f7e096] shadow-[0_0_20px_rgba(247,224,150,0.4)] scale-103'
                        : 'bg-gradient-to-b from-[#24170e] to-[#140c07] border-[#6b502d] hover:border-[#40e0d0] hover:scale-101'
                    }`}
                  >
                    {/* Pedestal Header */}
                    <div className="mb-2">
                      <span className="text-[10px] font-mono-clean font-bold text-[#a98f6d] block uppercase tracking-wider">
                        {pedestalLabels[slotIdx].title}
                      </span>
                    </div>

                    {/* Relic Symbol & Name */}
                    <div className="my-1">
                      <span className="text-4xl text-[#f7e096] hieroglyph-glow block mb-1">
                        {relic.glyphChar}
                      </span>
                      <span className="text-[11px] font-cinzel font-semibold text-[#ebd9ba] block truncate">
                        {relic.glyphName}
                      </span>
                    </div>

                    {/* Hidden Number Footer */}
                    <div className="mt-2 w-full pt-2 border-t border-[#523d24]/60">
                      <span className="text-xs font-mono-clean font-bold text-[#40e0d0] px-2 py-0.5 rounded bg-[#0d0805] border border-[#2d8299] inline-block">
                        Seal #{relic.originLevel}: {relic.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-3.5 rounded-lg text-xs font-sans-clean font-semibold text-center mb-5 border ${
                level10.isSolved
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                  : 'bg-[#29170e] border-[#8a4e2b] text-[#f7c28d]'
              }`}
            >
              {feedback}
            </div>
          )}

          {/* Submit Action */}
          {!level10.isSolved ? (
            <button
              onClick={handleCheckOrder}
              className="w-full py-4 px-6 font-cinzel font-bold text-sm text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>Break the Last Seal (Align the Sacred Relics)</span>
            </button>
          ) : (
            <div className="border-t border-[#6e502c] pt-5 mt-2 animate-in fade-in duration-300 text-center">
              <div className="flex items-center justify-center gap-2 mb-3 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-cinzel font-bold text-sm">
                  The Last Seal is Broken! The Golden Treasure Chamber Swings Open!
                </span>
              </div>
              <p className="text-xs text-[#a98f6d] mb-4">
                The massive golden doors part with a blaze of eternal light. The lost wealth of the Pharaoh is yours!
              </p>
              <button
                onClick={onVictory}
                className="w-full py-4 px-6 font-cinzel font-bold text-base text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.7)] transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>Enter the Pharaoh’s Golden Treasure Chamber!</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
