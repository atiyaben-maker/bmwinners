-- BM Winners – seed data from the work plan (status doc 13.11.2026) and official winner.co.il data
-- Demo predictions are flagged is_demo = true and are replaced by the real pipeline.

insert into public.leagues (code, name_he, country, official_url) values
  ('IL1', 'ליגת Winner', 'Israel', 'https://www.football.org.il'),
  ('IL2', 'ליגה לאומית', 'Israel', 'https://www.football.org.il'),
  ('EPL', 'פרמייר ליג', 'England', 'https://www.premierleague.com'),
  ('ESP', 'ספרדית ראשונה', 'Spain', 'https://www.laliga.com'),
  ('ITA', 'איטלקית ראשונה', 'Italy', 'https://www.legaseriea.it'),
  ('GER', 'גרמנית ראשונה', 'Germany', 'https://www.bundesliga.com'),
  ('FRA', 'צרפתית ראשונה', 'France', 'https://www.ligue1.com')
on conflict do nothing;

insert into public.rule_sets (version, zodiac, house_system, orb_aspect, orb_transit, sefer_yetzirah, letter_planet, club_birth_rule, gematria_rule, weights, spiritual_lambda) values (
  'v1', 'tropical', 'whole_sign', 8, 3, 'saadia',
  '{"ב":"שבתאי","ג":"צדק","ד":"מאדים","כ":"חמה","פ":"נוגה","ר":"כוכב","ת":"לבנה"}'::jsonb,
  'original official founding date stated by the club',
  'every person by full Hebrew name; team by its name on the Winner form',
  '{"club":0.15,"coach":0.15,"goalkeeper":0.15,"outfield10":0.30,"owners":0.10,"gematria":0.15}'::jsonb,
  0
) on conflict do nothing;

insert into public.params (id, name_he, layer, state, weight, notes) values
  ('market', 'יחסי שוק (ללא מרווח, שיטת Shin)', 'realistic', 'active', 0.70, 'המנבא החזק ביותר במחקר'),
  ('league_model', 'מודל ליגתי Dixon–Coles + pi-ratings', 'realistic', 'active', 0.30, 'מחליף את השוק כשאין יחסים'),
  ('lineup', 'תיקון הרכב (פציעות, הרחקות)', 'realistic', 'shadow', 0, 'אין מחקר כמותי – נמדד'),
  ('fans', 'אוהדים (נוכחות, דרבי)', 'realistic', 'shadow', 0, null),
  ('owners_real', 'בעלים (יציבות, שינויים)', 'realistic', 'shadow', 0, null),
  ('r1_event', 'R1 מפת אירוע (בית 1 מול 7)', 'spiritual', 'shadow', 0, null),
  ('r2_hour', 'R2 שעת כוכב (שצ"ם חנכ"ל)', 'spiritual', 'shadow', 0, null),
  ('r3_club', 'R3 מפות ייסוד', 'spiritual', 'shadow', 0, null),
  ('r4_people', 'R4 מפות אנשים (שחקנים, שוער, מאמן, בעלים)', 'spiritual', 'shadow', 0, null),
  ('r5_saadia', 'R5 גימטריה – נוסח רס"ג', 'spiritual', 'shadow', 0, 'סט כללים v1'),
  ('r5_gra', 'R5 גימטריה – נוסח הגר"א (השוואה)', 'spiritual', 'shadow', 0, 'רץ בצל'),
  ('sidereal', 'זודיאק סידרי (השוואה)', 'spiritual', 'shadow', 0, 'רץ בצל')
on conflict do nothing;

