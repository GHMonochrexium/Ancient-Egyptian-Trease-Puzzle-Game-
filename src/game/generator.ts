import {
  GamePlaythroughState,
  Level1State,
  Level2State,
  Level3State,
  Level4State,
  Level5State,
  Level6DuelState,
  Level7BinaryState,
  Level8MovingGuardianState,
  Level9CaesarState,
  Level10AltarState,
  MathQuestion,
  SacredNumberToken,
  SymbolCard,
  LevelXSacrificeState,
  SacrificeObject,
  LevelYMummyState,
  MummyChallengeType,
  LevelZFinalChallengeState,
  Act3State,
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

const BINARY_WORDS_LEVEL7 = [
  'OSIRIS',
  'ANUBIS',
  'SPHINX',
  'KEEPER',
  'SCARAB',
  'TEMPLE',
  'DIVINE',
  'HORUS',
];

const CIPHER_WORDS_LEVEL9 = [
  'IMMORTAL',
  'SANCTUARY',
  'TREASURE',
  'ETERNITY',
  'PYRAMIDS',
  'SOLARIS',
  'LABYRINTH',
];

// Generate dynamic math questions for Level 8
export function generateMathQuestions(): MathQuestion[] {
  const pool: { q: string; a: number }[] = [
    { q: '3 × 7', a: 21 },
    { q: '12 × 9', a: 108 },
    { q: '144 ÷ 12', a: 12 },
    { q: '18 + 27', a: 45 },
    { q: '8 × 8', a: 64 },
    { q: '96 ÷ 8', a: 12 },
    { q: '15 × 6', a: 90 },
    { q: '64 ÷ 4', a: 16 },
    { q: '45 + 39', a: 84 },
    { q: '7 × 9', a: 63 },
    { q: '13 × 4', a: 52 },
    { q: '81 ÷ 9', a: 9 },
    { q: '6 × 14', a: 84 },
    { q: '125 ÷ 5', a: 25 },
    { q: '29 + 43', a: 72 },
  ];

  return shuffleArray(pool).slice(0, 7).map((item, index) => ({
    id: index + 1,
    question: item.q,
    answer: item.a,
  }));
}

/**
 * Creates an entirely new randomized game playthrough state across all 10 levels
 */
export function generateNewGame(): GamePlaythroughState {
  // --- ACT 1: CHAMBERS 1 TO 5 ---

  // 1. Level 1 (The Hall of Glyphs)
  const shuffledGlyphs = shuffleArray(HIEROGLYPH_BANK);
  const selected6 = shuffledGlyphs.slice(0, 6);
  const cards: SymbolCard[] = [];
  let cardId = 1;

  selected6.forEach((item) => {
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

  const level1Code = generateRandomCode();
  const hiddenNumber1 = Math.floor(Math.random() * 9) + 1; // 1 to 9

  const level1: Level1State = {
    cards: shuffleArray(cards),
    matchedCount: 0,
    totalPairs: 6,
    isSolved: false,
    unlockedCode: level1Code,
    hiddenNumber: hiddenNumber1,
  };

  // 2. Level 2 (The Crypt of the Cipher)
  const level2Plaintext = CIPHER_WORDS_LEVEL2[Math.floor(Math.random() * CIPHER_WORDS_LEVEL2.length)];
  const level2Shift = Math.floor(Math.random() * 15) + 3;
  const level2Ciphertext = encryptCaesar(level2Plaintext, level2Shift);
  const level2Code = generateRandomCode();
  const hiddenNumber2 = Math.floor(Math.random() * 9) + 1;

  const level2: Level2State = {
    plaintext: level2Plaintext,
    shift: level2Shift,
    ciphertext: level2Ciphertext,
    selectedShift: 1,
    userDecoded: '',
    isSolved: false,
    unlockedCode: level2Code,
    hiddenNumber: hiddenNumber2,
  };

  // 3. Level 3 (The Vault of the Sandstorm)
  const level3SecretNumber = Math.floor(Math.random() * 9) + 1; // Single digit 1 to 9
  const level3Code = String(level3SecretNumber); // Single digit code for Level 4
  const hiddenNumber3 = level3SecretNumber; // Hidden number is the storm number

  const level3: Level3State = {
    secretNumber: level3SecretNumber,
    timeRemaining: 60,
    guesses: [],
    isSolved: false,
    isFailed: false,
    unlockedCode: level3Code,
    hiddenNumber: hiddenNumber3,
  };

  // 4. Level 4 (The Shrine of Bastet - Meowdo)
  const hiddenNumber4 = Math.floor(Math.random() * 9) + 1; // Single digit 1 to 9
  const level4Code = String(hiddenNumber4); // Single digit code for Level 4

  const level4: Level4State = {
    playerScore: 0,
    aiScore: 0,
    targetScore: 3,
    lastPlayerMove: null,
    lastAiMove: null,
    lastRoundWinner: null,
    isSolved: false,
    unlockedCode: level4Code,
    hiddenNumber: hiddenNumber4,
  };

  // 5. Level 5 (The Gateway of the Four Seals)
  // Combines the 4 hidden numbers from Levels 1 to 4!
  const level5CorrectCode = `${hiddenNumber1}-${hiddenNumber2}-${hiddenNumber3}-${hiddenNumber4}`;
  const level5UnlockedCode = generateRandomCode();

  const level5: Level5State = {
    hiddenNumbers: [
      { level: 1, value: hiddenNumber1, clue: 'Carved into the sandstone slab base of Chamber I' },
      { level: 2, value: hiddenNumber2, clue: 'Inscribed on the granite stele rim of Chamber II' },
      { level: 3, value: hiddenNumber3, clue: 'Divined from the sandstorm altar of Chamber III' },
      { level: 4, value: hiddenNumber4, clue: 'Stamped beneath Bastet’s golden shrine of Chamber IV' },
    ],
    correctCode: level5CorrectCode,
    enteredCode: '',
    attempts: 0,
    feedbackMessage: null,
    isSolved: false,
    unlockedCode: level5UnlockedCode,
  };

  // --- ACT 2: DEEP INNER TOMB (CHAMBERS 6 TO 10) ---

  // 6. Level 6 (The Duel - Trial of the Pharaoh)
  const hiddenNumber6 = Math.floor(Math.random() * 9) + 1;
  const level6ScarabKey = generateRandomCode();

  const level6: Level6DuelState = {
    playerWins: 0,
    pharaohWins: 0,
    targetWins: 3,
    lastPlayerMove: null,
    lastPharaohMove: null,
    lastRoundWinner: null,
    isShaking: false,
    pharaohEyesRed: false,
    isSolved: false,
    unlockedScarabKey: level6ScarabKey,
    hiddenNumber: hiddenNumber6,
  };

  // 7. Level 7 (The Binary Alphabet - Trial of Knowledge)
  const level7Word = BINARY_WORDS_LEVEL7[Math.floor(Math.random() * BINARY_WORDS_LEVEL7.length)];
  const level7Binary = stringToBinary(level7Word);
  const hiddenNumber7 = Math.floor(Math.random() * 9) + 1;
  const level7Code = generateRandomCode();

  const level7: Level7BinaryState = {
    secretWord: level7Word,
    binaryString: level7Binary,
    userAnswer: '',
    isSolved: false,
    unlockedCode: level7Code,
    hiddenNumber: hiddenNumber7,
  };

  // 8. Level 8 (The Moving Guardian - Trial of Speed)
  const level8Questions = generateMathQuestions();
  const hiddenNumber8 = Math.floor(Math.random() * 9) + 1;
  const level8Code = generateRandomCode();

  const level8: Level8MovingGuardianState = {
    guardianDistance: 100, // Starts at 100% away
    questions: level8Questions,
    currentQuestionIndex: 0,
    questionsSolved: 0,
    targetSolved: 5,
    timeRemaining: 60,
    isSolved: false,
    isFailed: false,
    unlockedCode: level8Code,
    hiddenNumber: hiddenNumber8,
  };

  // 9. Level 9 (The Caesar Cipher - Trial of Secrets)
  const level9Plain = CIPHER_WORDS_LEVEL9[Math.floor(Math.random() * CIPHER_WORDS_LEVEL9.length)];
  const level9Shift = Math.floor(Math.random() * 14) + 3;
  const level9Cipher = encryptCaesar(level9Plain, level9Shift);
  const hiddenNumber9 = Math.floor(Math.random() * 9) + 1;
  const level9Code = generateRandomCode();

  const level9: Level9CaesarState = {
    plaintext: level9Plain,
    shift: level9Shift,
    ciphertext: level9Cipher,
    userAnswer: '',
    isSolved: false,
    unlockedCode: level9Code,
    hiddenNumber: hiddenNumber9,
  };

  // 10. Level 10 (The Last Seal - The Lost Pharaoh Altar Alignment)
  // Combines 4 Sacred Relics from Levels 6 to 9 with their hidden numbers
  const relics: SacredNumberToken[] = [
    {
      id: 1,
      originLevel: 6,
      glyphName: 'Golden Scarab of the Duel',
      glyphChar: '𓆣',
      value: hiddenNumber6,
    },
    {
      id: 2,
      originLevel: 7,
      glyphName: 'Turquoise Lapis Cartouche',
      glyphChar: '𓊽',
      value: hiddenNumber7,
    },
    {
      id: 3,
      originLevel: 8,
      glyphName: 'Colossus Core of Speed',
      glyphChar: '𓅃',
      value: hiddenNumber8,
    },
    {
      id: 4,
      originLevel: 9,
      glyphName: 'Papyrus Sigil of Secrets',
      glyphChar: '𓋹',
      value: hiddenNumber9,
    },
  ];

  // Randomize the correct ordering permutation
  const correctOrder = shuffleArray([1, 2, 3, 4]);

  const orderNarratives = [
    'must be consecrated upon the First Pedestal of the Morning Sun (Dawn)',
    'must be anchored upon the Second Pedestal of the Desert Winds',
    'must be submerged in the Third Basin of the Nile Waters',
    'must seal the Fourth Portal of the Duat Underworld',
  ];

  const clues = correctOrder.map((relicId, index) => {
    const relic = relics.find((r) => r.id === relicId)!;
    return {
      position: index + 1,
      glyphName: relic.glyphName,
      text: `The ${relic.glyphName} (${relic.glyphChar}) ${orderNarratives[index]}.`,
    };
  });

  const level10: Level10AltarState = {
    relics,
    currentOrder: [1, 2, 3, 4],
    correctOrder,
    clues: shuffleArray(clues),
    feedbackMessage: null,
    isSolved: false,
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
      5: level5UnlockedCode,
      6: level6ScarabKey,
      7: level7Code,
      8: level8Code,
      9: level9Code,
    },
    sacredTokens: relics,
    level1,
    level2,
    level3,
    level4,
    level5,
    level6,
    level7,
    level8,
    level9,
    level10,
    act3: generateAct3State(),
  };
}

// --- ACT III: PURGATORIUM GENERATORS ---

const SACRED_OBJECT_TIERS: Record<string, { tier: number; tierName: string; clueDesc: string }> = {
  sun: { tier: 1, tierName: 'Celestial Realm', clueDesc: 'The radiant essence of Ra, lord of noon' },
  falcon: { tier: 1, tierName: 'Celestial Realm', clueDesc: 'The soaring falcon Horus, watcher of the sky' },
  eye: { tier: 1, tierName: 'Celestial Realm', clueDesc: 'The cosmic Eye of divine all-seeing sight' },
  crown: { tier: 2, tierName: 'Royal Dominion', clueDesc: 'The double pschent crown of earthly sovereignty' },
  djed: { tier: 2, tierName: 'Royal Dominion', clueDesc: 'The pillar of eternal stability and backbone of Osiris' },
  serpent: { tier: 2, tierName: 'Royal Dominion', clueDesc: 'The fire-spitting Uraeus cobra of royal authority' },
  ankh: { tier: 3, tierName: 'Sacred Life & Truth', clueDesc: 'The breath of everlasting mortal vitality' },
  scarab: { tier: 3, tierName: 'Sacred Life & Truth', clueDesc: 'Khepri rolling the dawn, emblem of rebirth' },
  lotus: { tier: 3, tierName: 'Sacred Life & Truth', clueDesc: 'The sacred water-bloom rising from primordial mud' },
  feather: { tier: 3, tierName: 'Sacred Life & Truth', clueDesc: 'The feather of Ma’at weighing against the heart' },
};

export function generateLevelXState(existingLives: number = 3): LevelXSacrificeState {
  // Pick exactly 3 distinct objects: 1 from Celestial Realm (tier 1), 1 from Royal Dominion (tier 2), 1 from Sacred Life & Truth (tier 3)
  const tier1Items = HIEROGLYPH_BANK.filter(
    (item) => SACRED_OBJECT_TIERS[item.key]?.tier === 1
  );
  const tier2Items = HIEROGLYPH_BANK.filter(
    (item) => SACRED_OBJECT_TIERS[item.key]?.tier === 2
  );
  const tier3Items = HIEROGLYPH_BANK.filter(
    (item) => SACRED_OBJECT_TIERS[item.key]?.tier === 3
  );

  const pickedTier1 = shuffleArray(tier1Items)[0] || HIEROGLYPH_BANK[0];
  const pickedTier2 = shuffleArray(tier2Items)[0] || HIEROGLYPH_BANK[3];
  const pickedTier3 = shuffleArray(tier3Items)[0] || HIEROGLYPH_BANK[1];

  // Exactly 3 boxes/objects presented in randomized order
  const picked = shuffleArray([pickedTier1, pickedTier2, pickedTier3]);

  const objects: SacrificeObject[] = picked.map((item, idx) => {
    const meta = SACRED_OBJECT_TIERS[item.key] || {
      tier: 2,
      tierName: 'Sacred Relic',
      clueDesc: 'Ancient relic',
    };
    return {
      id: idx + 1,
      symbolKey: item.key,
      name: item.name,
      glyph: item.glyph,
      tier: meta.tier,
      tierName: meta.tierName,
      clueDesc: meta.clueDesc,
    };
  });

  // Sort objects logically by divine hierarchy (Tier 1 -> Tier 2 -> Tier 3), with tie-break by ID
  const sorted = [...objects].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.id - b.id;
  });

  const targetSequence = sorted.map((o) => o.id);

  return {
    lives: existingLives,
    objects,
    sacrificedIds: [],
    targetSequence,
    pharaohDecree:
      'The Pharaoh decrees: "Offer the three sacred relics in the cosmic order of divine hierarchy: First the CELESTIAL REALM (Tier I), second the ROYAL DOMINION (Tier II), and lastly SACRED LIFE & TRUTH (Tier III)."',
    feedbackMessage: null,
    isSolved: false,
  };
}

