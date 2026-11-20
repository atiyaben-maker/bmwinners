// Demo dataset — mirrors supabase/seed.sql exactly. Used when Supabase env vars are absent
// (local QA) so every screen can be exercised. Predictions here are DEMO (is_demo = true);
// fixtures, results and prize tiers are the official winner.co.il data.
import type { DecisionView, MatchView, ParamView, PrizeTier, RoundView, RuleSetView, SourceView } from './types';

const current = [
  {
    "row": 1,
    "home": "הפועל באר שבע",
    "away": "הפועל תל אביב",
    "league": "ליגת Winner",
    "kickoffAt": "2026-11-08T20:30:00+02:00",
    "status": "scheduled",
    "result": null,
    "scoreHome": null,
    "scoreAway": null,
    "combined": [
      0.41,
      0.29,
      0.3
    ],
    "spiritual": {
      "probs": [
        0.34,
        0.33,
        0.33
      ],
      "lean": 0.1,
      "drawLean": 0.2,
      "ruleSet": "v1"
    }
  },
  {
    "row": 2,
    "home": "עירוני קרית שמונה",
    "away": "הפועל חיפה",
    "league": "ליגת Winner",
    "kickoffAt": "2026-11-07T18:00:00+02:00",
    "status": "scheduled",
    "result": null,
    "scoreHome": null,
    "scoreAway": null,
    "combined": [
      0.33,
      0.32,
      0.35
    ],
    "spiritual": {
      "probs": [
        0.3,
        0.33,
        0.37
      ],
      "lean": -0.3,
      "drawLean": 0.3,
      "ruleSet": "v1"
    }
  },
  {
    "row": 3,
    "home": "הפועל ירושלים",
    "away": "בני סכנין",
    "league": "ליגת Winner",
    "kickoffAt": "2026-11-07T18:00:00+02:00",
    "status": "scheduled",
    "result": null,
    "scoreHome": null,
    "scoreAway": null,
    "combined": [
      0.44,
      0.3,
      0.26
    ],
    "spiritual": {
      "probs": [
        0.37,
        0.33,
        0.3
      ],
      "lean": 0.25,
      "drawLean": 0.2,
      "ruleSet": "v1"
    }
  },
  {
    "row": 4,
    "home": "מכבי חיפה",
    "away": "מכבי נתניה",
    "league": "ליגת Winner",
    "kickoffAt": "2026-11-07T17:30:00+02:00",
    "status": "scheduled",
    "result": null,
    "scoreHome": null,
    "scoreAway": null,
    "combined": [
      0.58,
      0.24,
      0.18
    ],
    "spiritual": {
      "probs": [
        0.4,
        0.32,
        0.28
      ],
      "lean": 0.4,
      "drawLean": 0.1,
      "ruleSet": "v1"
    }
  },
  {
    "row": 5,
    "home": "הפועל פתח תקוה",
    "away": "הפועל רמת גן",
    "league": "ליגת Winner",
    "kickoffAt": "2026-11-07T15:00:00+02:00",
    "status": "scheduled",
    "result": null,
    "scoreHome": null,
    "scoreAway": null,
    "combined": [
      0.47,
      0.29,
      0.24
    ],
    "spiritual": {
      "probs": [
        0.33,
        0.34,
        0.33
      ],
      "lean": -0.05,
      "drawLean": 0.4,
      "ruleSet": "v1"
    }
  },
  {
    "row": 6,
    "home": "מ.ס כפר קאסם",
    "away": "הפועל עפולה",
    "league": "ליגה לאומית",
    "kickoffAt": "2026-11-09T19:00:00+02:00",
    "status": "scheduled",
    "result": null,
    "scoreHome": null,
    "scoreAway": null,
    "combined": [
      0.38,
      0.33,
      0.29
    ],
    "spiritual": {
      "probs": [
        0.34,
        0.34,
        0.32
      ],
      "lean": 0.05,
      "drawLean": 0.4,
      "ruleSet": "v1"
    }
  },
  {
    "row": 7,
    "home": "הפועל כפר סבא",
    "away": "מכבי בני ריינה",
    "league": "ליגה לאומית",
    "kickoffAt": "2026-11-09T19:00:00+02:00",
    "status": "scheduled",
    "result": null,
    "scoreHome": null,
    "scoreAway": null,
    "combined": [
      0.45,
      0.3,
      0.25
    ],
    "spiritual": {
      "probs": [
        0.36,
        0.33,
        0.31
      ],
      "lean": 0.2,
      "drawLean": 0.2,
      "ruleSet": "v1"
    }
  },
  {
    "row": 8,
    "home": "פולהאם",
    "away": "ניוקאסל",
    "league": "פרמייר ליג",
    "kickoffAt": "2026-11-07T17:00:00+02:00",
    "status": "scheduled",
    "result": null,
    "scoreHome": null,
    "scoreAway": null,
    "combined": [
      0.36,
      0.27,
      0.37
    ],
    "spiritual": {
      "probs": [
        0.31,
        0.33,
        0.36
      ],
      "lean": -0.15,
      "drawLean": 0.3,
      "ruleSet": "v1"
    }
  },
  {
    "row": 9,
    "home": "מנצ'סטר יונייטד",
    "away": "אסטון וילה",
    "league": "פרמייר ליג",
    "kickoffAt": "2026-11-08T18:30:00+02:00",
    "status": "scheduled",
    "result": null,
    "scoreHome": null,
    "scoreAway": null,
    "combined": [
      0.43,
      0.26,
      0.31
    ],
    "spiritual": {
      "probs": [
        0.38,
        0.32,
        0.3
      ],
      "lean": 0.3,
      "drawLean": 0.2,
      "ruleSet": "v1"
    }
  },
  {
    "row": 10,
    "home": "מלאגה",
    "away": "ראסינג דה סנטנדר",
    "league": "ספרדית ראשונה",
    "kickoffAt": "2026-11-07T15:00:00+02:00",
    "status": "scheduled",
    "result": null,
    "scoreHome": null,
    "scoreAway": null,
    "combined": [
      0.35,
      0.33,
      0.32
    ],
    "spiritual": {
      "probs": [
        0.33,
        0.34,
        0.33
      ],
      "lean": 0.0,
      "drawLean": 0.5,
      "ruleSet": "v1"
    }
  },
  {
    "row": 11,
    "home": "אספניול",
    "away": "דפורטיבו לה קורוניה",
    "league": "ספרדית ראשונה",
    "kickoffAt": "2026-11-07T17:15:00+02:00",
    "status": "scheduled",
    "result": null,
    "scoreHome": null,
    "scoreAway": null,
    "combined": [
      0.46,
      0.29,
      0.25
    ],
    "spiritual": {
      "probs": [
        0.36,
        0.33,
        0.31
      ],
      "lean": 0.15,
      "drawLean": 0.3,
      "ruleSet": "v1"
    }
  },
  {
    "row": 12,
    "home": "אוסאסונה",
    "away": "אתלטיק בילבאו",
    "league": "ספרדית ראשונה",
    "kickoffAt": "2026-11-07T19:30:00+02:00",
    "status": "scheduled",
    "result": null,
    "scoreHome": null,
    "scoreAway": null,
    "combined": [
      0.34,
      0.31,
      0.35
    ],
    "spiritual": {
      "probs": [
        0.31,
        0.33,
        0.36
      ],
      "lean": -0.2,
      "drawLean": 0.3,
      "ruleSet": "v1"
    }
  },
  {
    "row": 13,
    "home": "אלצ'ה",
    "away": "ריאל בטיס",
    "league": "ספרדית ראשונה",
    "kickoffAt": "2026-11-08T15:00:00+02:00",
    "status": "scheduled",
    "result": null,
    "scoreHome": null,
    "scoreAway": null,
    "combined": [
      0.33,
      0.3,
      0.37
    ],
    "spiritual": {
      "probs": [
        0.29,
        0.33,
        0.38
      ],
      "lean": -0.35,
      "drawLean": 0.2,
      "ruleSet": "v1"
    }
  },
  {
    "row": 14,
    "home": "נאפולי",
    "away": "לאציו",
    "league": "איטלקית ראשונה",
    "kickoffAt": "2026-11-08T13:30:00+02:00",
    "status": "scheduled",
    "result": null,
    "scoreHome": null,
    "scoreAway": null,
    "combined": [
      0.49,
      0.28,
      0.23
    ],
    "spiritual": {
      "probs": [
        0.36,
        0.33,
        0.31
      ],
      "lean": 0.2,
      "drawLean": 0.2,
      "ruleSet": "v1"
    }
  },
  {
    "row": 15,
    "home": "ברסט",
    "away": "ליון",
    "league": "צרפתית ראשונה",
    "kickoffAt": "2026-11-08T18:15:00+02:00",
    "status": "scheduled",
    "result": null,
    "scoreHome": null,
    "scoreAway": null,
    "combined": [
      0.3,
      0.27,
      0.43
    ],
    "spiritual": {
      "probs": [
        0.3,
        0.33,
        0.37
      ],
      "lean": -0.25,
      "drawLean": 0.2,
      "ruleSet": "v1"
    }
  },
  {
    "row": 16,
    "home": "לה האבר",
    "away": "לוריין",
    "league": "צרפתית ראשונה",
    "kickoffAt": "2026-11-08T18:15:00+02:00",
    "status": "scheduled",
    "result": null,
    "scoreHome": null,
    "scoreAway": null,
    "combined": [
      0.32,
      0.31,
      0.37
    ],
    "spiritual": {
      "probs": [
        0.34,
        0.33,
        0.33
      ],
      "lean": 0.05,
      "drawLean": 0.4,
      "ruleSet": "v1"
    }
  }
] as unknown as MatchView[];

