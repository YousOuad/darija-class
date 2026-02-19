const XP_PER_LEVEL = 500;

/**
 * Calculate level from total XP.
 * @param {number} xp - Total XP
 * @returns {number} Current level (starting from 1)
 */
export function getLevelFromXP(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/**
 * Calculate XP needed for the next level.
 * @param {number} currentXP - Current total XP
 * @returns {number} XP needed to reach next level
 */
export function getXPForNextLevel(currentXP) {
  const currentLevel = getLevelFromXP(currentXP);
  const nextLevelXP = currentLevel * XP_PER_LEVEL;
  return nextLevelXP - currentXP;
}

/**
 * Calculate progress percentage toward the next level.
 * @param {number} currentXP - Current total XP
 * @returns {number} Progress percentage (0-100)
 */
export function getProgressPercentage(currentXP) {
  const xpInCurrentLevel = currentXP % XP_PER_LEVEL;
  return Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100);
}

/**
 * Get a display-friendly level title.
 * @param {number} level - Level number
 * @returns {string} Level title
 */
export function getLevelTitle(level) {
  if (level <= 3) return 'Beginner';
  if (level <= 6) return 'Elementary';
  if (level <= 10) return 'Intermediate';
  if (level <= 15) return 'Upper Intermediate';
  if (level <= 20) return 'Advanced';
  return 'Master';
}

/**
 * Format XP number with commas.
 * @param {number} xp - XP value
 * @returns {string} Formatted XP string
 */
export function formatXP(xp) {
  return xp.toLocaleString();
}
