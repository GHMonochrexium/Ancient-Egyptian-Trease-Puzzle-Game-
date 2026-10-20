import React, { useState } from 'react';
import { GamePlaythroughState, GameStateUpdater, SacrificeObject } from '../types/game';
import { generateLevelXState } from '../game/generator';
import { sound } from '../audio/soundManager';
import { Flame, ShieldAlert, Sparkles, ArrowRight, RotateCcw, Heart, Skull } from 'lucide-react';

interface LevelXSacrificeProps {
  gameState: GamePlaythroughState;
  onUpdateState: (update: GameStateUpdater) => void;
  onProceedToLevelY: () => void;
  onReturnToMainGame: () => void;
}

export const LevelXSacrifice: React.FC<LevelXSacrificeProps> = ({
  gameState,
  onUpdateState,
  onProceedToLevelY,
  onReturnToMainGame,
}) => {
  const { act3 } = gameState;
  const { levelX } = act3;

  const [animatingObjectId, setAnimatingObjectId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(levelX.feedbackMessage);
  const [isFailed, setIsFailed] = useState(false);

  // Remaining objects that haven't been sacrificed yet
  const unSacrificedObjects = levelX.objects.filter(
    (o) => !levelX.sacrificedIds.includes(o.id)
  );

  // The next correct object ID according to the divine decree sequence
  const nextTargetId = levelX.targetSequence[levelX.sacrificedIds.length];

  const handleSacrificeObject = (obj: SacrificeObject) => {
    if (levelX.isSolved || isFailed || animatingObjectId !== null) return;

    sound.playStoneClick();
    setAnimatingObjectId(obj.id);

    setTimeout(() => {
      if (obj.id === nextTargetId) {
        // Correct sacrifice!
        sound.playSacrificeConsume();
        const nextSacrificed = [...levelX.sacrificedIds, obj.id];
        const isNowSolved = nextSacrificed.length === levelX.targetSequence.length;

        if (isNowSolved) {
          sound.playCodeUnlock();
        }

        onUpdateState((prev) => ({
          ...prev,
          act3: {
            ...prev.act3,
            levelX: {
              ...prev.act3.levelX,
              sacrificedIds: nextSacrificed,
              feedbackMessage: isNowSolved
                ? 'THE PHARAOH ACCEPTS YOUR OFFERING.'
                : `The Pharaoh’s altar consumes the ${obj.name}. The flame burns hotter!`,
              isSolved: isNowSolved,
            },
          },
        }));

        setFeedback(
          isNowSolved
            ? 'THE PHARAOH ACCEPTS YOUR OFFERING.'
            : `The Pharaoh’s altar consumes the ${obj.name}. The flame burns hotter!`
        );
        setAnimatingObjectId(null);
      } else {
        // Incorrect sacrifice!
        sound.playMismatchThud();
        const remainingLives = levelX.lives - 1;

        if (remainingLives <= 0) {
          // Failure condition!
          sound.playCurseWhisper();
          setIsFailed(true);
          setFeedback('All three sacred lives extinguished! The Pharaoh has rejected your soul.');
          setAnimatingObjectId(null);
        } else {
          // Remove 1 life and randomly regenerate sacred symbols as required
          const refreshed = generateLevelXState(remainingLives);
          onUpdateState((prev) => ({
            ...prev,
            act3: {
              ...prev.act3,
              levelX: {
                ...refreshed,
                feedbackMessage: `Incorrect offering! Cosmic balance was violated. The altar claims 1 life (${remainingLives} remaining). The relics have shifted!`,
              },
            },
          }));
          setFeedback(
            `Incorrect offering! Cosmic balance was violated. The altar claims 1 life (${remainingLives} remaining). The relics have shifted!`
          );
          setAnimatingObjectId(null);
        }
      }
    }, 400);
  };

  const handleRestartLevelX = () => {
    sound.playStoneSlide();
    const freshLevelX = generateLevelXState(3);
    onUpdateState((prev) => ({
      ...prev,
      act3: {
        ...prev.act3,
        gatewayLevel: 'X',
        levelX: freshLevelX,
      },
    }));
    setIsFailed(false);
    setFeedback(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="w-full stone-panel rounded-2xl p-5 mb-6 border-t-2 border-[#9333ea] bg-[#12071f]/95 shadow-[0_0_35px_rgba(147,51,234,0.3)]">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
          <div>
            <span className="text-[11px] font-mono-clean text-[#c084fc] uppercase tracking-widest flex items-center gap-1.5">
              <span>Act III · Gateway Trial I</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-[#f5d0fe]">
              Level X — The Sacrifice
            </h1>
          </div>

          {/* Three Egyptian Life Indicators */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#260c3e] border border-[#a855f7]/70 shadow-sm">
              <span className="text-xs font-cinzel text-[#d8b4fe] mr-1">Lives:</span>
              {[1, 2, 3].map((heartIndex) => {
                const isAlive = heartIndex <= levelX.lives;
                return (
                  <span
                    key={heartIndex}
                    className={`text-lg transition-transform ${
                      isAlive
                        ? 'text-[#e879f9] drop-shadow-[0_0_8px_rgba(232,121,249,0.8)] scale-110'
                        : 'text-[#4c1d95] opacity-40 scale-90'
                    }`}
                    title={isAlive ? 'Sacred Life Active' : 'Life Extinguished'}
                  >
                    𓆣
                  </span>
                );
              })}
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
          An ancient Pharaoh blocks the gateway to the forbidden realm. Offer the three sacred objects in the strict order of divine hierarchy to satisfy the obsidian altar.
        </p>
      </div>

      {/* Main Altar Area */}
      <div className="stone-panel rounded-2xl p-6 sm:p-8 border-2 border-[#7e22ce] bg-gradient-to-b from-[#170a27] to-[#0c0414] shadow-2xl relative overflow-hidden mb-8">
        {/* Pharaoh Decree / Rule Banner */}
        <div className="p-4 rounded-xl bg-[#230d3a]/90 border border-[#a855f7]/60 mb-6">
          <div className="flex items-center gap-2 mb-1.5 text-[#f5d0fe]">
            <Flame className="w-4 h-4 text-[#e879f9] animate-pulse" />
            <h3 className="text-xs font-cinzel font-bold uppercase tracking-wider">
              The Pharaoh’s Inscribed Decree
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#e9d5ff] font-serif italic leading-relaxed pl-6">
            {levelX.pharaohDecree}
          </p>
        </div>

        {/* Central Flaming Altar Visualization */}
        <div className="relative my-6 p-6 rounded-2xl bg-[#0e0417] border-2 border-[#a855f7]/50 text-center shadow-inner">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-t from-[#581c87] via-[#a855f7] to-[#f0abfc] flex items-center justify-center text-3xl shadow-[0_0_35px_rgba(168,85,247,0.7)] animate-pulse mb-3">
            🔥
          </div>
          <span className="text-xs font-cinzel font-bold text-[#f5d0fe] uppercase tracking-widest block mb-1">
            Obsidian Sacrifice Altar
          </span>
          <span className="text-[11px] font-mono-clean text-[#c084fc]">
            Offerings Consumed: {levelX.sacrificedIds.length} of 3
          </span>

          {/* Consumed Offerings Row */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            {levelX.objects.map((obj, idx) => {
              const isConsumed = levelX.sacrificedIds.includes(obj.id);
              return (
                <div
                  key={obj.id}
                  className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center text-base transition-all ${
                    isConsumed
                      ? 'bg-[#3b0764] border-[#c084fc] text-[#f5d0fe] shadow-[0_0_15px_rgba(192,132,252,0.6)]'
                      : 'bg-[#150a21] border-[#4c1d95] text-[#581c87]'
                  }`}
                  title={isConsumed ? `Consumed: ${obj.name}` : `Pending offering #${idx + 1}`}
                >
                  <span>{isConsumed ? obj.glyph : '•'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs sm:text-sm font-sans-clean font-semibold text-center mb-6 border ${
              levelX.isSolved
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                : isFailed
                ? 'bg-rose-950/90 border-rose-600 text-rose-200'
                : 'bg-[#2a0e44] border-[#a855f7] text-[#f5d0fe]'
            }`}
          >
            {feedback}
          </div>
        )}

        {/* Un-sacrificed Sacred Objects Selection */}
        {!levelX.isSolved && !isFailed && (
          <div>
            <span className="text-xs font-cinzel font-bold text-[#f5d0fe] block mb-3 text-center uppercase tracking-wider">
              Select Relic to Inscribe upon the Flaming Altar (3 Sacred Relics):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {unSacrificedObjects.map((obj) => {
                const isSelected = animatingObjectId === obj.id;
                return (
                  <button
                    key={obj.id}
                    onClick={() => handleSacrificeObject(obj)}
                    disabled={animatingObjectId !== null}
                    className={`p-4 rounded-xl bg-gradient-to-b from-[#210c37] to-[#12061e] border border-[#7e22ce] hover:border-[#c084fc] hover:scale-102 transition-all flex flex-col items-center justify-center text-center shadow-lg active:scale-95 cursor-pointer disabled:opacity-50 ${
                      isSelected ? 'animate-bounce border-[#e879f9]' : ''
                    }`}
                  >
                    <span className="text-3xl text-[#f5d0fe] mb-1.5 drop-shadow-[0_0_10px_rgba(245,208,254,0.4)]">
                      {obj.glyph}
                    </span>
                    <span className="text-xs font-cinzel font-bold text-[#faf5ff] mb-0.5">
                      {obj.name}
                    </span>
                    <span className="text-[10px] font-mono-clean text-[#c084fc] bg-[#3b0764]/70 px-2 py-0.5 rounded-full mb-1 border border-[#6b21a8]">
                      Tier: {obj.tierName}
                    </span>
                    <span className="text-[10px] text-[#d8b4fe] font-sans-clean italic max-w-xs">
                      {obj.clueDesc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Level X Solved State */}
        {levelX.isSolved && (
          <div className="mt-6 pt-6 border-t border-[#7e22ce] text-center animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-cinzel font-bold text-sm mb-4">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>THE PHARAOH ACCEPTS YOUR OFFERING.</span>
            </div>
            <p className="text-xs text-[#d8b4fe] font-sans-clean mb-5 max-w-md mx-auto">
              The altar counterweights sink into the earth. The crypt passage unlocks, leading deeper to Level Y: The Mummy.
            </p>
            <button
              onClick={() => {
                sound.playStoneSlide();
                onProceedToLevelY();
              }}
              className="w-full sm:w-auto px-8 py-3.5 font-cinzel font-bold text-sm tracking-wider text-[#12071f] bg-gradient-to-r from-[#e9d5ff] via-[#d8b4fe] to-[#c084fc] hover:from-[#f5d0fe] hover:to-[#e879f9] rounded-xl shadow-[0_0_25px_rgba(233,213,255,0.4)] transition-all active:scale-98 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Advance to Level Y: The Mummy</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Failure Screen when 3 lives lost */}
        {isFailed && (
          <div className="mt-6 pt-6 border-t border-rose-800 text-center animate-in fade-in duration-300">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-950 border border-rose-600 flex items-center justify-center text-rose-400 mb-3">
              <Skull className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-cinzel font-bold text-rose-300 mb-1">
              Trial of the Sacrifice Failed
            </h3>
            <p className="text-xs text-rose-200/80 font-sans-clean mb-4 max-w-md mx-auto">
              All 3 lives were lost. The Pharaoh’s curse forces you to restart Level X.
            </p>
            <button
              onClick={handleRestartLevelX}
              className="px-6 py-3 font-cinzel font-bold text-xs text-[#faf5ff] bg-gradient-to-r from-rose-900 to-rose-700 hover:from-rose-800 hover:to-rose-600 border border-rose-500 rounded-xl shadow-lg transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Level X (Restore 3 Lives)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
