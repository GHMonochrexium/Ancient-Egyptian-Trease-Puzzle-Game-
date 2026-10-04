import React from 'react';
import { CHAMBER_METADATA } from '../game/generator';
import { sound } from '../audio/soundManager';
import { Compass, X } from 'lucide-react';

interface CompassModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  highestDiscoveredLevel: number;
  completedLevels: number[];
  onSelectLevel: (levelId: number) => void;
}

export const CompassModal: React.FC<CompassModalProps> = ({
  isOpen,
  onClose,
  currentLevel,
  highestDiscoveredLevel,
  completedLevels,
  onSelectLevel,
}) => {
  if (!isOpen) return null;

  // Rotation angles for the 6 chambers around the compass
  const chamberAngles: Record<number, number> = {
    1: 0,    // North
    2: 60,   // North-East
    3: 120,  // South-East
    4: 180,  // South
    5: 240,  // South-West
    6: 300,  // North-West
  };

  const needleAngle = chamberAngles[currentLevel] ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl stone-panel rounded-2xl p-6 border-2 border-[#b88c3a] shadow-2xl text-[#f3e6cf]">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playStoneClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-[#bca378] hover:text-[#f8d486] transition-colors rounded-lg hover:bg-[#342416]"
          aria-label="Close compass"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-[#d4af37]" />
            <h2 className="text-xl font-cinzel font-bold text-[#f7df94] tracking-wider uppercase">
              The Celestial Astrolabe
            </h2>
          </div>
          <p className="text-xs text-[#a98f6d] font-sans-clean">
            The ancient needle aligns with the ley lines of the six sacred tomb chambers.
          </p>
        </div>

        {/* Compass Dial Visual */}
        <div className="relative w-64 h-64 mx-auto my-4 flex items-center justify-center">
          {/* Outer dial ring */}
          <div className="absolute inset-0 rounded-full border-4 border-[#8c6d31] bg-[#140e0a] shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] flex items-center justify-center">
            {/* Compass markings */}
            <div className="absolute top-2 text-[10px] font-cinzel font-bold text-[#d4af37]">N</div>
            <div className="absolute bottom-2 text-[10px] font-cinzel font-bold text-[#a98f6d]">S</div>
            <div className="absolute right-2 text-[10px] font-cinzel font-bold text-[#a98f6d]">E</div>
            <div className="absolute left-2 text-[10px] font-cinzel font-bold text-[#a98f6d]">W</div>

            {/* Subtle inner decorative rings */}
            <div className="w-48 h-48 rounded-full border border-dashed border-[#8c6d31]/40 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-[#8c6d31]/30"></div>
            </div>

            {/* Rotating golden needle */}
            <div
              className="absolute w-2 h-44 transition-transform duration-700 ease-out origin-center pointer-events-none"
              style={{ transform: `rotate(${needleAngle}deg)` }}
            >
              {/* North tip (gold) */}
              <div className="w-0 h-0 mx-auto border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[36px] border-b-[#e4be52] filter drop-shadow-[0_0_6px_rgba(228,190,82,0.8)]"></div>
              <div className="w-1.5 h-16 mx-auto bg-gradient-to-b from-[#e4be52] to-[#6a4f22]"></div>
              {/* South tip (bronze) */}
              <div className="w-1 h-14 mx-auto bg-gradient-to-b from-[#6a4f22] to-[#3a2814]"></div>
              <div className="w-0 h-0 mx-auto border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[24px] border-t-[#5c401e]"></div>
            </div>

            {/* Center golden pivot */}
            <div className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-[#f8df97] to-[#8c6d31] border border-black shadow-md flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#3a200a]"></div>
            </div>
          </div>
        </div>

        {/* 6 Chambers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-6">
          {CHAMBER_METADATA.map((chamber) => {
            const isDiscovered = chamber.id <= highestDiscoveredLevel;
            const isCompleted = completedLevels.includes(chamber.id);
            const isCurrent = currentLevel === chamber.id;

            return (
              <button
                key={chamber.id}
                onClick={() => {
                  if (isDiscovered) {
                    sound.playStoneClick();
                    onSelectLevel(chamber.id);
                    onClose();
                  }
                }}
                disabled={!isDiscovered}
                className={`p-3 rounded-lg border text-left transition-all relative ${
                  isCurrent
                    ? 'bg-[#3d2c18] border-[#f7df94] shadow-[0_0_15px_rgba(247,223,148,0.25)]'
                    : isDiscovered
                    ? 'bg-[#1e150e] border-[#725227] hover:border-[#bca378] hover:bg-[#281c13]'
                    : 'bg-[#100b08]/80 border-[#302216] opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono-clean text-[#a98f6d]">
                    CHAMBER {chamber.id}
                  </span>
                  {isCompleted && (
                    <span className="text-[10px] text-emerald-400 font-sans-clean font-semibold">
                      SOLVED
                    </span>
                  )}
                  {isCurrent && !isCompleted && (
                    <span className="text-[10px] text-[#f7df94] font-sans-clean font-semibold animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xl w-7 text-center font-bold text-[#e8c76e]">
                    {isDiscovered ? chamber.symbol : '?'}
                  </span>
                  <div className="truncate">
                    <p className="text-xs font-cinzel font-semibold text-[#f5ebd8] truncate">
                      {isDiscovered ? chamber.name : 'Unknown Chamber'}
                    </p>
                    <p className="text-[10px] text-[#9a7e5a] truncate">
                      {isDiscovered ? chamber.compassBearing : 'Deep in the Sands'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-[#8e7352] italic font-sans-clean">
            Pointer indicates your active chamber’s mystical bearing.
          </p>
        </div>
      </div>
    </div>
  );
};
