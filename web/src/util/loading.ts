export function getLoadingText(verb: string): string {
  // Words where the final consonant is not doubled
  const NEVER_DOUBLE = new Set([
    "visit",
    "edit",
    "credit",
    "deposit",
    "export",
    "import",
    "open",
    "cancel",
    "register",
    "filter",
    "order",
  ]);

  // Utility: Check if the word ends in a vowel + consonant
  const endsInVowelConsonant = (word: string): boolean => {
    const len = word.length;
    return (
      len >= 2 &&
      /[aeiou]/i.test(word[len - 2]) && // Second-to-last character is a vowel
      /[^aeiouwxy]/i.test(word[len - 1]) // Last character is a consonant (not w, x, y)
    );
  };

  // Handle words ending with "e"
  if (verb.endsWith("e")) {
    return `${verb.slice(0, -1)}ing...`;
  }

  // Handle words requiring double consonants
  if (endsInVowelConsonant(verb) && !NEVER_DOUBLE.has(verb.toLowerCase())) {
    return `${verb}${verb.at(-1)}ing...`;
  }

  // Default case: Just add "ing"
  return `${verb}ing...`;
}