insert into public.sources (id, name, tier, used_for, url) values
  ('winner', 'winner.co.il', 'official', 'טפסים, תוצאות, פרסים', 'https://www.winner.co.il'),
  ('ifa', 'football.org.il (ההתאחדות)', 'official', 'סגלים, תאריכי לידה, טבלאות בישראל', 'https://www.football.org.il'),
  ('leagues', 'אתרי הליגות והמועדונים', 'official', 'סגלים, מאמנים, ייסוד', null),
  ('api_football', 'API-Football (שכבה חינמית)', 'derived', 'לייב, הרכבים, פציעות', 'https://www.api-football.com'),
  ('fd_couk', 'football-data.co.uk', 'market', 'תוצאות ויחסי סגירה', 'https://www.football-data.co.uk'),
  ('swisseph', 'Swiss Ephemeris', 'computed', 'מיקומי כוכבים', 'https://www.astro.com/swisseph/')
on conflict do nothing;

insert into public.decisions (id, topic, decision, rationale, decided_at) values
  ('coverage', 'כיסוי', 'כל הליגות שבטפסים; מתחילים מאפס', 'נתוני הדרייב הדרום-אמריקאיים לא חופפים לליגות הטופס', '2026-11-13'),
  ('tool', 'סוג המערכת', 'כלי אישי בלבד', 'רישוי AGPL ונתונים לשימוש אישי', '2026-11-13'),
  ('data_budget', 'תקציב נתונים', 'שכבות חינמיות; Sportmonks רק אם יחסרו נתונים לליגה הישראלית', 'Sportmonks €29 מכסה רק 5 ליגות', '2026-11-13'),
  ('weekly_fill', 'מילוי שבועי', '2 טפסים = 20 טורים (60 ₪) + 4–5 בנקרים לווינר ליין', null, '2026-11-13'),
  ('success', 'מדד הצלחה', 'דיוק, פגיעה וחיזוי מדויק בלבד – לא כסף', 'אין הערכת סימוני ציבור, אין מסווג קופה, אין מדד רווח', '2026-11-13'),
  ('protocol', 'פרוטוקול מחזור', 'מחקר מלא מחדש בכל מחזור: שחקן → שוער → מאמן → בעלים → אוהדים → קבוצה → תאריך ומיקום → סינתזה', null, '2026-11-13'),
  ('layers', 'שכבות נתונים', 'קבוע / משתנה / יומן שינויים', null, '2026-11-13'),
  ('learning', 'מנגנון למידה', 'מרשם פרמטרים, בדיקות הסרה, אמינות מקורות, מצב צל', 'מעבר לדאטה שלנו לפי ביצועים מדודים', '2026-11-13'),
  ('zodiac', 'זודיאק', 'טרופי', 'תואם למסמכי הדרייב; סידרי בצל', '2026-11-13'),
  ('houses', 'בתים ואורבים', 'Whole Sign; 8° היבטים, 3° מעברים', null, '2026-11-13'),
  ('sefer_yetzirah', 'ספר יצירה', 'נוסח רס"ג', 'קדום, עקבי, תואם לשצ"ם חנכ"ל; הגר"א בצל', '2026-11-13'),
  ('spiritual_weight', 'משקל רוחני', '0 עד הוכחת שיפור בבדיקה בדיעבד', null, '2026-11-13')
on conflict do nothing;

-- ── round 264301 (31.10.2026) – official verified results and prize table (winner.co.il, 03.11.2026)
insert into public.rounds (id, draw_date, closing_at, first_prize, status, source_url) values
  (264301, '2026-10-31', '2026-10-31 14:54+02', 12000000, 'verified', 'https://www.winner.co.il/תוצאות/טוטו')
on conflict do nothing;

