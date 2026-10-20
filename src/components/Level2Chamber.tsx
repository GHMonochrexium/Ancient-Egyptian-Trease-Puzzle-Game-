import React, { useState } from 'react';
import { GamePlaythroughState } from '../types/game';
import { decryptCaesar } from '../game/generator';
import { sound } from '../audio/soundManager';
import { ArrowRight, CheckCircle2, Lock, Unlock, KeyRound, RotateCw } from 'lucide-react';

interface Level2ChamberProps {
  gameState: GamePlaythroughState;
  onUpdateState: (newState: Partial<GamePlaythroughState>) => void;
  onProceedToLevel: (levelId: number) => void;
  onOpenScroll: () => void;
}

export const Level2Chamber: React.FC<Level2ChamberProps> = ({
  gameState,
  onUpdateState,
  onProceedToLevel,
  onOpenScroll,
}) => {
  const { level2, level1 } = gameState;
  const isGateUnlocked = gameState.completedLevels.includes(1);
  const [enteredGateCode, setEnteredGateCode] = useState('');
  const [isGateOpen, setIsGateOpen] = useState(isGateUnlocked);
  const [gateError, setGateError] = useState(false);

  // Cipher controls
  const [shift, setShift] = useState(level2.selectedShift || 1);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Live decoded message with current shift
  const liveDecoded = decryptCaesar(level2.ciphertext, shift);

  const handleUnlockGate = (codeToTest: string) => {
    sound.playStoneClick();
    const cleanCode = codeToTest.trim().replace(/\s+/g, '-');
    if (cleanCode === level1.unlockedCode || cleanCode.replace(/-/g, '') === level1.unlockedCode.replace(/-/g, '')) {
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
    const normalized = ((newShift - 1 + 25) % 25) + 1; // 1 to 25
    setShift(normalized);
    setSubmissionFeedback(null);
  };

  const handleSubmitDecryption = () => {
    sound.playStoneClick();
    if (liveDecoded === level2.plaintext) {
      // SUCCESS!
      sound.playCodeUnlock();
      const updatedLevel2 = {
        ...level2,
        selectedShift: shift,
        userDecoded: liveDecoded,
        isSolved: true,
      };

      onUpdateState({
        level2: updatedLevel2,
        completedLevels: !gameState.completedLevels.includes(2)
          ? [...gameState.completedLevels, 2]
          : gameState.completedLevels,
        highestDiscoveredLevel: Math.max(gameState.highestDiscoveredLevel, 3),
      });
      setSubmissionFeedback('The tablet glows brightly in harmony! The sacred word is recognized.');
    } else {
      // INCORRECT
      sound.playMismatchThud();
      setSubmissionFeedback(`"${liveDecoded}" is not the sacred divine word. Adjust the shift stepper.`);
    }
  };

  const sacredToken = gameState.sacredTokens.find((t) => t.originLevel === 2);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Chamber Header */}
      <div className="w-full stone-panel rounded-xl p-5 mb-6 text-center border-t-2 border-[#d4af37]">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="text-left">
            <span className="text-[11px] font-mono-clean text-[#a98f6d] uppercase tracking-widest">
              Chamber II · Medou-Kemet
            </span>
            <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-[#f7e096]">
              The Crypt of the Cipher
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-cinzel text-[#d4af37] bg-[#1a120c] px-3 py-1.5 rounded-lg border border-[#8c6d31]">
              Status: {level2.isSolved ? 'Decoded' : isGateOpen ? 'Tablet Active' : 'Portal Sealed'}
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
          A towering granite stele inscribed with Caesar script guards the pathway to the deeper vaults.
        </p>
      </div>

      {/* If Chamber Portal is Still Sealed */}
      {!isGateOpen ? (
        <div className="w-full max-w-md stone-panel rounded-2xl p-6 border-2 border-[#b88c3a] text-center my-8 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#20150d] border border-[#8c6d31] flex items-center justify-center text-[#d4af37] mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-cinzel font-bold text-[#f7e096] mb-2">
            The Granite Gateway is Sealed
          </h2>
          <p className="text-xs text-[#a98f6d] mb-4">
            Enter the 4-digit code recovered from Chamber I (The Hall of Glyphs) to unlock the cryptographic stele.
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
              className="px-4 py-2.5 font-cinzel text-xs font-bold text-[#140e0a] bg-gradient-to-r from-[#e6c46e] to-[#c79c3c] rounded-lg hover:from-[#f5d78a] hover:to-[#dbaf4c] shadow transition-all"
            >
              Unseal
            </button>
          </div>

          {gateError && (
            <p className="text-xs text-rose-400 font-sans-clean mb-3">
              The lock mechanism resists. Verify the code from Chamber I.
            </p>
          )}

          {level1.isSolved && (
            <button
              onClick={() => {
                setEnteredGateCode(level1.unlockedCode);
                handleUnlockGate(level1.unlockedCode);
              }}
              className="text-xs font-sans-clean text-[#d4af37] hover:underline flex items-center justify-center gap-1.5 mx-auto mt-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Use Code from Journal: {level1.unlockedCode}
            </button>
          )}
        </div>
      ) : (
        /* The Active Caesar Cipher Puzzle */
        <div className="w-full max-w-2xl stone-panel rounded-2xl p-6 sm:p-8 border-2 border-[#b88c3a] shadow-2xl mb-8">
          {/* Stele Tablet Header */}
          <div className="text-center border-b border-[#6e502c] pb-4 mb-6">
            <span className="text-[10px] font-mono-clean text-[#a98f6d] tracking-widest uppercase block mb-1">
              Pharaonic Scribe Cipher Stele
            </span>
            <div className="bg-[#140e0a] border border-[#8c6d31] p-4 rounded-xl inline-block max-w-full my-2">
              <span className="text-[10px] font-cinzel text-[#8c6d31] uppercase tracking-wider block mb-1">
                Encrypted Inscription Carved on Stone
              </span>
              <span className="text-2xl sm:text-3xl font-mono-clean font-bold tracking-[0.3em] text-[#e8c76e] hieroglyph-glow">
                {level2.ciphertext}
              </span>
            </div>
            <p className="text-xs text-[#a98f6d] mt-2 italic font-sans-clean">
              Every glyph has been shifted forward by a secret number of paces in the Egyptian alphabet.
            </p>
          </div>

          {/* Shift Controls & Visual Dial */}
          <div className="bg-[#1a120c] border border-[#5a4224] rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-cinzel font-bold text-[#f7e096]">
                Shift Stepper:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShiftChange(shift - 1)}
                  className="w-8 h-8 rounded bg-[#2a1c12] border border-[#725227] text-[#f7e096] hover:bg-[#3d2919] font-bold text-sm"
                >
                  -
                </button>
                <span className="w-12 text-center font-mono-clean font-bold text-lg text-[#d4af37]">
                  +{shift}
                </span>
                <button
                  onClick={() => handleShiftChange(shift + 1)}
                  className="w-8 h-8 rounded bg-[#2a1c12] border border-[#725227] text-[#f7e096] hover:bg-[#3d2919] font-bold text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="1"
              max="25"
              value={shift}
              onChange={(e) => handleShiftChange(parseInt(e.target.value))}
              className="w-full accent-[#d4af37] bg-[#2d1f14] h-2 rounded-lg cursor-pointer mb-4"
            />

            {/* Live Decoded Output Preview */}
            <div className="p-4 rounded-lg bg-[#0e0a07] border border-[#7c5d31] text-center">
              <span className="text-[10px] font-cinzel text-[#9c8263] uppercase tracking-wider block mb-1">
                Deciphered Translation at Shift +{shift}
              </span>
              <span className="text-2xl sm:text-3xl font-mono-clean font-bold tracking-[0.25em] text-[#f7e096]">
                {liveDecoded}
              </span>
            </div>
          </div>

          {/* Feedback message */}
          {submissionFeedback && (
            <div
              className={`p-3 rounded-lg text-xs font-sans-clean text-center mb-4 ${
                level2.isSolved
                  ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-700 text-rose-300'
              }`}
            >
              {submissionFeedback}
            </div>
          )}

          {/* Submit Decoded Button */}
          {!level2.isSolved ? (
            <button
              onClick={handleSubmitDecryption}
              className="w-full py-3.5 px-6 font-cinzel font-bold text-xs sm:text-sm text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              <span>Submit Decoded Word: "{liveDecoded}"</span>
            </button>
          ) : (
            /* Solved State with Code 3 and Token 2 */
            <div className="border-t border-[#6e502c] pt-5 mt-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-center gap-2 mb-3 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-cinzel font-bold text-sm">
                  Crypt of the Cipher Mastered
                </span>
              </div>

              {/* Unlocked Code for Level 3 */}
              <div className="bg-[#120c08] border border-[#8c6d31] p-4 rounded-xl mb-4 text-center">
                <span className="text-[10px] font-cinzel text-[#a98f6d] uppercase tracking-widest block mb-1">
                  Gateway Key to Chamber III (Vault of the Sandstorm)
                </span>
                <div className="text-2xl sm:text-3xl font-mono-clean font-bold text-[#f7e096] tracking-[0.25em]">
                  {level2.unlockedCode}
                </div>
              </div>

              {/* Discovered Hidden Number for Chamber V */}
              <div className="flex items-center justify-center gap-3 p-3 bg-[#24170d] rounded-lg border border-[#78592c] mb-6">
                <span className="text-3xl text-[#f7e096] hieroglyph-glow">𓆣</span>
                <div className="text-left">
                  <span className="text-xs font-cinzel font-bold text-[#f3e6cf] block">
                    Hidden Seal Number II Discovered: <strong className="text-[#f7e096] text-base">{level2.hiddenNumber}</strong>
                  </span>
                  <span className="text-[11px] text-[#a98f6d]">
                    Inscribed into the granite stele rim. Automatically recorded in your Field Journal for Chamber V!
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playStoneSlide();
                  onProceedToLevel(3);
                }}
                className="w-full py-3.5 px-6 font-cinzel font-bold text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Proceed to Chamber III: Vault of the Sandstorm</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
