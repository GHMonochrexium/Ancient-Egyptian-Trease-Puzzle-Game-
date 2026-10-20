import React, { useState, useEffect } from 'react';
import { GamePlaythroughState, GameStateUpdater } from '../types/game';
import { sound } from '../audio/soundManager';
import { ArrowRight, CheckCircle2, Lock, KeyRound, AlertTriangle, ShieldAlert, Zap } from 'lucide-react';

interface Level8ChamberProps {
  gameState: GamePlaythroughState;
  onUpdateState: (update: GameStateUpdater) => void;
  onProceedToLevel: (levelId: number) => void;
  onOpenScroll: () => void;
  onTriggerGameOver: (reason: string) => void;
}

export const Level8Chamber: React.FC<Level8ChamberProps> = ({
  gameState,
  onUpdateState,
  onProceedToLevel,
  onOpenScroll,
  onTriggerGameOver,
}) => {
  const { level8, level7 } = gameState;
  const isGateUnlocked = gameState.completedLevels.includes(7);
  const [enteredGateCode, setEnteredGateCode] = useState('');
  const [isGateOpen, setIsGateOpen] = useState(isGateUnlocked);
  const [gateError, setGateError] = useState(false);

  // Math question interaction
  const [answerInput, setAnswerInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentQ = level8.questions[level8.currentQuestionIndex % level8.questions.length];

  const handleUnlockGate = (codeToTest: string) => {
    sound.playStoneClick();
    const cleanCode = codeToTest.trim().replace(/\s+/g, '-');
    if (cleanCode === level7.unlockedCode || cleanCode.replace(/-/g, '') === level7.unlockedCode.replace(/-/g, '')) {
      sound.playStoneSlide();
      setIsGateOpen(true);
      setGateError(false);
    } else {
      sound.playMismatchThud();
      setGateError(true);
    }
  };

  // Guardian Movement Timer: moves 2% closer every second!
  useEffect(() => {
    if (!isGateOpen || level8.isSolved || level8.isFailed) return;

    const timer = setInterval(() => {
      onUpdateState((prev) => {
        const nextDist = Math.max(0, prev.level8.guardianDistance - 2);
        if (nextDist <= 0 && !prev.level8.isSolved && !prev.level8.isFailed) {
          sound.playMismatchThud();
          onTriggerGameOver(
            'THE STONE GUARDIAN HAS CRUSHED YOU. The moving colossus closed the distance and overwhelmed your expedition.'
          );
          return {
            ...prev,
            level8: {
              ...prev.level8,
              guardianDistance: 0,
              isFailed: true,
            },
          };
        }
        return {
          ...prev,
          level8: {
            ...prev.level8,
            guardianDistance: nextDist,
          },
        };
      });

      // Guardian step audio
      if (level8.guardianDistance % 10 === 0) {
        sound.playGuardianStep();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isGateOpen, level8.isSolved, level8.isFailed, onUpdateState, onTriggerGameOver, level8.guardianDistance]);

  const handleSubmitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentQ || level8.isSolved || level8.isFailed) return;

    const val = parseInt(answerInput.trim(), 10);
    sound.playStoneClick();

    if (val === currentQ.answer) {
      // CORRECT: push guardian back by +15% distance and increment solved count
      sound.playMatchChime();
      const nextSolved = level8.questionsSolved + 1;
      const nextIndex = level8.currentQuestionIndex + 1;
      const isSolved = nextSolved >= level8.targetSolved;

      if (isSolved) {
        sound.playCodeUnlock();
      }

      setFeedback(`Correct! ${currentQ.question} = ${currentQ.answer}. The ancient counterweight forces the colossus backward!`);
      setAnswerInput('');

      onUpdateState((prev) => ({
        ...prev,
        level8: {
          ...prev.level8,
          questionsSolved: nextSolved,
          currentQuestionIndex: nextIndex,
          guardianDistance: Math.min(100, prev.level8.guardianDistance + 15),
          isSolved,
        },
        completedLevels: isSolved && !prev.completedLevels.includes(8)
          ? [...prev.completedLevels, 8]
          : prev.completedLevels,
        highestDiscoveredLevel: Math.max(prev.highestDiscoveredLevel, 9),
      }));
    } else {
      // WRONG: Guardian advances aggressively (-15% distance penalty)!
      sound.playMismatchThud();
      sound.playGuardianStep();
      setFeedback(`Incorrect! The runes reject "${answerInput}". The colossus surges forward!`);
      setAnswerInput('');

      onUpdateState((prev) => {
        const penalized = Math.max(0, prev.level8.guardianDistance - 15);
        if (penalized <= 0) {
          onTriggerGameOver('THE STONE GUARDIAN HAS CRUSHED YOU. The moving colossus closed the distance and overwhelmed your expedition.');
          return {
            ...prev,
            level8: {
              ...prev.level8,
              guardianDistance: 0,
              isFailed: true,
            },
          };
        }
        return {
          ...prev,
          level8: {
            ...prev.level8,
            guardianDistance: penalized,
          },
        };
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Chamber Header */}
      <div className="w-full stone-panel rounded-xl p-5 mb-6 text-center border-t-2 border-[#d4af37]">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="text-left">
            <span className="text-[11px] font-mono-clean text-[#a98f6d] uppercase tracking-widest">
              Chamber VIII · Sau-Menkhet
            </span>
            <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-[#f7e096]">
              The Moving Guardian (Trial of Speed)
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-cinzel text-[#d4af37] bg-[#1a120c] px-3 py-1.5 rounded-lg border border-[#8c6d31]">
              Equations Solved: {level8.questionsSolved} / {level8.targetSolved}
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
          A giant stone colossus awakens and begins stomping towards you! Solve the mathematical equations carved into the wall to push it back and freeze it into bedrock.
        </p>
      </div>

      {/* If Chamber Portal is Still Sealed */}
      {!isGateOpen ? (
        <div className="w-full max-w-md stone-panel rounded-2xl p-6 border-2 border-[#b88c3a] text-center my-8 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#20150d] border border-[#8c6d31] flex items-center justify-center text-[#d4af37] mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-cinzel font-bold text-[#f7e096] mb-2">
            The Guardian Hall is Sealed
          </h2>
          <p className="text-xs text-[#a98f6d] mb-4">
            Enter the gateway key unsealed in Chamber VII (The Binary Alphabet) to enter the guardian corridor.
          </p>

          <div className="flex items-center justify-center gap-2 mb-3">
            <input
              type="text"
              value={enteredGateCode}
              onChange={(e) => setEnteredGateCode(e.target.value)}
              placeholder="e.g. 8-3-1-9"
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
              The lock mechanism resists. Verify the key from Chamber VII.
            </p>
          )}

          {level7.isSolved && (
            <button
              onClick={() => {
                setEnteredGateCode(level7.unlockedCode);
                handleUnlockGate(level7.unlockedCode);
              }}
              className="text-xs font-sans-clean text-[#d4af37] hover:underline flex items-center justify-center gap-1.5 mx-auto mt-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Use Code from Journal: {level7.unlockedCode}
            </button>
          )}
        </div>
      ) : (
        /* The Active Moving Guardian Trial */
        <div className="w-full max-w-3xl stone-panel rounded-2xl p-6 sm:p-8 border-2 border-[#b88c3a] shadow-2xl mb-8">
          {/* Guardian Visual Banner & Distance Gauge */}
          <div className="relative w-full rounded-2xl overflow-hidden border-2 border-[#8c6d31] mb-6 bg-[#0a0604]">
            <div className="relative h-60 sm:h-72 w-full overflow-hidden">
              <img
                src="/src/assets/images/moving_stone_guardian_1791716402961.jpg"
                alt="Advancing Stone Guardian Colossus"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-1000"
                style={{
                  transform: `scale(${1 + (100 - level8.guardianDistance) / 180})`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50" />
            </div>

            {/* Distance Bar Overlay */}
            <div className="absolute bottom-3 inset-x-3 p-3 rounded-xl bg-black/85 backdrop-blur-sm border border-[#78592c]">
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="font-cinzel font-bold text-[#f7e096] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Guardian Distance:
                </span>
                <span
                  className={`font-mono-clean font-bold text-sm ${
                    level8.guardianDistance <= 25
                      ? 'text-rose-400 animate-pulse'
                      : 'text-[#e8c76e]'
                  }`}
                >
                  {level8.guardianDistance}% Remaining
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-[#1e140d] rounded-full overflow-hidden border border-[#523d24]">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    level8.guardianDistance <= 25
                      ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                      : level8.guardianDistance <= 50
                      ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-400'
                  }`}
                  style={{ width: `${level8.guardianDistance}%` }}
                />
              </div>
            </div>
          </div>

          {/* Current Math Equation Card */}
          {!level8.isSolved ? (
            <div>
              <div className="bg-[#120d09] border border-[#523d24] rounded-2xl p-6 mb-6 text-center shadow-inner">
                <span className="text-[10px] font-mono-clean text-[#a98f6d] uppercase tracking-widest block mb-1">
                  Sacred Equation #{level8.questionsSolved + 1} of {level8.targetSolved}
                </span>

                <div className="text-4xl sm:text-5xl font-mono-clean font-black text-[#f7e096] hieroglyph-glow my-3 tracking-wider">
                  {currentQ?.question} = ?
                </div>

                <p className="text-xs text-[#a98f6d] italic font-sans-clean mb-4">
                  Correct answers push the colossus backward. Wrong answers add a heavy distance penalty!
                </p>

                {/* Form to submit answer */}
                <form onSubmit={handleSubmitAnswer} className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                  <input
                    type="number"
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder="Answer"
                    autoFocus
                    className="w-full px-4 py-3 bg-[#0a0705] border-2 border-[#8c6d31] rounded-xl text-center font-mono-clean font-bold text-2xl text-[#f7e096] focus:outline-none focus:border-[#f7e096]"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 font-cinzel font-bold text-sm text-[#140e0a] bg-gradient-to-r from-[#e6c46e] to-[#c79c3c] hover:from-[#f5d78a] hover:to-[#dbaf4c] rounded-xl shadow transition-all cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    Solve
                  </button>
                </form>
              </div>

              {/* Feedback */}
              {feedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-sans-clean font-semibold text-center mb-4 border ${
                    feedback.startsWith('Correct')
                      ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                      : 'bg-rose-950/80 border border-rose-700 text-rose-300'
                  }`}
                >
                  {feedback}
                </div>
              )}
            </div>
          ) : (
            /* Solved State: Guardian Sealed & Hidden Number 8 */
            <div className="border-t border-[#6e502c] pt-5 mt-2 animate-in fade-in duration-300 text-center">
              <div className="flex items-center justify-center gap-2 mb-3 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-cinzel font-bold text-sm">
                  Stone Guardian Sealed! Mechanism Activated
                </span>
              </div>
              <p className="text-xs text-[#bda482] mb-4">
                The ceiling chains drop massive granite blocks, locking the colossus permanently into the bedrock.
              </p>

              {/* Unlocked Code for Level 9 */}
              <div className="bg-[#120c08] border border-[#8c6d31] p-4 rounded-xl mb-4 text-center">
                <span className="text-[10px] font-cinzel text-[#a98f6d] uppercase tracking-widest block mb-1">
                  Gateway Key to Chamber IX (The Papyrus Cipher)
                </span>
                <div className="text-2xl sm:text-3xl font-mono-clean font-bold text-[#f7e096] tracking-[0.25em]">
                  {level8.unlockedCode}
                </div>
              </div>

              {/* Hidden Number 8 on wall behind statue */}
              <div className="flex items-center justify-center gap-3 p-3.5 bg-[#142327] rounded-lg border border-[#40e0d0]/60 mb-6 shadow-sm">
                <span className="text-3xl text-[#40e0d0] turquoise-glow">𓅃</span>
                <div className="text-left">
                  <span className="text-xs font-cinzel font-bold text-[#d2fbf5] block">
                    Act II Relic Discovered: Colossus Core of Speed (Value: <strong className="text-[#40e0d0] text-base">{level8.hiddenNumber}</strong>)
                  </span>
                  <span className="text-[11px] text-[#94d5cb]">
                    Revealed carved onto the sandstone wall behind the sealed guardian. Saved in your Journal for Chamber X!
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playStoneSlide();
                  onProceedToLevel(9);
                }}
                className="w-full py-4 px-6 font-cinzel font-bold text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Chamber IX: The Papyrus Cipher</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
