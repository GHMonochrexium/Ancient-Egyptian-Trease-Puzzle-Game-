import React, { useState } from 'react';
import { GamePlaythroughState, MeowdoMove } from '../types/game';
import { sound } from '../audio/soundManager';
import { ArrowRight, CheckCircle2, Lock, KeyRound, Swords, Trophy } from 'lucide-react';

interface Level4ChamberProps {
  gameState: GamePlaythroughState;
  onUpdateState: (newState: Partial<GamePlaythroughState>) => void;
  onProceedToLevel: (levelId: number) => void;
  onOpenScroll: () => void;
}

const MOVES: { key: MeowdoMove; name: string; glyph: string; beats: string; icon: string }[] = [
  { key: 'cat', name: 'Bastet Cat', glyph: '𓃠', beats: 'Apep Snake', icon: '🐱' },
  { key: 'snake', name: 'Apep Snake', glyph: '𓆓', beats: 'Horus Falcon', icon: '🐍' },
  { key: 'falcon', name: 'Horus Falcon', glyph: '𓅃', beats: 'Bastet Cat', icon: '🦅' },
];

export const Level4Chamber: React.FC<Level4ChamberProps> = ({
  gameState,
  onUpdateState,
  onProceedToLevel,
  onOpenScroll,
}) => {
  const { level4, level3 } = gameState;
  const isGateUnlocked = gameState.completedLevels.includes(3);
  const [enteredGateCode, setEnteredGateCode] = useState('');
  const [isGateOpen, setIsGateOpen] = useState(isGateUnlocked);
  const [gateError, setGateError] = useState(false);

  // Animation states for Meowdo clash
  const [isClashing, setIsClashing] = useState(false);
  const [clashMessage, setClashMessage] = useState<string | null>(null);

  const handleUnlockGate = (codeToTest: string) => {
    sound.playStoneClick();
    const cleanCode = codeToTest.trim().replace(/\s+/g, '-');
    if (cleanCode === level3.unlockedCode || cleanCode.replace(/-/g, '') === level3.unlockedCode.replace(/-/g, '')) {
      sound.playStoneSlide();
      setIsGateOpen(true);
      setGateError(false);
    } else {
      sound.playMismatchThud();
      setGateError(true);
    }
  };

  const handlePlayMove = (playerMove: MeowdoMove) => {
    if (isClashing || level4.isSolved) return;
    sound.playStoneClick();
    setIsClashing(true);
    setClashMessage(null);

    // AI randomly chooses between cat, snake, falcon
    const choices: MeowdoMove[] = ['cat', 'snake', 'falcon'];
    const aiMove = choices[Math.floor(Math.random() * choices.length)];

    setTimeout(() => {
      // Determine winner
      let winner: 'player' | 'ai' | 'tie' = 'tie';
      let message = '';

      if (playerMove === aiMove) {
        winner = 'tie';
        message = 'Sacred equilibrium! Both invoked the same totem. No point awarded.';
        sound.playTimerTick(false);
      } else if (
        (playerMove === 'cat' && aiMove === 'snake') ||
        (playerMove === 'snake' && aiMove === 'falcon') ||
        (playerMove === 'falcon' && aiMove === 'cat')
      ) {
        winner = 'player';
        sound.playMeowdoClash(true);
        message = `Victory! Your ${playerMove.toUpperCase()} overpowers the statue’s ${aiMove.toUpperCase()}!`;
      } else {
        winner = 'ai';
        sound.playMeowdoClash(false);
        message = `Defeat! The statue’s ${aiMove.toUpperCase()} strikes down your ${playerMove.toUpperCase()}!`;
      }

      const newPlayerScore = winner === 'player' ? level4.playerScore + 1 : level4.playerScore;
      const newAiScore = winner === 'ai' ? level4.aiScore + 1 : level4.aiScore;
      const isSolved = newPlayerScore >= level4.targetScore;

      if (isSolved) {
        sound.playCodeUnlock();
      }

      onUpdateState({
        level4: {
          ...level4,
          playerScore: newPlayerScore,
          aiScore: newAiScore,
          lastPlayerMove: playerMove,
          lastAiMove: aiMove,
          lastRoundWinner: winner,
          isSolved,
        },
        completedLevels: isSolved && !gameState.completedLevels.includes(4)
          ? [...gameState.completedLevels, 4]
          : gameState.completedLevels,
        highestDiscoveredLevel: Math.max(gameState.highestDiscoveredLevel, 5),
      });

      setClashMessage(message);
      setIsClashing(false);
    }, 600);
  };

  const handleResetMatch = () => {
    sound.playStoneClick();
    onUpdateState({
      level4: {
        ...level4,
        playerScore: 0,
        aiScore: 0,
        lastPlayerMove: null,
        lastAiMove: null,
        lastRoundWinner: null,
      },
    });
    setClashMessage(null);
  };

  const sacredToken = gameState.sacredTokens.find((t) => t.originLevel === 4);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Chamber Header */}
      <div className="w-full stone-panel rounded-xl p-5 mb-6 text-center border-t-2 border-[#d4af37]">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="text-left">
            <span className="text-[11px] font-mono-clean text-[#a98f6d] uppercase tracking-widest">
              Chamber IV · Hut-Bast
            </span>
            <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-[#f7e096]">
              The Shrine of Bastet (Meowdo)
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-cinzel text-[#d4af37] bg-[#1a120c] px-3 py-1.5 rounded-lg border border-[#8c6d31]">
              Score: You {level4.playerScore} — {level4.aiScore} Bastet
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
          The regal black-and-gold Bastet statue challenges all seekers to an ancient ritual of Meowdo. Win 3 rounds to prove your cunning.
        </p>
      </div>

      {/* If Chamber Portal is Still Sealed */}
      {!isGateOpen ? (
        <div className="w-full max-w-md stone-panel rounded-2xl p-6 border-2 border-[#b88c3a] text-center my-8 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#20150d] border border-[#8c6d31] flex items-center justify-center text-[#d4af37] mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-cinzel font-bold text-[#f7e096] mb-2">
            The Cat Shrine Portal is Sealed
          </h2>
          <p className="text-xs text-[#a98f6d] mb-4">
            Enter the 4-digit code recovered from Chamber III (The Vault of the Sandstorm) to enter the sacred court of Bastet.
          </p>

          <div className="flex items-center justify-center gap-2 mb-3">
            <input
              type="text"
              value={enteredGateCode}
              onChange={(e) => setEnteredGateCode(e.target.value)}
              placeholder="e.g. 6-3-5-8"
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
              The lock mechanism resists. Verify the code from Chamber III.
            </p>
          )}

          {level3.isSolved && (
            <button
              onClick={() => {
                setEnteredGateCode(level3.unlockedCode);
                handleUnlockGate(level3.unlockedCode);
              }}
              className="text-xs font-sans-clean text-[#d4af37] hover:underline flex items-center justify-center gap-1.5 mx-auto mt-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Use Code from Journal: {level3.unlockedCode}
            </button>
          )}
        </div>
      ) : (
        /* The Active Meowdo Game */
        <div className="w-full max-w-2xl stone-panel rounded-2xl p-6 sm:p-8 border-2 border-[#b88c3a] shadow-2xl mb-8">
          {/* Statue & Lore Display */}
          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-[#6e502c] pb-6 mb-6">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-lg shrink-0 bg-[#160e0a]">
              <img
                src="/src/assets/images/egyptian_cat_statue_1791117294001.jpg"
                alt="Ancient Egyptian Bastet Cat Statue"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-mono-clean text-[#a98f6d] tracking-widest uppercase block mb-1">
                Divine Guardian of Wits
              </span>
              <h3 className="text-lg font-cinzel font-bold text-[#f7e096] mb-1">
                Bastet’s Sacred Trial
              </h3>
              <p className="text-xs text-[#bda482] font-sans-clean mb-3">
                🐱 <strong>Cat</strong> scratches 🐍 <strong>Snake</strong> · 🐍 <strong>Snake</strong> bites 🦅 <strong>Falcon</strong> · 🦅 <strong>Falcon</strong> stoops on 🐱 <strong>Cat</strong>.
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <span className="text-xs font-cinzel text-[#e8c76e]">
                  Target: 3 Round Wins
                </span>
                {level4.aiScore > 0 && !level4.isSolved && (
                  <button
                    onClick={handleResetMatch}
                    className="text-[11px] text-[#a98f6d] hover:text-[#f7df94] underline"
                  >
                    Reset Tally
                  </button>
                )}
              </div>
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
                  {level4.lastPlayerMove
                    ? MOVES.find((m) => m.key === level4.lastPlayerMove)?.icon
                    : '❔'}
                </div>
                <span className="text-xs font-cinzel font-semibold text-[#f7e096] mt-1 capitalize">
                  {level4.lastPlayerMove || 'Awaiting'}
                </span>
                <span className="text-xl font-mono-clean font-bold text-emerald-400 mt-0.5">
                  {level4.playerScore} pts
                </span>
              </div>

              {/* Clash Icon */}
              <div className="flex flex-col items-center">
                <div className={`p-3 rounded-full ${isClashing ? 'animate-spin' : ''} text-[#d4af37]`}>
                  <Swords className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-mono-clean text-[#7a6042] uppercase tracking-wider">
                  VS
                </span>
              </div>

              {/* AI Statue Side */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-cinzel font-bold text-[#bca378] mb-1">
                  Bastet Statue
                </span>
                <div className="w-16 h-16 rounded-xl bg-[#22160d] border border-[#8c6d31] flex items-center justify-center text-3xl shadow-inner">
                  {level4.lastAiMove
                    ? MOVES.find((m) => m.key === level4.lastAiMove)?.icon
                    : '❔'}
                </div>
                <span className="text-xs font-cinzel font-semibold text-[#f7e096] mt-1 capitalize">
                  {level4.lastAiMove || 'Watching'}
                </span>
                <span className="text-xl font-mono-clean font-bold text-amber-500 mt-0.5">
                  {level4.aiScore} pts
                </span>
              </div>
            </div>

            {/* Clash Result Message */}
            {clashMessage && (
              <div
                className={`p-2.5 rounded-lg text-xs font-sans-clean font-semibold ${
                  level4.lastRoundWinner === 'player'
                    ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
                    : level4.lastRoundWinner === 'ai'
                    ? 'bg-rose-950/80 border border-rose-700 text-rose-300'
                    : 'bg-[#241a12] border border-[#6b502d] text-[#e6d5b8]'
                }`}
              >
                {clashMessage}
              </div>
            )}
          </div>

          {/* Interactive Player Choices */}
          {!level4.isSolved ? (
            <div>
              <span className="text-xs font-cinzel font-bold text-[#f7e096] block mb-3 text-center">
                Choose Your Offering to the Altar:
              </span>
              <div className="grid grid-cols-3 gap-3">
                {MOVES.map((move) => (
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
                      Beats {move.beats}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Solved State with Code 5 & Token 4 */
            <div className="border-t border-[#6e502c] pt-5 mt-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-center gap-2 mb-3 text-emerald-400">
                <Trophy className="w-5 h-5" />
                <span className="font-cinzel font-bold text-sm">
                  Bastet Smiles Upon You! 3 Victories Achieved
                </span>
              </div>

              {/* Unlocked Code for Level 5 */}
              <div className="bg-[#120c08] border border-[#8c6d31] p-4 rounded-xl mb-4 text-center">
                <span className="text-[10px] font-cinzel text-[#a98f6d] uppercase tracking-widest block mb-1">
                  Gateway Key to Chamber V (Chamber of the Pharaoh's Order)
                </span>
                <div className="text-2xl sm:text-3xl font-mono-clean font-bold text-[#f7e096] tracking-[0.25em]">
                  {level4.unlockedCode}
                </div>
              </div>

              {/* Discovered Sacred Number Token 4 */}
              {sacredToken && (
                <div className="flex items-center justify-center gap-3 p-3 bg-[#24170d] rounded-lg border border-[#78592c] mb-6">
                  <span className="text-3xl text-[#f7e096] hieroglyph-glow">
                    {sacredToken.glyphChar}
                  </span>
                  <div className="text-left">
                    <span className="text-xs font-cinzel font-bold text-[#f3e6cf] block">
                      Sacred Stone: {sacredToken.glyphName}
                    </span>
                    <span className="text-[11px] text-[#a98f6d]">
                      Carved Rune Value: <strong className="text-[#f7e096]">{sacredToken.value}</strong> (Recorded in Journal for Chamber V)
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  sound.playStoneSlide();
                  onProceedToLevel(5);
                }}
                className="w-full py-3.5 px-6 font-cinzel font-bold text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <span>Proceed to Chamber V: The Pharaoh’s Order</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
