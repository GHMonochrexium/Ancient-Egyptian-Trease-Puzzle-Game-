import React, { useState } from 'react';
import { GamePlaythroughState, GameStateUpdater } from '../types/game';
import { sound } from '../audio/soundManager';
import { Scroll, Sparkles, ArrowRight, KeyRound, Swords, HelpCircle, CheckCircle2, RotateCcw } from 'lucide-react';

interface LevelYMummyProps {
  gameState: GamePlaythroughState;
  onUpdateState: (update: GameStateUpdater) => void;
  onProceedToLevelZ: () => void;
  onReturnToMainGame: () => void;
}

export const LevelYMummy: React.FC<LevelYMummyProps> = ({
  gameState,
  onUpdateState,
  onProceedToLevelZ,
  onReturnToMainGame,
}) => {
  const { act3 } = gameState;
  const { levelY } = act3;

  // Caesar / Binary answer input
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Bandages state (4 bandages)
  const [peeledBandages, setPeeledBandages] = useState<number[]>([]);

  const handleOpenScroll = () => {
    sound.playCurseWhisper();
    onUpdateState((prev) => ({
      ...prev,
      act3: {
        ...prev.act3,
        levelY: {
          ...prev.act3.levelY,
          isScrollOpened: true,
        },
      },
    }));
  };

  // Submit Caesar Cipher
  const handleSubmitCaesar = () => {
    sound.playStoneClick();
    const clean = userInput.trim().toUpperCase();
    if (clean === levelY.caesarPlain) {
      sound.playCodeUnlock();
      setFeedback('Inscribed truth accepted! The sarcophagus wards shatter.');
      onUpdateState((prev) => ({
        ...prev,
        act3: {
          ...prev.act3,
          levelY: {
            ...prev.act3.levelY,
            challengeSolved: true,
          },
        },
      }));
    } else {
      sound.playMismatchThud();
      setFeedback('The hieroglyphic cipher rejects your transcription. Re-verify the alphabet shift pace.');
    }
  };

  // Submit Binary Code
  const handleSubmitBinary = () => {
    sound.playStoneClick();
    const clean = userInput.trim().toUpperCase();
    if (clean === levelY.binaryWord) {
      sound.playCodeUnlock();
      setFeedback('The binary scribe seals dissolve! The mummy stirs.');
      onUpdateState((prev) => ({
        ...prev,
        act3: {
          ...prev.act3,
          levelY: {
            ...prev.act3.levelY,
            challengeSolved: true,
          },
        },
      }));
    } else {
      sound.playMismatchThud();
      setFeedback('Incorrect binary translation. Each 8-bit byte represents one ASCII character.');
    }
  };

  // Play Rock Paper Scissors
  const handlePlayRps = (playerChoice: 'rock' | 'paper' | 'scissors') => {
    sound.playStoneClick();
    const moves: ('rock' | 'paper' | 'scissors')[] = ['rock', 'paper', 'scissors'];
    const guardianChoice = moves[Math.floor(Math.random() * moves.length)];

    let result: 'win' | 'lose' | 'tie' = 'tie';
    if (playerChoice === guardianChoice) {
      result = 'tie';
      sound.playTimerTick(false);
      setFeedback('Sacred standoff! Both chose the same totem. Cast again!');
    } else if (
      (playerChoice === 'rock' && guardianChoice === 'scissors') ||
      (playerChoice === 'paper' && guardianChoice === 'rock') ||
      (playerChoice === 'scissors' && guardianChoice === 'paper')
    ) {
      result = 'win';
      sound.playMeowdoClash(true);
      setFeedback(`Victory! Your ${playerChoice.toUpperCase()} overcomes the Mummy Guardian’s ${guardianChoice.toUpperCase()}!`);
      onUpdateState((prev) => ({
        ...prev,
        act3: {
          ...prev.act3,
          levelY: {
            ...prev.act3.levelY,
            playerMove: playerChoice,
            guardianMove: guardianChoice,
            rpsResult: 'win',
            challengeSolved: true,
          },
        },
      }));
    } else {
      result = 'lose';
      sound.playMeowdoClash(false);
      setFeedback(`Defeat! The Mummy Guardian’s ${guardianChoice.toUpperCase()} broke your ${playerChoice.toUpperCase()}. Try again!`);
      onUpdateState((prev) => ({
        ...prev,
        act3: {
          ...prev.act3,
          levelY: {
            ...prev.act3.levelY,
            playerMove: playerChoice,
            guardianMove: guardianChoice,
            rpsResult: 'lose',
          },
        },
      }));
    }
  };

  // Peel a bandage
  const handlePeelBandage = (index: number) => {
    if (peeledBandages.includes(index)) return;
    sound.playBandageUnwrap();
    const nextPeeled = [...peeledBandages, index];
    setPeeledBandages(nextPeeled);

    if (nextPeeled.length >= 4) {
      sound.playCodeUnlock();
      onUpdateState((prev) => ({
        ...prev,
        act3: {
          ...prev.act3,
          levelY: {
            ...prev.act3.levelY,
            isSolved: true,
          },
        },
      }));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="w-full stone-panel rounded-2xl p-5 mb-6 border-t-2 border-[#9333ea] bg-[#12071f]/95 shadow-[0_0_35px_rgba(147,51,234,0.3)]">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
          <div>
            <span className="text-[11px] font-mono-clean text-[#c084fc] uppercase tracking-widest flex items-center gap-1.5">
              <span>Act III · Gateway Trial II</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-[#f5d0fe]">
              Level Y — The Mummy
            </h1>
          </div>

          <button
            onClick={onReturnToMainGame}
            className="text-xs font-cinzel text-[#d8b4fe] hover:text-[#faf5ff] underline underline-offset-4 decoration-[#7e22ce] transition-colors cursor-pointer"
          >
            Exit to Main Trek
          </button>
        </div>

        <p className="text-xs text-[#d8b4fe] font-sans-clean max-w-2xl">
          A sealed sarcophagus rests upon the burial plinth. Unfold the Sacred Scroll to reveal the binding trial, then peel away the mummy’s linen wraps to uncover the gateway seal.
        </p>
      </div>

      {/* Sarcophagus Chamber Card */}
      <div className="stone-panel rounded-2xl p-6 sm:p-8 border-2 border-[#7e22ce] bg-gradient-to-b from-[#160927] to-[#0c0414] shadow-2xl relative overflow-hidden mb-8">
        {/* Burial Chamber Visual Header */}
        <div className="relative rounded-xl overflow-hidden border border-[#a855f7]/50 mb-6 h-56 sm:h-64 bg-[#0a0311]">
          <img
            src="/src/assets/images/cursed_mummy_sarcophagus_1791721969675.jpg"
            alt="Cursed Mummy Sarcophagus Chamber"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-85"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0417] via-transparent to-black/40" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <span className="text-xs font-cinzel font-bold text-[#f5d0fe] drop-shadow-md">
              𓊽 Burial Chamber of the Nameless Priest
            </span>
            <span className="text-[11px] font-mono-clean text-[#e879f9] bg-[#2d0e4a]/80 px-2.5 py-1 rounded-md border border-[#a855f7]">
              {levelY.isSolved ? 'Seal Broken' : levelY.challengeSolved ? 'Unwrap Bandages' : 'Sarcophagus Sealed'}
            </span>
          </div>
        </div>

        {/* STEP 1: OPEN THE SACRED SCROLL */}
        {!levelY.isScrollOpened ? (
          <div className="text-center py-6">
            <p className="text-xs text-[#d8b4fe] font-sans-clean mb-4 max-w-md mx-auto">
              The sarcophagus is protected by an ancient binding riddle locked inside the royal papyrus scroll.
            </p>
            <button
              onClick={handleOpenScroll}
              className="px-8 py-4 rounded-xl font-cinzel font-bold text-sm tracking-widest text-[#12071f] bg-gradient-to-r from-[#e9d5ff] via-[#d8b4fe] to-[#c084fc] hover:from-[#f5d0fe] hover:to-[#e879f9] shadow-[0_0_30px_rgba(192,132,252,0.5)] hover:scale-102 active:scale-98 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Scroll className="w-5 h-5 text-[#4c1d95]" />
              <span>OPEN THE SACRED SCROLL</span>
            </button>
          </div>
        ) : !levelY.challengeSolved ? (
          /* STEP 2: ACTIVE RANDOMIZED CHALLENGE (Caesar, Binary, or RPS) */
          <div className="p-5 rounded-xl bg-[#200c35] border-2 border-[#a855f7] mb-6 animate-in fade-in duration-300">
            {/* Challenge Header */}
            <div className="flex items-center justify-between mb-4 border-b border-[#6b21a8] pb-3">
              <div className="flex items-center gap-2 text-[#f5d0fe]">
                <Scroll className="w-5 h-5 text-[#e879f9]" />
                <h3 className="text-sm font-cinzel font-bold uppercase tracking-wider">
                  The Sacred Scroll Unfolds: {levelY.challengeType === 'caesar' ? 'Trial of the Caesar Cipher' : levelY.challengeType === 'binary' ? 'Trial of the Binary Code' : 'Trial of the Guardian Duel (RPS)'}
                </h3>
              </div>
              <span className="text-[10px] font-mono-clean text-[#c084fc] bg-[#3b0764] px-2 py-0.5 rounded border border-[#7e22ce]">
                Randomized ~33.3% Trial
              </span>
            </div>

            {/* A: CAESAR CIPHER */}
            {levelY.challengeType === 'caesar' && (
              <div className="space-y-4">
                <p className="text-xs text-[#e9d5ff] font-sans-clean">
                  The scribe shifted each letter backward by <strong className="text-[#f5d0fe] font-mono-clean">{levelY.caesarShift}</strong> positions. Decode the encrypted inscription to break the first ward:
                </p>
                <div className="p-4 bg-[#12051e] rounded-xl border border-[#7e22ce] text-center">
                  <span className="text-[10px] font-mono-clean text-[#c084fc] uppercase tracking-widest block mb-1">
                    Cursed Ciphertext
                  </span>
                  <div className="text-2xl font-mono-clean font-bold tracking-[0.25em] text-[#f5d0fe]">
                    {levelY.caesarCipher}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter decoded word..."
                    className="px-4 py-2.5 bg-[#12051e] border border-[#7e22ce] rounded-xl text-center font-mono-clean font-bold tracking-widest text-base text-[#f5d0fe] uppercase focus:outline-none focus:border-[#c084fc] w-64"
                  />
                  <button
                    onClick={handleSubmitCaesar}
                    className="px-5 py-2.5 font-cinzel font-bold text-xs text-[#12071f] bg-gradient-to-r from-[#e9d5ff] to-[#c084fc] hover:from-[#f5d0fe] hover:to-[#e879f9] rounded-xl shadow transition-all cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}

            {/* B: BINARY CODE */}
            {levelY.challengeType === 'binary' && (
              <div className="space-y-4">
                <p className="text-xs text-[#e9d5ff] font-sans-clean">
                  Ancient astronomical pulses are recorded in 8-bit ASCII binary. Translate the sequence to spell the sacred word:
                </p>
                <div className="p-4 bg-[#12051e] rounded-xl border border-[#7e22ce] text-center">
                  <span className="text-[10px] font-mono-clean text-[#c084fc] uppercase tracking-widest block mb-1">
                    Binary Stream
                  </span>
                  <div className="text-sm sm:text-base font-mono-clean font-bold tracking-wider text-[#f5d0fe] break-all">
                    {levelY.binaryString}
                  </div>
                </div>

                {/* Rosetta Helper */}
                <details className="text-xs text-[#d8b4fe] bg-[#160725] p-3 rounded-lg border border-[#6b21a8] cursor-pointer">
                  <summary className="font-cinzel font-semibold text-[#f5d0fe]">
                    View Rosetta Binary Conversion Key
                  </summary>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 font-mono-clean text-[11px] text-[#c084fc]">
                    <span>A: 01000001</span>
                    <span>B: 01000010</span>
                    <span>C: 01000011</span>
                    <span>D: 01000100</span>
                    <span>E: 01000101</span>
                    <span>K: 01001011</span>
                    <span>M: 01001101</span>
                    <span>O: 01001111</span>
                    <span>R: 01010010</span>
                    <span>S: 01010011</span>
                    <span>T: 01010100</span>
                    <span>U: 01010101</span>
                  </div>
                </details>

                <div className="flex items-center justify-center gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter translated word..."
                    className="px-4 py-2.5 bg-[#12051e] border border-[#7e22ce] rounded-xl text-center font-mono-clean font-bold tracking-widest text-base text-[#f5d0fe] uppercase focus:outline-none focus:border-[#c084fc] w-64"
                  />
                  <button
                    onClick={handleSubmitBinary}
                    className="px-5 py-2.5 font-cinzel font-bold text-xs text-[#12071f] bg-gradient-to-r from-[#e9d5ff] to-[#c084fc] hover:from-[#f5d0fe] hover:to-[#e879f9] rounded-xl shadow transition-all cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}

            {/* C: ROCK PAPER SCISSORS */}
            {levelY.challengeType === 'rps' && (
              <div className="space-y-4 text-center">
                <p className="text-xs text-[#e9d5ff] font-sans-clean max-w-lg mx-auto">
                  A spectral Mummy Guardian manifests before the sarcophagus. You must win a ritual clash of Rock, Paper, Scissors!
                </p>

                {levelY.playerMove && (
                  <div className="flex items-center justify-center gap-8 py-3 bg-[#130620] rounded-xl border border-[#6b21a8] max-w-sm mx-auto">
                    <div>
                      <span className="text-[10px] font-cinzel text-[#c084fc] block">You</span>
                      <span className="text-2xl">
                        {levelY.playerMove === 'rock' ? '🪨' : levelY.playerMove === 'paper' ? '📜' : '✂️'}
                      </span>
                    </div>
                    <div className="text-sm font-mono-clean text-[#e879f9] font-bold">VS</div>
                    <div>
                      <span className="text-[10px] font-cinzel text-[#c084fc] block">Mummy Guardian</span>
                      <span className="text-2xl">
                        {levelY.guardianMove === 'rock' ? '🪨' : levelY.guardianMove === 'paper' ? '📜' : '✂️'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-2">
                  {[
                    { key: 'rock', icon: '🪨', label: 'Rock (Stone)' },
                    { key: 'paper', icon: '📜', label: 'Paper (Papyrus)' },
                    { key: 'scissors', icon: '✂️', label: 'Scissors (Shears)' },
                  ].map((move) => (
                    <button
                      key={move.key}
                      onClick={() => handlePlayRps(move.key as 'rock' | 'paper' | 'scissors')}
                      className="px-4 py-3 rounded-xl bg-[#2b1046] border border-[#a855f7] hover:border-[#f5d0fe] hover:scale-105 active:scale-95 transition-all text-xs font-cinzel font-bold text-[#faf5ff] flex flex-col items-center gap-1 shadow cursor-pointer"
                    >
                      <span className="text-2xl">{move.icon}</span>
                      <span>{move.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback message */}
            {feedback && (
              <p className="text-xs font-sans-clean font-semibold text-center mt-4 text-[#f5d0fe]">
                {feedback}
              </p>
            )}
          </div>
        ) : (
          /* STEP 3: UNCOVER THE MUMMY (Peel away 4 bandages) */
          <div className="p-6 rounded-xl bg-[#1e0a32] border-2 border-[#a855f7] text-center animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3b0764] border border-[#c084fc] text-[#f5d0fe] text-xs font-cinzel font-bold mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Scroll Riddle Solved! Peel the Mummy’s Bandages</span>
            </div>
            <p className="text-xs text-[#d8b4fe] font-sans-clean mb-6 max-w-md mx-auto">
              Click on each of the four enchanted linen bandages to unwrap the mummy and uncover the gateway seal!
            </p>

            {/* Sarcophagus Bandages Interactive Grid */}
            <div className="relative max-w-sm mx-auto p-6 rounded-2xl bg-[#0f0418] border border-[#7e22ce] shadow-inner mb-6">
              {/* Sarcophagus Mask representation */}
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-b from-[#eab308] to-[#ca8a04] border-2 border-[#fef08a] flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(234,179,8,0.5)] mb-4">
                👑
              </div>

              {/* Bandage Strips */}
              <div className="space-y-2.5">
                {[
                  { id: 1, name: 'First Linen Wrap of Anubis' },
                  { id: 2, name: 'Second Linen Wrap of Osiris' },
                  { id: 3, name: 'Third Linen Wrap of Thoth' },
                  { id: 4, name: 'Final Heart Seal Bandage' },
                ].map((bandage) => {
                  const isPeeled = peeledBandages.includes(bandage.id);
                  return (
                    <button
                      key={bandage.id}
                      onClick={() => handlePeelBandage(bandage.id)}
                      disabled={isPeeled}
                      className={`w-full py-2.5 px-4 rounded-lg font-cinzel text-xs font-bold transition-all flex items-center justify-between border ${
                        isPeeled
                          ? 'bg-[#180a25] border-[#4c1d95] text-[#581c87] line-through opacity-50 cursor-default'
                          : 'bg-gradient-to-r from-[#d8b4fe]/30 via-[#c084fc]/40 to-[#d8b4fe]/30 border-[#c084fc] text-[#faf5ff] hover:border-[#f5d0fe] hover:scale-102 cursor-pointer shadow-[0_0_12px_rgba(192,132,252,0.3)]'
                      }`}
                    >
                      <span>{isPeeled ? `✓ ${bandage.name} (Torn)` : `✂️ Unwrap: ${bandage.name}`}</span>
                      <span className="text-[10px] font-mono-clean">{isPeeled ? 'Peeled' : 'Tap to Peel'}</span>
                    </button>
                  );
                })}
              </div>

              {/* Revealed Gateway Scarab Key */}
              {levelY.isSolved && (
                <div className="mt-5 p-4 rounded-xl bg-gradient-to-b from-[#3b0764] to-[#1e0735] border-2 border-[#e879f9] shadow-[0_0_25px_rgba(232,121,249,0.7)] animate-in zoom-in duration-300">
                  <div className="text-4xl mb-1 text-[#f5d0fe] animate-pulse">𓆣</div>
                  <h4 className="text-xs font-cinzel font-bold text-[#faf5ff] uppercase tracking-wider mb-1">
                    Ancient Gateway Scarab Revealed
                  </h4>
                  <p className="text-[11px] text-[#e9d5ff] font-sans-clean">
                    The royal heart scarab glows with unearthly violet energy.
                  </p>
                </div>
              )}
            </div>

            {/* Solved Advance Button */}
            {levelY.isSolved && (
              <div className="animate-in fade-in duration-300">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3b0764] border border-[#c084fc] text-[#f5d0fe] font-cinzel font-bold text-sm mb-4">
                  <Sparkles className="w-5 h-5 text-[#e879f9]" />
                  <span>THE SEAL IS BROKEN. THE FINAL GATE AWAITS.</span>
                </div>
                <div className="mt-2">
                  <button
                    onClick={() => {
                      sound.playStoneSlide();
                      onProceedToLevelZ();
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 font-cinzel font-bold text-sm tracking-wider text-[#12071f] bg-gradient-to-r from-[#e9d5ff] via-[#d8b4fe] to-[#c084fc] hover:from-[#f5d0fe] hover:to-[#e879f9] rounded-xl shadow-[0_0_25px_rgba(233,213,255,0.4)] transition-all active:scale-98 inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Advance to Level Z: The Final Challenge</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
