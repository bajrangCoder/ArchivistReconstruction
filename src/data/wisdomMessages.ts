/**
 * Array of cryptic, poetic wisdom messages in the style of an 18th-century scholar.
 */
export const WISDOM_MESSAGES: string[] = [
  "The ink flows where the mind goes.",
  "Every stain on the page tells a story of perseverance.",
  "Order emerges from the chaos of scattered thoughts.",
  "The quill remembers what the hand has forgotten.",
  "In the space between letters, wisdom takes root.",
  "Patience, dear scribe, for mastery comes to those who wait.",
  "The parchment yields its secrets to the persistent hand.",
  "Through darkness of ink, light of knowledge is revealed.",
  "A well-placed mark echoes through the ages.",
  "The archive speaks only to those who listen.",
  "Each cleared line is a verse in your opus.",
  "The most brilliant manuscripts began with a single stroke.",
  "Seek the order within the scattered ink.",
  "Where others see chaos, the archivist finds harmony.",
  "The page remembers every choice, every deliberation.",
  "Time bends to the will of the meticulous scribe.",
  "In the dance of blocks, find your rhythm.",
  "A masterwork is not made; it is revealed.",
  "The ancient texts whisper their approval.",
  "Your hand moves, but the archive guides.",
  "Every gap filled brings the manuscript closer to completion.",
  "The ink knows not impatience, nor should you.",
  "Between the lines lies the true message.",
  "A scattered page awaits its faithful restorer.",
  "The archive rewards those who see patterns in disorder.",
  "What appears as chaos is merely undiscovered order.",
  "The scholar's path is paved with careful placements.",
  "Let the rhythm of arrangement be your meditation.",
  "The manuscript evolves with each thoughtful decision.",
  "Haste makes waste; precision makes history.",
  "The page is infinite, yet space is precious.",
  "Celebrate each cleared column as a small victory.",
  "The ancient ones smile upon your dedication.",
  "Through your hands, forgotten knowledge finds new life.",
  "The archive's memory is long; your legacy endures.",
  "Every block placed is a word in your story.",
  "The margins hold as much meaning as the text.",
  "Clarity of mind brings clarity to the page.",
  "The weight of history rests in each careful move.",
  "What was scattered shall be made whole again."
];

/**
 * Get a random wisdom message.
 */
export const getRandomWisdom = (): string => {
  const index = Math.floor(Math.random() * WISDOM_MESSAGES.length);
  return WISDOM_MESSAGES[index];
};

/**
 * Get a wisdom message based on score (higher scores get "better" messages).
 */
export const getWisdomByScore = (score: number): string => {
  // Use score to seed the selection, but still feel somewhat random
  const baseIndex = Math.floor((score / 100) % WISDOM_MESSAGES.length);
  const randomOffset = Math.floor(Math.random() * 5);
  const index = (baseIndex + randomOffset) % WISDOM_MESSAGES.length;
  return WISDOM_MESSAGES[index];
};
