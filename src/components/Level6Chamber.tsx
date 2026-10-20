import React, { useState } from 'react';
import { GamePlaythroughState, GameStateUpdater, DuelMove } from '../types/game';
import { sound } from '../audio/soundManager';
import { ArrowRight, Trophy, Swords, Sparkles, AlertCircle } from 'lucide-react';

interface Level6ChamberProps {
  gameState: GamePlaythroughState;
  onUpdateState: (update: GameStateUpdater) => void;
  onProceedToLevel: (levelId: number) => void;
  onOpenScroll: () => void;
}

const DUEL_OPTIONS: { key: DuelMove; name: string; icon: string; beats: string; beatDesc: string }[] = [
  { key: 'rock', name: 'Granite Stone', icon: '🪨', beats: 'scissors', beatDesc: 'smashes Khopesh Blades' },
  { key: 'paper', name: 'Royal Papyrus', icon: '📜', beats: 'rock', beatDesc: 'envelops Granite Stone' },
  { key: 'scissors', name: 'Khopesh Blades', icon: '⚔️', beats: 'paper', beatDesc: 'cleaves Royal Papyrus' },
];

export const Level6Chamber: React.FC<Level6ChamberProps> = ({
  gameState,
  onUpdateState,
  onProceedToLevel,
  onOpenScroll,
}) => {
  const { level6 } = gameState;
  const [isClashing, setIsClashing] = useState(false);
  const [clashMessage, setClashMessage] = useState<string | null>(null);

  const handlePlayMove = (playerMove: DuelMove) => {
    if (isClashing || level6.isSolved) return;
    sound.playStoneClick();
    setIsClashing(true);
    setClashMessage(null);

    // Pharaoh randomly selects Rock, Paper, or Scissors
    const options: DuelMove[] = ['rock', 'paper', 'scissors'];
    const pharaohMove = options[Math.floor(Math.random() * options.length)];

    setTimeout(() => {
      let winner: 'player' | 'pharaoh' | 'tie' = 'tie';
      let message = '';
      let isLosing = false;

      if (playerMove === pharaohMove) {
        winner = 'tie';
        message = 'A divine standoff! Both invoked the same seal. Ties do not count.';
        sound.playTimerTick(false);
      } else if (
        (playerMove === 'rock' && pharaohMove === 'scissors') ||
        (playerMove === 'paper' && pharaohMove === 'rock') ||
        (playerMove === 'scissors' && pharaohMove === 'paper')
      ) {
        winner = 'player';
        sound.playMeowdoClash(true);
        message = `Victory! Your ${playerMove.toUpperCase()} bests the Pharaoh’s ${pharaohMove.toUpperCase()}!`;
      } else {
        winner = 'pharaoh';
        isLosing = true;
        sound.playEarthquakeShake();
        message = `Defeat! The Pharaoh’s ${pharaohMove.toUpperCase()} overwhelms your ${playerMove.toUpperCase()}! The room violently quakes!`;
      }

      const nextPlayerWins = winner === 'player' ? level6.playerWins + 1 : level6.playerWins;
      const nextPharaohWins = winner === 'pharaoh' ? level6.pharaohWins + 1 : level6.pharaohWins;
      const isSolved = nextPlayerWins >= level6.targetWins;

      if (isSolved) {
        sound.playCodeUnlock();
      }

      onUpdateState((prev) => ({
        ...prev,
        level6: {
          ...prev.level6,
          playerWins: nextPlayerWins,
          pharaohWins: nextPharaohWins,
          lastPlayerMove: playerMove,
          lastPharaohMove: pharaohMove,
          lastRoundWinner: winner,
          isShaking: isLosing,
          pharaohEyesRed: isLosing,
          isSolved,
        },
        completedLevels: isSolved && !prev.completedLevels.includes(6)
          ? [...prev.completedLevels, 6]
          : prev.completedLevels,
        highestDiscoveredLevel: Math.max(prev.highestDiscoveredLevel, 7),
      }));

      setClashMessage(message);
      setIsClashing(false);

      if (isLosing) {
        // Reset shake and red eyes after 1.5 seconds
        setTimeout(() => {
          onUpdateState((prev) => ({
            ...prev,
            level6: {
              ...prev.level6,
              isShaking: false,
              pharaohEyesRed: false,
            },
          }));
        }, 1500);
      }
    }, 600);
  };

  const handleResetMatch = () => {
    sound.playStoneClick();
    onUpdateState((prev) => ({
      ...prev,
      level6: {
        ...prev.level6,
        playerWins: 0,
        pharaohWins: 0,
        lastPlayerMove: null,
        lastPharaohMove: null,
        lastRoundWinner: null,
        isShaking: false,
        pharaohEyesRed: false,
      },
    }));
    setClashMessage(null);
  };

  return (
    <div
      className={`w-full max-w-4xl mx-auto flex flex-col items-center transition-all ${
        level6.isShaking ? 'animate-[bounce_0.2s_infinite]' : ''
      }`}
    >
      {/* Chamber Header */}
      <div className="w-full stone-panel rounded-xl p-5 mb-6 text-center border-t-2 border-[#d4af37]">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="text-left">
            <span className="text-[11px] font-mono-clean text-[#a98f6d] uppercase tracking-widest">
              Chamber VI · Per-Aa-Khab
            </span>
            <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-[#f7e096]">
              The Duel: Trial of the Pharaoh
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-cinzel text-[#d4af37] bg-[#1a120c] px-3 py-1.5 rounded-lg border border-[#8c6d31]">
              Score: You {level6.playerWins} — {level6.pharaohWins} Pharaoh (Target: 3)
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
          A colossal black basalt Pharaoh statue blocks the portal. Its eyes glow with ancient power as it challenges you to an eternal duel of Rock, Paper, Scissors!
        </p>
      </div>

      {/* Main Duel Interface */}
      <div className="w-full max-w-3xl stone-panel rounded-2xl p-6 sm:p-8 border-2 border-[#b88c3a] shadow-2xl mb-8">
        {/* Pharaoh Visual Banner */}
        <div className="relative w-full rounded-2xl overflow-hidden border-2 border-[#8c6d31] mb-6 bg-[#0a0604]">
          <div className="relative h-64 sm:h-72 w-full overflow-hidden">
            <img
              src="/src/assets/images/pharaoh_statue_duel_1791716392393.jpg"
              alt="Colossal Pharaoh Statue"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-all duration-300 ${
                level6.pharaohEyesRed ? 'brightness-125 contrast-125 sepia hue-rotate-320' : ''
              }`}
            />
            {/* Eye glow overlay */}
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
                level6.pharaohEyesRed
                  ? 'bg-rose-900/35 mix-blend-multiply opacity-100'
                  : 'bg-gradient-to-t from-black/80 via-transparent to-black/40'
              }`}
            />
          </div>

          <div className="absolute bottom-3 inset-x-3 p-3 rounded-xl bg-black/80 backdrop-blur-sm border border-[#78592c] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  level6.pharaohEyesRed ? 'bg-rose-500 animate-ping' : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-cinzel font-bold text-[#f7e096]">
                {level6.pharaohEyesRed
                  ? 'The Pharaoh’s Eyes Flash Blood Red! The Tomb Shakes!'
                  : 'The Pharaoh’s Eyes Glow with Radiant Gold'}
              </span>
            </div>
            {!level6.isSolved && level6.pharaohWins > 0 && (
              <button
                onClick={handleResetMatch}
                className="text-[11px] text-[#a98f6d] hover:text-[#f7df94] underline cursor-pointer"
              >
                Reset Score
              </button>
            )}
          </div>
        </div>

        {/* Clash Arena Display */}
        <div className="bg-[#120d09] border border-[#523d24] rounded-xl p-5 mb-6 text-center">
          <div className="grid grid-cols-3 items-center gap-2 mb-4">
            {/* Player Side */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-cinzel font-bold text-[#bca378] mb-1">
                You (Seeker)
              </span>
              <div className="w-16 h-16 rounded-xl bg-[#22160d] border border-[#8c6d31] flex items-center justify-center text-3xl shadow-inner">
                {level6.lastPlayerMove
                  ? DUEL_OPTIONS.find((m) => m.key === level6.lastPlayerMove)?.icon
                  : '❔'}
              </div>
              <span className="text-xs font-cinzel font-semibold text-[#f7e096] mt-1 capitalize">
                {level6.lastPlayerMove || 'Awaiting'}
              </span>
              <span className="text-xl font-mono-clean font-bold text-emerald-400 mt-0.5">
                {level6.playerWins} / 3 wins
              </span>
            </div>

            {/* Swords Clash Icon */}
            <div className="flex flex-col items-center">
              <div className={`p-3 rounded-full ${isClashing ? 'animate-spin' : ''} text-[#d4af37]`}>
                <Swords className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-mono-clean text-[#7a6042] uppercase tracking-wider">
                VS
              </span>
            </div>

            {/* Pharaoh Side */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-cinzel font-bold text-[#bca378] mb-1">
                Colossal Pharaoh
              </span>
              <div className="w-16 h-16 rounded-xl bg-[#22160d] border border-[#8c6d31] flex items-center justify-center text-3xl shadow-inner">
                {level6.lastPharaohMove
                  ? DUEL_OPTIONS.find((m) => m.key === level6.lastPharaohMove)?.icon
                  : '❔'}
              </div>
              <span className="text-xs font-cinzel font-semibold text-[#f7e096] mt-1 capitalize">
                {level6.lastPharaohMove || 'Watching'}
              </span>
              <span className="text-xl font-mono-clean font-bold text-amber-500 mt-0.5">
                {level6.pharaohWins} wins
              </span>
            </div>
          </div>

          {/* Clash Result Message */}
          {clashMessage && (
            <div
              className={`p-2.5 rounded-lg text-xs font-sans-clean font-semibold ${
                level6.lastRoundWinner === 'player'
                  ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
                  : level6.lastRoundWinner === 'pharaoh'
                  ? 'bg-rose-950/80 border border-rose-700 text-rose-300 animate-pulse'
                  : 'bg-[#241a12] border border-[#6b502d] text-[#e6d5b8]'
              }`}
            >
              {clashMessage}
            </div>
          )}
        </div>

        {/* Player Move Buttons */}
        {!level6.isSolved ? (
          <div>
            <span className="text-xs font-cinzel font-bold text-[#f7e096] block mb-3 text-center">
              Choose Your Divine Gesture to Challenge the Pharaoh:
            </span>
            <div className="grid grid-cols-3 gap-3">
              {DUEL_OPTIONS.map((move) => (
                <button
                  key={move.key}
                  onClick={() => handlePlayMove(move.key)}
                  disabled={isClashing}
                  className="p-4 rounded-xl bg-gradient-to-b from-[#2a1c11] to-[#160f09] border border-[#8c6d31] hover:border-[#f7e096] hover:scale-102 transition-all flex flex-col items-center justify-center shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <span className="text-3xl mb-1">{move.icon}</span>
                  <span className="text-xs font-cinzel font-bold text-[#f7e096] mb-0.5">
                    {move.name}
                  </span>
                  <span className="text-[10px] text-[#9c8263] font-sans-clean">
                    {move.beatDesc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Solved State: Golden Scarab Key & Hidden Number 6 */
          <div className="border-t border-[#6e502c] pt-5 mt-2 animate-in fade-in duration-300">
            <div className="flex items-center justify-center gap-2 mb-3 text-emerald-400">
              <Trophy className="w-5 h-5" />
              <span className="font-cinzel font-bold text-sm">
                The Pharaoh Bows! 3 Victories Achieved
              </span>
            </div>

            {/* Unlocked Golden Scarab Key for Level 7 */}
            <div className="bg-[#120c08] border border-[#8c6d31] p-4 rounded-xl mb-4 text-center">
              <span className="text-[10px] font-cinzel text-[#a98f6d] uppercase tracking-widest block mb-1">
                Golden Scarab Key to Chamber VII (The Binary Alphabet)
              </span>
              <div className="text-2xl sm:text-3xl font-mono-clean font-bold text-[#f7e096] tracking-[0.25em]">
                {level6.unlockedScarabKey}
              </div>
            </div>

            {/* Hidden Number 6 carved into statue base */}
            <div className="flex items-center justify-center gap-3 p-3.5 bg-[#142321] rounded-lg border border-[#40e0d0]/60 mb-6 shadow-sm">
              <span className="text-3xl text-[#40e0d0] turquoise-glow">𓆣</span>
              <div className="text-left">
                <span className="text-xs font-cinzel font-bold text-[#d2fbf5] block">
                  Act II Relic Discovered: Golden Scarab of the Duel (Value: <strong className="text-[#40e0d0] text-base">{level6.hiddenNumber}</strong>)
                </span>
                <span className="text-[11px] text-[#94d5cb]">
                  Carved into the pedestal of the Pharaoh's throne. Automatically saved in your Journal for Chamber X!
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playStoneSlide();
                onProceedToLevel(7);
              }}
              className="w-full py-3.5 px-6 font-cinzel font-bold text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Chamber VII: The Binary Alphabet</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
