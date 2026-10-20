import React, { useState } from 'react';
import { GamePlaythroughState, GameStateUpdater } from '../types/game';
import { sound } from '../audio/soundManager';
import { ArrowRight, CheckCircle2, Lock, KeyRound, Sparkles, Shield, AlertTriangle } from 'lucide-react';

interface Level5ChamberProps {
  gameState: GamePlaythroughState;
  onUpdateState: (update: GameStateUpdater) => void;
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

  // 4-digit code combination state for the Four Seals
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [feedback, setFeedback] = useState<string | null>(level5.feedbackMessage);

  const handleUnlockThreshold = (codeToTest: string) => {
    sound.playStoneClick();
    const cleanCode = codeToTest.trim().replace(/\s+/g, '-');
    if (
      cleanCode === level4.unlockedCode ||
      cleanCode === String(level4.hiddenNumber) ||
      cleanCode.replace(/-/g, '') === level4.unlockedCode.replace(/-/g, '')
    ) {
      sound.playStoneSlide();
      setIsGateOpen(true);
      setGateError(false);
    } else {
      sound.playMismatchThud();
      setGateError(true);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    sound.playStoneClick();
    const clean = val.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = clean;
    setDigits(newDigits);
    setFeedback(null);
  };

  const handleAutoFillFromJournal = () => {
    sound.playStoneClick();
    const auto = [
      String(gameState.level1.hiddenNumber),
      String(gameState.level2.hiddenNumber),
      String(gameState.level3.hiddenNumber),
      String(gameState.level4.hiddenNumber),
    ];
    setDigits(auto);
  };

  const handleSubmitFourSeals = () => {
    sound.playStoneClick();
    const userCode = digits.join('-');
    const targetCode = level5.correctCode;

    if (userCode === targetCode || digits.join('') === targetCode.replace(/-/g, '')) {
      sound.playStoneSlide();
      sound.playCodeUnlock();
      const msg = 'The four ancient counterweights disengage! The subterranean portal opens to the Deep Inner Tomb!';
      setFeedback(msg);

      onUpdateState((prev) => ({
        ...prev,
        level5: {
          ...prev.level5,
          enteredCode: userCode,
          feedbackMessage: msg,
          isSolved: true,
        },
        completedLevels: !prev.completedLevels.includes(5)
          ? [...prev.completedLevels, 5]
          : prev.completedLevels,
        highestDiscoveredLevel: Math.max(prev.highestDiscoveredLevel, 6),
      }));
    } else {
      sound.playMismatchThud();
      // Count matching positions
      const targetParts = targetCode.split('-');
      let correctMatches = 0;
      digits.forEach((d, i) => {
        if (d === targetParts[i]) correctMatches++;
      });

      const err = `The portal shakes in rejection — ${correctMatches} of the 4 seal numbers are correctly placed. Review the hidden numbers recorded in your Field Journal!`;
      setFeedback(err);
      onUpdateState((prev) => ({
        ...prev,
        level5: {
          ...prev.level5,
          attempts: prev.level5.attempts + 1,
          feedbackMessage: err,
        },
      }));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Chamber Header */}
      <div className="w-full stone-panel rounded-xl p-5 mb-6 text-center border-t-2 border-[#d4af37]">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="text-left">
            <span className="text-[11px] font-mono-clean text-[#a98f6d] uppercase tracking-widest">
              Chamber V · Khetam-Fedu
            </span>
            <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-[#f7e096]">
              Gateway of the Four Seals
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-cinzel text-[#d4af37] bg-[#1a120c] px-3 py-1.5 rounded-lg border border-[#8c6d31]">
              Status: {level5.isSolved ? 'Portal Disengaged' : 'Sealed by 4 Numbers'}
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
          A massive iron-banded stone portal stands between the outer chambers and the deep forbidden tomb. You must enter the four numbers hidden across Chambers I to IV.
        </p>
      </div>

      {/* If Chamber Portal is Still Sealed from Level 4 */}
      {!isGateOpen ? (
        <div className="w-full max-w-md stone-panel rounded-2xl p-6 border-2 border-[#b88c3a] text-center my-8 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#20150d] border border-[#8c6d31] flex items-center justify-center text-[#d4af37] mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-cinzel font-bold text-[#f7e096] mb-2">
            The Archway of Bastet is Locked
          </h2>
          <p className="text-xs text-[#a98f6d] mb-4">
            Enter the single-digit sacred key awarded by Bastet in Chamber IV to reach the Gateway of the Four Seals.
          </p>

          <div className="flex items-center justify-center gap-2 mb-3">
            <input
              type="text"
              maxLength={4}
              value={enteredGateCode}
              onChange={(e) => setEnteredGateCode(e.target.value)}
              placeholder={`e.g. ${level4.unlockedCode || '4'}`}
              className="px-4 py-2.5 bg-[#120d09] border border-[#6b502d] rounded-lg text-center font-mono-clean font-bold tracking-widest text-2xl text-[#f7e096] focus:outline-none focus:border-[#d4af37] w-36"
            />
            <button
              onClick={() => handleUnlockThreshold(enteredGateCode)}
              className="px-4 py-2.5 font-cinzel text-xs font-bold text-[#140e0a] bg-gradient-to-r from-[#e6c46e] to-[#c79c3c] rounded-lg hover:from-[#f5d78a] hover:to-[#dbaf4c] shadow transition-all cursor-pointer"
            >
              Unseal
            </button>
          </div>

          {gateError && (
            <p className="text-xs text-rose-400 font-sans-clean mb-3">
              The lock mechanism resists. Enter the single-digit key from Chamber IV.
            </p>
          )}

          {level4.isSolved && (
            <button
              onClick={() => {
                setEnteredGateCode(level4.unlockedCode);
                handleUnlockThreshold(level4.unlockedCode);
              }}
              className="text-xs font-sans-clean text-[#d4af37] hover:underline flex items-center justify-center gap-1.5 mx-auto mt-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Use Chamber IV Key: <strong className="text-[#f7e096] text-sm">{level4.unlockedCode}</strong>
            </button>
          )}
        </div>
      ) : (
        /* The Active Four Seals Combination Puzzle */
        <div className="w-full max-w-3xl stone-panel rounded-2xl p-6 sm:p-8 border-2 border-[#b88c3a] shadow-2xl mb-8">
          {/* Wall of the 4 Seals Lore & Clues */}
          <div className="bg-[#120c08] border border-[#6b502d] rounded-xl p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[#d4af37]">
                <Shield className="w-5 h-5" />
                <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider">
                  The Four Inscriptions of the Threshold
                </h3>
              </div>
              <button
                onClick={handleAutoFillFromJournal}
                className="text-xs font-cinzel text-[#d4af37] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fill Numbers from Journal</span>
              </button>
            </div>
            <p className="text-xs text-[#a98f6d] font-sans-clean mb-3">
              Four sacred numbers were hidden across your journey through Chambers I to IV. Enter each number into its corresponding lock tumbler:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {level5.hiddenNumbers.map((hn) => (
                <div
                  key={hn.level}
                  className="p-3 rounded-lg bg-[#1c130b] border border-[#523d24] text-xs font-sans-clean text-[#ebd9ba] flex items-start gap-2.5"
                >
                  <span className="text-[#d4af37] text-sm font-bold">Seal {hn.level}:</span>
                  <span className="leading-relaxed">{hn.clue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Four Tumbler Inputs */}
          <div className="mb-6 text-center">
            <span className="text-xs font-cinzel font-bold text-[#f7e096] block mb-3 uppercase tracking-wider">
              Enter the Four-Digit Threshold Code:
            </span>

            <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-sm mx-auto mb-4">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[10px] font-mono-clean text-[#a98f6d] mb-1">
                    SEAL #{idx + 1}
                  </span>
                  <input
                    type="text"
                    maxLength={1}
                    value={digits[idx]}
                    disabled={level5.isSolved}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    className="w-14 h-16 sm:w-16 sm:h-20 bg-[#100a06] border-2 border-[#8c6d31] rounded-xl text-center font-mono-clean font-bold text-2xl sm:text-3xl text-[#f7e096] shadow-inner focus:outline-none focus:border-[#f7e096]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
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

          {/* Action Button: Disengage Threshold */}
          {!level5.isSolved ? (
            <button
              onClick={handleSubmitFourSeals}
              className="w-full py-4 px-6 font-cinzel font-bold text-sm text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Disengage the Four Stone Seals</span>
            </button>
          ) : (
            <div className="border-t border-[#6e502c] pt-5 mt-2 animate-in fade-in duration-300 text-center">
              <div className="flex items-center justify-center gap-2 mb-3 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-cinzel font-bold text-sm">
                  Subterranean Divide Breached! Inner Tomb Unlocked
                </span>
              </div>
              <p className="text-xs text-[#a98f6d] mb-4">
                The iron bands snap back and the colossal portal descends into the bedrock floor. Ahead lies Chamber VI: The Duel against the Pharaoh!
              </p>

              <button
                onClick={() => {
                  sound.playStoneSlide();
                  onProceedToLevel(6);
                }}
                className="w-full py-4 px-6 font-cinzel font-bold text-sm text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-2xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Descend to Chamber VI: The Duel (Trial of the Pharaoh)</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
