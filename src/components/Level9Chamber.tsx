import React, { useState } from 'react';
import { GamePlaythroughState, GameStateUpdater } from '../types/game';
import { decryptCaesar } from '../game/generator';
import { sound } from '../audio/soundManager';
import { ArrowRight, CheckCircle2, Lock, KeyRound, Sparkles, RotateCw, Scroll } from 'lucide-react';

interface Level9ChamberProps {
  gameState: GamePlaythroughState;
  onUpdateState: (update: GameStateUpdater) => void;
  onProceedToLevel: (levelId: number) => void;
  onOpenScroll: () => void;
}

export const Level9Chamber: React.FC<Level9ChamberProps> = ({
  gameState,
  onUpdateState,
  onProceedToLevel,
  onOpenScroll,
}) => {
  const { level9, level8 } = gameState;
  const isGateUnlocked = gameState.completedLevels.includes(8);
  const [enteredGateCode, setEnteredGateCode] = useState('');
  const [isGateOpen, setIsGateOpen] = useState(isGateUnlocked);
  const [gateError, setGateError] = useState(false);

  // Cipher controls
  const [shift, setShift] = useState(1);
  const [typedInput, setTypedInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const liveDecoded = decryptCaesar(level9.ciphertext, shift);

  const handleUnlockGate = (codeToTest: string) => {
    sound.playStoneClick();
    const cleanCode = codeToTest.trim().replace(/\s+/g, '-');
    if (cleanCode === level8.unlockedCode || cleanCode.replace(/-/g, '') === level8.unlockedCode.replace(/-/g, '')) {
      sound.playStoneSlide();
      setIsGateOpen(true);
      setGateError(false);
    } else {
      sound.playMismatchThud();
      setGateError(true);
    }
  };

  const handleShiftChange = (newShift: number) => {
    sound.playStoneClick();
    const normalized = ((newShift - 1 + 25) % 25) + 1;
    setShift(normalized);
    setFeedback(null);
  };

  const handleSubmitDecryption = () => {
    sound.playStoneClick();
    const candidate = (typedInput.trim() || liveDecoded).toUpperCase();
    const target = level9.plaintext.toUpperCase();

    if (candidate === target || liveDecoded.toUpperCase() === target) {
      sound.playCodeUnlock();
      setFeedback(`Correct! The Royal Papyrus reveals the sacred word: "${target}".`);

      onUpdateState((prev) => ({
        ...prev,
        level9: {
          ...prev.level9,
          userAnswer: target,
          isSolved: true,
        },
        completedLevels: !prev.completedLevels.includes(9)
          ? [...prev.completedLevels, 9]
          : prev.completedLevels,
        highestDiscoveredLevel: Math.max(prev.highestDiscoveredLevel, 10),
      }));
    } else {
      sound.playMismatchThud();
      setFeedback(`"${candidate}" is not the true sacred word of the papyrus. Adjust the alphabet shift stepper.`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Chamber Header */}
      <div className="w-full stone-panel rounded-xl p-5 mb-6 text-center border-t-2 border-[#d4af37]">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="text-left">
            <span className="text-[11px] font-mono-clean text-[#a98f6d] uppercase tracking-widest">
              Chamber IX · Djed-Papyrus
            </span>
            <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-[#f7e096]">
              The Papyrus Cipher (Trial of Secrets)
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-cinzel text-[#d4af37] bg-[#1a120c] px-3 py-1.5 rounded-lg border border-[#8c6d31]">
              Status: {level9.isSolved ? 'Deciphered' : 'Papyrus Active'}
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
          An ancient royal papyrus contains scrambled messages guarding the threshold to the Final Sanctum. Work out the letter displacement to uncover the secret word.
        </p>
      </div>

      {/* If Chamber Portal is Sealed */}
      {!isGateOpen ? (
        <div className="w-full max-w-md stone-panel rounded-2xl p-6 border-2 border-[#b88c3a] text-center my-8 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#20150d] border border-[#8c6d31] flex items-center justify-center text-[#d4af37] mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-cinzel font-bold text-[#f7e096] mb-2">
            The Papyrus Vault Door is Sealed
          </h2>
          <p className="text-xs text-[#a98f6d] mb-4">
            Enter the 4-digit code recovered from Chamber VIII (The Moving Guardian) to unseal the sacred papyrus stele.
          </p>

          <div className="flex items-center justify-center gap-2 mb-3">
            <input
              type="text"
              value={enteredGateCode}
              onChange={(e) => setEnteredGateCode(e.target.value)}
              placeholder="e.g. 5-1-9-2"
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
              The lock mechanism resists. Verify the code from Chamber VIII.
            </p>
          )}

          {level8.isSolved && (
            <button
              onClick={() => {
                setEnteredGateCode(level8.unlockedCode);
                handleUnlockGate(level8.unlockedCode);
              }}
              className="text-xs font-sans-clean text-[#d4af37] hover:underline flex items-center justify-center gap-1.5 mx-auto mt-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Use Code from Journal: {level8.unlockedCode}
            </button>
          )}
        </div>
      ) : (
        /* The Active Papyrus Cipher Puzzle */
        <div className="w-full max-w-2xl stone-panel rounded-2xl p-6 sm:p-8 border-2 border-[#b88c3a] shadow-2xl mb-8">
          {/* Papyrus Scroll Display */}
          <div className="text-center border-b border-[#6e502c] pb-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-1 text-[#d4af37]">
              <Scroll className="w-5 h-5" />
              <span className="text-[10px] font-mono-clean uppercase tracking-widest block">
                Royal Papyrus of the Sun King
              </span>
            </div>

            <div className="bg-[#1e140c] border-2 border-[#8c6d31] p-5 rounded-2xl inline-block max-w-full my-2 shadow-inner">
              <span className="text-[10px] font-cinzel text-[#8c6d31] uppercase tracking-wider block mb-1">
                Encrypted Papyrus Inscription
              </span>
              <span className="text-2xl sm:text-3xl font-mono-clean font-bold tracking-[0.3em] text-[#e8c76e] hieroglyph-glow">
                {level9.ciphertext}
              </span>
            </div>
            <p className="text-xs text-[#a98f6d] mt-2 italic font-sans-clean">
              Every letter has been displaced forward in the alphabet by a secret shift value.
            </p>
          </div>

          {/* Shift Stepper & Slider */}
          <div className="bg-[#1a120c] border border-[#5a4224] rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-cinzel font-bold text-[#f7e096]">
                Alphabet Shift Stepper:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShiftChange(shift - 1)}
                  className="w-8 h-8 rounded bg-[#2a1c12] border border-[#725227] text-[#f7e096] hover:bg-[#3d2919] font-bold text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="w-12 text-center font-mono-clean font-bold text-lg text-[#d4af37]">
                  +{shift}
                </span>
                <button
                  onClick={() => handleShiftChange(shift + 1)}
                  className="w-8 h-8 rounded bg-[#2a1c12] border border-[#725227] text-[#f7e096] hover:bg-[#3d2919] font-bold text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="25"
              value={shift}
              onChange={(e) => handleShiftChange(parseInt(e.target.value, 10))}
              className="w-full accent-[#d4af37] bg-[#2d1f14] h-2 rounded-lg cursor-pointer mb-4"
            />

            {/* Live Decoded Output Preview */}
            <div className="p-4 rounded-lg bg-[#0e0a07] border border-[#7c5d31] text-center mb-3">
              <span className="text-[10px] font-cinzel text-[#9c8263] uppercase tracking-wider block mb-1">
                Deciphered Translation at Shift +{shift}
              </span>
              <span className="text-2xl sm:text-3xl font-mono-clean font-bold tracking-[0.25em] text-[#f7e096]">
                {liveDecoded}
              </span>
            </div>

            {/* Direct Input fallback */}
            <div className="text-center">
              <span className="text-xs font-cinzel text-[#bca378] block mb-1">
                Word to Inscribe:
              </span>
              <input
                type="text"
                value={typedInput || liveDecoded}
                onChange={(e) => setTypedInput(e.target.value.toUpperCase())}
                placeholder="e.g. IMMORTAL"
                disabled={level9.isSolved}
                className="px-4 py-2.5 bg-[#0e0a07] border border-[#7c5d31] rounded-lg text-center font-mono-clean font-bold tracking-widest text-lg text-[#f7e096] focus:outline-none focus:border-[#d4af37] w-64 max-w-full mx-auto"
              />
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-3 rounded-lg text-xs font-sans-clean text-center mb-4 ${
                level9.isSolved
                  ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-700 text-rose-300'
              }`}
            >
              {feedback}
            </div>
          )}

          {/* Submit Action */}
          {!level9.isSolved ? (
            <button
              onClick={handleSubmitDecryption}
              className="w-full py-3.5 px-6 font-cinzel font-bold text-xs sm:text-sm text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Submit Decoded Word: "{typedInput || liveDecoded}"</span>
            </button>
          ) : (
            <div className="border-t border-[#6e502c] pt-5 mt-2 animate-in fade-in duration-300 text-center">
              <div className="flex items-center justify-center gap-2 mb-3 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-cinzel font-bold text-sm">
                  Royal Papyrus Cipher Mastered
                </span>
              </div>

              {/* Unlocked Code for Level 10 */}
              <div className="bg-[#120c08] border border-[#8c6d31] p-4 rounded-xl mb-4 text-center">
                <span className="text-[10px] font-cinzel text-[#a98f6d] uppercase tracking-widest block mb-1">
                  Gateway Key to Chamber X (The Last Seal: The Lost Pharaoh)
                </span>
                <div className="text-2xl sm:text-3xl font-mono-clean font-bold text-[#f7e096] tracking-[0.25em]">
                  {level9.unlockedCode}
                </div>
              </div>

              {/* Hidden Number 9 */}
              <div className="flex items-center justify-center gap-3 p-3.5 bg-[#142327] rounded-lg border border-[#40e0d0]/60 mb-6 shadow-sm">
                <span className="text-3xl text-[#40e0d0] turquoise-glow">𓋹</span>
                <div className="text-left">
                  <span className="text-xs font-cinzel font-bold text-[#d2fbf5] block">
                    Act II Relic Discovered: Papyrus Sigil of Secrets (Value: <strong className="text-[#40e0d0] text-base">{level9.hiddenNumber}</strong>)
                  </span>
                  <span className="text-[11px] text-[#94d5cb]">
                    Revealed beneath the broken papyrus wax seal. Saved in your Journal for Chamber X!
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playStoneSlide();
                  onProceedToLevel(10);
                }}
                className="w-full py-4 px-6 font-cinzel font-bold text-sm text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Descend to Chamber X: The Last Seal (The Lost Pharaoh)</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
