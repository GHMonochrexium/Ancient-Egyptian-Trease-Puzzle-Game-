export type GameMode =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'GAME_OVER'
  | 'VICTORY'
  | 'ACT3_INTRO'
  | 'ACT3_LEVEL_X'
  | 'ACT3_LEVEL_Y'
  | 'ACT3_LEVEL_Z'
  | 'DARK_REALM_ENTRANCE'
  | 'PURGATORIUM_TRIALS'
  | 'SECRET_VICTORY';

export interface LevelInfo {
  id: number;
  name: string;
  egyptianName: string;
  symbol: string;
  compassBearing: string;
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
  unlockedCode: string;
  hiddenNumber: number; // Hidden number for Level 5
}

export interface Level2State {
  plaintext: string;
  shift: number;
  ciphertext: string;
  selectedShift: number;
  userDecoded: string;
  isSolved: boolean;
  unlockedCode: string;
  hiddenNumber: number; // Hidden number for Level 5
}

export interface Level3State {
  secretNumber: number; // 1 to 9 (single digit)
  timeRemaining: number; // 60 seconds
  guesses: { guess: number; feedback: 'higher' | 'lower' | 'correct' }[];
  isSolved: boolean;
  isFailed: boolean;
  unlockedCode: string;
  hiddenNumber: number; // Hidden number for Level 5
}

export type MeowdoMove = 'cat' | 'snake' | 'falcon';

export interface Level4State {
  playerScore: number;
  aiScore: number;
  targetScore: number;
  lastPlayerMove: MeowdoMove | null;
  lastAiMove: MeowdoMove | null;
  lastRoundWinner: 'player' | 'ai' | 'tie' | null;
  isSolved: boolean;
  unlockedCode: string;
  hiddenNumber: number; // Hidden number for Level 5
}

// LEVEL 5 (Swapped with 10's 4-digit hidden number deduction)
export interface Level5State {
  hiddenNumbers: { level: number; value: number; clue: string }[];
  correctCode: string; // 4-digit code e.g. "4-7-3-8"
  enteredCode: string;
  attempts: number;
  feedbackMessage: string | null;
  isSolved: boolean;
  unlockedCode: string; // Code for Level 6
}

// LEVEL 6: The Duel (Trial of the Pharaoh)
export type DuelMove = 'rock' | 'paper' | 'scissors';

export interface Level6DuelState {
  playerWins: number;
  pharaohWins: number;
  targetWins: number; // 3
  lastPlayerMove: DuelMove | null;
  lastPharaohMove: DuelMove | null;
  lastRoundWinner: 'player' | 'pharaoh' | 'tie' | null;
  isShaking: boolean;
  pharaohEyesRed: boolean;
  isSolved: boolean;
  unlockedScarabKey: string;
  hiddenNumber: number; // Hidden in statue base for Level 10
}

// LEVEL 7: The Binary Alphabet (Trial of Knowledge)
export interface Level7BinaryState {
  secretWord: string;
  binaryString: string; // e.g. "01000111 01001111..."
  userAnswer: string;
  isSolved: boolean;
  unlockedCode: string;
  hiddenNumber: number; // Hidden in cartouche for Level 10
}

// LEVEL 8: The Moving Statue (Trial of Speed)
export interface MathQuestion {
  id: number;
  question: string;
  answer: number;
}

export interface Level8MovingGuardianState {
  guardianDistance: number; // 100 to 0 (moves closer every second)
  questions: MathQuestion[];
  currentQuestionIndex: number;
  questionsSolved: number;
  targetSolved: number; // e.g. 5
  timeRemaining: number;
  isSolved: boolean;
  isFailed: boolean;
  unlockedCode: string;
  hiddenNumber: number; // Hidden on wall behind statue for Level 10
}

// LEVEL 9: The Caesar Cipher (Trial of Secrets)
export interface Level9CaesarState {
  plaintext: string;
  shift: number;
  ciphertext: string;
  userAnswer: string;
  isSolved: boolean;
  unlockedCode: string;
  hiddenNumber: number; // Revealed after decoding for Level 10
}

// LEVEL 10: The Last Seal / The Lost Pharaoh (Swapped with Level 5 cosmic altar alignment)
export interface Level10Clue {
  position: number;
  text: string;
  glyphName: string;
}

export interface Level10AltarState {
  relics: SacredNumberToken[]; // 4 relics from Levels 6-9
  currentOrder: number[]; // Array of relic IDs
  correctOrder: number[];
  clues: Level10Clue[];
  feedbackMessage: string | null;
  isSolved: boolean;
}

// --- ACT III: PURGATORIUM (THE DARK REALM) TYPES ---

export interface SacrificeObject {
  id: number;
  symbolKey: string;
  name: string;
  glyph: string;
  tier: number; // 1 = Celestial/Sun, 2 = Royal/Power, 3 = Life/Nature
  tierName: string;
  clueDesc: string;
}

export interface LevelXSacrificeState {
  lives: number; // exactly 3
  objects: SacrificeObject[];
  sacrificedIds: number[];
  targetSequence: number[]; // correct order of object IDs based on Pharaoh's decree
  pharaohDecree: string;
  feedbackMessage: string | null;
  isSolved: boolean;
}

export type MummyChallengeType = 'caesar' | 'binary' | 'rps';

export interface LevelYMummyState {
  isScrollOpened: boolean;
  challengeType: MummyChallengeType;
  caesarPlain: string;
  caesarCipher: string;
  caesarShift: number;
  binaryString: string;
  binaryWord: string;
  guardianMove: 'rock' | 'paper' | 'scissors' | null;
  playerMove: 'rock' | 'paper' | 'scissors' | null;
  rpsResult: 'win' | 'lose' | 'tie' | null;
  challengeSolved: boolean;
  bandagesRemaining: number; // 4 layers to unwrap
  isSolved: boolean;
}

export interface LevelZFinalChallengeState {
  targetNumber: number; // 1 to 50
  timeRemaining: number; // 60 seconds
  guesses: { guess: number; feedback: 'higher' | 'lower' | 'correct' }[];
  isSolved: boolean;
  isFailed: boolean;
}

export interface PurgatoriumTrialsState {
  timeRemaining: number; // 420 seconds (07:00)
  currentTrial: number; // 1 to 10
  trialsCompleted: number[];
  isFailed: boolean;
  isCompleted: boolean;
}

export interface Act3State {
  isDiscovered: boolean;
  gatewayLevel: 'X' | 'Y' | 'Z';
  levelX: LevelXSacrificeState;
  levelY: LevelYMummyState;
  levelZ: LevelZFinalChallengeState;
  purgatorium: PurgatoriumTrialsState;
  hasUnlockedSecretEnding: boolean;
}

export interface GamePlaythroughState {
  currentLevel: number; // 1 to 10
  highestDiscoveredLevel: number;
  completedLevels: number[];
  levelCodes: Record<number, string>;
  sacredTokens: SacredNumberToken[];
  level1: Level1State;
  level2: Level2State;
  level3: Level3State;
  level4: Level4State;
  level5: Level5State;
  level6: Level6DuelState;
  level7: Level7BinaryState;
  level8: Level8MovingGuardianState;
  level9: Level9CaesarState;
  level10: Level10AltarState;
  act3: Act3State;
}

export type GameStateUpdater =
  | Partial<GamePlaythroughState>
  | ((prev: GamePlaythroughState) => GamePlaythroughState);
