import React, { useEffect, useRef } from 'react';
import { sound } from '../audio/soundManager';
import { Trophy, Sparkles, RotateCcw, Crown, Shield } from 'lucide-react';

interface TreasureVictoryProps {
  onPlayAgain: () => void;
}

export const TreasureVictory: React.FC<TreasureVictoryProps> = ({ onPlayAgain }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    sound.playTreasureVictory();

    // Glittering gold coin/sparkle particle shower
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const onResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', onResize);

    const sparkles = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vy: 1 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 1.5,
      size: 2 + Math.random() * 4,
      color: ['#fcedae', '#d4af37', '#e8c76e', '#fef08a', '#40e0d0'][Math.floor(Math.random() * 5)],
      alpha: 0.2 + Math.random() * 0.8,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      sparkles.forEach((s) => {
        s.y += s.vy;
        s.x += s.vx;

        if (s.y > height) {
          s.y = -10;
          s.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto my-6 flex flex-col items-center animate-in zoom-in-95 duration-500">
      {/* Spectacular Treasure Chamber Showcase */}
      <div className="relative w-full rounded-3xl overflow-hidden border-4 border-[#d4af37] shadow-[0_0_50px_rgba(212,175,55,0.5)] bg-[#0d0905]">
        {/* Canvas for falling golden sparkles */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
        />

        {/* Generated Treasure Chamber Image */}
        <div className="relative w-full h-80 sm:h-96 overflow-hidden">
          <img
            src="/src/assets/images/egyptian_treasure_chamber_1791117275580.jpg"
            alt="Magnificent Egyptian Treasure Chamber"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover scale-105 animate-pulse transition-transform duration-10000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0906] via-[#0c0906]/40 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-30 p-6 sm:p-10 text-center -mt-20">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-b from-[#fcedae] via-[#d4af37] to-[#8c6d31] p-1 shadow-2xl flex items-center justify-center text-[#140e0a] mb-4">
            <Trophy className="w-9 h-9 sm:w-11 sm:h-11 text-[#1c130b]" />
          </div>

          <span className="text-xs sm:text-sm font-mono-clean text-[#e8c76e] font-bold tracking-[0.3em] uppercase block mb-1">
            Prophecy Fulfilled · Duat Unlocked
          </span>

          <h1 className="text-3xl sm:text-5xl font-cinzel font-black text-[#f7e096] hieroglyph-glow tracking-wider mb-4">
            THE TREASURE HAS BEEN FOUND
          </h1>

          <p className="text-sm sm:text-base text-[#e5d2b3] max-w-xl mx-auto leading-relaxed mb-6 font-sans-clean">
            You have surmounted the Hall of Glyphs, deciphered the Granite Stele, outlasted the deadly Sandstorm, appeased Bastet, aligned the Cosmic Pedestals, and conquered Purgatory!
          </p>

          {/* Lore Hint */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#1c130b]/90 border border-[#8c6d31] max-w-xl mx-auto mb-8 shadow-inner">
            <div className="flex items-center justify-center gap-2 mb-1 text-[#f7e096]">
              <Sparkles className="w-4 h-4" />
              <span className="font-cinzel text-xs font-bold tracking-wider">
                Whispers of the Eternal Pharaoh
              </span>
            </div>
            <p className="text-xs text-[#c4aa86] italic font-sans-clean">
              "The golden sarcophagus yields its priceless relics. Yet deep beneath the subterranean foundation, the shifting sands whisper that further chambers and ancient secrets remain slumbering in the abyss..."
            </p>
          </div>

          {/* Play Again button (Randomizes completely new game) */}
          <div className="max-w-md mx-auto">
            <button
              onClick={() => {
                sound.playStoneClick();
                onPlayAgain();
              }}
              className="w-full py-4 px-8 font-cinzel font-bold text-base text-[#140e0a] bg-gradient-to-r from-[#f7e096] via-[#d4af37] to-[#aa7c11] hover:from-[#fcedae] hover:to-[#be8f1a] rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.7)] transition-all active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Embark on a New Hunt (Play Again)</span>
            </button>
            <p className="text-[11px] text-[#8e7352] mt-3 font-sans-clean">
              Generates an entirely new randomized set of ciphers, symbol pairs, codes, and secret solutions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
