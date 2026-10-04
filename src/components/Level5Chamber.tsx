import React, { useState } from 'react';
import { GamePlaythroughState } from '../types/game';
import { sound } from '../audio/soundManager';
import { ArrowRight, CheckCircle2, Lock, KeyRound, ArrowLeftRight, Scroll, Sparkles } from 'lucide-react';

interface Level5ChamberProps {
  gameState: GamePlaythroughState;
  onUpdateState: (newState: Partial<GamePlaythroughState>) => void;
  onProceedToLevel: (levelId: number) => void;
  onOpenScroll: () => void;
}

export const Level5Chamber: React.FC<Level5ChamberProps> = ({
  gameState,
  onUpdateState,
  onProceedToLevel,
  onOpenScroll,
}) => {
  const { level5, level4 } = gameState;
  const isGateUnlocked = gameState.completedLevels.includes(4);
  const [enteredGateCode, setEnteredGateCode] = useState('');
  const [isGateOpen, setIsGateOpen] = useState(isGateUnlocked);
  const [gateError, setGateError] = useState(false);

  // Selected stone index for click-to-swap
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [currentOrder, setCurrentOrder] = useState<number[]>(level5.currentOrder);
  const [feedback, setFeedback] = useState<string | null>(level5.feedbackMessage);

  const handleUnlockGate = (codeToTest: string) => {
    sound.playStoneClick();
    const cleanCode = codeToTest.trim().replace(/\s+/g, '-');
    if (cleanCode === level4.unlockedCode || cleanCode.replace(/-/g, '') === level4.unlockedCode.replace(/-/g, '')) {
      sound.playStoneSlide();
      setIsGateOpen(true);
      setGateError(false);
    } else {
      sound.playMismatchThud();
      setGateError(true);
    }
  };

  const handleSlotClick = (index: number) => {
    if (level5.isSolved) return;
    sound.playStoneClick();

    if (selectedSlotIndex === null) {
      // Select this slot
      setSelectedSlotIndex(index);
    } else if (selectedSlotIndex === index) {
      // Deselect
      setSelectedSlotIndex(null);
    } else {
      // SWAP stones at selectedSlotIndex and index!
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
    // Compare currentOrder with correctOrder
    let correctCount = 0;
    for (let i = 0; i < 4; i++) {
      if (currentOrder[i] === level5.correctOrder[i]) {
        correctCount++;
      }
    }

    if (correctCount === 4) {
      // ALL 4 CORRECT!
      sound.playStoneSlide();
      sound.playCodeUnlock();
      const updatedLevel5 = {
        ...level5,
        currentOrder,
        feedbackMessage: 'All four cosmic stones resonate! The colossal obsidian gate of Purgatory grinds open!',
        isSolved: true,
      };

      onUpdateState({
        level5: updatedLevel5,
        completedLevels: !gameState.completedLevels.includes(5)
          ? [...gameState.completedLevels, 5]
          : gameState.completedLevels,
        highestDiscoveredLevel: Math.max(gameState.highestDiscoveredLevel, 6),
      });
      setFeedback(updatedLevel5.feedbackMessage);
    } else {
      sound.playMismatchThud();
      const msg = `The altar shakes violently — ${correctCount} of the 4 sacred stones resonate in harmony, but the mechanism remains locked. Re-read the wall inscriptions.`;
      setFeedback(msg);
      onUpdateState({
        level5: {
          ...level5,
          currentOrder,
          feedbackMessage: msg,
        },
      });
    }
  };

  const pedestalLabels = [
    { title: 'I. Portal of Dawn', desc: 'First Station of the Morning Sun' },
    { title: 'II. Hall of Winds', desc: 'Second Station of Desert Winds' },
    { title: 'III. Altar of the Nile', desc: 'Third Station of the Sacred Waters' },
    { title: 'IV. Gate of the Underworld', desc: 'Final Station of the Duat' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Chamber Header */}
      <div className="w-full stone-panel rounded-xl p-5 mb-6 text-center border-t-2 border-[#d4af37]">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="text-left">
            <span className="text-[11px] font-mono-clean text-[#a98f6d] uppercase tracking-widest">
              Chamber V · Ma’at-User
            </span>
            <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-[#f7e096]">
              The Chamber of the Pharaoh’s Order
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-cinzel text-[#d4af37] bg-[#1a120c] px-3 py-1.5 rounded-lg border border-[#8c6d31]">
              Status: {level5.isSolved ? 'Portal Open' : 'Alignment Required'}
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
          The four sacred numbers gathered from your previous trials must now be ordered upon the pedestals in mythological alignment to unseal Purgatory.
        </p>
      </div>

      {/* If Chamber Portal is Still Sealed */}
      {!isGateOpen ? (
        <div className="w-full max-w-md stone-panel rounded-2xl p-6 border-2 border-[#b88c3a] text-center my-8 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#20150d] border border-[#8c6d31] flex items-center justify-center text-[#d4af37] mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-cinzel font-bold text-[#f7e096] mb-2">
            The Sanctum Archway is Sealed
          </h2>
          <p className="text-xs text-[#a98f6d] mb-4">
            Enter the 4-digit code awarded by Bastet in Chamber IV to enter the sanctum of alignment.
          </p>

          <div className="flex items-center justify-center gap-2 mb-3">
            <input
              type="text"
              value={enteredGateCode}
              onChange={(e) => setEnteredGateCode(e.target.value)}
              placeholder="e.g. 9-1-4-6"
              className="px-4 py-2.5 bg-[#120d09] border border-[#6b502d] rounded-lg text-center font-mono-clean font-bold tracking-widest text-lg text-[#f7e096] focus:outline-none focus:border-[#d4af37] w-48"
            />
            <button
              onClick={() => handleUnlockGate(enteredGateCode)}
              className="px-4 py-2.5 font-cinzel text-xs font-bold text-[#140e0a] bg-gradient-to-r from-[#e6c46e] to-[#c79c3c] rounded-lg hover:from-[#f5d78a] hover:to-[#dbaf4c] shadow transition-all"
            >
              Unseal
            </button>
          </div>

          {gateError && (
            <p className="text-xs text-rose-400 font-sans-clean mb-3">
              The lock mechanism resists. Verify the code from Chamber IV.
            </p>
          )}

          {level4.isSolved && (
            <button
              onClick={() => {
                setEnteredGateCode(level4.unlockedCode);
                handleUnlockGate(level4.unlockedCode);
              }}
              className="text-xs font-sans-clean text-[#d4af37] hover:underline flex items-center justify-center gap-1.5 mx-auto mt-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Use Code from Journal: {level4.unlockedCode}
            </button>
          )}
        </div>
      ) : (
        /* The Active Ordering Puzzle */
        <div className="w-full max-w-3xl stone-panel rounded-2xl p-6 sm:p-8 border-2 border-[#b88c3a] shadow-2xl mb-8">
          {/* Wall Inscription Clues */}
          <div className="bg-[#120c08] border border-[#6b502d] rounded-xl p-5 mb-8">
            <div className="flex items-center gap-2 mb-3 text-[#d4af37]">
              <Scroll className="w-4 h-4" />
              <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider">
                Temple Wall Inscriptions (The Sacred Stations)
              </h3>
            </div>
            <p className="text-xs text-[#a98f6d] font-sans-clean mb-3">
              Study the divine inscriptions preserved upon the tomb pillars to deduce each sacred stone’s true position:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {level5.clues.map((clue, idx) => (
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

          {/* Interactive Pedestals & Stones Shelf */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-cinzel font-bold text-[#f7e096]">
                The Four Sacred Altar Pedestals:
              </span>
              <span className="text-[11px] text-[#a98f6d] flex items-center gap-1">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Click two stones to swap their positions
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {currentOrder.map((tokenId, slotIdx) => {
                const token = gameState.sacredTokens.find((t) => t.id === tokenId)!;
                const isSelected = selectedSlotIndex === slotIdx;
                const isCorrect = level5.isSolved && level5.correctOrder[slotIdx] === tokenId;

                return (
                  <div
                    key={slotIdx}
                    onClick={() => handleSlotClick(slotIdx)}
                    className={`rounded-xl p-4 flex flex-col items-center justify-between text-center transition-all cursor-pointer border-2 min-h-[170px] ${
                      isCorrect
                        ? 'bg-gradient-to-b from-[#25381f] to-[#121c10] border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                        : isSelected
                        ? 'bg-gradient-to-b from-[#422f1b] to-[#25170d] border-[#f7e096] shadow-[0_0_20px_rgba(247,224,150,0.4)] scale-103'
                        : 'bg-gradient-to-b from-[#24170e] to-[#140c07] border-[#6b502d] hover:border-[#bca378] hover:scale-101'
                    }`}
                  >
                    {/* Pedestal Header */}
                    <div className="mb-2">
                      <span className="text-[10px] font-mono-clean font-bold text-[#a98f6d] block uppercase tracking-wider">
                        {pedestalLabels[slotIdx].title}
                      </span>
                    </div>

                    {/* Stone & Rune Display */}
                    <div className="my-1">
                      <span className="text-4xl text-[#f7e096] hieroglyph-glow block mb-1">
                        {token.glyphChar}
                      </span>
                      <span className="text-[11px] font-cinzel font-semibold text-[#ebd9ba] block truncate">
                        {token.glyphName}
                      </span>
                    </div>

                    {/* Number Value Footer */}
                    <div className="mt-2 w-full pt-2 border-t border-[#523d24]/60">
                      <span className="text-xs font-mono-clean font-bold text-[#f7e096] px-2 py-0.5 rounded bg-[#0d0805] border border-[#5a4224] inline-block">
                        Carved: {token.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback & Result */}
          {feedback && (
            <div
              className={`p-3.5 rounded-lg text-xs font-sans-clean font-semibold text-center mb-5 border ${
                level5.isSolved
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                  : 'bg-[#29170e] border-[#8a4e2b] text-[#f7c28d]'
              }`}
            >
              {feedback}
            </div>
          )}

          {/* Action Button: Check / Submit Alignment */}
          {!level5.isSolved ? (
            <button
              onClick={handleCheckOrder}
              className="w-full py-3.5 px-6 font-cinzel font-bold text-xs sm:text-sm text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Align the Four Sacred Stones</span>
            </button>
          ) : (
            <div className="border-t border-[#6e502c] pt-5 mt-2 animate-in fade-in duration-300 text-center">
              <div className="flex items-center justify-center gap-2 mb-3 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-cinzel font-bold text-sm">
                  The Cosmic Seal of the Pharaoh is Aligned
                </span>
              </div>
              <p className="text-xs text-[#a98f6d] mb-4">
                The massive monolithic slabs part with a thunderous groan. Beyond lies the forbidden ruin of Purgatory.
              </p>

              <button
                onClick={() => {
                  sound.playStoneSlide();
                  onProceedToLevel(6);
                }}
                className="w-full py-4 px-6 font-cinzel font-bold text-sm text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-2xl transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Descend into Level 6: PURGATORY (Final Trial)</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