const previous = [
  {
    "row": 1,
    "home": "הפועל תל אביב",
    "away": "מכבי חיפה",
    "league": "ליגת Winner",
    "kickoffAt": "2026-11-02T20:30:00+02:00",
    "status": "played",
    "result": "1",
    "scoreHome": 2,
    "scoreAway": 1,
    "combined": null,
    "spiritual": null
  },
  {
    "row": 2,
    "home": "מכבי נתניה",
    "away": "הפועל ירושלים",
    "league": "ליגת Winner",
    "kickoffAt": "2026-10-31T19:30:00+02:00",
    "status": "played",
    "result": "X",
    "scoreHome": 1,
    "scoreAway": 1,
    "combined": null,
    "spiritual": null
  },
  {
    "row": 3,
    "home": "בני סכנין",
    "away": "עירוני טבריה",
    "league": "ליגת Winner",
    "kickoffAt": "2026-10-31T18:00:00+02:00",
    "status": "played",
    "result": "X",
    "scoreHome": 1,
    "scoreAway": 1,
    "combined": null,
    "spiritual": null
  },
  {
    "row": 4,
    "home": "הפועל חיפה",
    "away": "הפועל פתח תקוה",
    "league": "ליגת Winner",
    "kickoffAt": "2026-10-31T17:30:00+02:00",
    "status": "played",
    "result": "1",
    "scoreHome": 2,
    "scoreAway": 1,
    "combined": null,
    "spiritual": null
  },
  {
    "row": 5,
    "home": "מ.ס. אשדוד",
    "away": "בני יהודה ת\"א",
    "league": "ליגה לאומית",
    "kickoffAt": "2026-11-02T19:00:00+02:00",
    "status": "played",
    "result": "1",
    "scoreHome": 3,
    "scoreAway": 1,
    "combined": null,
    "spiritual": null
  },
  {
    "row": 6,
    "home": "מכבי קביליו יפו",
    "away": "הפועל כפר סבא",
    "league": "ליגה לאומית",
    "kickoffAt": "2026-11-02T19:00:00+02:00",
    "status": "played",
    "result": "2",
    "scoreHome": 0,
    "scoreAway": 3,
    "combined": null,
    "spiritual": null
  },
  {
    "row": 7,
    "home": "ליברפול",
    "away": "ארסנל",
    "league": "פרמייר ליג",
    "kickoffAt": "2026-11-01T18:30:00+02:00",
    "status": "played",
    "result": "2",
    "scoreHome": 0,
    "scoreAway": 1,
    "combined": null,
    "spiritual": null
  },
  {
    "row": 8,
    "home": "קובנטרי",
    "away": "סנדרלנד",
    "league": "פרמייר ליג",
    "kickoffAt": "2026-10-31T17:00:00+02:00",
    "status": "played",
    "result": "1",
    "scoreHome": 3,
    "scoreAway": 1,
    "combined": null,
    "spiritual": null
  },
  {
    "row": 9,
    "home": "האל",
    "away": "איפסוויץ'",
    "league": "פרמייר ליג",
    "kickoffAt": "2026-10-31T17:00:00+02:00",
    "status": "played",
    "result": "X",
    "scoreHome": 2,
    "scoreAway": 2,
    "combined": null,
    "spiritual": null
  },
  {
    "row": 10,
    "home": "בורנמות'",
    "away": "לידס",
    "league": "פרמייר ליג",
    "kickoffAt": "2026-10-31T17:00:00+02:00",
    "status": "played",
    "result": "1",
    "scoreHome": 2,
    "scoreAway": 0,
    "combined": null,
    "spiritual": null
  },
  {
    "row": 11,
    "home": "ראיו וייקאנו",
    "away": "סלטה ויגו",
    "league": "ספרדית ראשונה",
    "kickoffAt": "2026-10-31T17:15:00+02:00",
    "status": "played",
    "result": "1",
    "scoreHome": 3,
    "scoreAway": 0,
    "combined": null,
    "spiritual": null
  },
  {
    "row": 12,
    "home": "חטאפה",
    "away": "סביליה",
    "league": "ספרדית ראשונה",
    "kickoffAt": "2026-11-01T15:00:00+02:00",
    "status": "played",
    "result": "1",
    "scoreHome": 3,
    "scoreAway": 1,
    "combined": null,
    "spiritual": null
  },
  {
    "row": 13,
    "home": "אלצ'ה",
    "away": "ולנסיה",
    "league": "ספרדית ראשונה",
    "kickoffAt": "2026-11-01T19:30:00+02:00",
    "status": "played",
    "result": "2",
    "scoreHome": 0,
    "scoreAway": 1,
    "combined": null,
    "spiritual": null
  },
  {
    "row": 14,
    "home": "אתלטיק בילבאו",
    "away": "ריאל סוסיאדד",
    "league": "ספרדית ראשונה",
    "kickoffAt": "2026-11-01T22:00:00+02:00",
    "status": "played",
    "result": "1",
    "scoreHome": 2,
    "scoreAway": 1,
    "combined": null,
    "spiritual": null
  },
  {
    "row": 15,
    "home": "מילאן",
    "away": "אינטר",
    "league": "איטלקית ראשונה",
    "kickoffAt": "2026-10-31T21:45:00+02:00",
    "status": "played",
    "result": "1",
    "scoreHome": 3,
    "scoreAway": 1,
    "combined": null,
    "spiritual": null
  },
  {
    "row": 16,
    "home": "יובנטוס",
    "away": "נאפולי",
    "league": "איטלקית ראשונה",
    "kickoffAt": "2026-11-01T21:45:00+02:00",
    "status": "played",
    "result": "1",
    "scoreHome": 2,
    "scoreAway": 0,
    "combined": null,
    "spiritual": null
  }
] as unknown as MatchView[];