const MUMMY_CAESAR_WORDS = ['ANUBIS', 'ETERNAL', 'WRATH', 'SARCOPHAGUS', 'IMMORTAL', 'PURGATORY'];
const MUMMY_BINARY_WORDS = ['CURSE', 'TOMB', 'SEAL', 'DARK', 'WRATH', 'SHADOW'];

export function generateLevelYState(): LevelYMummyState {
  const challengeTypes: MummyChallengeType[] = ['caesar', 'binary', 'rps'];
  const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

  const caesarPlain = MUMMY_CAESAR_WORDS[Math.floor(Math.random() * MUMMY_CAESAR_WORDS.length)];
  const caesarShift = Math.floor(Math.random() * 8) + 3;
  const caesarCipher = encryptCaesar(caesarPlain, caesarShift);

  const binaryWord = MUMMY_BINARY_WORDS[Math.floor(Math.random() * MUMMY_BINARY_WORDS.length)];
  const binaryString = stringToBinary(binaryWord);

  return {
    isScrollOpened: false,
    challengeType,
    caesarPlain,
    caesarCipher,
    caesarShift,
    binaryString,
    binaryWord,
    guardianMove: null,
    playerMove: null,
    rpsResult: null,
    challengeSolved: false,
    bandagesRemaining: 4,
    isSolved: false,
  };
}

