/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameMode, GamePlaythroughState, GameStateUpdater } from './types/game';
import { generateNewGame, CHAMBER_METADATA } from './game/generator';
import { sound } from './audio/soundManager';
import { TitleMenu } from './components/TitleMenu';
import { CompassModal } from './components/CompassModal';
import { InstructionScrollModal } from './components/InstructionScrollModal';
import { JournalDrawer } from './components/JournalDrawer';
import { Level1Chamber } from './components/Level1Chamber';
import { Level2Chamber } from './components/Level2Chamber';
import { Level3Chamber } from './components/Level3Chamber';
import { Level4Chamber } from './components/Level4Chamber';
import { Level5Chamber } from './components/Level5Chamber';
import { Level6Chamber } from './components/Level6Chamber';
import { TreasureVictory } from './components/TreasureVictory';
import { GameOverScreen } from './components/GameOverScreen';
import { Compass, Scroll, BookOpen, Volume2, VolumeX, RotateCcw } from 'lucide-react';

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>('TITLE_MENU');
  const [gameState, setGameState] = useState<GamePlaythroughState>(() => generateNewGame());
  const [gameOverReason, setGameOverReason] = useState<string>('');

  // Modals state
  const [isCompassOpen, setIsCompassOpen] = useState(false);
  const [isScrollOpen, setIsScrollOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  // Audio toggles
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(true); // default music muted until player enters or toggles

  const handleStartGame = () => {
    sound.startMusic();
    setIsMusicMuted(false);
    setGameMode('PLAYING');
  };

  const handleRestart = () => {
    sound.playStoneSlide();
    sound.stopSandstormWind();
    const freshGame = generateNewGame();
    setGameState(freshGame);
    setGameOverReason('');
    setGameMode('PLAYING');
  };

  const handlePlayAgainFromVictory = () => {
    sound.playStoneSlide();
    const freshGame = generateNewGame();
    setGameState(freshGame);
    setGameMode('PLAYING');
  };

  const handleTriggerGameOver = (reason: string) => {
    setGameOverReason(reason);
    setGameMode('GAME_OVER');
  };

  const handleVictory = () => {
    setGameMode('VICTORY');
  };

  const handleUpdateGameState = (update: GameStateUpdater) => {
    setGameState((prev) => {
      if (typeof update === 'function') {
        return update(prev);
      }
      return {
        ...prev,
        ...update,
      };
    });
  };

  const handleProceedToLevel = (levelId: number) => {
    sound.playStoneSlide();
    setGameState((prev) => ({
      ...prev,
      currentLevel: levelId,
      highestDiscoveredLevel: Math.max(prev.highestDiscoveredLevel, levelId),
    }));
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const handleToggleMusic = () => {
    const next = !isMusicMuted;
    setIsMusicMuted(next);
    sound.setMusicMuted(next);
  };

  const currentChamberMeta = CHAMBER_METADATA.find((c) => c.id === gameState.currentLevel) || CHAMBER_METADATA[0];

  return (
    <div className="min-h-screen bg-[#0c0906] text-[#e6d5b8] flex flex-col font-sans-clean selection:bg-[#d4af37]/30">
      {/* Top Bar following Top Bar Contract (3 zones, single line) */}
      <header className="h-16 px-4 sm:px-6 border-b border-[#3a2818] bg-[#140e0a]/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark brand */}
        <div className="flex items-center gap-2 truncate">
          <button
            onClick={() => {
              if (gameMode !== 'TITLE_MENU') {
                sound.playStoneClick();
                setGameMode('TITLE_MENU');
              }
            }}
            className="text-base sm:text-lg font-cinzel font-bold tracking-tight text-[#f7e096] hover:text-[#fef08a] transition-colors truncate whitespace-nowrap"
          >
            Ancient Egyptian Treasure Hunt
          </button>
        </div>

        {/* Zone 2: Navigation controls & Modals */}
        {gameMode === 'PLAYING' && (
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Compass Button */}
            <button
              onClick={() => {
                sound.playStoneClick();
                setIsCompassOpen(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#22160d] hover:bg-[#342214] border border-[#6b502d] text-xs font-cinzel text-[#ebd9ba] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
              title="Open Astrolabe Compass"
            >
              <Compass className="w-4 h-4 text-[#d4af37]" />
              <span className="hidden sm:inline">Compass</span>
            </button>

            {/* Instruction Scroll Button */}
            <button
              onClick={() => {
                sound.playStoneClick();
                setIsScrollOpen(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#22160d] hover:bg-[#342214] border border-[#6b502d] text-xs font-cinzel text-[#ebd9ba] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
              title="Read Chamber Instruction Papyrus"
            >
              <Scroll className="w-4 h-4 text-[#d4af37]" />
              <span className="hidden sm:inline">Scroll</span>
            </button>

            {/* Field Journal Button */}
            <button
              onClick={() => {
                sound.playStoneClick();
                setIsJournalOpen(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#22160d] hover:bg-[#342214] border border-[#6b502d] text-xs font-cinzel text-[#ebd9ba] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
              title="Open Explorer Journal"
            >
              <BookOpen className="w-4 h-4 text-[#d4af37]" />
              <span className="hidden sm:inline">Journal</span>
            </button>
          </nav>
        )}

        {/* Zone 3: Primary Action & Audio controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Audio Toggles */}
          <button
            onClick={handleToggleMusic}
            className="p-2 rounded-lg text-[#a98f6d] hover:text-[#f7e096] hover:bg-[#25180f] transition-colors"
            title={isMusicMuted ? 'Unmute Atmosphere' : 'Mute Atmosphere'}
          >
            {isMusicMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#d4af37]" />}
          </button>

          {gameMode === 'PLAYING' && (
            <button
              onClick={handleRestart}
              className="px-3 py-1.5 text-xs font-cinzel font-semibold text-[#140e0a] bg-gradient-to-r from-[#e6c46e] to-[#c79c3c] hover:from-[#f5d78a] hover:to-[#dbaf4c] rounded-lg transition-all shadow active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Restart</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col items-center justify-center">
        {gameMode === 'TITLE_MENU' && (
          <TitleMenu
            onStartGame={handleStartGame}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            isMusicMuted={isMusicMuted}
            onToggleMusic={handleToggleMusic}
          />
        )}

        {gameMode === 'PLAYING' && (
          <div className="w-full">
            {gameState.currentLevel === 1 && (
              <Level1Chamber
                gameState={gameState}
                onUpdateState={handleUpdateGameState}
                onProceedToLevel={handleProceedToLevel}
                onOpenScroll={() => setIsScrollOpen(true)}
              />
            )}

            {gameState.currentLevel === 2 && (
              <Level2Chamber
                gameState={gameState}
                onUpdateState={handleUpdateGameState}
                onProceedToLevel={handleProceedToLevel}
                onOpenScroll={() => setIsScrollOpen(true)}
              />
            )}

            {gameState.currentLevel === 3 && (
              <Level3Chamber
                gameState={gameState}
                onUpdateState={handleUpdateGameState}
                onProceedToLevel={handleProceedToLevel}
                onOpenScroll={() => setIsScrollOpen(true)}
                onTriggerGameOver={handleTriggerGameOver}
              />
            )}

            {gameState.currentLevel === 4 && (
              <Level4Chamber
                gameState={gameState}
                onUpdateState={handleUpdateGameState}
                onProceedToLevel={handleProceedToLevel}
                onOpenScroll={() => setIsScrollOpen(true)}
              />
            )}

            {gameState.currentLevel === 5 && (
              <Level5Chamber
                gameState={gameState}
                onUpdateState={handleUpdateGameState}
                onProceedToLevel={handleProceedToLevel}
                onOpenScroll={() => setIsScrollOpen(true)}
              />
            )}

            {gameState.currentLevel === 6 && (
              <Level6Chamber
                gameState={gameState}
                onUpdateState={handleUpdateGameState}
                onVictory={handleVictory}
                onOpenScroll={() => setIsScrollOpen(true)}
                onTriggerGameOver={handleTriggerGameOver}
              />
            )}
          </div>
        )}

        {gameMode === 'VICTORY' && (
          <TreasureVictory onPlayAgain={handlePlayAgainFromVictory} />
        )}

        {gameMode === 'GAME_OVER' && (
          <GameOverScreen
            reason={gameOverReason}
            onRestart={handleRestart}
          />
        )}
      </main>

      {/* Global Modals */}
      <CompassModal
        isOpen={isCompassOpen}
        onClose={() => setIsCompassOpen(false)}
        currentLevel={gameState.currentLevel}
        highestDiscoveredLevel={gameState.highestDiscoveredLevel}
        completedLevels={gameState.completedLevels}
        onSelectLevel={(levelId) => {
          handleProceedToLevel(levelId);
        }}
      />

      <InstructionScrollModal
        isOpen={isScrollOpen}
        onClose={() => setIsScrollOpen(false)}
        currentLevel={gameState.currentLevel}
      />

      <JournalDrawer
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        gameState={gameState}
      />
    </div>
  );
}