insert into public.round_matches (round_id, row_no, form_home, form_away, league_label, kickoff_at, status, result, score_home, score_away) values
  (264301, 1, 'הפועל תל אביב', 'מכבי חיפה', 'ליגת Winner', '2026-11-02 20:30+02', 'played', '1', 2, 1),
  (264301, 2, 'מכבי נתניה', 'הפועל ירושלים', 'ליגת Winner', '2026-10-31 19:30+02', 'played', 'X', 1, 1),
  (264301, 3, 'בני סכנין', 'עירוני טבריה', 'ליגת Winner', '2026-10-31 18:00+02', 'played', 'X', 1, 1),
  (264301, 4, 'הפועל חיפה', 'הפועל פתח תקוה', 'ליגת Winner', '2026-10-31 17:30+02', 'played', '1', 2, 1),
  (264301, 5, 'מ.ס. אשדוד', 'בני יהודה ת"א', 'ליגה לאומית', '2026-11-02 19:00+02', 'played', '1', 3, 1),
  (264301, 6, 'מכבי קביליו יפו', 'הפועל כפר סבא', 'ליגה לאומית', '2026-11-02 19:00+02', 'played', '2', 0, 3),
  (264301, 7, 'ליברפול', 'ארסנל', 'פרמייר ליג', '2026-11-01 18:30+02', 'played', '2', 0, 1),
  (264301, 8, 'קובנטרי', 'סנדרלנד', 'פרמייר ליג', '2026-10-31 17:00+02', 'played', '1', 3, 1),
  (264301, 9, 'האל', 'איפסוויץ''', 'פרמייר ליג', '2026-10-31 17:00+02', 'played', 'X', 2, 2),
  (264301, 10, 'בורנמות''', 'לידס', 'פרמייר ליג', '2026-10-31 17:00+02', 'played', '1', 2, 0),
  (264301, 11, 'ראיו וייקאנו', 'סלטה ויגו', 'ספרדית ראשונה', '2026-10-31 17:15+02', 'played', '1', 3, 0),
  (264301, 12, 'חטאפה', 'סביליה', 'ספרדית ראשונה', '2026-11-01 15:00+02', 'played', '1', 3, 1),
  (264301, 13, 'אלצ''ה', 'ולנסיה', 'ספרדית ראשונה', '2026-11-01 19:30+02', 'played', '2', 0, 1),
  (264301, 14, 'אתלטיק בילבאו', 'ריאל סוסיאדד', 'ספרדית ראשונה', '2026-11-01 22:00+02', 'played', '1', 2, 1),
  (264301, 15, 'מילאן', 'אינטר', 'איטלקית ראשונה', '2026-10-31 21:45+02', 'played', '1', 3, 1),
  (264301, 16, 'יובנטוס', 'נאפולי', 'איטלקית ראשונה', '2026-11-01 21:45+02', 'played', '1', 2, 0)
on conflict do nothing;

insert into public.prize_tiers (round_id, hits, winners, amount, total) values
  (264301, 16, 0, 0, 12000000),
  (264301, 15, 1, 348157, 348157),
  (264301, 14, 12, 3303, 39630),
  (264301, 13, 82, 483, 39630),
  (264301, 12, 566, 65, 36987)
on conflict do nothing;

-- ── round 264401 (07.11.2026) – official form (winner.co.il); results to be ingested
insert into public.rounds (id, draw_date, closing_at, first_prize, status, source_url) values
  (264401, '2026-11-07', '2026-11-07 14:54+02', 12000000, 'closed', 'https://www.winner.co.il/משחקים/ווינר-16/רגיל')
on conflict do nothing;

