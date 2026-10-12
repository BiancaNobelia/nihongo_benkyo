export function filterSimilarGroups(groups, kanji, {query = '', category = 'all', level = 'all'} = {}) {
  const byChar = new Map(kanji.map(k => [k.char, k]));
  const search = query.trim().toLocaleLowerCase('id');
  return groups.filter(group => {
    const cards = group.members.map(member => byChar.get(member.char)).filter(Boolean);
    if (category !== 'all' && group.category !== category) return false;
    // Keep every partner visible even when only one matches the selected level.
    if (level !== 'all' && !cards.some(k => k.level === level)) return false;
    const text = [group.title, group.focus, group.tip, ...group.members.map(m => m.cue),
      ...cards.flatMap(k => [k.char, k.meaning, ...k.on, ...k.kun, ...k.kun.map(r => r.replaceAll('.', '')), k.example?.word, k.example?.reading])].join(' ').toLocaleLowerCase('id');
    return !search || text.includes(search);
  });
}

export function groupsForCharacter(groups, char) {
  return groups.filter(group => group.members.some(member => member.char === char));
}

export function createSimilarPractice(group, random = Math.random) {
  const shuffled = items => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  return shuffled(group.members).map(member => ({
    prompt: member.cue,
    answer: member.char,
    options: shuffled(group.members.map(m => m.char)),
  }));
}
