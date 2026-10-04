import {
  GamePlaythroughState,
  Level1State,
  Level2State,
  Level3State,
  Level4State,
  Level5State,
  Level6State,
  SacredNumberToken,
  SymbolCard,
} from '../types/game';

// Utility helper to shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate random 4-digit code string like "7-2-9-4"
export function generateRandomCode(): string {
  const digits = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10));
  return digits.join('-');
}

// Caesar cipher helper
export function encryptCaesar(text: string, shift: number): string {
  return text
    .toUpperCase()
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      return char;
    })
    .join('');
}

export function decryptCaesar(text: string, shift: number): string {
  return encryptCaesar(text, (26 - (shift % 26)) % 26);
}

// Convert ASCII string to binary representation (8 bits space-separated)
export function stringToBinary(text: string): string {
  return text
    .toUpperCase()
    .split('')
    .map((char) => {
      const bin = char.charCodeAt(0).toString(2);
      return bin.padStart(8, '0');
    })
    .join(' ');
}

export function binaryToString(binary: string): string {
  const bytes = binary.trim().split(/\s+/);
  return bytes
    .map((b) => {
      const code = parseInt(b, 2);
      return isNaN(code) ? '?' : String.fromCharCode(code);
    })
    .join('');
}

const HIEROGLYPH_BANK = [
  { key: 'eye', name: 'Eye of Horus', glyph: '𓂀' },
  { key: 'ankh', name: 'Key of Life (Ankh)', glyph: '𓋹' },
  { key: 'scarab', name: 'Sacred Scarab', glyph: '𓆣' },
  { key: 'djed', name: 'Djed of Stability', glyph: '𓊽' },
  { key: 'falcon', name: 'Horus Falcon', glyph: '𓅃' },
  { key: 'lotus', name: 'Nile Lotus', glyph: '𓆸' },
  { key: 'serpent', name: 'Uraeus Serpent', glyph: '𓆓' },
  { key: 'sun', name: 'Sun of Ra', glyph: '𓇳' },
  { key: 'crown', name: 'Pharaoh Crown', glyph: '𓋑' },
  { key: 'feather', name: "Ma'at Feather", glyph: '𓇌' },
];

const CIPHER_WORDS_LEVEL2 = [
  'PHARAOH',
  'OSIRIS',
  'ANUBIS',
  'SPHINX',
  'SCARAB',
  'TEMPLE',
  'PYRAMID',
  'BASTET',
  'HORUS',
  'NEFERTITI',
];

const PURGATORY_LEFT_WORDS = ['ETERNAL', 'AMULET', 'DIVINE', 'SACRED', 'KEEPER', 'SPIRIT'];
const PURGATORY_BINARY_WORDS = ['GOLD', 'LIFE', 'TOMB', 'SUNS', 'KING', 'REIC'];
const PURGATORY_RIGHT_WORDS = ['SHADOW', 'FLAME', 'POWER', 'THRONE', 'CROWN', 'LIGHT'];

/**
 * Creates an entirely new randomized game playthrough state
 */