insert into public.round_matches (round_id, row_no, form_home, form_away, league_label, kickoff_at) values
  (264401, 1, 'הפועל באר שבע', 'הפועל תל אביב', 'ליגת Winner', '2026-11-08 20:30+02'),
  (264401, 2, 'עירוני קרית שמונה', 'הפועל חיפה', 'ליגת Winner', '2026-11-07 18:00+02'),
  (264401, 3, 'הפועל ירושלים', 'בני סכנין', 'ליגת Winner', '2026-11-07 18:00+02'),
  (264401, 4, 'מכבי חיפה', 'מכבי נתניה', 'ליגת Winner', '2026-11-07 17:30+02'),
  (264401, 5, 'הפועל פתח תקוה', 'הפועל רמת גן', 'ליגת Winner', '2026-11-07 15:00+02'),
  (264401, 6, 'מ.ס כפר קאסם', 'הפועל עפולה', 'ליגה לאומית', '2026-11-09 19:00+02'),
  (264401, 7, 'הפועל כפר סבא', 'מכבי בני ריינה', 'ליגה לאומית', '2026-11-09 19:00+02'),
  (264401, 8, 'פולהאם', 'ניוקאסל', 'פרמייר ליג', '2026-11-07 17:00+02'),
  (264401, 9, 'מנצ''סטר יונייטד', 'אסטון וילה', 'פרמייר ליג', '2026-11-08 18:30+02'),
  (264401, 10, 'מלאגה', 'ראסינג דה סנטנדר', 'ספרדית ראשונה', '2026-11-07 15:00+02'),
  (264401, 11, 'אספניול', 'דפורטיבו לה קורוניה', 'ספרדית ראשונה', '2026-11-07 17:15+02'),
  (264401, 12, 'אוסאסונה', 'אתלטיק בילבאו', 'ספרדית ראשונה', '2026-11-07 19:30+02'),
  (264401, 13, 'אלצ''ה', 'ריאל בטיס', 'ספרדית ראשונה', '2026-11-08 15:00+02'),
  (264401, 14, 'נאפולי', 'לאציו', 'איטלקית ראשונה', '2026-11-08 13:30+02'),
  (264401, 15, 'ברסט', 'ליון', 'צרפתית ראשונה', '2026-11-08 18:15+02'),
  (264401, 16, 'לה האבר', 'לוריין', 'צרפתית ראשונה', '2026-11-08 18:15+02')
on conflict do nothing;

-- demo predictions (is_demo = true) so the board can be reviewed before the pipeline runs
insert into public.predictions (round_id, row_no, layer, p1, px, p2, is_demo) values
  (264401,1,'combined',.41,.29,.30,true),(264401,2,'combined',.33,.32,.35,true),(264401,3,'combined',.44,.30,.26,true),
  (264401,4,'combined',.58,.24,.18,true),(264401,5,'combined',.47,.29,.24,true),(264401,6,'combined',.38,.33,.29,true),
  (264401,7,'combined',.45,.30,.25,true),(264401,8,'combined',.36,.27,.37,true),(264401,9,'combined',.43,.26,.31,true),
  (264401,10,'combined',.35,.33,.32,true),(264401,11,'combined',.46,.29,.25,true),(264401,12,'combined',.34,.31,.35,true),
  (264401,13,'combined',.33,.30,.37,true),(264401,14,'combined',.49,.28,.23,true),(264401,15,'combined',.30,.27,.43,true),
  (264401,16,'combined',.32,.31,.37,true);

insert into public.predictions (round_id, row_no, layer, p1, px, p2, lean, draw_lean, rule_set, is_demo) values
  (264401,1,'spiritual',.34,.33,.33,.10,.2,'v1',true),(264401,2,'spiritual',.30,.33,.37,-.30,.3,'v1',true),
  (264401,3,'spiritual',.37,.33,.30,.25,.2,'v1',true),(264401,4,'spiritual',.40,.32,.28,.40,.1,'v1',true),
  (264401,5,'spiritual',.33,.34,.33,-.05,.4,'v1',true),(264401,6,'spiritual',.34,.34,.32,.05,.4,'v1',true),
  (264401,7,'spiritual',.36,.33,.31,.20,.2,'v1',true),(264401,8,'spiritual',.31,.33,.36,-.15,.3,'v1',true),
  (264401,9,'spiritual',.38,.32,.30,.30,.2,'v1',true),(264401,10,'spiritual',.33,.34,.33,0,.5,'v1',true),
  (264401,11,'spiritual',.36,.33,.31,.15,.3,'v1',true),(264401,12,'spiritual',.31,.33,.36,-.20,.3,'v1',true),
  (264401,13,'spiritual',.29,.33,.38,-.35,.2,'v1',true),(264401,14,'spiritual',.36,.33,.31,.20,.2,'v1',true),
  (264401,15,'spiritual',.30,.33,.37,-.25,.2,'v1',true),(264401,16,'spiritual',.34,.33,.33,.05,.4,'v1',true);
