import React, { useState } from 'react';
import { GamePlaythroughState, SymbolCard } from '../types/game';
import { sound } from '../audio/soundManager';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Level1ChamberProps {
  gameState: GamePlaythroughState;
  onUpdateState: (newState: Partial<GamePlaythroughState>) => void;
  onProceedToLevel: (levelId: number) => void;
  onOpenScroll: () => void;
}

export const Level1Chamber: React.FC<Level1ChamberProps> = ({
  gameState,
  onUpdateState,
  onProceedToLevel,
  onOpenScroll,
}) => {
  const { level1 } = gameState;
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleCardClick = (index: number) => {
    if (isEvaluating || level1.cards[index].isFlipped || level1.cards[index].isMatched) {
      return;
    }

    sound.playStoneClick();

    // Flip this card
    const updatedCards = [...level1.cards];
    updatedCards[index] = { ...updatedCards[index], isFlipped: true };

    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);

    if (newSelected.length === 2) {
      setIsEvaluating(true);
      const [firstIdx, secondIdx] = newSelected;
      const firstCard = updatedCards[firstIdx];
      const secondCard = updatedCards[secondIdx];

      if (firstCard.symbolKey === secondCard.symbolKey) {
        // MATCH!
        setTimeout(() => {
          sound.playMatchChime();
          const matchedCards = updatedCards.map((c, i) =>
            i === firstIdx || i === secondIdx ? { ...c, isMatched: true } : c
          );
          const newMatchedCount = level1.matchedCount + 1;
          const isSolved = newMatchedCount === level1.totalPairs;

          if (isSolved) {
            sound.playCodeUnlock();
          }

          onUpdateState({
            level1: {
              ...level1,
              cards: matchedCards,
              matchedCount: newMatchedCount,
              isSolved,
            },
            completedLevels: isSolved && !gameState.completedLevels.includes(1)
              ? [...gameState.completedLevels, 1]
              : gameState.completedLevels,
            highestDiscoveredLevel: Math.max(gameState.highestDiscoveredLevel, 2),
          });

          setSelectedIndices([]);
          setIsEvaluating(false);
        }, 500);
      } else {
        // MISMATCH
        setTimeout(() => {
          sound.playMismatchThud();
          const revertedCards = updatedCards.map((c, i) =>
            i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c
          );
          onUpdateState({
            level1: {
              ...level1,
              cards: revertedCards,
            },
          });
          setSelectedIndices([]);
          setIsEvaluating(false);
        }, 900);
      }
    } else {
      onUpdateState({
        level1: {
          ...level1,
          cards: updatedCards,
        },
      });
    }
  };

  const sacredToken = gameState.sacredTokens.find((t) => t.originLevel === 1);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Chamber Header */}
      <div className="w-full stone-panel rounded-xl p-5 mb-6 text-center border-t-2 border-[#d4af37]">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="text-left">
            <span className="text-[11px] font-mono-clean text-[#a98f6d] uppercase tracking-widest">
              Chamber I · Sekhem-Netjer
            </span>
            <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-[#f7e096]">
              The Hall of Glyphs
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-cinzel text-[#d4af37] bg-[#1a120c] px-3 py-1.5 rounded-lg border border-[#8c6d31]">
              Pairs Matched: {level1.matchedCount} / {level1.totalPairs}
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
          The sanctuary wall holds twelve stone tablets carved with paired deities. Touch the stones to awaken their harmonic resonance.
        </p>
      </div>

      {/* Grid of 12 Sandstone Tiles */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-2xl mb-8">
        {level1.cards.map((card, idx) => {
          const isRevealed = card.isFlipped || card.isMatched;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              disabled={isRevealed || isEvaluating}
              className={`aspect-square rounded-xl p-2 transition-all duration-300 transform relative flex flex-col items-center justify-center select-none ${
                card.isMatched
                  ? 'bg-gradient-to-b from-[#2e2113] to-[#1a120b] border-2 border-[#5fcb4d] shadow-[0_0_15px_rgba(95,203,77,0.3)]'
                  : isRevealed
                  ? 'bg-gradient-to-b from-[#3a2917] to-[#20150b] border-2 border-[#e8c76e] shadow-[0_0_15px_rgba(232,199,110,0.4)] scale-102'
                  : 'bg-gradient-to-b from-[#201610] to-[#140d08] border border-[#6b4e28] hover:border-[#bca378] hover:scale-102 shadow-md cursor-pointer'
              }`}
            >
              {isRevealed ? (
                <div className="flex flex-col items-center justify-center animate-in zoom-in-75 duration-200">
                  <span className="text-3xl sm:text-4xl text-[#f7e096] hieroglyph-glow leading-none mb-1">
                    {card.glyph}
                  </span>
                  <span className="text-[10px] font-cinzel font-medium text-[#cbb28b] text-center line-clamp-1 px-1">
                    {card.name}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-8 h-8 rounded-full border border-dashed border-[#8c6d31]/50 flex items-center justify-center mb-1">
                    <span className="text-xs font-cinzel text-[#8c6d31]">𓊽</span>
                  </div>
                  <span className="text-[10px] font-mono-clean text-[#7a6042]">
                    SEAL #{idx + 1}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Chamber Solved Banner & Code Reveal */}
      {level1.isSolved && (
        <div className="w-full max-w-xl stone-panel rounded-2xl p-6 border-2 border-[#d4af37] shadow-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-center gap-2 mb-2 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
            <h2 className="text-lg font-cinzel font-bold tracking-wider">
              Chamber Wall Awakened
            </h2>
          </div>
          <p className="text-xs text-[#bda482] mb-4">
            The ancient mechanisms retract, revealing the gateway cipher and a sacred relic.
          </p>

          {/* Unlocked Code Box */}
          <div className="bg-[#120c08] border border-[#8c6d31] p-4 rounded-xl mb-4">
            <span className="text-[10px] font-cinzel text-[#a98f6d] uppercase tracking-widest block mb-1">
              Gateway Key to Chamber II (Crypt of the Cipher)
            </span>
            <div className="text-2xl sm:text-3xl font-mono-clean font-bold text-[#f7e096] tracking-[0.25em]">
              {level1.unlockedCode}
            </div>
          </div>

          {/* Discovered Sacred Number Token */}
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
              onProceedToLevel(2);
            }}
            className="w-full py-3.5 px-6 font-cinzel font-bold text-[#140e09] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <span>Proceed to Chamber II: Crypt of the Cipher</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
