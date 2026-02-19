/**
 * Group a flat list of lessons (from backend) by level and module.
 * Returns { A2: [module1, module2, ...], B1: [...], B2: [...] }
 */
export function groupLessonsByModule(lessons) {
  const grouped = {};

  lessons.forEach((lesson) => {
    // Skip game_content entries
    if (lesson.order >= 999) return;

    const level = lesson.level.toUpperCase();
    if (!grouped[level]) grouped[level] = {};

    const moduleId = lesson.module;
    if (!grouped[level][moduleId]) {
      // Extract a readable title from the content_json or module id
      const moduleTitle =
        lesson.content_json?.module_title ||
        moduleId
          .replace(/^[ab]\d_m\d+_?/, '')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()) ||
        moduleId;

      grouped[level][moduleId] = {
        id: moduleId,
        title: moduleTitle,
        lessons: [],
      };
    }

    grouped[level][moduleId].lessons.push({
      id: lesson.id,
      title: lesson.title,
      xp: level === 'B2' ? 100 : level === 'B1' ? 75 : 50,
      order: lesson.order,
    });
  });

  // Sort lessons within each module by order, then convert to arrays
  const result = {};
  for (const level of ['A2', 'B1', 'B2']) {
    const modules = grouped[level] || {};
    result[level] = Object.values(modules).map((mod) => {
      mod.lessons.sort((a, b) => a.order - b.order);
      return mod;
    });
  }
  return result;
}

/**
 * Transform backend leaderboard response to frontend format.
 */
export function transformLeaderboard(data, currentUserId) {
  return (data.entries || []).map((entry) => ({
    rank: entry.rank,
    name: entry.display_name,
    xp: entry.xp_total,
    avatar: entry.display_name.charAt(0).toUpperCase(),
    isCurrentUser: entry.user_id === currentUserId,
  }));
}

/**
 * Format recent activity timestamps to relative strings.
 */
export function transformActivity(activities) {
  const now = Date.now();
  return activities.map((a) => {
    const diff = now - new Date(a.timestamp).getTime();
    const hours = Math.floor(diff / 3600000);
    let time;
    if (hours < 1) time = 'Just now';
    else if (hours < 24) time = `${hours}h ago`;
    else if (hours < 48) time = 'Yesterday';
    else time = `${Math.floor(hours / 24)}d ago`;

    return { type: a.type, title: a.title, xp: a.xp, time };
  });
}

/**
 * Map curriculum content_json vocabulary from backend field names
 * (romanized) to frontend ScriptText field names (latin).
 */
export function mapVocab(vocab) {
  return (vocab || []).map((v) => ({
    ...v,
    latin: v.latin || v.romanized || '',
    example_latin: v.example_latin || v.example_sentence?.romanized || '',
    example_arabic: v.example_arabic || v.example_sentence?.arabic || '',
    example_english: v.example_english || v.example_sentence?.english || '',
  }));
}

/**
 * Map curriculum grammar from backend field names.
 */
export function mapGrammar(grammar) {
  return (grammar || []).map((g) => ({
    ...g,
    examples: (g.examples || []).map((ex) => ({
      arabic: ex.arabic || '',
      latin: ex.latin || ex.romanized || '',
      english: ex.english || '',
    })),
  }));
}

/**
 * Map curriculum phrases from backend field names.
 */
export function mapPhrases(phrases) {
  return (phrases || []).map((p) => ({
    ...p,
    latin: p.latin || p.romanized || '',
  }));
}
