import React from 'react';
import { sound } from '../audio/soundManager';
import { Scroll, X, BookOpen } from 'lucide-react';

interface InstructionScrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
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
    progressionKey: 'Solving all pairs unearths a four-digit numeric cipher and the Sacred Eye Token needed for the tomb depths.',
  },
  2: {
    title: 'Chamber II: The Crypt of the Cipher',
    subtitle: 'Scroll of the Shifting Tablet',
    objective: 'Decode the secret word encrypted upon the royal Caesar stele to unseal the next corridor.',
    interactWith: 'The stone alphabet dial and shift stepper at the base of the ancient carved tablet.',
    howItWorks: 'The scribe shifted every letter forward in the alphabet by a secret constant number of paces. Adjust the shift stepper or dial until the scrambled glyphs reform into a meaningful sacred word.',
    failureConsequence: 'Submitting an erroneous transcription will cause the tablet mechanism to jam until the correct word is entered.',
    progressionKey: 'Entering the authentic decoded message unlocks the gateway code to Chamber III and grants the Falcon Token.',
  },
  3: {
    title: 'Chamber III: The Vault of the Sandstorm',
    subtitle: 'Scroll of the Rising Dunes',
    objective: 'Deduce the hidden sacred integer between 1 and 10 before suffocating sands swallow the sanctum.',
    interactWith: 'The numbered stone altar dials and the submission lever in the heart of the storm.',
    howItWorks: 'A 60-second sandstorm timer begins upon entry. Submit guesses between 1 and 10. The temple spirits will immediately echo back whether the true number is HIGHER or LOWER.',
    failureConsequence: 'If the timer hits zero (00:00), the ceiling collapses, burying you forever. You must restart your trek from the beginning.',
    progressionKey: 'Pinpointing the exact number calms the storm, revealing the Chamber IV code and the Sacred Serpent Token.',
  },
  4: {
    title: 'Chamber IV: The Shrine of Bastet',
    subtitle: 'Scroll of the Sacred Meowdo',
    objective: 'Best the sacred AI guardian cat statue in an ancient trial of wits and divine instincts.',
    interactWith: 'The three ritual offering bowls: Cat (Bastet), Snake (Apep), and Falcon (Horus).',
    howItWorks: 'Meowdo is governed by the eternal circle: Bastet Cat pounces on Apep Snake; Apep Snake poisons Horus Falcon; Horus Falcon soars and strikes Bastet Cat. First to achieve 3 victories claims the blessing.',
    failureConsequence: 'Losses in individual clashes simply allow the trial to continue until either you or the guardian reaches 3 points. If the guardian wins 3, the match resets.',
    progressionKey: 'Earning 3 divine victories appeases Bastet, unveiling the Chamber V code and the Sacred Ankh Token.',
  },
  5: {
    title: 'Chamber V: The Chamber of the Pharaoh’s Order',
    subtitle: 'Scroll of Cosmic Alignment',
    objective: 'Arrange the four Sacred Numbered Tokens discovered across prior chambers into their true mythical sequence.',
    interactWith: 'The four stone pediments and the tokens inscribed with your gathered numbers and glyphs.',
    howItWorks: 'Read the wall inscriptions carved in the sanctum. Each clue refers to a deity’s cosmic station (Dawn, Desert Winds, Sacred Nile, Underworld). Drag or swap the numbered stones into their matching pedestal.',
    failureConsequence: 'Incorrect arrangements cause the temple mechanism to rumble in rejection, leaving the heavy stone portal shut.',
    progressionKey: 'Aligning all four stones in harmony triggers the massive hydraulic counterweights opening the doors to Level 6: Purgatory.',
  },
  6: {
    title: 'Chamber VI: Purgatory',
    subtitle: 'Scroll of the Final Triad',
    objective: 'Conquer three distinct ancient cryptograms across the ruin within 10 minutes to forge the Master Incantation.',
    interactWith: 'The Left Caesar Tablet, the Central Glowing Binary Obelisk, and the Right Caesar Stele, culminating at the Golden Altar.',
    howItWorks: 'Solve the left cipher (alphabet shift), translate the center glowing binary bits into sacred letters, and decrypt the right cipher. Then present the three decoded sacred words together at the central Altar.',
    failureConsequence: 'A strict 10:00 countdown is active. If time expires, the tomb locks forever into eternal purgatory.',
    progressionKey: 'Offering the three sacred words shatters the curse, opening the gates to the golden Pharaoh’s Treasure Chamber!',
  },
};

export const InstructionScrollModal: React.FC<InstructionScrollModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
}) => {
  if (!isOpen) return null;

  const info = CHAMBER_INSTRUCTIONS[currentLevel] || CHAMBER_INSTRUCTIONS[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Papyrus Scroll Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6 sm:p-8 papyrus-panel border-4 border-[#84623a] text-[#ebd9ba] shadow-2xl">
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
        <div className="space-y-4 text-sm font-sans-clean">
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
        </div>

        {/* Decorative Papyrus Footer Roll */}
        <div className="mt-6 pt-4 border-t border-[#6b4f2c] flex items-center justify-between">
          <span className="text-[11px] text-[#9a7e58] font-cinzel">
            Hieroglyphic papyrus preserved by Thoth
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
