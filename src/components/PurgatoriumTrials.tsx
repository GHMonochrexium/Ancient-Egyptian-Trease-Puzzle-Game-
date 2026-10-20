import React, { useState, useEffect, useRef } from 'react';
import { GamePlaythroughState, GameStateUpdater, SymbolCard } from '../types/game';
import { encryptCaesar, stringToBinary, shuffleArray } from '../game/generator';
import { sound } from '../audio/soundManager';
import {
  Clock,
  Flame,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Skull,
  Swords,
  CheckCircle2,
  Lock,
  Wind,
} from 'lucide-react';

interface PurgatoriumTrialsProps {
  gameState: GamePlaythroughState;
  onUpdateState: (update: GameStateUpdater) => void;
  onCompletePurgatorium: () => void;
  onFailPurgatorium: () => void;
  onReturnToMainGame: () => void;
}

export const PurgatoriumTrials: React.FC<PurgatoriumTrialsProps> = ({
  gameState,
  onUpdateState,
  onCompletePurgatorium,
  onFailPurgatorium,
  onReturnToMainGame,
}) => {
  const { act3 } = gameState;
  const { purgatorium } = act3;

  // Single continuous 7-minute (420s) timer across all 10 trials
  const [timeLeft, setTimeLeft] = useState(purgatorium.timeRemaining || 420);
  const [currentTrial, setCurrentTrial] = useState(purgatorium.currentTrial || 1);
  const [isFailed, setIsFailed] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Active Timer Effect
  useEffect(() => {
    if (isFailed || purgatorium.isCompleted) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          sound.playCurseWhisper();
          setIsFailed(true);
          return 0;
        }
        if (prev <= 30) {
          sound.playTimerTick(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isFailed, purgatorium.isCompleted]);

  // Sync timeLeft back to gameState periodically
  useEffect(() => {
    onUpdateState((prev) => ({
      ...prev,
      act3: {
        ...prev.act3,
        purgatorium: {
          ...prev.act3.purgatorium,
          timeRemaining: timeLeft,
          currentTrial,
        },
      },
    }));
  }, [currentTrial, onUpdateState]);

  // Advance to next trial
  const advanceTrial = (solvedTrialNum: number) => {
    sound.playCodeUnlock();
    if (solvedTrialNum >= 10) {
      if (timerRef.current) clearInterval(timerRef.current);
      onCompletePurgatorium();
    } else {
      setCurrentTrial(solvedTrialNum + 1);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- TRIAL 1 STATE (24 Cards / 12 Pairs) ---
  const [trial1Cards, setTrial1Cards] = useState<SymbolCard[]>(() => {
    const symbols = [
      { key: 'eye', name: 'Eye of Horus', glyph: '𓂀' },
      { key: 'ankh', name: 'Key of Life', glyph: '𓋹' },
      { key: 'scarab', name: 'Sacred Scarab', glyph: '𓆣' },
      { key: 'djed', name: 'Djed Pillar', glyph: '𓊽' },
      { key: 'falcon', name: 'Horus Falcon', glyph: '𓅃' },
      { key: 'lotus', name: 'Nile Lotus', glyph: '𓆸' },
      { key: 'serpent', name: 'Uraeus Serpent', glyph: '𓆓' },
      { key: 'sun', name: 'Sun of Ra', glyph: '𓇳' },
      { key: 'crown', name: 'Pharaoh Crown', glyph: '𓋑' },
      { key: 'feather', name: "Ma'at Feather", glyph: '𓇌' },
      { key: 'cat', name: 'Bastet Cat', glyph: '𓃠' },
      { key: 'jackal', name: 'Anubis Jackal', glyph: '𓃦' },
    ];
    const deck: SymbolCard[] = [];
    let id = 1;
    symbols.forEach((s) => {
      deck.push({ id: id++, symbolKey: s.key, name: s.name, glyph: s.glyph, isFlipped: false, isMatched: false });
      deck.push({ id: id++, symbolKey: s.key, name: s.name, glyph: s.glyph, isFlipped: false, isMatched: false });
    });
    return shuffleArray(deck);
  });
  const [flipped1, setFlipped1] = useState<number[]>([]);
  const [matchedPairs1, setMatchedPairs1] = useState(0);

  const handleFlipCard1 = (id: number) => {
    if (flipped1.length >= 2 || flipped1.includes(id)) return;
    const card = trial1Cards.find((c) => c.id === id);
    if (!card || card.isMatched) return;

    sound.playStoneClick();
    const nextFlipped = [...flipped1, id];
    setFlipped1(nextFlipped);

    if (nextFlipped.length === 2) {
      const first = trial1Cards.find((c) => c.id === nextFlipped[0])!;
      const second = trial1Cards.find((c) => c.id === nextFlipped[1])!;

      if (first.symbolKey === second.symbolKey) {
        sound.playMatchChime();
        setTrial1Cards((prev) =>
          prev.map((c) => (c.id === first.id || c.id === second.id ? { ...c, isMatched: true } : c))
        );
        setMatchedPairs1((m) => {
          const next = m + 1;
          if (next >= 12) {
            setTimeout(() => advanceTrial(1), 600);
          }
          return next;
        });
        setFlipped1([]);
      } else {
        sound.playMismatchThud();
        setTimeout(() => setFlipped1([]), 800);
      }
    }
  };

  // --- TRIAL 2 STATE (Harder Caesar Crypt) ---
  const [t2Input, setT2Input] = useState('');
  const [t2Feedback, setT2Feedback] = useState<string | null>(null);
  const t2Plain = 'SARCOPHAGUS';
  const t2Shift = 8;
  const t2Cipher = encryptCaesar(t2Plain, t2Shift);

  const handleT2Submit = () => {
    if (t2Input.trim().toUpperCase() === t2Plain) {
      setT2Feedback('Correct! Decoy runes dispelled.');
      advanceTrial(2);
    } else {
      sound.playMismatchThud();
      setT2Feedback('Cipher rejected! Step pace was 8.');
    }
  };

  // --- TRIAL 3 STATE (High-Speed Sandstorm Number: 1 to 25) ---
  const [t3Secret] = useState(() => Math.floor(Math.random() * 25) + 1);
  const [t3Input, setT3Input] = useState('');
  const [t3Feedback, setT3Feedback] = useState<string | null>(null);

  const handleT3Submit = () => {
    const n = parseInt(t3Input.trim(), 10);
    if (isNaN(n) || n < 1 || n > 25) {
      sound.playMismatchThud();
      setT3Feedback('Enter an integer between 1 and 25.');
      return;
    }
    sound.playStoneClick();
    if (n === t3Secret) {
      setT3Feedback('Sacred number balanced! Sandstorm freezes.');
      advanceTrial(3);
    } else if (n < t3Secret) {
      sound.playMismatchThud();
      setT3Feedback(`${n} is TOO LOW! (↑ Aim Higher)`);
    } else {
      sound.playMismatchThud();
      setT3Feedback(`${n} is TOO HIGH! (↓ Aim Lower)`);
    }
    setT3Input('');
  };

  // --- TRIAL 4 STATE (Corrupted Meowdo: Win 5 rounds) ---
  const [t4Score, setT4Score] = useState({ player: 0, ai: 0 });
  const [t4Feedback, setT4Feedback] = useState<string | null>(null);

  const handleT4Play = (move: 'cat' | 'snake' | 'falcon') => {
    const aiMoves: ('cat' | 'snake' | 'falcon')[] = ['cat', 'snake', 'falcon'];
    const ai = aiMoves[Math.floor(Math.random() * aiMoves.length)];

    let winner: 'player' | 'ai' | 'tie' = 'tie';
    if (move === ai) {
      winner = 'tie';
      sound.playTimerTick(false);
      setT4Feedback(`Both chose ${move}. Standoff!`);
    } else if (
      (move === 'cat' && ai === 'snake') ||
      (move === 'snake' && ai === 'falcon') ||
      (move === 'falcon' && ai === 'cat')
    ) {
      winner = 'player';
      sound.playMeowdoClash(true);
      const nextP = t4Score.player + 1;
      setT4Score((s) => ({ ...s, player: nextP }));
      setT4Feedback(`Point! Your ${move} defeated ${ai}! (${nextP}/5)`);
      if (nextP >= 5) {
        setTimeout(() => advanceTrial(4), 500);
      }
    } else {
      winner = 'ai';
      sound.playMeowdoClash(false);
      setT4Score((s) => ({ ...s, ai: s.ai + 1 }));
      setT4Feedback(`Bastet struck back with ${ai}!`);
    }
  };

  // --- TRIAL 5 STATE (Five Dark Seals: 5-digit sequence) ---
  const [t5Digits, setT5Digits] = useState(['4', '7', '2', '9', '3']);
  const [t5Target] = useState(['4', '7', '2', '9', '3']);
  const [t5Feedback, setT5Feedback] = useState<string | null>(null);
  const [t5InputDigits, setT5InputDigits] = useState(['', '', '', '', '']);

  const handleT5Submit = () => {
    if (t5InputDigits.join('') === t5Target.join('')) {
      setT5Feedback('The Five Dark Tumblers lock into cosmic alignment!');
      advanceTrial(5);
    } else {
      sound.playMismatchThud();
      setT5Feedback('The Five Seals reject the arrangement! Review the inscribed riddle.');
    }
  };

  // --- TRIAL 6 STATE (Pharaoh Duel: Win 4 rounds of RPS) ---
  const [t6Wins, setT6Wins] = useState(0);
  const [t6Feedback, setT6Feedback] = useState<string | null>(null);

  const handleT6Play = (move: 'rock' | 'paper' | 'scissors') => {
    const aiMoves: ('rock' | 'paper' | 'scissors')[] = ['rock', 'paper', 'scissors'];
    const ai = aiMoves[Math.floor(Math.random() * aiMoves.length)];

    if (move === ai) {
      sound.playTimerTick(false);
      setT6Feedback('Tie with the Pharaoh statue! No round awarded.');
    } else if (
      (move === 'rock' && ai === 'scissors') ||
      (move === 'paper' && ai === 'rock') ||
      (move === 'scissors' && ai === 'paper')
    ) {
      sound.playMeowdoClash(true);
      const nextW = t6Wins + 1;
      setT6Wins(nextW);
      setT6Feedback(`Victory! You crushed the Pharaoh's ${ai}! (${nextW}/4 wins)`);
      if (nextW >= 4) {
        setTimeout(() => advanceTrial(6), 500);
      }
    } else {
      sound.playMeowdoClash(false);
      sound.playEarthquakeRumble();
      setT6Feedback(`Defeat! The Pharaoh's eyes flash blood-red!`);
    }
  };

  // --- TRIAL 7 STATE (Dual-Word Binary Stream) ---
  const t7TargetWord = 'IMMORTAL';
  const t7Binary = stringToBinary(t7TargetWord);
  const [t7Input, setT7Input] = useState('');
  const [t7Feedback, setT7Feedback] = useState<string | null>(null);

  const handleT7Submit = () => {
    if (t7Input.trim().toUpperCase() === t7TargetWord) {
      setT7Feedback('Binary Stream transcribed!');
      advanceTrial(7);
    } else {
      sound.playMismatchThud();
      setT7Feedback('Binary translation mismatch. Verify 8-bit characters.');
    }
  };

  // --- TRIAL 8 STATE (Fast Moving Guardian: 7 Math Questions) ---
  const t8Questions = [
    { q: '14 × 7', a: 98 },
    { q: '168 ÷ 12', a: 14 },
    { q: '29 + 84', a: 113 },
    { q: '16 × 9', a: 144 },
    { q: '225 ÷ 15', a: 15 },
    { q: '93 - 47', a: 46 },
    { q: '13 × 8', a: 104 },
  ];
  const [t8Index, setT8Index] = useState(0);
  const [t8Answer, setT8Answer] = useState('');
  const [t8Feedback, setT8Feedback] = useState<string | null>(null);

  const handleT8Submit = () => {
    const val = parseInt(t8Answer.trim(), 10);
    const curr = t8Questions[t8Index];
    if (val === curr.a) {
      sound.playStoneClick();
      const nextIdx = t8Index + 1;
      if (nextIdx >= t8Questions.length) {
        setT8Feedback('Colossus sealed in granite!');
        advanceTrial(8);
      } else {
        setT8Index(nextIdx);
        setT8Answer('');
        setT8Feedback(`Correct! Guardian pushed back. (${nextIdx}/${t8Questions.length})`);
      }
    } else {
      sound.playMismatchThud();
      setT8Feedback('Equation incorrect! Colossus gains distance!');
    }
  };

  // --- TRIAL 9 STATE (Double Caesar Shift Papyrus) ---
  const t9Target = 'LABYRINTH';
  const t9Shift = 5;
  const t9Cipher = encryptCaesar(t9Target, t9Shift);
  const [t9Input, setT9Input] = useState('');
  const [t9Feedback, setT9Feedback] = useState<string | null>(null);

  const handleT9Submit = () => {
    if (t9Input.trim().toUpperCase() === t9Target) {
      setT9Feedback('Cursed Papyrus decoded!');
      advanceTrial(9);
    } else {
      sound.playMismatchThud();
      setT9Feedback('Papyrus inscription rejected.');
    }
  };

  // --- TRIAL 10 STATE (Cosmic Altar Alignment: 5 Relics) ---
  const [t10Order, setT10Order] = useState([1, 2, 3, 4, 5]);
  const t10CorrectOrder = [3, 1, 5, 2, 4];
  const [t10Feedback, setT10Feedback] = useState<string | null>(null);

  const t10Relics = [
    { id: 1, name: 'Sun of Ra', glyph: '𓇳', desc: 'Second Pedestal: Desert Winds' },
    { id: 2, name: 'Ankh of Life', glyph: '𓋹', desc: 'Fourth Pedestal: Nile Waters' },
    { id: 3, name: 'Eye of Horus', glyph: '𓂀', desc: 'First Pedestal: Dawn Star' },
    { id: 4, name: 'Djed Pillar', glyph: '𓊽', desc: 'Fifth Pedestal: Underworld Portal' },
    { id: 5, name: 'Scarab of Dawn', glyph: '𓆣', desc: 'Third Pedestal: High Noon' },
  ];

  const handleSwapRelics = (idx1: number, idx2: number) => {
    sound.playStoneClick();
    const copy = [...t10Order];
    const temp = copy[idx1];
    copy[idx1] = copy[idx2];
    copy[idx2] = temp;
    setT10Order(copy);
  };

  const handleT10Submit = () => {
    const isMatched = t10Order.every((val, i) => val === t10CorrectOrder[i]);
    if (isMatched) {
      setT10Feedback('PERFECT COSMIC ALIGNMENT! THE FINAL SEAL SHATTERS!');
      advanceTrial(10);
    } else {
      sound.playMismatchThud();
      setT10Feedback('The pedestals rumble in discordance. Check mythological positions!');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 animate-in fade-in duration-300">
      {/* HUD Header Bar: Timer & Progress */}
      <div className="w-full rounded-2xl p-4 sm:p-5 mb-6 border-2 border-rose-700 bg-gradient-to-r from-[#1b0610] via-[#240816] to-[#1b0610] shadow-[0_0_35px_rgba(225,29,72,0.4)] flex items-center justify-between flex-wrap gap-4 sticky top-16 z-30 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-mono-clean text-rose-400 uppercase tracking-widest block">
            Act III · The Forbidden Trial
          </span>
          <h1 className="text-lg sm:text-xl font-cinzel font-bold text-[#fff1f2] flex items-center gap-2">
            <span>PURGATORIUM</span>
            <span className="text-xs font-mono-clean text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-700">
              TRIAL {currentTrial} OF 10
            </span>
          </h1>
        </div>

        {/* 7-MINUTE CONTINUOUS COUNTDOWN */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-mono-clean font-bold text-lg sm:text-xl tracking-widest shadow-lg ${
              timeLeft <= 60
                ? 'bg-rose-950 border-rose-500 text-rose-200 animate-pulse'
                : 'bg-black/80 border-rose-600 text-rose-300'
            }`}
          >
            <Clock className="w-5 h-5 text-rose-400" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          <button
            onClick={onReturnToMainGame}
            className="text-xs font-cinzel text-rose-300 hover:text-white underline underline-offset-4 decoration-rose-700 cursor-pointer"
          >
            Exit Route
          </button>
        </div>
      </div>

      {/* Progress Dots / Breadcrumb for 10 Trials */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-6 overflow-x-auto py-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tNum) => {
          const isDone = currentTrial > tNum;
          const isCurrent = currentTrial === tNum;
          return (
            <div
              key={tNum}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-clean font-bold transition-all flex items-center gap-1 border ${
                isDone
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : isCurrent
                  ? 'bg-rose-900 border-rose-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.7)] scale-105'
                  : 'bg-[#15060e] border-rose-950 text-rose-700'
              }`}
            >
              <span>{isDone ? '✓' : tNum}</span>
              <span className="hidden md:inline">T{tNum}</span>
            </div>
          );
        })}
      </div>

      {/* Active Trial Canvas */}
      {!isFailed ? (
        <div className="stone-panel rounded-2xl p-6 sm:p-8 border-2 border-rose-700 bg-gradient-to-b from-[#1b0612] to-[#0c0308] shadow-2xl relative overflow-hidden mb-8">
          {/* TRIAL 1: 24 Cards Symbol Recognition */}
          {currentTrial === 1 && (
            <div>
              <div className="text-center mb-5">
                <span className="text-[11px] font-mono-clean text-rose-400 uppercase tracking-widest block mb-1">
                  Trial 1 of 10 · Symbol Recognition (Enhanced)
                </span>
                <h2 className="text-xl font-cinzel font-bold text-white mb-1">
                  The Obsidian Glyph Grid (24 Slabs)
                </h2>
                <p className="text-xs text-rose-300">
                  Find all 12 matching sacred hieroglyphic pairs. Pairs matched: {matchedPairs1} / 12
                </p>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-w-3xl mx-auto">
                {trial1Cards.map((card) => {
                  const isOpen = card.isMatched || flipped1.includes(card.id);
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleFlipCard1(card.id)}
                      disabled={isOpen}
                      className={`h-16 sm:h-20 rounded-xl font-cinzel font-bold text-2xl transition-all border flex items-center justify-center cursor-pointer ${
                        card.isMatched
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-sm'
                          : isOpen
                          ? 'bg-[#3b0724] border-rose-400 text-rose-200 scale-105'
                          : 'bg-[#16060f] border-rose-900/60 text-rose-700 hover:border-rose-500 hover:scale-102'
                      }`}
                    >
                      {isOpen ? card.glyph : '𓁹'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TRIAL 2: Harder Caesar Crypt */}
          {currentTrial === 2 && (
            <div className="max-w-xl mx-auto text-center space-y-4">
              <span className="text-[11px] font-mono-clean text-rose-400 uppercase tracking-widest block">
                Trial 2 of 10 · Decoy Caesar Crypt
              </span>
              <h2 className="text-xl font-cinzel font-bold text-white">
                Decipher the Royal Obsidian Stele
              </h2>
              <p className="text-xs text-rose-300">
                Shift: 8 paces backward. Decoy letters flicker in the stone. Submit the true word:
              </p>
              <div className="p-4 bg-black/60 rounded-xl border border-rose-800 text-2xl font-mono-clean font-bold tracking-[0.25em] text-rose-200">
                {t2Cipher}
              </div>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={t2Input}
                  onChange={(e) => setT2Input(e.target.value)}
                  placeholder="Enter decoded word..."
                  className="px-4 py-2.5 bg-black/80 border border-rose-700 rounded-xl text-center font-mono-clean font-bold text-lg text-white uppercase focus:outline-none focus:border-rose-400 w-64"
                />
                <button
                  onClick={handleT2Submit}
                  className="px-6 py-2.5 font-cinzel font-bold text-xs bg-rose-700 hover:bg-rose-600 text-white rounded-xl shadow cursor-pointer"
                >
                  Decode
                </button>
              </div>
              {t2Feedback && <p className="text-xs text-rose-200 font-semibold">{t2Feedback}</p>}
            </div>
          )}

          {/* TRIAL 3: High-Speed Sandstorm Number (1 to 25) */}
          {currentTrial === 3 && (
            <div className="max-w-xl mx-auto text-center space-y-4">
              <span className="text-[11px] font-mono-clean text-rose-400 uppercase tracking-widest block">
                Trial 3 of 10 · Sandstorm Influx (Expanded Scale)
              </span>
              <h2 className="text-xl font-cinzel font-bold text-white">
                Divine the Sandstorm Integer (1–25)
              </h2>
              <p className="text-xs text-rose-300">
                The storm surges across 25 possible runes. Enter your divination:
              </p>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={t3Input}
                  onChange={(e) => setT3Input(e.target.value)}
                  placeholder="1 - 25"
                  className="px-4 py-2.5 bg-black/80 border border-rose-700 rounded-xl text-center font-mono-clean font-bold text-xl text-white focus:outline-none focus:border-rose-400 w-40"
                />
                <button
                  onClick={handleT3Submit}
                  className="px-6 py-2.5 font-cinzel font-bold text-xs bg-rose-700 hover:bg-rose-600 text-white rounded-xl shadow cursor-pointer"
                >
                  Submit
                </button>
              </div>
              {t3Feedback && <p className="text-xs text-rose-200 font-semibold">{t3Feedback}</p>}
            </div>
          )}

          {/* TRIAL 4: Corrupted Meowdo (Win 5) */}
          {currentTrial === 4 && (
            <div className="max-w-xl mx-auto text-center space-y-4">
              <span className="text-[11px] font-mono-clean text-rose-400 uppercase tracking-widest block">
                Trial 4 of 10 · Corrupted Shrine of Bastet
              </span>
              <h2 className="text-xl font-cinzel font-bold text-white">
                Achieve 5 Sacred Meowdo Victories
              </h2>
              <div className="flex items-center justify-center gap-4 text-xs font-cinzel text-rose-200">
                <span className="px-3 py-1 bg-black/60 rounded-lg border border-rose-800">
                  You: {t4Score.player} / 5
                </span>
                <span className="px-3 py-1 bg-black/60 rounded-lg border border-rose-800">
                  Bastet: {t4Score.ai}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                {[
                  { key: 'cat', icon: '🐱', label: 'Bastet Cat' },
                  { key: 'snake', icon: '🐍', label: 'Apep Snake' },
                  { key: 'falcon', icon: '🦅', label: 'Horus Falcon' },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => handleT4Play(m.key as 'cat' | 'snake' | 'falcon')}
                    className="px-4 py-3 rounded-xl bg-black/60 border border-rose-700 hover:border-rose-400 hover:scale-105 active:scale-95 text-xs font-cinzel font-bold text-white flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
              {t4Feedback && <p className="text-xs text-rose-200 font-semibold">{t4Feedback}</p>}
            </div>
          )}

          {/* TRIAL 5: Five Dark Seals */}
          {currentTrial === 5 && (
            <div className="max-w-xl mx-auto text-center space-y-4">
              <span className="text-[11px] font-mono-clean text-rose-400 uppercase tracking-widest block">
                Trial 5 of 10 · The Five Dark Seals
              </span>
              <h2 className="text-xl font-cinzel font-bold text-white">
                Enter the Five Forbidden Seal Digits
              </h2>
              <p className="text-xs text-rose-300">
                Clue carved in blood: "The 4 of the North, the 7 of the Pleiades, the 2 of Twin Cobras, the 9 of the Ennead, and the 3 of the Sacred Triad."
              </p>
              <div className="flex items-center justify-center gap-2">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={t5InputDigits[idx]}
                    onChange={(e) => {
                      const copy = [...t5InputDigits];
                      copy[idx] = e.target.value.replace(/[^0-9]/g, '');
                      setT5InputDigits(copy);
                    }}
                    placeholder="?"
                    className="w-12 h-14 bg-black/80 border-2 border-rose-700 rounded-xl text-center font-mono-clean font-bold text-xl text-white focus:outline-none focus:border-rose-400"
                  />
                ))}
              </div>
              <button
                onClick={handleT5Submit}
                className="px-6 py-2.5 font-cinzel font-bold text-xs bg-rose-700 hover:bg-rose-600 text-white rounded-xl shadow cursor-pointer"
              >
                Disengage Seals
              </button>
              {t5Feedback && <p className="text-xs text-rose-200 font-semibold">{t5Feedback}</p>}
            </div>
          )}

          {/* TRIAL 6: Pharaoh Duel (Win 4 RPS) */}
          {currentTrial === 6 && (
            <div className="max-w-xl mx-auto text-center space-y-4">
              <span className="text-[11px] font-mono-clean text-rose-400 uppercase tracking-widest block">
                Trial 6 of 10 · Duel with the Raging Colossus
              </span>
              <h2 className="text-xl font-cinzel font-bold text-white">
                Defeat the Pharaoh in 4 Rounds
              </h2>
              <p className="text-xs text-rose-300">
                Victories Achieved: {t6Wins} of 4
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                {[
                  { key: 'rock', icon: '🪨', label: 'Rock (Stone)' },
                  { key: 'paper', icon: '📜', label: 'Paper (Scroll)' },
                  { key: 'scissors', icon: '✂️', label: 'Scissors (Blade)' },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => handleT6Play(m.key as 'rock' | 'paper' | 'scissors')}
                    className="px-4 py-3 rounded-xl bg-black/60 border border-rose-700 hover:border-rose-400 hover:scale-105 active:scale-95 text-xs font-cinzel font-bold text-white flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
              {t6Feedback && <p className="text-xs text-rose-200 font-semibold">{t6Feedback}</p>}
            </div>
          )}

          {/* TRIAL 7: Dual Binary Stream */}
          {currentTrial === 7 && (
            <div className="max-w-xl mx-auto text-center space-y-4">
              <span className="text-[11px] font-mono-clean text-rose-400 uppercase tracking-widest block">
                Trial 7 of 10 · The Binary Crypt
              </span>
              <h2 className="text-xl font-cinzel font-bold text-white">
                Decode the 8-Bit Binary Stream
              </h2>
              <div className="p-3 bg-black/80 rounded-xl border border-rose-800 text-xs sm:text-sm font-mono-clean text-rose-200 break-all">
                {t7Binary}
              </div>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={t7Input}
                  onChange={(e) => setT7Input(e.target.value)}
                  placeholder="Enter decoded word..."
                  className="px-4 py-2.5 bg-black/80 border border-rose-700 rounded-xl text-center font-mono-clean font-bold text-base text-white uppercase focus:outline-none focus:border-rose-400 w-64"
                />
                <button
                  onClick={handleT7Submit}
                  className="px-6 py-2.5 font-cinzel font-bold text-xs bg-rose-700 hover:bg-rose-600 text-white rounded-xl shadow cursor-pointer"
                >
                  Submit
                </button>
              </div>
              {t7Feedback && <p className="text-xs text-rose-200 font-semibold">{t7Feedback}</p>}
            </div>
          )}

          {/* TRIAL 8: Fast Moving Colossus */}
          {currentTrial === 8 && (
            <div className="max-w-xl mx-auto text-center space-y-4">
              <span className="text-[11px] font-mono-clean text-rose-400 uppercase tracking-widest block">
                Trial 8 of 10 · Advancing Colossus Speed Trial
              </span>
              <h2 className="text-xl font-cinzel font-bold text-white">
                Solve Equation {t8Index + 1} of {t8Questions.length}
              </h2>
              <div className="p-4 bg-black/80 rounded-xl border-2 border-rose-700 text-3xl font-mono-clean font-bold text-rose-300">
                {t8Questions[t8Index].q} = ?
              </div>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  value={t8Answer}
                  onChange={(e) => setT8Answer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleT8Submit();
                  }}
                  placeholder="Answer..."
                  className="px-4 py-2.5 bg-black/80 border border-rose-700 rounded-xl text-center font-mono-clean font-bold text-xl text-white focus:outline-none focus:border-rose-400 w-44"
                />
                <button
                  onClick={handleT8Submit}
                  className="px-6 py-2.5 font-cinzel font-bold text-xs bg-rose-700 hover:bg-rose-600 text-white rounded-xl shadow cursor-pointer"
                >
                  Solve
                </button>
              </div>
              {t8Feedback && <p className="text-xs text-rose-200 font-semibold">{t8Feedback}</p>}
            </div>
          )}

          {/* TRIAL 9: Double Caesar Shift Papyrus */}
          {currentTrial === 9 && (
            <div className="max-w-xl mx-auto text-center space-y-4">
              <span className="text-[11px] font-mono-clean text-rose-400 uppercase tracking-widest block">
                Trial 9 of 10 · Royal Papyrus Cipher
              </span>
              <h2 className="text-xl font-cinzel font-bold text-white">
                Decipher the Cursed Royal Papyrus
              </h2>
              <p className="text-xs text-rose-300">
                Letter displacement pace: 5 paces forward. Reverse it:
              </p>
              <div className="p-3 bg-black/80 rounded-xl border border-rose-800 text-2xl font-mono-clean font-bold tracking-[0.25em] text-rose-200">
                {t9Cipher}
              </div>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={t9Input}
                  onChange={(e) => setT9Input(e.target.value)}
                  placeholder="Enter word..."
                  className="px-4 py-2.5 bg-black/80 border border-rose-700 rounded-xl text-center font-mono-clean font-bold text-base text-white uppercase focus:outline-none focus:border-rose-400 w-64"
                />
                <button
                  onClick={handleT9Submit}
                  className="px-6 py-2.5 font-cinzel font-bold text-xs bg-rose-700 hover:bg-rose-600 text-white rounded-xl shadow cursor-pointer"
                >
                  Submit
                </button>
              </div>
              {t9Feedback && <p className="text-xs text-rose-200 font-semibold">{t9Feedback}</p>}
            </div>
          )}

          {/* TRIAL 10: Cosmic Altar Alignment (5 Relics) */}
          {currentTrial === 10 && (
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <span className="text-[11px] font-mono-clean text-rose-400 uppercase tracking-widest block">
                Trial 10 of 10 · The Cosmic Altar of Purgatorium
              </span>
              <h2 className="text-2xl font-cinzel font-bold text-white">
                Align the Five Relics into Cosmic Harmony
              </h2>
              <p className="text-xs text-rose-300">
                Swap the relics into mythological order: 1. Dawn Star (Eye) → 2. Desert Winds (Sun) → 3. High Noon (Scarab) → 4. Nile Waters (Ankh) → 5. Underworld (Djed).
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 my-4">
                {t10Order.map((relicId, idx) => {
                  const relic = t10Relics.find((r) => r.id === relicId)!;
                  return (
                    <div
                      key={relic.id}
                      className="p-3 rounded-xl bg-black/80 border-2 border-rose-700 flex flex-col items-center justify-between"
                    >
                      <span className="text-[10px] font-mono-clean text-rose-400">Pedestal #{idx + 1}</span>
                      <span className="text-3xl my-1 text-white">{relic.glyph}</span>
                      <span className="text-xs font-cinzel font-bold text-rose-200">{relic.name}</span>
                      <div className="flex gap-1 mt-2">
                        {idx > 0 && (
                          <button
                            onClick={() => handleSwapRelics(idx, idx - 1)}
                            className="px-2 py-0.5 text-[10px] bg-rose-950 border border-rose-700 rounded text-rose-300 cursor-pointer"
                          >
                            ←
                          </button>
                        )}
                        {idx < 4 && (
                          <button
                            onClick={() => handleSwapRelics(idx, idx + 1)}
                            className="px-2 py-0.5 text-[10px] bg-rose-950 border border-rose-700 rounded text-rose-300 cursor-pointer"
                          >
                            →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleT10Submit}
                className="px-8 py-3.5 font-cinzel font-bold text-sm tracking-widest bg-gradient-to-r from-rose-700 to-rose-500 text-white rounded-xl shadow-[0_0_25px_rgba(244,63,94,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                UNSEAL THE FORBIDDEN TREASURE
              </button>
              {t10Feedback && <p className="text-xs text-rose-200 font-semibold">{t10Feedback}</p>}
            </div>
          )}
        </div>
      ) : (
        /* Failure Screen: 7-Minute Timer Expired */
        <div className="p-8 rounded-2xl bg-black/90 border-2 border-rose-600 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-950 border border-rose-500 flex items-center justify-center text-rose-400 mb-4">
            <Skull className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-cinzel font-black tracking-widest text-rose-300 mb-2">
            PURGATORIUM HAS REJECTED YOU
          </h2>
          <p className="text-sm text-rose-200/90 font-sans-clean max-w-lg mx-auto mb-6">
            The seven-minute sandglass has expired. The ancient curse re-seals the Dark Realm. You must repeat the gateway trials (Levels X, Y, and Z) to re-enter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onFailPurgatorium}
              className="px-8 py-3.5 rounded-xl font-cinzel font-bold text-xs tracking-wider text-white bg-rose-700 hover:bg-rose-600 border border-rose-400 shadow-lg cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Return to Level X (The Sacrifice)</span>
            </button>
            <button
              onClick={onReturnToMainGame}
              className="px-5 py-3.5 rounded-xl font-cinzel text-xs text-rose-300 hover:text-white bg-black/60 border border-rose-900 cursor-pointer"
            >
              Return to Normal Trek
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
