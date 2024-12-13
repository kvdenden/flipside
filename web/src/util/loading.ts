export function getLoadingText(verb: string): string {
  // Words where the final consonant is not doubled
  const NEVER_DOUBLE = new Set(["edit", "deposit", "open", "cancel", "register", "filter", "order"]);

  // Utility: Check if the word ends in a consonant + vowel + consonant (CVC)
  const endsInCVC = (word: string): boolean => /^[^aeiou][aeiou][^aeiouwxy]$/i.test(word.slice(-3)); // Last 3 letters match CVC

  // Handle words ending with "e"
  if (verb.endsWith("e")) {
    return `${verb.slice(0, -1)}ing...`;
  }

  // Handle words requiring double consonants
  if (endsInCVC(verb) && !NEVER_DOUBLE.has(verb.toLowerCase())) {
    return `${verb}${verb.at(-1)}ing...`;
  }

  // Default case: Just add "ing"
  return `${verb}ing...`;
}