export const DEMO_ROUND: RoundView = {
  id: 264401,
  drawDate: '2026-11-07',
  closingAt: '2026-11-07T14:54:00+02:00',
  firstPrize: 12000000,
  status: 'closed',
  sourceUrl: 'https://www.winner.co.il/משחקים/ווינר-16/רגיל',
  isDemo: true,
  predictionsAt: '2026-11-20T09:00:00+02:00',
  matches: current,
};

export const DEMO_PREVIOUS: RoundView = {
  id: 264301,
  drawDate: '2026-10-31',
  closingAt: '2026-10-31T14:54:00+02:00',
  firstPrize: 12000000,
  status: 'verified',
  sourceUrl: 'https://www.winner.co.il/תוצאות/טוטו',
  isDemo: false,
  predictionsAt: null,
  matches: previous,
};

export const DEMO_PRIZES: PrizeTier[] = [
  { hits: 16, winners: 0, amount: 0 },
  { hits: 15, winners: 1, amount: 348157 },
  { hits: 14, winners: 12, amount: 3303 },
  { hits: 13, winners: 82, amount: 483 },
  { hits: 12, winners: 566, amount: 65 },
];

export const DEMO_PARAMS: ParamView[] = [
  {
    "id": "market",
    "name": "יחסי שוק (ללא מרווח, שיטת Shin)",
    "layer": "realistic",
    "state": "active",
    "weight": 0.7,
    "notes": "המנבא החזק ביותר במחקר"
  },
  {
    "id": "league_model",
    "name": "מודל ליגתי Dixon–Coles + pi-ratings",
    "layer": "realistic",
    "state": "active",
    "weight": 0.3,
    "notes": "מחליף את השוק כשאין יחסים"
  },
  {
    "id": "lineup",
    "name": "תיקון הרכב (פציעות, הרחקות)",
    "layer": "realistic",
    "state": "shadow",
    "weight": 0.0,
    "notes": "אין מחקר כמותי – נמדד"
  },
  {
    "id": "fans",
    "name": "אוהדים (נוכחות, דרבי)",
    "layer": "realistic",
    "state": "shadow",
    "weight": 0.0,
    "notes": null
  },
  {
    "id": "owners_real",
    "name": "בעלים (יציבות, שינויים)",
    "layer": "realistic",
    "state": "shadow",
    "weight": 0.0,
    "notes": null
  },
  {
    "id": "r1_event",
    "name": "R1 מפת אירוע (בית 1 מול 7)",
    "layer": "spiritual",
    "state": "shadow",
    "weight": 0.0,
    "notes": null
  },
  {
    "id": "r2_hour",
    "name": "R2 שעת כוכב (שצ\"ם חנכ\"ל)",
    "layer": "spiritual",
    "state": "shadow",
    "weight": 0.0,
    "notes": null
  },
  {
    "id": "r3_club",
    "name": "R3 מפות ייסוד",
    "layer": "spiritual",
    "state": "shadow",
    "weight": 0.0,
    "notes": null
  },
  {
    "id": "r4_people",
    "name": "R4 מפות אנשים (שחקנים, שוער, מאמן, בעלים)",
    "layer": "spiritual",
    "state": "shadow",
    "weight": 0.0,
    "notes": null
  },
  {
    "id": "r5_saadia",
    "name": "R5 גימטריה – נוסח רס\"ג",
    "layer": "spiritual",
    "state": "shadow",
    "weight": 0.0,
    "notes": "סט כללים v1"
  },
  {
    "id": "r5_gra",
    "name": "R5 גימטריה – נוסח הגר\"א (השוואה)",
    "layer": "spiritual",
    "state": "shadow",
    "weight": 0.0,
    "notes": "רץ בצל"
  },
  {
    "id": "sidereal",
    "name": "זודיאק סידרי (השוואה)",
    "layer": "spiritual",
    "state": "shadow",
    "weight": 0.0,
    "notes": "רץ בצל"
  }
] as ParamView[];

