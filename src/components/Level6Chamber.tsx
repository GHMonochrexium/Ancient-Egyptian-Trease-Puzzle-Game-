import React, { useState, useEffect } from 'react';
import { GamePlaythroughState, GameStateUpdater } from '../types/game';
import { decryptCaesar, binaryToString } from '../game/generator';
import { sound } from '../audio/soundManager';
import { Clock, Sparkles, CheckCircle2, RotateCw, Eye, ArrowRight, Lock } from 'lucide-react';

interface Level6ChamberProps {
  gameState: GamePlaythroughState;
  onUpdateState: (update: GameStateUpdater) => void;
  onVictory: () => void;
  onOpenScroll: () => void;
  onTriggerGameOver: (reason: string) => void;
}

export const Level6Chamber: React.FC<Level6ChamberProps> = ({
  gameState,
  onUpdateState,
  onVictory,
  onOpenScroll,
  onTriggerGameOver,
}) => {
  const { level6 } = gameState;
  const [activeStation, setActiveStation] = useState<'left' | 'center' | 'right' | 'altar'>('left');

  // Left Caesar state
  const [leftShift, setLeftShift] = useState(1);
  const leftLive = decryptCaesar(level6.leftCipher.ciphertext, leftShift);
  const [leftInput, setLeftInput] = useState('');
  const [leftFeedback, setLeftFeedback] = useState<string | null>(null);

  // Center Binary state
  const [binaryInput, setBinaryInput] = useState('');
  const [binaryFeedback, setBinaryFeedback] = useState<string | null>(null);
  const [showBinaryHelper, setShowBinaryHelper] = useState(false);

  // Right Caesar state
  const [rightShift, setRightShift] = useState(1);
  const rightLive = decryptCaesar(level6.rightCipher.ciphertext, rightShift);
  const [rightInput, setRightInput] = useState('');
  const [rightFeedback, setRightFeedback] = useState<string | null>(null);

  // Master Altar state
  const [masterInput, setMasterInput] = useState('');
  const [masterFeedback, setMasterFeedback] = useState<string | null>(null);

  // Keep input synced if user changes shift and hasn't manually typed
  useEffect(() => {
    if (!leftInput) {
      // preview is available
    }
  }, [leftShift]);

  // 10-Minute (600 seconds) Countdown Timer
  useEffect(() => {
    if (level6.isSolved || level6.isFailed) return;

    const timer = setInterval(() => {
      onUpdateState((prev) => {
        const nextTime = Math.max(0, prev.level6.timeRemaining - 1);
        if (nextTime <= 0 && !prev.level6.isSolved && !prev.level6.isFailed) {
          sound.playMismatchThud();
          onTriggerGameOver(
            'PURGATORY HAS CLAIMED YOUR SOUL. The ten minutes have expired and the obsidian doors are permanently sealed.'
          );
          return {
            ...prev,
            level6: {
              ...prev.level6,
              timeRemaining: 0,
              isFailed: true,
            },
          };
        }
        return {
          ...prev,
          level6: {
            ...prev.level6,
            timeRemaining: nextTime,
          },
        };
      });

      // Sound ticks for tension
      if (level6.timeRemaining <= 60) {
        sound.playTimerTick(true);
      } else if (level6.timeRemaining % 10 === 0) {
        sound.playTimerTick(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [level6.isSolved, level6.isFailed, onUpdateState, onTriggerGameOver, level6.timeRemaining]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Submit Left Caesar
  const handleSubmitLeft = () => {
    sound.playStoneClick();
    const candidate = (leftInput.trim() || leftLive).toUpperCase();
    const target = level6.leftCipher.plaintext.toUpperCase();

    if (candidate === target || leftLive.toUpperCase() === target) {
      sound.playCodeUnlock();
      setLeftFeedback(`Correct! The Left Stele reveals the sacred word: "${target}".`);
      onUpdateState((prev) => ({
        ...prev,
        level6: {
          ...prev.level6,
          leftCipher: {
            ...prev.level6.leftCipher,
            userAnswer: target,
            isSolved: true,
          },
        },
      }));
    } else {
      sound.playMismatchThud();
      setLeftFeedback(`"${candidate}" is discordant with the cosmic left pillar. Continue shifting.`);
    }
  };

  // Submit Center Binary
  const handleSubmitBinary = () => {
    sound.playStoneClick();
    const candidate = binaryInput.trim().toUpperCase();
    const target = level6.centerBinary.plaintextWord.toUpperCase();

    if (candidate === target) {
      sound.playCodeUnlock();
      setBinaryFeedback(`Correct! The Obelisk pulses with pure gold light: "${target}".`);
      onUpdateState((prev) => ({
        ...prev,
        level6: {
          ...prev.level6,
          centerBinary: {
            ...prev.level6.centerBinary,
            userAnswer: target,
            isSolved: true,
          },
        },
      }));
    } else {
      sound.playMismatchThud();
      setBinaryFeedback(`"${candidate || 'EMPTY'}" does not unlock the glowing obelisk. Convert each 8-bit byte to ASCII.`);
    }
  };

  // Quick translate helper for binary
  const handleAutoTranslateBinary = () => {
    sound.playStoneClick();
    const translated = binaryToString(level6.centerBinary.binarySequence);
    setBinaryInput(translated);
  };

  // Submit Right Caesar
  const handleSubmitRight = () => {
    sound.playStoneClick();
    const candidate = (rightInput.trim() || rightLive).toUpperCase();
    const target = level6.rightCipher.plaintext.toUpperCase();

    if (candidate === target || rightLive.toUpperCase() === target) {
      sound.playCodeUnlock();
      setRightFeedback(`Correct! The Right Stele reveals the sacred word: "${target}".`);
      onUpdateState((prev) => ({
        ...prev,
        level6: {
          ...prev.level6,
          rightCipher: {
            ...prev.level6.rightCipher,
            userAnswer: target,
            isSolved: true,
          },
        },
      }));
    } else {
      sound.playMismatchThud();
      setRightFeedback(`"${candidate}" does not appease the right pillar. Continue shifting.`);
    }
  };

  // Submit Master Altar
  const handleFinalTreasureUnlock = () => {
    sound.playStoneClick();
    const targetMaster = level6.finalMasterWord.toUpperCase();
    const cleanInput = masterInput.trim().toUpperCase().replace(/\s+/g, ' ');
    const allThreeSolved =
      level6.leftCipher.isSolved && level6.centerBinary.isSolved && level6.rightCipher.isSolved;

    if (allThreeSolved || cleanInput === targetMaster) {
      sound.playTreasureVictory();
      onUpdateState((prev) => ({
        ...prev,
        level6: {
          ...prev.level6,
          isSolved: true,
        },
        completedLevels: !prev.completedLevels.includes(6)
          ? [...prev.completedLevels, 6]
          : prev.completedLevels,
      }));
      onVictory();
    } else {
      sound.playMismatchThud();
      setMasterFeedback('All three sacred altars (Left, Center, Right) must be decrypted and presented to the Altar.');
    }
  };

  const allThreeSolved =
    level6.leftCipher.isSolved && level6.centerBinary.isSolved && level6.rightCipher.isSolved;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Purgatory Dramatic Banner */}
      <div className="relative w-full rounded-2xl overflow-hidden mb-6 border-2 border-[#b88c3a] shadow-2xl bg-[#0c0906]">
        {/* Background Hall Image */}
        <div className="absolute inset-0 opacity-40">
          <img
            src="/src/assets/images/egyptian_purgatory_hall_1791117264065.jpg"
            alt="Purgatory Hall"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/90"></div>

        <div className="relative p-6 z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-xs font-mono-clean text-rose-400 font-bold uppercase tracking-widest">
                Chamber VI · Duat-Amenti
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-cinzel font-bold text-[#f7e096] hieroglyph-glow">
              PURGATORY
            </h1>
            <p className="text-xs text-[#bca378] font-sans-clean mt-1 max-w-lg">
              Three ancient decoding mechanisms stand between you and the Pharaoh’s eternal treasure vault. You have ten minutes to solve all three before the curse seals the ruin!
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2">
            <div
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-mono-clean font-bold text-xl sm:text-2xl shadow-xl ${
                level6.timeRemaining <= 60
                  ? 'bg-rose-950/90 border-rose-600 text-rose-300 animate-pulse'
                  : 'bg-[#18110b] border-[#d4af37] text-[#f7e096]'
              }`}
            >
              <Clock className="w-5 h-5 text-[#d4af37]" />
              <span>PURGATORY — {formatTimer(level6.timeRemaining)}</span>
            </div>
            <button
              onClick={onOpenScroll}
              className="text-xs font-cinzel text-[#f3e6cf] hover:text-[#f8d486] underline underline-offset-4 decoration-[#8c6d31] transition-colors"
            >
              Consult Ancient Scroll
            </button>
          </div>
        </div>
      </div>

      {/* Station Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mb-6">
        <button
          onClick={() => {
            sound.playStoneClick();
            setActiveStation('left');
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeStation === 'left'
              ? 'bg-[#3b2917] border-[#f7e096] shadow-md'
              : 'bg-[#18100a] border-[#5a4224] hover:bg-[#24170d]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono-clean text-[#a98f6d]">STATION 1</span>
            {level6.leftCipher.isSolved && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <span className="text-xs font-cinzel font-bold text-[#f7e096] block truncate">
            Left Caesar Tablet
          </span>
          <span className="text-[10px] text-[#9c8263] block truncate">
            {level6.leftCipher.isSolved ? `Decoded: ${level6.leftCipher.userAnswer}` : 'Unsolved'}
          </span>
        </button>

        <button
          onClick={() => {
            sound.playStoneClick();
            setActiveStation('center');
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeStation === 'center'
              ? 'bg-[#3b2917] border-[#f7e096] shadow-md'
              : 'bg-[#18100a] border-[#5a4224] hover:bg-[#24170d]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono-clean text-[#a98f6d]">STATION 2</span>
            {level6.centerBinary.isSolved && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <span className="text-xs font-cinzel font-bold text-[#f7e096] block truncate">
            Center Binary Obelisk
          </span>
          <span className="text-[10px] text-[#9c8263] block truncate">
            {level6.centerBinary.isSolved ? `Decoded: ${level6.centerBinary.userAnswer}` : 'Unsolved'}
          </span>
        </button>

        <button
          onClick={() => {
            sound.playStoneClick();
            setActiveStation('right');
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeStation === 'right'
              ? 'bg-[#3b2917] border-[#f7e096] shadow-md'
              : 'bg-[#18100a] border-[#5a4224] hover:bg-[#24170d]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono-clean text-[#a98f6d]">STATION 3</span>
            {level6.rightCipher.isSolved && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <span className="text-xs font-cinzel font-bold text-[#f7e096] block truncate">
            Right Caesar Stele
          </span>
          <span className="text-[10px] text-[#9c8263] block truncate">
            {level6.rightCipher.isSolved ? `Decoded: ${level6.rightCipher.userAnswer}` : 'Unsolved'}
          </span>
        </button>

        <button
          onClick={() => {
            sound.playStoneClick();
            setActiveStation('altar');
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            activeStation === 'altar'
              ? 'bg-gradient-to-r from-[#443118] to-[#2b1f0f] border-[#f7e096] shadow-[0_0_15px_rgba(247,224,150,0.3)]'
              : 'bg-[#18100a] border-[#8c6d31] hover:bg-[#24170d]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono-clean text-[#e8c76e] font-bold">SANCTUM</span>
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
          </div>
          <span className="text-xs font-cinzel font-bold text-[#fcecb6] block truncate">
            Master Golden Altar
          </span>
          <span className="text-[10px] text-[#bca378] block truncate">
            {allThreeSolved ? 'Trinity Ready to Unseal!' : 'Requires 3 Seals'}
          </span>
        </button>
      </div>

      {/* Active Station View */}
      <div className="w-full stone-panel rounded-2xl p-6 sm:p-8 border-2 border-[#b88c3a] shadow-2xl mb-8">
        {/* ================= STATION 1: LEFT CAESAR CIPHER ================= */}
        {activeStation === 'left' && (
          <div>
            <div className="text-center border-b border-[#6e502c] pb-4 mb-6">
              <span className="text-[10px] font-mono-clean text-[#a98f6d] tracking-widest uppercase block mb-1">
                Station I · Western Obsidian Wing
              </span>
              <h2 className="text-xl font-cinzel font-bold text-[#f7e096] mb-2">
                The Left Caesar Cipher Tablet
              </h2>
              <div className="bg-[#120d09] border border-[#8c6d31] p-4 rounded-xl inline-block max-w-full my-2">
                <span className="text-[10px] font-cinzel text-[#8c6d31] uppercase tracking-wider block mb-1">
                  Carved Ciphertext on Left Tablet
                </span>
                <span className="text-2xl sm:text-3xl font-mono-clean font-bold tracking-[0.3em] text-[#e8c76e] hieroglyph-glow">
                  {level6.leftCipher.ciphertext}
                </span>
              </div>
              <p className="text-xs text-[#a98f6d] mt-2 italic font-sans-clean">
                Shift the letters or type the decoded sacred word directly into the tablet.
              </p>
            </div>

            {/* Stepper & Slider */}
            <div className="bg-[#1a120c] border border-[#5a4224] rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-cinzel font-bold text-[#f7e096]">
                  Shift Stepper:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sound.playStoneClick();
                      const n = ((leftShift - 2 + 25) % 25) + 1;
                      setLeftShift(n);
                      setLeftInput(decryptCaesar(level6.leftCipher.ciphertext, n));
                    }}
                    className="w-8 h-8 rounded bg-[#2a1c12] border border-[#725227] text-[#f7e096] hover:bg-[#3d2919] font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-mono-clean font-bold text-lg text-[#d4af37]">
                    +{leftShift}
                  </span>
                  <button
                    onClick={() => {
                      sound.playStoneClick();
                      const n = (leftShift % 25) + 1;
                      setLeftShift(n);
                      setLeftInput(decryptCaesar(level6.leftCipher.ciphertext, n));
                    }}
                    className="w-8 h-8 rounded bg-[#2a1c12] border border-[#725227] text-[#f7e096] hover:bg-[#3d2919] font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="1"
                max="25"
                value={leftShift}
                onChange={(e) => {
                  const n = parseInt(e.target.value);
                  setLeftShift(n);
                  setLeftInput(decryptCaesar(level6.leftCipher.ciphertext, n));
                }}
                className="w-full accent-[#d4af37] bg-[#2d1f14] h-2 rounded-lg cursor-pointer mb-4"
              />

              <div className="p-4 rounded-lg bg-[#0e0a07] border border-[#7c5d31] text-center mb-4">
                <span className="text-[10px] font-cinzel text-[#9c8263] uppercase tracking-wider block mb-1">
                  Deciphered Translation at Shift +{leftShift}
                </span>
                <span className="text-2xl sm:text-3xl font-mono-clean font-bold tracking-[0.25em] text-[#f7e096]">
                  {leftLive}
                </span>
              </div>

              {/* Direct Word Input */}
              <div className="text-center">
                <span className="text-xs font-cinzel text-[#bca378] block mb-1">
                  Word to Submit:
                </span>
                <input
                  type="text"
                  value={leftInput || leftLive}
                  onChange={(e) => setLeftInput(e.target.value.toUpperCase())}
                  placeholder="e.g. ETERNAL"
                  disabled={level6.leftCipher.isSolved}
                  className="px-4 py-2.5 bg-[#0e0a07] border border-[#7c5d31] rounded-lg text-center font-mono-clean font-bold tracking-widest text-lg text-[#f7e096] focus:outline-none focus:border-[#d4af37] w-64 max-w-full mx-auto"
                />
              </div>
            </div>

            {leftFeedback && (
              <div
                className={`p-3 rounded-lg text-xs font-sans-clean text-center mb-4 ${
                  level6.leftCipher.isSolved
                    ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
                    : 'bg-rose-950/80 border border-rose-700 text-rose-300'
                }`}
              >
                {leftFeedback}
              </div>
            )}

            {!level6.leftCipher.isSolved ? (
              <button
                onClick={handleSubmitLeft}
                className="w-full py-3.5 px-6 font-cinzel font-bold text-xs sm:text-sm text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>Submit Left Word: "{leftInput || leftLive}"</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-950/60 border border-emerald-600 rounded-xl text-center">
                  <span className="text-xs font-cinzel font-bold text-emerald-400 block mb-1">
                    Left Tablet Decoded & Harmonized
                  </span>
                  <span className="text-xl font-mono-clean font-bold text-[#f7e096] tracking-widest">
                    {level6.leftCipher.userAnswer}
                  </span>
                </div>
                <button
                  onClick={() => {
                    sound.playStoneClick();
                    setActiveStation('center');
                  }}
                  className="w-full py-3 px-4 font-cinzel font-semibold text-xs text-[#ebd9ba] bg-[#22160d] hover:bg-[#342214] border border-[#6b502d] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Proceed to Station II (Center Obelisk)</span>
                  <ArrowRight className="w-4 h-4 text-[#d4af37]" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= STATION 2: CENTER BINARY OBELISK ================= */}
        {activeStation === 'center' && (
          <div>
            <div className="text-center border-b border-[#6e502c] pb-4 mb-6">
              <span className="text-[10px] font-mono-clean text-[#a98f6d] tracking-widest uppercase block mb-1">
                Station II · Central Lapis Sanctum
              </span>
              <h2 className="text-xl font-cinzel font-bold text-[#f7e096] mb-2">
                The Glowing Binary Obelisk
              </h2>
              <div className="bg-[#0b141a] border border-[#2d8299] p-4 rounded-xl inline-block max-w-full my-2">
                <span className="text-[10px] font-cinzel text-[#4dd2eb] uppercase tracking-wider block mb-1">
                  Glowing Lapis Lazuli Binary Stream
                </span>
                <span className="text-base sm:text-xl font-mono-clean font-bold tracking-[0.15em] text-[#71e8ff] turquoise-glow break-all">
                  {level6.centerBinary.binarySequence}
                </span>
              </div>
              <p className="text-xs text-[#a98f6d] mt-2 italic font-sans-clean">
                Convert each 8-bit byte to its corresponding ASCII letter.
              </p>
            </div>

            {/* Binary Helper / Rosetta Stone Toggle */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <button
                onClick={() => {
                  sound.playStoneClick();
                  setShowBinaryHelper(!showBinaryHelper);
                }}
                className="text-xs font-cinzel text-[#d4af37] hover:underline flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>{showBinaryHelper ? 'Hide' : 'Reveal'} Ancient Binary Rosetta Reference</span>
              </button>
              <button
                onClick={handleAutoTranslateBinary}
                className="text-xs font-cinzel text-[#71e8ff] hover:underline flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Quick-Transcribe Binary</span>
              </button>
            </div>

            {showBinaryHelper && (
              <div className="p-4 rounded-xl bg-[#11191d] border border-[#2b6575] mb-6 animate-in fade-in duration-200">
                <span className="text-xs font-cinzel font-bold text-[#4dd2eb] block mb-2 text-center uppercase tracking-wider">
                  Sacred Binary Inscriptions Reference
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-clean text-[#beeaf2]">
                  <div>G = 01000111</div>
                  <div>O = 01001111</div>
                  <div>L = 01001100</div>
                  <div>D = 01000100</div>
                  <div>I = 01001001</div>
                  <div>F = 01000110</div>
                  <div>E = 01000101</div>
                  <div>T = 01010100</div>
                  <div>M = 01001101</div>
                  <div>B = 01000010</div>
                  <div>S = 01010011</div>
                  <div>U = 01010101</div>
                  <div>N = 01001110</div>
                  <div>K = 01001011</div>
                  <div>R = 01010010</div>
                  <div>C = 01000011</div>
                </div>
              </div>
            )}

            {/* Input Form */}
            <div className="bg-[#1a120c] border border-[#5a4224] rounded-xl p-5 mb-6 text-center">
              <span className="text-xs font-cinzel font-bold text-[#f7e096] block mb-2">
                Enter Decoded Word (4 Letters):
              </span>
              <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
                <input
                  type="text"
                  value={binaryInput}
                  onChange={(e) => setBinaryInput(e.target.value.toUpperCase())}
                  placeholder="e.g. GOLD"
                  maxLength={6}
                  disabled={level6.centerBinary.isSolved}
                  className="px-4 py-3 bg-[#0e0a07] border border-[#7c5d31] rounded-lg text-center font-mono-clean font-bold tracking-widest text-xl text-[#f7e096] focus:outline-none focus:border-[#d4af37] w-full"
                />
              </div>
            </div>

            {binaryFeedback && (
              <div
                className={`p-3 rounded-lg text-xs font-sans-clean text-center mb-4 ${
                  level6.centerBinary.isSolved
                    ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
                    : 'bg-rose-950/80 border border-rose-700 text-rose-300'
                }`}
              >
                {binaryFeedback}
              </div>
            )}

            {!level6.centerBinary.isSolved ? (
              <button
                onClick={handleSubmitBinary}
                className="w-full py-3.5 px-6 font-cinzel font-bold text-xs sm:text-sm text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit Binary Word: "{binaryInput || '...'}"</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-950/60 border border-emerald-600 rounded-xl text-center">
                  <span className="text-xs font-cinzel font-bold text-emerald-400 block mb-1">
                    Center Obelisk Decoded & Harmonized
                  </span>
                  <span className="text-xl font-mono-clean font-bold text-[#f7e096] tracking-widest">
                    {level6.centerBinary.userAnswer}
                  </span>
                </div>
                <button
                  onClick={() => {
                    sound.playStoneClick();
                    setActiveStation('right');
                  }}
                  className="w-full py-3 px-4 font-cinzel font-semibold text-xs text-[#ebd9ba] bg-[#22160d] hover:bg-[#342214] border border-[#6b502d] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Proceed to Station III (Right Stele)</span>
                  <ArrowRight className="w-4 h-4 text-[#d4af37]" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= STATION 3: RIGHT CAESAR CIPHER ================= */}
        {activeStation === 'right' && (
          <div>
            <div className="text-center border-b border-[#6e502c] pb-4 mb-6">
              <span className="text-[10px] font-mono-clean text-[#a98f6d] tracking-widest uppercase block mb-1">
                Station III · Eastern Obsidian Wing
              </span>
              <h2 className="text-xl font-cinzel font-bold text-[#f7e096] mb-2">
                The Right Caesar Stele
              </h2>
              <div className="bg-[#120d09] border border-[#8c6d31] p-4 rounded-xl inline-block max-w-full my-2">
                <span className="text-[10px] font-cinzel text-[#8c6d31] uppercase tracking-wider block mb-1">
                  Carved Ciphertext on Right Stele
                </span>
                <span className="text-2xl sm:text-3xl font-mono-clean font-bold tracking-[0.3em] text-[#e8c76e] hieroglyph-glow">
                  {level6.rightCipher.ciphertext}
                </span>
              </div>
              <p className="text-xs text-[#a98f6d] mt-2 italic font-sans-clean">
                Shift the letters or type the decoded sacred word directly into the stele.
              </p>
            </div>

            {/* Stepper & Slider */}
            <div className="bg-[#1a120c] border border-[#5a4224] rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-cinzel font-bold text-[#f7e096]">
                  Shift Stepper:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sound.playStoneClick();
                      const n = ((rightShift - 2 + 25) % 25) + 1;
                      setRightShift(n);
                      setRightInput(decryptCaesar(level6.rightCipher.ciphertext, n));
                    }}
                    className="w-8 h-8 rounded bg-[#2a1c12] border border-[#725227] text-[#f7e096] hover:bg-[#3d2919] font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-mono-clean font-bold text-lg text-[#d4af37]">
                    +{rightShift}
                  </span>
                  <button
                    onClick={() => {
                      sound.playStoneClick();
                      const n = (rightShift % 25) + 1;
                      setRightShift(n);
                      setRightInput(decryptCaesar(level6.rightCipher.ciphertext, n));
                    }}
                    className="w-8 h-8 rounded bg-[#2a1c12] border border-[#725227] text-[#f7e096] hover:bg-[#3d2919] font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="1"
                max="25"
                value={rightShift}
                onChange={(e) => {
                  const n = parseInt(e.target.value);
                  setRightShift(n);
                  setRightInput(decryptCaesar(level6.rightCipher.ciphertext, n));
                }}
                className="w-full accent-[#d4af37] bg-[#2d1f14] h-2 rounded-lg cursor-pointer mb-4"
              />

              <div className="p-4 rounded-lg bg-[#0e0a07] border border-[#7c5d31] text-center mb-4">
                <span className="text-[10px] font-cinzel text-[#9c8263] uppercase tracking-wider block mb-1">
                  Deciphered Translation at Shift +{rightShift}
                </span>
                <span className="text-2xl sm:text-3xl font-mono-clean font-bold tracking-[0.25em] text-[#f7e096]">
                  {rightLive}
                </span>
              </div>

              {/* Direct Word Input */}
              <div className="text-center">
                <span className="text-xs font-cinzel text-[#bca378] block mb-1">
                  Word to Submit:
                </span>
                <input
                  type="text"
                  value={rightInput || rightLive}
                  onChange={(e) => setRightInput(e.target.value.toUpperCase())}
                  placeholder="e.g. FLAME"
                  disabled={level6.rightCipher.isSolved}
                  className="px-4 py-2.5 bg-[#0e0a07] border border-[#7c5d31] rounded-lg text-center font-mono-clean font-bold tracking-widest text-lg text-[#f7e096] focus:outline-none focus:border-[#d4af37] w-64 max-w-full mx-auto"
                />
              </div>
            </div>

            {rightFeedback && (
              <div
                className={`p-3 rounded-lg text-xs font-sans-clean text-center mb-4 ${
                  level6.rightCipher.isSolved
                    ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
                    : 'bg-rose-950/80 border border-rose-700 text-rose-300'
                }`}
              >
                {rightFeedback}
              </div>
            )}

            {!level6.rightCipher.isSolved ? (
              <button
                onClick={handleSubmitRight}
                className="w-full py-3.5 px-6 font-cinzel font-bold text-xs sm:text-sm text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>Submit Right Word: "{rightInput || rightLive}"</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-950/60 border border-emerald-600 rounded-xl text-center">
                  <span className="text-xs font-cinzel font-bold text-emerald-400 block mb-1">
                    Right Stele Decoded & Harmonized
                  </span>
                  <span className="text-xl font-mono-clean font-bold text-[#f7e096] tracking-widest">
                    {level6.rightCipher.userAnswer}
                  </span>
                </div>
                <button
                  onClick={() => {
                    sound.playStoneClick();
                    setActiveStation('altar');
                  }}
                  className="w-full py-3 px-4 font-cinzel font-semibold text-xs text-[#ebd9ba] bg-[#22160d] hover:bg-[#342214] border border-[#6b502d] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Proceed to Master Golden Altar</span>
                  <ArrowRight className="w-4 h-4 text-[#d4af37]" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= SANCTUM: MASTER GOLDEN ALTAR ================= */}
        {activeStation === 'altar' && (
          <div className="text-center">
            <div className="border-b border-[#6e502c] pb-4 mb-6">
              <span className="text-[10px] font-mono-clean text-[#a98f6d] tracking-widest uppercase block mb-1">
                The Final Incantation
              </span>
              <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-[#f7e096] mb-2">
                The Master Golden Altar
              </h2>
              <p className="text-xs text-[#bca378] font-sans-clean max-w-lg mx-auto">
                Offer the three decoded sacred words to shatter the curse of Purgatory and swing open the Pharaoh’s Treasure Vault.
              </p>
            </div>

            {/* Status of the 3 seals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div
                onClick={() => {
                  sound.playStoneClick();
                  setActiveStation('left');
                }}
                className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                  level6.leftCipher.isSolved
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-[#18110b] border-[#42311f] text-[#7d674f] hover:border-[#8c6d31]'
                }`}
              >
                <span className="text-[10px] font-mono-clean uppercase tracking-wider block mb-1">
                  Left Seal
                </span>
                <span className="text-base font-cinzel font-bold block">
                  {level6.leftCipher.isSolved ? level6.leftCipher.userAnswer : 'LOCKED (Click)'}
                </span>
              </div>

              <div
                onClick={() => {
                  sound.playStoneClick();
                  setActiveStation('center');
                }}
                className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                  level6.centerBinary.isSolved
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-[#18110b] border-[#42311f] text-[#7d674f] hover:border-[#8c6d31]'
                }`}
              >
                <span className="text-[10px] font-mono-clean uppercase tracking-wider block mb-1">
                  Center Seal
                </span>
                <span className="text-base font-cinzel font-bold block">
                  {level6.centerBinary.isSolved ? level6.centerBinary.userAnswer : 'LOCKED (Click)'}
                </span>
              </div>

              <div
                onClick={() => {
                  sound.playStoneClick();
                  setActiveStation('right');
                }}
                className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                  level6.rightCipher.isSolved
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-[#18110b] border-[#42311f] text-[#7d674f] hover:border-[#8c6d31]'
                }`}
              >
                <span className="text-[10px] font-mono-clean uppercase tracking-wider block mb-1">
                  Right Seal
                </span>
                <span className="text-base font-cinzel font-bold block">
                  {level6.rightCipher.isSolved ? level6.rightCipher.userAnswer : 'LOCKED (Click)'}
                </span>
              </div>
            </div>

            {masterFeedback && (
              <div className="p-3 bg-rose-950/80 border border-rose-700 text-rose-300 rounded-lg text-xs font-sans-clean mb-4">
                {masterFeedback}
              </div>
            )}

            {/* Combined Incantation Action */}
            {allThreeSolved ? (
              <div className="bg-[#18120b] border-2 border-[#d4af37] p-6 rounded-2xl animate-in zoom-in-95 duration-300 shadow-2xl">
                <span className="text-xs font-cinzel text-[#d4af37] uppercase tracking-widest block mb-1">
                  The Complete Divine Incantation
                </span>
                <div className="text-2xl sm:text-3xl font-cinzel font-bold text-[#f7e096] hieroglyph-glow tracking-[0.2em] mb-4">
                  {level6.finalMasterWord}
                </div>
                <button
                  onClick={handleFinalTreasureUnlock}
                  className="w-full py-4 px-8 font-cinzel font-bold text-sm sm:text-base text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Sparkles className="w-6 h-6" />
                  <span>Unseal the Pharaoh’s Golden Treasure Vault!</span>
                </button>
              </div>
            ) : (
              <div className="p-6 bg-[#140e0a] border border-[#523d24] rounded-2xl text-xs text-[#a98f6d]">
                <Lock className="w-6 h-6 mx-auto mb-2 text-[#7d674f]" />
                <p className="mb-4">
                  Decode the Left Tablet, the Center Obelisk, and the Right Stele to summon the final divine words before the timer expires!
                </p>
                <div className="max-w-md mx-auto">
                  <span className="text-[11px] font-cinzel text-[#8c6d31] block mb-1">
                    Or whisper the complete 3-word phrase if already deduced:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={masterInput}
                      onChange={(e) => setMasterInput(e.target.value.toUpperCase())}
                      placeholder="e.g. ETERNAL GOLD FLAME"
                      className="px-3 py-2 bg-[#0e0a07] border border-[#7c5d31] rounded-lg text-center font-mono-clean font-bold tracking-wider text-xs text-[#f7e096] focus:outline-none focus:border-[#d4af37] flex-1"
                    />
                    <button
                      onClick={handleFinalTreasureUnlock}
                      className="px-4 py-2 font-cinzel font-bold text-xs text-[#140e0a] bg-gradient-to-r from-[#f7e096] to-[#d4af37] rounded-lg"
                    >
                      Invoke
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
