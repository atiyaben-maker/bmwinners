import type { Metadata } from 'next';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import { Suspense } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, LoadingRegion, PageHeader } from '@/components/ui';
import { fmtDate } from '@/lib/format';
import { getDecisions, getRuleSet } from '@/server/data';

export const metadata: Metadata = { title: 'תוכנית עבודה' };
type SP = Promise<Record<string, string | string[] | undefined>>;

const DOCS = {
  status: { file: 'status.md', label: 'סטטוס והחלטות' },
  spec: { file: 'spec.md', label: 'אפיון מלא' },
} as const;
type DocId = keyof typeof DOCS;

// Plan documents are versioned in the repo (content/*.md) – the system works by them.
async function loadDoc(id: DocId): Promise<string> {
  'use cache';
  return readFile(path.join(process.cwd(), 'content', DOCS[id].file), 'utf8');
}

function slug(text: string) {
  return (
    'h-' +
    text
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-')
      .slice(0, 60)
  );
}

function textOf(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node && typeof node === 'object' && 'props' in node) return textOf((node as { props: { children?: React.ReactNode } }).props.children);
  return '';
}

const md: Components = {
  h1: ({ children }) => <h2 className="mt-2 mb-3 text-xl font-bold">{children}</h2>,
  h2: ({ children }) => (
    <h3 id={slug(textOf(children))} className="mt-8 mb-2 scroll-mt-20 border-b border-line pb-1 text-lg font-bold">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 id={slug(textOf(children))} className="mt-5 mb-1.5 scroll-mt-20 font-bold">
      {children}
    </h4>
  ),
  p: ({ children }) => <p className="my-2.5">{children}</p>,
  // GFM task-list checkboxes are read-only status marks, not form controls
  input: ({ checked }) => (
    <span className="me-1.5">
      <span aria-hidden>{checked ? '☑' : '☐'}</span>
      <span className="sr-only">{checked ? 'הושלם:' : 'פתוח:'}</span>
    </span>
  ),
  ul: ({ children }) => <ul className="my-2.5 list-disc space-y-1 ps-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2.5 list-decimal space-y-1 ps-5">{children}</ol>,
  a: ({ href, children }) => (
    <a href={href} className="break-words text-real underline underline-offset-2" target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code dir="ltr" className="rounded bg-ground px-1 py-0.5 text-[0.85em] wrap-anywhere">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre dir="ltr" tabIndex={0} aria-label="נוסחה" className="my-3 max-w-full overflow-x-auto rounded-lg bg-ground p-3 text-start text-sm [&>code]:bg-transparent [&>code]:p-0 [&>code]:[overflow-wrap:normal]">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => <blockquote className="my-3 border-s-4 border-line-strong ps-3 text-ink-2">{children}</blockquote>,
  table: ({ children }) => (
    <div role="region" aria-label="טבלה" tabIndex={0} className="scroll-region my-3 rounded-lg border border-line">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-line-strong bg-ground px-3 py-1.5 text-start align-bottom font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-t border-line px-3 py-1.5 align-top">{children}</td>,
};

export default function PlanPage({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageHeader title="תוכנית עבודה" eyebrow="המסמכים שלפיהם המערכת פועלת · מנוהלים בגרסאות במאגר הקוד" />
      <Suspense fallback={<LoadingRegion label="טוען את תוכנית העבודה" rows={14} />}>
        <Plan searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Plan({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const doc: DocId = sp.doc === 'spec' ? 'spec' : 'status';
  const [decisions, ruleSet, body] = await Promise.all([getDecisions(), getRuleSet(), loadDoc(doc)]);
  const toc = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());

  return (
    <div className="space-y-4">
      <nav aria-label="מסמכי התוכנית" className="flex flex-wrap gap-2">
        {(Object.keys(DOCS) as DocId[]).map((id) => (
          <Link
            key={id}
            href={`/plan?doc=${id}`}
            aria-current={id === doc ? 'page' : undefined}
            className={`inline-flex min-h-11 items-center rounded-lg border px-4 text-sm ${id === doc ? 'border-ink bg-ink font-medium text-white' : 'border-line bg-surface hover:bg-ground'}`}
          >
            {DOCS[id].label}
          </Link>
        ))}
      </nav>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="min-w-0 rounded-xl border border-line bg-surface px-4 py-4 sm:px-6">
          <div className="max-w-[72ch] leading-relaxed break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
              {body}
            </ReactMarkdown>
          </div>
        </article>

        <div className="space-y-4 xl:sticky xl:top-6 xl:max-h-[calc(100dvh-3rem)] xl:overflow-y-auto">
          {toc.length > 3 && (
            <Card title="תוכן עניינים" id="toc">
              <ol className="space-y-0.5 px-2 py-2 text-sm">
                {toc.map((h) => (
                  <li key={h}>
                    <a href={`#${slug(h)}`} className="block rounded-md px-2 py-1.5 hover:bg-ground">
                      {h}
                    </a>
                  </li>
                ))}
              </ol>
            </Card>
          )}
          <Card title={`החלטות נעולות (${decisions.length})`} id="decisions">
            <ul className="divide-y divide-line text-sm">
              {decisions.map((d) => (
                <li key={d.id} className="px-4 py-2">
                  <p className="font-medium">{d.topic}</p>
                  <p>{d.decision}</p>
                  <p className="text-xs text-ink-2">
                    {d.rationale ? `${d.rationale} · ` : ''}
                    <span className="num">{fmtDate(d.decidedAt)}</span>
                  </p>
                </li>
              ))}
            </ul>
          </Card>
          <Card title={`סט כללים רוחני ${ruleSet.version}`} id="ruleset">
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 px-4 py-3 text-sm">
              <dt className="text-ink-2">זודיאק</dt>
              <dd>{ruleSet.zodiac === 'tropical' ? 'טרופי' : ruleSet.zodiac}</dd>
              <dt className="text-ink-2">בתים</dt>
              <dd dir="ltr" className="text-start">Whole Sign</dd>
              <dt className="text-ink-2">אורבים</dt>
              <dd className="num">
                {ruleSet.orbAspect}° היבטים · {ruleSet.orbTransit}° מעברים
              </dd>
              <dt className="text-ink-2">ספר יצירה</dt>
              <dd>{ruleSet.seferYetzirah === 'saadia' ? 'נוסח רס"ג (הגר"א בצל)' : ruleSet.seferYetzirah}</dd>
              <dt className="text-ink-2">משקל λ</dt>
              <dd className="num">{ruleSet.spiritualLambda}</dd>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