export const DEMO_SOURCES: SourceView[] = [
  {
    "id": "winner",
    "name": "winner.co.il",
    "tier": "official",
    "usedFor": "טפסים, תוצאות, פרסים",
    "url": "https://www.winner.co.il",
    "reliability": null,
    "sample": 0
  },
  {
    "id": "ifa",
    "name": "football.org.il (ההתאחדות)",
    "tier": "official",
    "usedFor": "סגלים, תאריכי לידה, טבלאות בישראל",
    "url": "https://www.football.org.il",
    "reliability": null,
    "sample": 0
  },
  {
    "id": "leagues",
    "name": "אתרי הליגות והמועדונים",
    "tier": "official",
    "usedFor": "סגלים, מאמנים, ייסוד",
    "url": null,
    "reliability": null,
    "sample": 0
  },
  {
    "id": "api_football",
    "name": "API-Football (שכבה חינמית)",
    "tier": "derived",
    "usedFor": "לייב, הרכבים, פציעות",
    "url": "https://www.api-football.com",
    "reliability": null,
    "sample": 0
  },
  {
    "id": "fd_couk",
    "name": "football-data.co.uk",
    "tier": "market",
    "usedFor": "תוצאות ויחסי סגירה",
    "url": "https://www.football-data.co.uk",
    "reliability": null,
    "sample": 0
  },
  {
    "id": "swisseph",
    "name": "Swiss Ephemeris",
    "tier": "computed",
    "usedFor": "מיקומי כוכבים",
    "url": "https://www.astro.com/swisseph/",
    "reliability": null,
    "sample": 0
  }
];