export function generateNewGame(): GamePlaythroughState {
  // 1. Generate Level 1 (Symbols)
  const shuffledGlyphs = shuffleArray(HIEROGLYPH_BANK);
  const selected6 = shuffledGlyphs.slice(0, 6);
  const cards: SymbolCard[] = [];
  let cardId = 1;

  selected6.forEach((item) => {
    // 2 cards per symbol
    cards.push({
      id: cardId++,
      symbolKey: item.key,
      name: item.name,
      glyph: item.glyph,
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      id: cardId++,
      symbolKey: item.key,
      name: item.name,
      glyph: item.glyph,
      isFlipped: false,
      isMatched: false,
    });
  });

  const shuffledCards = shuffleArray(cards);
  const level1Code = generateRandomCode();

  const level1: Level1State = {
    cards: shuffledCards,
    matchedCount: 0,
    totalPairs: 6,
    isSolved: false,
    unlockedCode: level1Code,
  };

  // 2. Generate Level 2 (Caesar Cipher)
  const level2Plaintext = CIPHER_WORDS_LEVEL2[Math.floor(Math.random() * CIPHER_WORDS_LEVEL2.length)];
  const level2Shift = Math.floor(Math.random() * 15) + 3; // Shift between 3 and 17
  const level2Ciphertext = encryptCaesar(level2Plaintext, level2Shift);
  const level2Code = generateRandomCode();

  const level2: Level2State = {
    plaintext: level2Plaintext,
    shift: level2Shift,
    ciphertext: level2Ciphertext,
    selectedShift: 1,
    userDecoded: '',
    isSolved: false,
    unlockedCode: level2Code,
  };

  // 3. Generate Level 3 (Sandstorm)
  const level3SecretNumber = Math.floor(Math.random() * 10) + 1; // 1 to 10
  const level3Code = generateRandomCode();

  const level3: Level3State = {
    secretNumber: level3SecretNumber,
    timeRemaining: 60,
    guesses: [],
    isSolved: false,
    isFailed: false,
    unlockedCode: level3Code,
  };

  // 4. Generate Level 4 (Meowdo)
  const level4Code = generateRandomCode();

  const level4: Level4State = {
    playerScore: 0,
    aiScore: 0,
    targetScore: 3,
    lastPlayerMove: null,
    lastAiMove: null,
    lastRoundWinner: null,
    isSolved: false,
    unlockedCode: level4Code,
  };

  // 5. Sacred Number Tokens gathered from Levels 1-4 for Level 5
  // We use 4 distinct Egyptian hieroglyphs
  const tokenGlyphs = [
    { name: 'Eye of Horus', glyph: '𓂀' },
    { name: 'Horus Falcon', glyph: '𓅃' },
    { name: 'Uraeus Serpent', glyph: '𓆓' },
    { name: 'Ankh of Life', glyph: '𓋹' },
  ];

  const sacredTokens: SacredNumberToken[] = tokenGlyphs.map((item, idx) => ({
    id: idx + 1,
    originLevel: idx + 1,
    glyphName: item.name,
    glyphChar: item.glyph,
    // Distinct random numbers between 1 and 9
    value: ((Math.floor(Math.random() * 8) + 1 + idx * 2) % 9) + 1,
  }));

  // Correct order is a permutation of [1, 2, 3, 4]
  const correctOrder = shuffleArray([1, 2, 3, 4]);

  // Generate mythological clues corresponding to the correct positions
  const orderNarratives = [
    'stands at the First Portal of the Morning Sun',
    'guards the Second Hall of Desert Winds',
    'rests upon the Third Altar of the Sacred Nile',
    'seals the Fourth Gate of the Underworld',
  ];

  const clues = correctOrder.map((tokenId, index) => {
    const token = sacredTokens.find((t) => t.id === tokenId)!;
    return {
      position: index + 1,
      glyphName: token.glyphName,
      text: `The ${token.glyphName} ${orderNarratives[index]}.`,
    };
  });

  // Clues are shuffled so the player has to read carefully
  const shuffledClues = shuffleArray(clues);

  const level5: Level5State = {
    tokens: sacredTokens,
    currentOrder: [1, 2, 3, 4], // Initial arrangement
    correctOrder: correctOrder,
    clues: shuffledClues,
    feedbackMessage: null,
    isSolved: false,
  };

  // 6. Generate Level 6 (Purgatory - 3-part puzzle)
  const leftPlain = PURGATORY_LEFT_WORDS[Math.floor(Math.random() * PURGATORY_LEFT_WORDS.length)];
  const leftShift = Math.floor(Math.random() * 12) + 2;
  const leftCipher: Level6State['leftCipher'] = {
    plaintext: leftPlain,
    shift: leftShift,
    ciphertext: encryptCaesar(leftPlain, leftShift),
    userAnswer: '',
    isSolved: false,
  };

  const centerPlain = PURGATORY_BINARY_WORDS[Math.floor(Math.random() * PURGATORY_BINARY_WORDS.length)];
  const centerBinary: Level6State['centerBinary'] = {
    plaintextWord: centerPlain,
    binarySequence: stringToBinary(centerPlain),
    userAnswer: '',
    isSolved: false,
  };

  const rightChoices = PURGATORY_RIGHT_WORDS.filter((w) => w !== leftPlain);
  const rightPlain = rightChoices[Math.floor(Math.random() * rightChoices.length)];
  let rightShift = Math.floor(Math.random() * 12) + 3;
  if (rightShift === leftShift) rightShift = (rightShift + 3) % 25 + 1;

  const rightCipher: Level6State['rightCipher'] = {
    plaintext: rightPlain,
    shift: rightShift,
    ciphertext: encryptCaesar(rightPlain, rightShift),
    userAnswer: '',
    isSolved: false,
  };

  const finalMasterWord = `${leftPlain} ${centerPlain} ${rightPlain}`;

  const level6: Level6State = {
    timeRemaining: 600, // 10 minutes (was 5 minutes)
    leftCipher,
    centerBinary,
    rightCipher,
    finalMasterWord,
    masterInput: '',
    isSolved: false,
    isFailed: false,
  };

  return {
    currentLevel: 1,
    highestDiscoveredLevel: 1,
    completedLevels: [],
    levelCodes: {
      1: level1Code,
      2: level2Code,
      3: level3Code,
      4: level4Code,
    },
    sacredTokens,
    level1,
    level2,
    level3,
    level4,
    level5,
    level6,
  };
}

export const CHAMBER_METADATA = [
  {
    id: 1,
    name: 'Hall of Glyphs',
    egyptianName: 'Sekhem-Netjer',
    symbol: '𓂀',
    compassBearing: 'North',
    description: 'A quiet antechamber with sandstone tiles inscribed with pairs of ancient deities and royal seals.',
  },
  {
    id: 2,
    name: 'Crypt of the Cipher',
    egyptianName: 'Medou-Kemet',
    symbol: '𓆣',
    compassBearing: 'North-East',
    description: 'An ancient scriptorium containing a shifting stone tablet with inscribed Caesar script.',
  },
  {
    id: 3,
    name: 'Vault of the Sandstorm',
    egyptianName: 'Set-Khensu',
    symbol: '𓇳',
    compassBearing: 'East',
    description: 'A perilous burial vault where desert sands pour through cracks in the ceiling.',
  },
  {
    id: 4,
    name: 'Shrine of Bastet',
    egyptianName: 'Hut-Bast',
    symbol: '𓃠',
    compassBearing: 'South-East',
    description: 'A serene candlelit shrine where a regal golden cat statue challenges travelers to Meowdo.',
  },
  {
    id: 5,
    name: 'Chamber of the Pharaoh’s Order',
    egyptianName: 'Ma’at-User',
    symbol: '𓊽',
    compassBearing: 'South',
    description: 'A ceremonial sanctum where the four sacred inscribed numbers must be set upon the golden altar in cosmic alignment.',
  },
  {
    id: 6,
    name: 'Purgatory Ruin',
    egyptianName: 'Duat-Amenti',
    symbol: '𓅃',
    compassBearing: 'West',
    description: 'The deep obsidian sanctum holding three ancient decoding mechanisms under an encroaching curse.',
  },
];
