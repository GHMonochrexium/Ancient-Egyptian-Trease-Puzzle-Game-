import React, { useState, useEffect, useRef } from 'react';
import { GamePlaythroughState, GameStateUpdater } from '../types/game';
import { generateLevelXState, generateLevelYState, generateLevelZState } from '../game/generator';
import { sound } from '../audio/soundManager';
import { Clock, AlertTriangle, Sparkles, ArrowRight, RotateCcw, Skull } from 'lucide-react';

interface LevelZFinalChallengeProps {
  gameState: GamePlaythroughState;
  onUpdateState: (update: GameStateUpdater) => void;
  onEnterDarkRealm: () => void;
  onReturnToMainGame: () => void;
}

export const LevelZFinalChallenge: React.FC<LevelZFinalChallengeProps> = ({
  gameState,
  onUpdateState,
  onEnterDarkRealm,
  onReturnToMainGame,
}) => {
  const { act3 } = gameState;
  const { levelZ } = act3;

  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(levelZ.timeRemaining);
  const [isFailed, setIsFailed] = useState(levelZ.isFailed);
  const timerRef = useRef<number | null>(null);

  // 60-second timer
  useEffect(() => {
    if (levelZ.isSolved || isFailed) return;

    timerRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          sound.playCurseWhisper();
          setIsFailed(true);
          onUpdateState((s) => ({
            ...s,
            act3: {
              ...s.act3,
              levelZ: {
                ...s.act3.levelZ,
                isFailed: true,
                timeRemaining: 0,
              },
            },
          }));
          return 0;
        }
        if (prev <= 10) {
          sound.playTimerTick(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [levelZ.isSolved, isFailed, onUpdateState]);

  const handleGuessSubmit = () => {
    if (levelZ.isSolved || isFailed || remaining <= 0) return;

    const num = parseInt(inputVal.trim(), 10);
    // Reject invalid inputs without counting them as valid guesses
    if (isNaN(num) || num < 1 || num > 50) {
      sound.playMismatchThud();
      setFeedback('Invalid offering! You must enter a valid integer between 1 and 50.');
      return;
    }

    sound.playStoneClick();
    setInputVal('');

    if (num === levelZ.targetNumber) {
      // Success! Stop timer immediately
      if (timerRef.current) clearInterval(timerRef.current);
      sound.playCodeUnlock();
      sound.playDarkRealmTransition();

      const newGuesses = [...levelZ.guesses, { guess: num, feedback: 'correct' as const }];
      onUpdateState((prev) => ({
        ...prev,
        act3: {
          ...prev.act3,
          levelZ: {
            ...prev.act3.levelZ,
            guesses: newGuesses,
            timeRemaining: remaining,
            isSolved: true,
          },
        },
      }));
      setFeedback('THE SACRED HARMONY RESONATES! THE FINAL GATE OPENS!');
    } else {
      const isHigher = num < levelZ.targetNumber; // target is higher
      const feedbackType: 'higher' | 'lower' = isHigher ? 'higher' : 'lower';
      const msg = isHigher
        ? `Guess ${num} is TOO LOW! (↑ Aim Higher)`
        : `Guess ${num} is TOO HIGH! (↓ Aim Lower)`;

      sound.playMismatchThud();
      const newGuesses = [...levelZ.guesses, { guess: num, feedback: feedbackType }];
      onUpdateState((prev) => ({
        ...prev,
        act3: {
          ...prev.act3,
          levelZ: {
            ...prev.act3.levelZ,
            guesses: newGuesses,
          },
        },
      }));
      setFeedback(msg);
    }
  };

  const handleRestartGatewayTrials = () => {
    sound.playStoneSlide();
    // Resets all Act III gateway progress back to Level X
    onUpdateState((prev) => ({
      ...prev,
      act3: {
        ...prev.act3,
        gatewayLevel: 'X',
        levelX: generateLevelXState(3),
        levelY: generateLevelYState(),
        levelZ: generateLevelZState(),
      },
    }));
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="w-full stone-panel rounded-2xl p-5 mb-6 border-t-2 border-[#9333ea] bg-[#12071f]/95 shadow-[0_0_35px_rgba(147,51,234,0.3)]">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
          <div>
            <span className="text-[11px] font-mono-clean text-[#c084fc] uppercase tracking-widest flex items-center gap-1.5">
              <span>Act III · Gateway Trial III</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-[#f5d0fe]">
              Level Z — The Final Challenge
            </h1>
          </div>

          {/* Countdown Display */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono-clean font-bold text-sm ${
                levelZ.isSolved
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : remaining <= 15
                  ? 'bg-rose-950/90 border-rose-600 text-rose-300 animate-pulse'
                  : 'bg-[#220d36] border-[#a855f7] text-[#f5d0fe]'
              }`}
            >
              <Clock className="w-4 h-4 text-[#e879f9]" />
              <span>TIME: {formatTimer(remaining)}</span>
            </div>

            <button
              onClick={onReturnToMainGame}
              className="text-xs font-cinzel text-[#d8b4fe] hover:text-[#faf5ff] underline underline-offset-4 decoration-[#7e22ce] transition-colors cursor-pointer"
            >
              Exit to Main Trek
            </button>
          </div>
        </div>

        <p className="text-xs text-[#d8b4fe] font-sans-clean max-w-2xl">
          An ancient intelligence guards the gate to the Dark Realm. You have exactly 60 seconds to divine the secret integer between 1 and 50.
        </p>
      </div>

      {/* Main Challenge Card */}
      <div className="stone-panel rounded-2xl p-6 sm:p-8 border-2 border-[#7e22ce] bg-gradient-to-b from-[#170a27] to-[#0c0414] shadow-2xl relative overflow-hidden mb-8">
        {!isFailed ? (
          <div>
            {/* Intel Display */}
            <div className="text-center py-4 mb-6">
              <span className="text-[11px] font-mono-clean text-[#c084fc] uppercase tracking-widest block mb-1">
                Cosmic Resonance Scale: 1 to 50
              </span>
              <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-[#faf5ff]">
                Input Your Divination
              </h2>
            </div>

            {/* Input & Submit Area */}
            {!levelZ.isSolved && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 max-w-md mx-auto">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGuessSubmit();
                  }}
                  disabled={levelZ.isSolved || isFailed || remaining <= 0}
                  placeholder="1 - 50"
                  className="w-full sm:w-44 px-4 py-3 bg-[#12051e] border-2 border-[#7e22ce] rounded-xl text-center font-mono-clean font-bold text-2xl text-[#f5d0fe] focus:outline-none focus:border-[#c084fc] shadow-inner"
                />
                <button
                  onClick={handleGuessSubmit}
                  disabled={levelZ.isSolved || isFailed || remaining <= 0}
                  className="w-full sm:w-auto px-8 py-3.5 font-cinzel font-bold text-sm text-[#12071f] bg-gradient-to-r from-[#e9d5ff] via-[#d8b4fe] to-[#c084fc] hover:from-[#f5d0fe] hover:to-[#e879f9] rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.4)] active:scale-95 transition-all cursor-pointer"
                >
                  Submit Guess
                </button>
              </div>
            )}

            {/* Feedback message */}
            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs sm:text-sm font-sans-clean font-semibold text-center mb-6 border max-w-lg mx-auto ${
                  levelZ.isSolved
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-[#290d42] border-[#a855f7] text-[#f5d0fe]'
                }`}
              >
                {feedback}
              </div>
            )}

            {/* History of Guesses */}
            {levelZ.guesses.length > 0 && !levelZ.isSolved && (
              <div className="p-4 bg-[#140621]/90 rounded-xl border border-[#6b21a8] max-w-lg mx-auto mb-6">
                <span className="text-[10px] font-cinzel text-[#c084fc] uppercase tracking-wider block mb-2 text-center">
                  Previous Divine Attunements ({levelZ.guesses.length}):
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2 max-h-36 overflow-y-auto pr-1">
                  {levelZ.guesses.map((g, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-lg text-xs font-mono-clean font-bold border ${
                        g.feedback === 'higher'
                          ? 'bg-[#2b1046] border-[#a855f7] text-[#e9d5ff]'
                          : g.feedback === 'lower'
                          ? 'bg-[#3b0b30] border-[#f43f5e] text-[#fecdd3]'
                          : 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      }`}
                    >
                      #{g.guess}: {g.feedback === 'higher' ? '↑ Higher' : '↓ Lower'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Solved State: Gateway to the Dark Realm */}
            {levelZ.isSolved && (
              <div className="mt-6 pt-6 border-t border-[#7e22ce] text-center animate-in zoom-in duration-500">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-t from-[#4c1d95] via-[#9333ea] to-[#f472b6] flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(244,114,182,0.7)] animate-pulse mb-4">
                  🌀
                </div>
                <h3 className="text-xl sm:text-2xl font-cinzel font-black tracking-widest text-[#f5d0fe] mb-2 drop-shadow-[0_2px_12px_rgba(244,114,182,0.8)]">
                  THE THREE SEALS HAVE FALLEN
                </h3>
                <p className="text-xs sm:text-sm text-[#e9d5ff] font-sans-clean mb-6 max-w-md mx-auto">
                  The veil between worlds has dissolved. The passage to THE DARK REALM opens before you.
                </p>
                <button
                  onClick={() => {
                    sound.playDarkRealmTransition();
                    onEnterDarkRealm();
                  }}
                  className="px-10 py-4 font-cinzel font-bold text-sm tracking-[0.25em] text-[#faf5ff] bg-gradient-to-r from-[#581c87] via-[#9333ea] to-[#e11d48] hover:from-[#6b21a8] hover:via-[#a855f7] hover:to-[#f43f5e] border-2 border-[#f472b6] rounded-2xl shadow-[0_0_35px_rgba(225,29,72,0.7)] hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-[#fbcfe8]" />
                  <span>BREACH THE DARK REALM</span>
                  <ArrowRight className="w-5 h-5 text-[#fbcfe8]" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Failure State: Timer Expired */
          <div className="text-center py-8 animate-in fade-in duration-300">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-950 border-2 border-rose-600 flex items-center justify-center text-rose-400 mb-4">
              <Skull className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-cinzel font-bold text-rose-300 mb-2">
              YOU HAVE FAILED THE FINAL TRIAL. THE GATE REMAINS SEALED.
            </h3>
            <p className="text-xs text-rose-200/80 font-sans-clean mb-6 max-w-md mx-auto">
              The 60-second sandglass has run dry. The ancient wards reset all Act III gateway progress back to Level X.
            </p>
            <button
              onClick={handleRestartGatewayTrials}
              className="px-8 py-3.5 font-cinzel font-bold text-xs text-[#faf5ff] bg-gradient-to-r from-rose-900 via-rose-800 to-rose-900 hover:from-rose-800 hover:to-rose-700 border border-rose-500 rounded-xl shadow-lg transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Return to Level X (The Sacrifice)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