export const DEMO_DECISIONS: DecisionView[] = [
  {
    "id": "coverage",
    "topic": "כיסוי",
    "decision": "כל הליגות שבטפסים; מתחילים מאפס",
    "rationale": "נתוני הדרייב הדרום-אמריקאיים לא חופפים לליגות הטופס",
    "decidedAt": "2026-11-13"
  },
  {
    "id": "tool",
    "topic": "סוג המערכת",
    "decision": "כלי אישי בלבד",
    "rationale": "רישוי AGPL ונתונים לשימוש אישי",
    "decidedAt": "2026-11-13"
  },
  {
    "id": "data_budget",
    "topic": "תקציב נתונים",
    "decision": "שכבות חינמיות; Sportmonks רק אם יחסרו נתונים לליגה הישראלית",
    "rationale": "Sportmonks €29 מכסה רק 5 ליגות",
    "decidedAt": "2026-11-13"
  },
  {
    "id": "weekly_fill",
    "topic": "מילוי שבועי",
    "decision": "2 טפסים = 20 טורים (60 ₪) + 4–5 בנקרים לווינר ליין",
    "rationale": null,
    "decidedAt": "2026-11-13"
  },
  {
    "id": "success",
    "topic": "מדד הצלחה",
    "decision": "דיוק, פגיעה וחיזוי מדויק בלבד – לא כסף",
    "rationale": "אין הערכת סימוני ציבור, אין מסווג קופה, אין מדד רווח",
    "decidedAt": "2026-11-13"
  },
  {
    "id": "protocol",
    "topic": "פרוטוקול מחזור",
    "decision": "מחקר מלא מחדש בכל מחזור: שחקן → שוער → מאמן → בעלים → אוהדים → קבוצה → תאריך ומיקום → סינתזה",
    "rationale": null,
    "decidedAt": "2026-11-13"
  },
  {
    "id": "layers",
    "topic": "שכבות נתונים",
    "decision": "קבוע / משתנה / יומן שינויים",
    "rationale": null,
    "decidedAt": "2026-11-13"
  },
  {
    "id": "learning",
    "topic": "מנגנון למידה",
    "decision": "מרשם פרמטרים, בדיקות הסרה, אמינות מקורות, מצב צל",
    "rationale": "מעבר לדאטה שלנו לפי ביצועים מדודים",
    "decidedAt": "2026-11-13"
  },
  {
    "id": "zodiac",
    "topic": "זודיאק",
    "decision": "טרופי",
    "rationale": "תואם למסמכי הדרייב; סידרי בצל",
    "decidedAt": "2026-11-13"
  },
  {
    "id": "houses",
    "topic": "בתים ואורבים",
    "decision": "Whole Sign; 8° היבטים, 3° מעברים",
    "rationale": null,
    "decidedAt": "2026-11-13"
  },
  {
    "id": "sefer_yetzirah",
    "topic": "ספר יצירה",
    "decision": "נוסח רס\"ג",
    "rationale": "קדום, עקבי, תואם לשצ\"ם חנכ\"ל; הגר\"א בצל",
    "decidedAt": "2026-11-13"
  },
  {
    "id": "spiritual_weight",
    "topic": "משקל רוחני",
    "decision": "0 עד הוכחת שיפור בבדיקה בדיעבד",
    "rationale": null,
    "decidedAt": "2026-11-13"
  }
];

export const DEMO_RULESET: RuleSetView = {
  version: 'v1',
  zodiac: 'tropical',
  houseSystem: 'whole_sign',
  orbAspect: 8,
  orbTransit: 3,
  seferYetzirah: 'saadia',
  letterPlanet: { ב: 'שבתאי', ג: 'צדק', ד: 'מאדים', כ: 'חמה', פ: 'נוגה', ר: 'כוכב', ת: 'לבנה' },
  weights: { club: 0.15, coach: 0.15, goalkeeper: 0.15, outfield10: 0.3, owners: 0.1, gematria: 0.15 },
  spiritualLambda: 0,
};
