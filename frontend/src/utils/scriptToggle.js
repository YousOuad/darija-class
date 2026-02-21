/**
 * Renders text based on the current script mode.
 * @param {string} arabic - The Arabic script version
 * @param {string} latin - The Latin script version
 * @param {'arabic'|'latin'|'hybrid'} mode - Current script mode
 * @returns {string} The rendered text
 */
export function renderText(arabic, latin, mode) {
  switch (mode) {
    case 'arabic':
      return arabic || latin;
    case 'latin':
      return latin || arabic;
    case 'hybrid':
      if (arabic && latin) {
        return `${arabic} (${latin})`;
      }
      return arabic || latin;
    default:
      return latin || arabic;
  }
}

/**
 * Gets the text direction for a given script mode.
 * @param {'arabic'|'latin'|'hybrid'} mode - Current script mode
 * @returns {'rtl'|'ltr'} The text direction
 */
export function getDirection(mode) {
  return mode === 'arabic' ? 'rtl' : 'ltr';
}

/**
 * Gets the appropriate font class for the script mode.
 * @param {'arabic'|'latin'|'hybrid'} mode - Current script mode
 * @returns {string} CSS class name
 */
export function getFontClass(mode) {
  return mode === 'arabic' ? 'font-arabic' : 'font-sans';
}
