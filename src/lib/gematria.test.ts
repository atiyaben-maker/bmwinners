import { describe, expect, it } from 'vitest';
import { doubleLetters, gematria, reduced } from './gematria';
import { DEMO_RULESET } from './demo';

describe('gematria', () => {
  it('computes standard values (finals = base value)', () => {
    expect(gematria('אבג')).toBe(6);
    expect(gematria('שלום')).toBe(376);
    expect(gematria('מכבי')).toBe(72);
    expect(gematria('ם')).toBe(gematria('מ'));
  });
  it('ignores spaces, punctuation, geresh and Latin', () => {
    expect(gematria('מ.ס. אשדוד')).toBe(gematria('מסאשדוד'));
    expect(gematria('אלצ\'ה')).toBe(gematria('אלצה'));
    expect(gematria('Winner')).toBe(0);
  });
  it('reduces to a single digit', () => {
    expect(reduced(376)).toBe(7);
    expect(reduced(9)).toBe(9);
    expect(reduced(0)).toBe(0);
  });
  it('maps double letters to planets per rule set v1 (Saadia)', () => {
    const d = doubleLetters('הפועל באר שבע', DEMO_RULESET.letterPlanet);
    expect(d).toEqual([
      { letter: 'ב', count: 2, planet: 'שבתאי' },
      { letter: 'פ', count: 1, planet: 'נוגה' },
      { letter: 'ר', count: 1, planet: 'כוכב' },
    ]);
  });
});
