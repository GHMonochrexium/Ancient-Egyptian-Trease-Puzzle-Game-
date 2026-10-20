import React from 'react';
import { sound } from '../audio/soundManager';
import { Scroll, X } from 'lucide-react';

interface InstructionScrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  onEnterAct3?: () => void;
}

interface ChamberInstruction {
  title: string;
  subtitle: string;
  objective: string;
  interactWith: string;
  howItWorks: string;
  failureConsequence: string;
  progressionKey: string;
}

const CHAMBER_INSTRUCTIONS: Record<number, ChamberInstruction> = {
  1: {
    title: 'Chamber I: The Hall of Glyphs',
    subtitle: 'Scroll of the Twins & Mirrors',
    objective: 'Reawaken the slumbering wall by uncovering all hidden pairs of identical sacred hieroglyphs.',
    interactWith: 'Click the face-down sandstone slabs carved with ancient deity emblems and royal cartouches.',
    howItWorks: 'Select two slabs. If their sacred carvings match, they lock in an enlightened state. If they differ, the sands turn them face down again. Match every twin on the wall.',
    failureConsequence: 'There is no time limit, but hasty minds will be delayed by misplaced memory.',
    progressionKey: 'Solving all pairs unearths the Chamber II code and reveals Hidden Number I carved into the sandstone base.',
  },
  2: {
    title: 'Chamber II: The Crypt of the Cipher',
    subtitle: 'Scroll of the Shifting Tablet',
    objective: 'Decode the secret word encrypted upon the royal Caesar stele to unseal the next corridor.',
    interactWith: 'The stone alphabet dial and shift stepper at the base of the ancient carved tablet.',
    howItWorks: 'The scribe shifted every letter forward in the alphabet by a secret constant number of paces. Adjust the shift stepper or dial until the scrambled glyphs reform into a meaningful sacred word.',
    failureConsequence: 'Submitting an erroneous transcription will cause the tablet mechanism to jam until the correct word is entered.',
    progressionKey: 'Entering the authentic decoded message unlocks the gateway code to Chamber III and reveals Hidden Number II.',
  },
  3: {
    title: 'Chamber III: The Vault of the Sandstorm',
    subtitle: 'Scroll of the Rising Dunes',
    objective: 'Deduce the hidden sacred single-digit integer between 1 and 9 before suffocating sands swallow the sanctum.',
    interactWith: 'The numbered stone altar dials and the submission lever in the heart of the storm.',
    howItWorks: 'A 60-second sandstorm timer begins upon entry. Submit guesses between 1 and 9. The temple spirits will immediately echo back whether the true number is HIGHER or LOWER.',
    failureConsequence: 'If the timer hits zero (00:00), the ceiling collapses, burying you forever. You must restart your trek from the beginning.',
    progressionKey: 'Pinpointing the exact number calms the storm, revealing the single-digit Chamber IV key and Hidden Number III.',
  },
  4: {
    title: 'Chamber IV: The Shrine of Bastet',
    subtitle: 'Scroll of the Sacred Meowdo',
    objective: 'Best the sacred AI guardian cat statue in an ancient trial of wits and divine instincts.',
    interactWith: 'The three ritual offering bowls: Cat (Bastet), Snake (Apep), and Falcon (Horus).',
    howItWorks: 'Meowdo is governed by the eternal circle: Bastet Cat pounces on Apep Snake; Apep Snake poisons Horus Falcon; Horus Falcon strikes Bastet Cat. First to achieve 3 victories claims the blessing.',
    failureConsequence: 'Losses in individual clashes simply allow the trial to continue until either you or the guardian reaches 3 points.',
    progressionKey: 'Earning 3 divine victories appeases Bastet, unveiling the single-digit Chamber V key and Hidden Number IV.',
  },
  5: {
    title: 'Chamber V: Gateway of the Four Seals',
    subtitle: 'Scroll of the Subterranean Threshold',
    objective: 'Assemble the four hidden numbers discovered across Chambers I–IV into the true sequence to open the Deep Tomb.',
    interactWith: 'The massive iron-banded stone portal dials and four lock tumblers.',
    howItWorks: 'Review the four numbers carved in Chambers 1 through 4 recorded in your Field Journal. Input the numbers in order (Seal 1 to Seal 4) to disengage the massive counterweights.',
    failureConsequence: 'An invalid code triggers warning rattles through the iron bands.',
    progressionKey: 'Inputting the four-digit code breaches the central divide and grants passage into Chamber VI: The Duel!',
  },
  6: {
    title: 'Chamber VI: The Duel (Trial of the Pharaoh)',
    subtitle: 'Scroll of the Royal Colossus',
    objective: 'Overcome the colossal black basalt Pharaoh statue in an ancient duel of rock, paper, scissors.',
    interactWith: 'The three divine gesture keystones: Rock, Paper, Scissors.',
    howItWorks: 'Choose your gesture. Standard rules apply: Rock smashes Scissors; Paper covers Rock; Scissors cuts Paper. Ties do not count. You must win 3 rounds against the Pharaoh.',
    failureConsequence: 'Every time you lose a round, the Pharaoh’s eyes flash blood-red and the chamber violently trembles with earthquake tremors!',
    progressionKey: 'Winning 3 rounds shatters the statue’s blockade, awarding the Golden Scarab Key and revealing Hidden Number VI carved in its throne base.',
  },
  7: {
    title: 'Chamber VII: The Binary Alphabet',
    subtitle: 'Scroll of the Scribe’s Stream',
    objective: 'Translate the glowing turquoise and lapis binary stream into the ancient password word.',
    interactWith: 'The binary wall carvings, the interactive Rosetta translation chart, and the password pedestal.',
    howItWorks: 'Each 8-bit byte represents one ASCII character (e.g. 01000001 = A). Translate the sequence into letters or use the quick-transcribe tool.',
    failureConsequence: 'Submitting incorrect transcriptions leaves the passage sealed.',
    progressionKey: 'Submitting the true decoded word reveals the passage code and uncovers Hidden Number VII inside the glowing cartouche.',
  },
  8: {
    title: 'Chamber VIII: The Moving Guardian',
    subtitle: 'Scroll of the Advancing Colossus',
    objective: 'Solve ancient mathematical equations carved into the wall to freeze the advancing colossus before it crushes you!',
    interactWith: 'The arithmetic question slate and answer keypad.',
    howItWorks: 'The stone guardian advances towards you every second. Answer 5 mathematical questions correctly (multiplication, division, addition). Each correct answer pushes the colossus back. Wrong answers incur a penalty!',
    failureConsequence: 'If the guardian reaches your position (Distance = 0%), you are crushed and must restart!',
    progressionKey: 'Solving all 5 equations activates the freezing counterweight, sealing the statue and revealing Hidden Number VIII on the wall behind it.',
  },
  9: {
    title: 'Chamber IX: The Papyrus Cipher',
    subtitle: 'Scroll of the Secret Shifts',
    objective: 'Decipher the royal papyrus document using the Caesar shift wheel to uncover the final passage glyph.',
    interactWith: 'The ancient papyrus parchment slider, shift adjuster, and decoded word input.',
    howItWorks: 'Adjust the shift dial to reverse the scribe’s letter displacement until the scrambled inscription forms the sacred word.',
    failureConsequence: 'The seal remains dormant until the authentic word is presented.',
    progressionKey: 'Solving the papyrus cipher opens the entrance to Chamber X and reveals Hidden Number IX.',
  },
  10: {
    title: 'Chamber X: The Last Seal (The Lost Pharaoh)',
    subtitle: 'Scroll of the Eternal Sarcophagus',
    objective: 'Align the four sacred relics gathered from Chambers VI–IX onto the golden altar pedestals in mythological cosmic harmony!',
    interactWith: 'The four golden pediments (Dawn, Desert Winds, Nile Waters, Underworld) and the four relic tokens.',
    howItWorks: 'Study the divine wall inscriptions to identify which sacred relic belongs on which pedestal. Click and swap the stones until all four resonate with cosmic truth.',
    failureConsequence: 'Mismatched alignments cause the altar to shake, refusing entry.',
    progressionKey: 'Perfect cosmic alignment breaks the final seal, swinging open the massive golden gates to the Pharaoh’s Legendary Treasure Room!',
  },
};