export function generateLevelZState(): LevelZFinalChallengeState {
  // Random integer between 1 and 50 inclusive
  const targetNumber = Math.floor(Math.random() * 50) + 1;

  return {
    targetNumber,
    timeRemaining: 60,
    guesses: [],
    isSolved: false,
    isFailed: false,
  };
}

export function generateAct3State(): Act3State {
  return {
    isDiscovered: false,
    gatewayLevel: 'X',
    levelX: generateLevelXState(3),
    levelY: generateLevelYState(),
    levelZ: generateLevelZState(),
    purgatorium: {
      timeRemaining: 420, // 7 minutes
      currentTrial: 1,
      trialsCompleted: [],
      isFailed: false,
      isCompleted: false,
    },
    hasUnlockedSecretEnding: false,
  };
}

export const CHAMBER_METADATA = [
  {
    id: 1,
    name: 'Hall of Glyphs',
    egyptianName: 'Sekhem-Netjer',
    symbol: '𓂀',
    compassBearing: 'North',
    description: 'Antechamber with paired deity slabs and the 1st hidden seal number.',
  },
  {
    id: 2,
    name: 'Crypt of the Cipher',
    egyptianName: 'Medou-Kemet',
    symbol: '𓆣',
    compassBearing: 'North-East',
    description: 'Ancient scriptorium with a shifting Caesar stele and the 2nd hidden seal number.',
  },
  {
    id: 3,
    name: 'Vault of the Sandstorm',
    egyptianName: 'Set-Khensu',
    symbol: '𓇳',
    compassBearing: 'East',
    description: 'Perilous burial vault where desert sands pour from the ceiling (3rd hidden number).',
  },
  {
    id: 4,
    name: 'Shrine of Bastet',
    egyptianName: 'Hut-Bast',
    symbol: '𓃠',
    compassBearing: 'South-East',
    description: 'Candlelit court where the sacred cat statue challenges you to Meowdo (4th hidden number).',
  },
  {
    id: 5,
    name: 'Gateway of the Four Seals',
    egyptianName: 'Khetam-Fedu',
    symbol: '𓋑',
    compassBearing: 'South',
    description: 'Colossal iron-banded stone portal locking the subterranean descent to the Inner Tomb.',
  },
  {
    id: 6,
    name: 'The Duel: Trial of the Pharaoh',
    egyptianName: 'Per-Aa-Khab',
    symbol: '𓀠',
    compassBearing: 'South-West',
    description: 'A colossal Pharaoh statue with glowing eyes challenges you to a trial of rock-paper-scissors.',
  },
  {
    id: 7,
    name: 'The Binary Alphabet',
    egyptianName: 'Seshu-Sebau',
    symbol: '𓊽',
    compassBearing: 'West',
    description: 'Lapis lazuli walls covered in ancient binary streams hiding the password of Thoth.',
  },
  {
    id: 8,
    name: 'The Moving Guardian',
    egyptianName: 'Sau-Menkhet',
    symbol: '𓅃',
    compassBearing: 'North-West',
    description: 'A giant stone colossus advances down the corridor; solve sacred math equations to freeze it.',
  },
  {
    id: 9,
    name: 'The Papyrus Cipher',
    egyptianName: 'Djed-Papyrus',
    symbol: '𓆸',
    compassBearing: 'North-North-East',
    description: 'Ancient royal papyrus with encrypted messages guarding the entrance to the Final Sanctum.',
  },
  {
    id: 10,
    name: 'The Last Seal: The Lost Pharaoh',
    egyptianName: 'Neb-Amenti',
    symbol: '𓋹',
    compassBearing: 'The Golden Core',
    description: 'The ultimate golden altar room. Align the four divine relics to reveal the Pharaoh’s Treasure Vault!',
  },
];
