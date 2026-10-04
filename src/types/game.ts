export type GameMode = 'TITLE_MENU' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';

export interface LevelInfo {
  id: number;
  name: string;
  egyptianName: string;
  symbol: string;
  compassBearing: string; // e.g. "North", "North-East", etc.
  description: string;
}

export interface SymbolCard {
  id: number;
  symbolKey: string;
  name: string;
  glyph: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface SacredNumberToken {
  id: number;
  originLevel: number;
  glyphName: string;
  glyphChar: string;
  value: number;
}

export interface Level1State {
  cards: SymbolCard[];
  matchedCount: number;
  totalPairs: number;
  isSolved: boolean;
  unlockedCode: string; // e.g. "7-2-9-4"
}

export interface Level2State {
  plaintext: string;
  shift: number;
  ciphertext: string;
  selectedShift: number;
  userDecoded: string;
  isSolved: boolean;
  unlockedCode: string; // e.g. "4-8-1-5"
}

export interface Level3State {
  secretNumber: number; // 1 to 10
  timeRemaining: number; // 60 seconds countdown
  guesses: { guess: number; feedback: 'higher' | 'lower' | 'correct' }[];
  isSolved: boolean;
  isFailed: boolean;
  unlockedCode: string; // e.g. "6-3-5-8"
}

export type MeowdoMove = 'cat' | 'snake' | 'falcon';

export interface Level4State {
  playerScore: number;
  aiScore: number;
  targetScore: number; // 3
  lastPlayerMove: MeowdoMove | null;
  lastAiMove: MeowdoMove | null;
  lastRoundWinner: 'player' | 'ai' | 'tie' | null;
  isSolved: boolean;
  unlockedCode: string; // e.g. "9-1-4-6"
}

export interface Level5Clue {
  position: number; // 1, 2, 3, 4
  text: string;
  glyphName: string;
}

export interface Level5State {
  tokens: SacredNumberToken[];
  currentOrder: number[]; // Array of token IDs
  correctOrder: number[]; // Correct sequence of token IDs
  clues: Level5Clue[];
  feedbackMessage: string | null;
  isSolved: boolean;
}

export interface PurgatoryCipher {
  plaintext: string;
  shift: number;
  ciphertext: string;
  userAnswer: string;
  isSolved: boolean;
}

export interface PurgatoryBinary {
  plaintextWord: string;
  binarySequence: string; // e.g. "01000111 01001111..."
  userAnswer: string;
  isSolved: boolean;
}

export interface Level6State {
  timeRemaining: number; // 600 seconds (10:00)
  leftCipher: PurgatoryCipher;
  centerBinary: PurgatoryBinary;
  rightCipher: PurgatoryCipher;
  finalMasterWord: string; // Combined solution
  masterInput: string;
  isSolved: boolean;
  isFailed: boolean;
}

export type GameStateUpdater =
  | Partial<GamePlaythroughState>
  | ((prev: GamePlaythroughState) => GamePlaythroughState);

export interface GamePlaythroughState {
  currentLevel: number; // 1 to 6
  highestDiscoveredLevel: number;
  completedLevels: number[];
  levelCodes: Record<number, string>;
  sacredTokens: SacredNumberToken[];
  level1: Level1State;
  level2: Level2State;
  level3: Level3State;
  level4: Level4State;
  level5: Level5State;
  level6: Level6State;
}