export const InstructionScrollModal: React.FC<InstructionScrollModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  onEnterAct3,
}) => {
  if (!isOpen) return null;

  const info = CHAMBER_INSTRUCTIONS[currentLevel] || CHAMBER_INSTRUCTIONS[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Papyrus Scroll Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-5 sm:p-8 papyrus-panel border-4 border-[#84623a] text-[#ebd9ba] shadow-2xl">
        {/* Decorative Papyrus Header Roll */}
        <div className="h-4 w-full bg-gradient-to-r from-[#5a4025] via-[#8c673d] to-[#5a4025] rounded-full mb-4 shadow-md border border-[#3e2c19]"></div>

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playStoneClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 text-[#a88252] hover:text-[#f8d486] transition-colors rounded-lg hover:bg-[#3d2c18]"
          aria-label="Roll up scroll"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title & Lore */}
        <div className="text-center border-b border-[#73512c] pb-4 mb-5">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Scroll className="w-5 h-5 text-[#d4af37]" />
            <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-[#f8de92] tracking-wider">
              {info.title}
            </h2>
          </div>
          <p className="text-xs italic text-[#bca378] font-cinzel">
            {info.subtitle}
          </p>
        </div>

        {/* 5 Mandatory Instruction Sections */}
        <div className="space-y-3.5 text-sm font-sans-clean">
          {/* 1. Objective */}
          <div className="bg-[#241910]/80 p-3.5 rounded-lg border border-[#6b4f2c]">
            <h3 className="text-xs font-cinzel font-bold text-[#eec874] uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span>
              1. Primary Objective
            </h3>
            <p className="text-[#e2ceb0] leading-relaxed pl-3.5 text-xs sm:text-sm">
              {info.objective}
            </p>
          </div>

          {/* 2. What to interact with */}
          <div className="bg-[#241910]/80 p-3.5 rounded-lg border border-[#6b4f2c]">
            <h3 className="text-xs font-cinzel font-bold text-[#eec874] uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span>
              2. Interactive Artifacts
            </h3>
            <p className="text-[#e2ceb0] leading-relaxed pl-3.5 text-xs sm:text-sm">
              {info.interactWith}
            </p>
          </div>

          {/* 3. How the puzzle works */}
          <div className="bg-[#241910]/80 p-3.5 rounded-lg border border-[#6b4f2c]">
            <h3 className="text-xs font-cinzel font-bold text-[#eec874] uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span>
              3. Mechanics & Rules
            </h3>
            <p className="text-[#e2ceb0] leading-relaxed pl-3.5 text-xs sm:text-sm">
              {info.howItWorks}
            </p>
          </div>

          {/* 4. Failure Consequence */}
          <div className="bg-[#2b1712]/80 p-3.5 rounded-lg border border-[#853c2a]">
            <h3 className="text-xs font-cinzel font-bold text-[#f58e72] uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e05234]"></span>
              4. Danger & Penalty
            </h3>
            <p className="text-[#e8b5a7] leading-relaxed pl-3.5 text-xs sm:text-sm">
              {info.failureConsequence}
            </p>
          </div>

          {/* 5. Progression Key */}
          <div className="bg-[#1c2419]/80 p-3.5 rounded-lg border border-[#3e6837]">
            <h3 className="text-xs font-cinzel font-bold text-[#9ae28f] uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5fcb4d]"></span>
              5. Advancement & Key
            </h3>
            <p className="text-[#cee5c9] leading-relaxed pl-3.5 text-xs sm:text-sm">
              {info.progressionKey}
            </p>
          </div>

          {/* Secret Entrance: Level IV Cursed Inscription to PURGATORIUM */}
          {currentLevel === 4 && onEnterAct3 && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#12071f] via-[#200938] to-[#12071f] border-2 border-[#7c3aed] shadow-[0_0_30px_rgba(124,58,237,0.35)] text-center relative overflow-hidden group animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),transparent)] pointer-events-none" />
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <span className="text-[#c084fc] animate-pulse text-lg">𓋹</span>
                <span className="text-[11px] font-cinzel font-bold text-[#e9d5ff] uppercase tracking-widest">
                  Forbidden Papyrus Tear Unveiled
                </span>
                <span className="text-[#c084fc] animate-pulse text-lg">𓆣</span>
              </div>
              <p className="text-xs text-[#d8b4fe] font-sans-clean mb-3 max-w-lg mx-auto">
                Between the dried reed fibers lies a cursed seal bleeding with violet starlight. It beckons toward the forbidden trials of the underworld.
              </p>
              <button
                onClick={() => {
                  sound.playCurseWhisper();
                  onClose();
                  onEnterAct3();
                }}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-cinzel font-bold text-sm tracking-[0.25em] text-[#faf5ff] bg-gradient-to-r from-[#4c1d95] via-[#7c3aed] to-[#4c1d95] hover:from-[#581c87] hover:via-[#9333ea] hover:to-[#581c87] border border-[#c084fc]/50 hover:border-[#f3e8ff] shadow-[0_0_20px_rgba(147,51,234,0.6)] hover:shadow-[0_0_30px_rgba(168,85,247,0.85)] hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-3 mx-auto"
              >
                <span className="text-base text-[#f5d0fe]">𓃠</span>
                <span>PURGATORIUM</span>
                <span className="text-base text-[#f5d0fe]">𓊽</span>
              </button>
            </div>
          )}
        </div>

        {/* Decorative Papyrus Footer Roll */}
        <div className="mt-6 pt-4 border-t border-[#6b4f2c] flex items-center justify-between">
          <span className="text-[11px] text-[#9a7e58] font-cinzel">
            Sacred Papyrus preserved by Thoth
          </span>
          <button
            onClick={() => {
              sound.playStoneClick();
              onClose();
            }}
            className="px-5 py-2 text-xs font-cinzel font-semibold text-[#1a120c] bg-gradient-to-r from-[#e6c46e] to-[#c79c3c] hover:from-[#f3d789] hover:to-[#dfaf4d] rounded-md transition-all shadow-md active:scale-95"
          >
            Roll Up Papyrus
          </button>
        </div>
      </div>
    </div>
  );
};
