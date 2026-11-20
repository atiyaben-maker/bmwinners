// Standard Hebrew gematria (מספר הכרחי; final letters keep their base value) and the
// Sefer Yetzirah double letters (בגדכפרת) per the locked rule set (Saadia version, v1).

const VALUES: Record<string, number> = {
  א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9,
  י: 10, כ: 20, ך: 20, ל: 30, מ: 40, ם: 40, נ: 50, ן: 50, ס: 60, ע: 70, פ: 80, ף: 80, צ: 90, ץ: 90,
  ק: 100, ר: 200, ש: 300, ת: 400,
};
const FINAL_TO_BASE: Record<string, string> = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' };
export const DOUBLE_LETTERS = ['ב', 'ג', 'ד', 'כ', 'פ', 'ר', 'ת'] as const;

export function hebrewLetters(text: string): string[] {
  return Array.from(text.normalize('NFC')).filter((ch) => ch in VALUES);
}

export function gematria(text: string): number {
  return hebrewLetters(text).reduce((sum, ch) => sum + VALUES[ch], 0);
}

/** Repeated digit sum (מספר קטן / digital root) – 0 for empty input. */
export function reduced(n: number): number {
  if (n <= 0) return 0;
  return 1 + ((n - 1) % 9);
}

/** Double letters present in a name with counts, mapped to planets by the rule-set letter map. */
export function doubleLetters(text: string, letterPlanet: Record<string, string>) {
  const counts = new Map<string, number>();
  for (const ch of hebrewLetters(text)) {
    const base = FINAL_TO_BASE[ch] ?? ch;
    if ((DOUBLE_LETTERS as readonly string[]).includes(base)) counts.set(base, (counts.get(base) ?? 0) + 1);
  }
  return DOUBLE_LETTERS.filter((l) => counts.has(l)).map((l) => ({ letter: l, count: counts.get(l)!, planet: letterPlanet[l] ?? '—' }));
}
