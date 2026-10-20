import React, { useState, useEffect, useRef } from 'react';
import { GamePlaythroughState, GameStateUpdater } from '../types/game';
import { sound } from '../audio/soundManager';
import { ArrowRight, CheckCircle2, Lock, KeyRound, AlertTriangle, Wind } from 'lucide-react';

interface Level3ChamberProps {
  gameState: GamePlaythroughState;
  onUpdateState: (update: GameStateUpdater) => void;
  onProceedToLevel: (levelId: number) => void;
  onOpenScroll: () => void;
  onTriggerGameOver: (reason: string) => void;
}

export const Level3Chamber: React.FC<Level3ChamberProps> = ({
  gameState,
  onUpdateState,
  onProceedToLevel,
  onOpenScroll,
  onTriggerGameOver,
}) => {
  const { level3, level2 } = gameState;
  const isGateUnlocked = gameState.completedLevels.includes(2);
  const [enteredGateCode, setEnteredGateCode] = useState('');
  const [isGateOpen, setIsGateOpen] = useState(isGateUnlocked);
  const [gateError, setGateError] = useState(false);

  // Puzzle interaction
  const [currentGuess, setCurrentGuess] = useState<number | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Unseal Chamber 3 Gate with Level 2 code
  const handleUnlockGate = (codeToTest: string) => {
    sound.playStoneClick();
    const cleanCode = codeToTest.trim().replace(/\s+/g, '-');
    if (cleanCode === level2.unlockedCode || cleanCode.replace(/-/g, '') === level2.unlockedCode.replace(/-/g, '')) {
      sound.playStoneSlide();
      setIsGateOpen(true);
      setGateError(false);
    } else {
      sound.playMismatchThud();
      setGateError(true);
    }
  };

  // Timer logic when gate is open and not yet solved
  useEffect(() => {
    if (!isGateOpen || level3.isSolved || level3.isFailed) {
      sound.stopSandstormWind();
      return;
    }

    const timer = setInterval(() => {
      onUpdateState((prev) => {
        const nextTime = Math.max(0, prev.level3.timeRemaining - 1);
        if (nextTime <= 0 && !prev.level3.isSolved && !prev.level3.isFailed) {
          sound.stopSandstormWind();
          sound.playMismatchThud();
          onTriggerGameOver('THE TEMPLE HAS CLAIMED YOU. The suffocating sandstorm has completely buried the vault.');
          return {
            ...prev,
            level3: {
              ...prev.level3,
              timeRemaining: 0,
              isFailed: true,
            },
          };
        }
        return {
          ...prev,
          level3: {
            ...prev.level3,
            timeRemaining: nextTime,
          },
        };
      });

      // Sound update: calculate storm intensity 0 to 1 as time decreases from 60 to 0
      const intensity = Math.min(1, Math.max(0, (60 - level3.timeRemaining + 1) / 60));
      sound.updateSandstormWind(intensity);

      // Urgent tick in last 15 seconds
      if (level3.timeRemaining <= 15) {
        sound.playTimerTick(true);
      } else if (level3.timeRemaining % 5 === 0) {
        sound.playTimerTick(false);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      sound.stopSandstormWind();
    };
  }, [isGateOpen, level3.timeRemaining, level3.isSolved, level3.isFailed]);

  // Canvas Sandstorm Particle Simulation
  useEffect(() => {
    if (!isGateOpen || level3.isSolved) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const onResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', onResize);

    // Number of particles increases as time diminishes
    const particleCount = 70 + Math.floor((60 - level3.timeRemaining) * 4);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 3 + Math.random() * 8 + (60 - level3.timeRemaining) * 0.15,
      vy: 1 + Math.random() * 3,
      size: 1 + Math.random() * 2.5,
      alpha: 0.15 + Math.random() * 0.5,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Sand particle rendering
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x > width) p.x = -10;
        if (p.y > height) p.y = -10;

        ctx.fillStyle = `rgba(224, 185, 120, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [isGateOpen, level3.isSolved, level3.timeRemaining]);

  const handleGuessSubmit = (val: number) => {
    if (level3.isSolved || level3.isFailed || !isGateOpen) return;
    sound.playStoneClick();
    setCurrentGuess(val);

    if (val === level3.secretNumber) {
      // SOLVED!
      sound.stopSandstormWind();
      sound.playCodeUnlock();
      setLastFeedback(`The number ${val} is correct! The sand vents lock shut.`);

      onUpdateState({
        level3: {
          ...level3,
          isSolved: true,
          guesses: [...level3.guesses, { guess: val, feedback: 'correct' }],
        },
        completedLevels: !gameState.completedLevels.includes(3)
          ? [...gameState.completedLevels, 3]
          : gameState.completedLevels,
        highestDiscoveredLevel: Math.max(gameState.highestDiscoveredLevel, 4),
      });
    } else if (val < level3.secretNumber) {
      sound.playMismatchThud();
      setLastFeedback('The number is higher.');
      onUpdateState({
        level3: {
          ...level3,
          guesses: [...level3.guesses, { guess: val, feedback: 'higher' }],
        },
      });
    } else {
      sound.playMismatchThud();
      setLastFeedback('The number is lower.');
      onUpdateState({
        level3: {
          ...level3,
          guesses: [...level3.guesses, { guess: val, feedback: 'lower' }],
        },
      });
    }
  };

  // Sand danger visual levels:
  // 60-40s: subtle wind
  // 40-20s: more sand
  // 20-10s: sand rising rapidly
  // 10-0s: almost engulfed
  const remaining = level3.timeRemaining;
  const sandOverlayOpacity = level3.isSolved
    ? 0
    : remaining > 40
    ? 0.1
    : remaining > 20
    ? 0.35
    : remaining > 10
    ? 0.65
    : 0.85;

  const sandDuneHeightPercent = level3.isSolved
    ? 0
    : Math.min(85, Math.floor(((60 - remaining) / 60) * 85));

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const sacredToken = gameState.sacredTokens.find((t) => t.originLevel === 3);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Chamber Header */}
      <div className="w-full stone-panel rounded-xl p-5 mb-6 text-center border-t-2 border-[#d4af37] relative z-20">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="text-left">
            <span className="text-[11px] font-mono-clean text-[#a98f6d] uppercase tracking-widest">
              Chamber III · Set-Khensu
            </span>
            <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-[#f7e096]">
              The Vault of the Sandstorm
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isGateOpen && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono-clean font-bold text-sm ${
                  level3.isSolved
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                    : remaining <= 15
                    ? 'bg-rose-950/90 border-rose-600 text-rose-300 animate-pulse'
                    : 'bg-[#1e130c] border-[#8c6d31] text-[#f7e096]'
                }`}
              >
                <Wind className="w-4 h-4" />
                <span>SANDSTORM: {formatTimer(remaining)}</span>
              </div>
            )}
            <button
              onClick={onOpenScroll}
              className="text-xs font-cinzel text-[#f3e6cf] hover:text-[#f8d486] underline underline-offset-4 decoration-[#8c6d31] transition-colors"
            >
              Read Scroll
            </button>
          </div>
        </div>
        <p className="text-xs text-[#bda482] font-sans-clean max-w-2xl mx-auto">
          Ceiling vents pour suffocating desert sand into the chamber. You must divine the sacred single-digit number between 1 and 9 before you are buried alive!
        </p>
      </div>

      {/* If Chamber Portal is Still Sealed */}
      {!isGateOpen ? (
        <div className="w-full max-w-md stone-panel rounded-2xl p-6 border-2 border-[#b88c3a] text-center my-8 shadow-2xl relative z-20">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#20150d] border border-[#8c6d31] flex items-center justify-center text-[#d4af37] mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-cinzel font-bold text-[#f7e096] mb-2">
            The Sand Vault Door is Sealed
          </h2>
          <p className="text-xs text-[#a98f6d] mb-4">
            Enter the 4-digit code unsealed from Chamber II (The Crypt of the Cipher) to open the airlock. Beware: the sandstorm timer begins upon entry!
          </p>

          <div className="flex items-center justify-center gap-2 mb-3">
            <input
              type="text"
              value={enteredGateCode}
              onChange={(e) => setEnteredGateCode(e.target.value)}
              placeholder="e.g. 4-8-1-5"
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
              The lock mechanism resists. Verify the code from Chamber II.
            </p>
          )}

          {level2.isSolved && (
            <button
              onClick={() => {
                setEnteredGateCode(level2.unlockedCode);
                handleUnlockGate(level2.unlockedCode);
              }}
              className="text-xs font-sans-clean text-[#d4af37] hover:underline flex items-center justify-center gap-1.5 mx-auto mt-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Use Code from Journal: {level2.unlockedCode}
            </button>
          )}
        </div>
      ) : (
        /* The Active Sandstorm Chamber */
        <div className="relative w-full max-w-2xl stone-panel rounded-2xl p-6 sm:p-8 border-2 border-[#b88c3a] shadow-2xl mb-8 overflow-hidden z-20">
          {/* Dynamic Sand Particles Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />

          {/* Progressive Sandstorm Dune Overlay */}
          {!level3.isSolved && (
            <div
              className="absolute inset-0 bg-[#e0b978] pointer-events-none transition-opacity duration-1000 z-10"
              style={{ opacity: sandOverlayOpacity }}
            />
          )}

          {/* Sand Dune Rising from Bottom */}
          {!level3.isSolved && sandDuneHeightPercent > 0 && (
            <div
              className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#c59c58] via-[#dfb776]/90 to-transparent pointer-events-none transition-all duration-1000 z-10"
              style={{ height: `${sandDuneHeightPercent}%` }}
            />
          )}

          {/* Content inside Chamber (above sand background) */}
          <div className="relative z-20">
            {/* Timer Banner */}
            <div className="flex items-center justify-between border-b border-[#6e502c] pb-4 mb-6">
              <div>
                <span className="text-[10px] font-mono-clean text-[#a98f6d] tracking-widest uppercase block mb-0.5">
                  Sandstorm Influx
                </span>
                <h3 className="text-base font-cinzel font-bold text-[#f7e096]">
                  Divine the Sacred Number (1 – 9)
                </h3>
              </div>
              <div
                className={`text-2xl sm:text-3xl font-mono-clean font-bold tracking-widest px-4 py-1.5 rounded-lg border ${
                  level3.isSolved
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                    : remaining <= 15
                    ? 'bg-rose-950 border-rose-600 text-rose-300 animate-pulse'
                    : 'bg-[#100b07] border-[#8c6d31] text-[#f7e096]'
                }`}
              >
                {formatTimer(remaining)}
              </div>
            </div>

            {/* Warning indicator */}
            {!level3.isSolved && (
              <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg bg-[#2b180d]/80 border border-[#85572b] text-xs text-[#ebcead]">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {remaining > 40 && 'Desert dust swirls through ceiling cracks. Choose carefully.'}
                  {remaining <= 40 && remaining > 20 && 'Sand cascades across the pedestals! The air grows thin.'}
                  {remaining <= 20 && remaining > 10 && 'Warning: Sand rises to your knees! Make haste!'}
                  {remaining <= 10 && 'The ceiling is collapsing! Submerge or escape now!'}
                </span>
              </div>
            )}

            {/* Number Selector (1 to 9 Single Digit) */}
            <div className="mb-6">
              <span className="text-xs font-cinzel font-bold text-[#f7e096] block mb-2 text-center">
                Select Your Single-Digit Divination (1–9):
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                  const wasGuessed = level3.guesses.some((g) => g.guess === num);
                  const isCorrect = level3.isSolved && level3.secretNumber === num;

                  return (
                    <button
                      key={num}
                      onClick={() => handleGuessSubmit(num)}
                      disabled={level3.isSolved || level3.isFailed}
                      className={`h-12 rounded-lg font-cinzel font-bold text-lg transition-all transform active:scale-95 shadow-md flex items-center justify-center ${
                        isCorrect
                          ? 'bg-emerald-600 text-white border-2 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                          : wasGuessed
                          ? 'bg-[#18110b] text-[#745f47] border border-[#3e2c1c] opacity-60'
                          : 'bg-gradient-to-b from-[#342417] to-[#1c130c] border border-[#8c6d31] text-[#f7e096] hover:border-[#f7e096] hover:scale-105 cursor-pointer'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback & Guesses History */}
            {lastFeedback && (
              <div
                className={`p-3.5 rounded-lg text-sm font-sans-clean font-semibold text-center mb-4 border ${
                  level3.isSolved
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                    : 'bg-[#29170e] border-[#8a4e2b] text-[#f7c28d]'
                }`}
              >
                {lastFeedback}
              </div>
            )}

            {/* History of Previous Guesses */}
            {level3.guesses.length > 0 && !level3.isSolved && (
              <div className="p-3 bg-[#120c08]/80 border border-[#523d24] rounded-lg mb-4 text-xs font-sans-clean">
                <span className="text-[#a98f6d] font-cinzel block mb-1">
                  Previous Invocations:
                </span>
                <div className="flex flex-wrap gap-2">
                  {level3.guesses.map((g, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-[#1e140d] border border-[#6b502d] text-[#e6d5b8]"
                    >
                      Guess #{g.guess}: <strong className="text-[#f7e096]">{g.feedback === 'higher' ? '↑ Higher' : '↓ Lower'}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chamber Solved State */}
            {level3.isSolved && (
              <div className="border-t border-[#6e502c] pt-5 mt-2 animate-in fade-in duration-300">
                <div className="flex items-center justify-center gap-2 mb-3 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-cinzel font-bold text-sm">
                    Sandstorm Quelled! Vault Preserved
                  </span>
                </div>

                {/* Unlocked Code for Level 4 */}
                <div className="bg-[#120c08] border border-[#8c6d31] p-4 rounded-xl mb-4 text-center">
                  <span className="text-[10px] font-cinzel text-[#a98f6d] uppercase tracking-widest block mb-1">
                    Gateway Key to Chamber IV (Shrine of Bastet)
                  </span>
                  <div className="text-3xl sm:text-4xl font-mono-clean font-bold text-[#f7e096] tracking-[0.25em]">
                    {level3.unlockedCode}
                  </div>
                  <span className="text-[11px] text-[#40e0d0] block mt-1 font-mono-clean">
                    ★ Single-digit sacred key for Chamber IV threshold
                  </span>
                </div>

                {/* Discovered Hidden Number for Chamber V */}
                <div className="flex items-center justify-center gap-3 p-3 bg-[#24170d] rounded-lg border border-[#78592c] mb-6">
                  <span className="text-3xl text-[#f7e096] hieroglyph-glow">𓇳</span>
                  <div className="text-left">
                    <span className="text-xs font-cinzel font-bold text-[#f3e6cf] block">
                      Hidden Seal Number III Discovered: <strong className="text-[#f7e096] text-base">{level3.hiddenNumber}</strong>
                    </span>
                    <span className="text-[11px] text-[#a98f6d]">
                      Divined from the sandstorm altar. Automatically recorded in your Field Journal for Chamber V!
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playStoneSlide();
                    onProceedToLevel(4);
                  }}
                  className="w-full py-3.5 px-6 font-cinzel font-bold text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <span>Proceed to Chamber IV: Shrine of Bastet</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
