import React, { useState } from 'react';
import { GamePlaythroughState, GameStateUpdater } from '../types/game';
import { binaryToString } from '../game/generator';
import { sound } from '../audio/soundManager';
import { ArrowRight, CheckCircle2, Lock, KeyRound, Sparkles, Eye, BookOpen } from 'lucide-react';

interface Level7ChamberProps {
  gameState: GamePlaythroughState;
  onUpdateState: (update: GameStateUpdater) => void;
  onProceedToLevel: (levelId: number) => void;
  onOpenScroll: () => void;
}

export const Level7Chamber: React.FC<Level7ChamberProps> = ({
  gameState,
  onUpdateState,
  onProceedToLevel,
  onOpenScroll,
}) => {
  const { level7, level6 } = gameState;
  const isGateUnlocked = gameState.completedLevels.includes(6);
  const [enteredGateCode, setEnteredGateCode] = useState('');
  const [isGateOpen, setIsGateOpen] = useState(isGateUnlocked);
  const [gateError, setGateError] = useState(false);

  // Puzzle interaction
  const [inputWord, setInputWord] = useState(level7.userAnswer);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showRosetta, setShowRosetta] = useState(false);

  const handleUnlockGate = (codeToTest: string) => {
    sound.playStoneClick();
    const cleanCode = codeToTest.trim().replace(/\s+/g, '-');
    if (cleanCode === level6.unlockedScarabKey || cleanCode.replace(/-/g, '') === level6.unlockedScarabKey.replace(/-/g, '')) {
      sound.playStoneSlide();
      setIsGateOpen(true);
      setGateError(false);
    } else {
      sound.playMismatchThud();
      setGateError(true);
    }
  };

  const handleQuickTranscribe = () => {
    sound.playStoneClick();
    const translated = binaryToString(level7.binaryString);
    setInputWord(translated);
  };

  const handleSubmitWord = () => {
    sound.playStoneClick();
    const clean = inputWord.trim().toUpperCase();

    if (clean === level7.secretWord.toUpperCase()) {
      sound.playCodeUnlock();
      const msg = `Correct! The binary stream illuminates: "${clean}". The knowledge of Thoth reveals the path.`;
      setFeedback(msg);

      onUpdateState((prev) => ({
        ...prev,
        level7: {
          ...prev.level7,
          userAnswer: clean,
          isSolved: true,
        },
        completedLevels: !prev.completedLevels.includes(7)
          ? [...prev.completedLevels, 7]
          : prev.completedLevels,
        highestDiscoveredLevel: Math.max(prev.highestDiscoveredLevel, 8),
      }));
    } else {
      sound.playMismatchThud();
      setFeedback(`"${clean || 'EMPTY'}" does not resonate with the binary stream. Decode each 8-bit byte into ASCII characters.`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Chamber Header */}
      <div className="w-full stone-panel rounded-xl p-5 mb-6 text-center border-t-2 border-[#40e0d0]">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="text-left">
            <span className="text-[11px] font-mono-clean text-[#40e0d0] uppercase tracking-widest turquoise-glow">
              Chamber VII · Seshu-Sebau
            </span>
            <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-[#f7e096]">
              The Binary Alphabet (Trial of Knowledge)
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-cinzel text-[#40e0d0] bg-[#112327] px-3 py-1.5 rounded-lg border border-[#2d8299]">
              Status: {level7.isSolved ? 'Decoded' : 'Binary Stream Active'}
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
          The sanctuary walls are carved with mysterious sequences of zeros and ones. The scribes of Thoth have concealed a secret password within the binary bytes.
        </p>
      </div>

      {/* If Chamber Portal is Sealed */}
      {!isGateOpen ? (
        <div className="w-full max-w-md stone-panel rounded-2xl p-6 border-2 border-[#b88c3a] text-center my-8 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#20150d] border border-[#8c6d31] flex items-center justify-center text-[#d4af37] mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-cinzel font-bold text-[#f7e096] mb-2">
            The Scriptorium Vault is Sealed
          </h2>
          <p className="text-xs text-[#a98f6d] mb-4">
            Enter the Golden Scarab Key recovered from the Pharaoh’s Duel in Chamber VI to enter the hall of binary knowledge.
          </p>

          <div className="flex items-center justify-center gap-2 mb-3">
            <input
              type="text"
              value={enteredGateCode}
              onChange={(e) => setEnteredGateCode(e.target.value)}
              placeholder="e.g. 7-2-9-4"
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
              The lock mechanism resists. Verify the Scarab Key from Chamber VI.
            </p>
          )}

          {level6.isSolved && (
            <button
              onClick={() => {
                setEnteredGateCode(level6.unlockedScarabKey);
                handleUnlockGate(level6.unlockedScarabKey);
              }}
              className="text-xs font-sans-clean text-[#40e0d0] hover:underline flex items-center justify-center gap-1.5 mx-auto mt-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Use Golden Scarab Key: {level6.unlockedScarabKey}
            </button>
          )}
        </div>
      ) : (
        /* The Active Binary Puzzle */
        <div className="w-full max-w-3xl stone-panel rounded-2xl p-6 sm:p-8 border-2 border-[#2d8299] shadow-2xl mb-8">
          {/* Lapis Lazuli Glowing Binary Wall */}
          <div className="text-center border-b border-[#2d8299]/50 pb-5 mb-6">
            <span className="text-[10px] font-mono-clean text-[#40e0d0] tracking-widest uppercase block mb-1">
              Glowing Inscription on Obsidian Wall
            </span>
            <div className="bg-[#091519] border-2 border-[#40e0d0]/50 p-5 rounded-2xl inline-block max-w-full my-2 shadow-[0_0_25px_rgba(64,224,208,0.2)]">
              <span className="text-[10px] font-cinzel text-[#40e0d0] uppercase tracking-wider block mb-1.5">
                8-Bit ASCII Byte Stream
              </span>
              <span className="text-base sm:text-2xl font-mono-clean font-bold tracking-[0.2em] text-[#71e8ff] turquoise-glow break-all">
                {level7.binaryString}
              </span>
            </div>
            <p className="text-xs text-[#a98f6d] mt-2 italic font-sans-clean">
              Each 8-bit byte translates into a letter of the alphabet (e.g. 01000001 = A).
            </p>
          </div>

          {/* Rosetta Reference Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={() => {
                sound.playStoneClick();
                setShowRosetta(!showRosetta);
              }}
              className="px-3.5 py-2 rounded-lg bg-[#142327] hover:bg-[#1b353b] border border-[#2d8299] text-xs font-cinzel text-[#71e8ff] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Eye className="w-4 h-4 text-[#40e0d0]" />
              <span>{showRosetta ? 'Hide' : 'Reveal'} Binary Rosetta Decoding Chart</span>
            </button>

            <button
              onClick={handleQuickTranscribe}
              className="px-3.5 py-2 rounded-lg bg-[#271d12] hover:bg-[#3d2a17] border border-[#8c6d31] text-xs font-cinzel text-[#f7e096] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span>Quick-Transcribe via Altar Compass</span>
            </button>
          </div>

          {/* Rosetta Stone Inscriptions Table */}
          {showRosetta && (
            <div className="p-4 rounded-xl bg-[#091519] border border-[#2d8299] mb-6 animate-in fade-in duration-200">
              <span className="text-xs font-cinzel font-bold text-[#40e0d0] block mb-2 text-center uppercase tracking-wider">
                Ancient Binary Rosetta Alphabet (ASCII)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-clean text-[#beeaf2]">
                <div>A = 01000001</div>
                <div>B = 01000010</div>
                <div>C = 01000011</div>
                <div>D = 01000100</div>
                <div>E = 01000101</div>
                <div>H = 01001000</div>
                <div>I = 01001001</div>
                <div>K = 01001011</div>
                <div>M = 01001101</div>
                <div>N = 01001110</div>
                <div>O = 01001111</div>
                <div>P = 01010000</div>
                <div>R = 01010010</div>
                <div>S = 01010011</div>
                <div>T = 01010100</div>
                <div>U = 01010101</div>
              </div>
            </div>
          )}

          {/* Submission Input Box */}
          <div className="bg-[#120d09] border border-[#523d24] rounded-xl p-5 mb-6 text-center">
            <span className="text-xs font-cinzel font-bold text-[#f7e096] block mb-2">
              Enter the Decoded Secret Word:
            </span>
            <div className="max-w-xs mx-auto">
              <input
                type="text"
                value={inputWord}
                onChange={(e) => setInputWord(e.target.value.toUpperCase())}
                placeholder="e.g. OSIRIS"
                disabled={level7.isSolved}
                className="w-full px-4 py-3 bg-[#0a0705] border-2 border-[#40e0d0]/60 rounded-xl text-center font-mono-clean font-bold tracking-widest text-2xl text-[#71e8ff] focus:outline-none focus:border-[#40e0d0]"
              />
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-3.5 rounded-lg text-xs font-sans-clean font-semibold text-center mb-5 border ${
                level7.isSolved
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-700 text-rose-300'
              }`}
            >
              {feedback}
            </div>
          )}

          {/* Submit Action */}
          {!level7.isSolved ? (
            <button
              onClick={handleSubmitWord}
              className="w-full py-4 px-6 font-cinzel font-bold text-sm text-[#140e0a] bg-gradient-to-r from-[#40e0d0] via-[#38c5b8] to-[#209287] hover:from-[#66e8db] hover:to-[#28ab9e] rounded-xl shadow-[0_0_25px_rgba(64,224,208,0.4)] transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Submit Decoded Word: "{inputWord || '...'}"</span>
            </button>
          ) : (
            <div className="border-t border-[#6e502c] pt-5 mt-2 animate-in fade-in duration-300 text-center">
              <div className="flex items-center justify-center gap-2 mb-3 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-cinzel font-bold text-sm">
                  Trial of Knowledge Conquered
                </span>
              </div>

              {/* Unlocked Code for Level 8 */}
              <div className="bg-[#120c08] border border-[#8c6d31] p-4 rounded-xl mb-4 text-center">
                <span className="text-[10px] font-cinzel text-[#a98f6d] uppercase tracking-widest block mb-1">
                  Gateway Key to Chamber VIII (The Moving Guardian)
                </span>
                <div className="text-2xl sm:text-3xl font-mono-clean font-bold text-[#f7e096] tracking-[0.25em]">
                  {level7.unlockedCode}
                </div>
              </div>

              {/* Hidden Number 7 in Cartouche */}
              <div className="flex items-center justify-center gap-3 p-3.5 bg-[#142327] rounded-lg border border-[#40e0d0]/60 mb-6 shadow-sm">
                <span className="text-3xl text-[#40e0d0] turquoise-glow">𓊽</span>
                <div className="text-left">
                  <span className="text-xs font-cinzel font-bold text-[#d2fbf5] block">
                    Act II Relic Discovered: Turquoise Lapis Cartouche (Value: <strong className="text-[#40e0d0] text-base">{level7.hiddenNumber}</strong>)
                  </span>
                  <span className="text-[11px] text-[#94d5cb]">
                    Concealed in the glowing cartouche wall. Automatically saved in your Journal for Chamber X!
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playStoneSlide();
                  onProceedToLevel(8);
                }}
                className="w-full py-4 px-6 font-cinzel font-bold text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Chamber VIII: The Moving Guardian (Trial of Speed)</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
