'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useId, useRef, useState } from 'react';

export interface TabDef {
  id: string;
  label: string;
  content: React.ReactNode;
}

/**
 * WAI-ARIA APG tabs (automatic activation). Selected tab is mirrored to ?tab= so it survives
 * refresh/back. Arrow keys follow the visual order in RTL (ArrowLeft = next).
 */
export function Tabs({ tabs, initial, label }: { tabs: TabDef[]; initial: string; label: string }) {
  const [active, setActive] = useState(tabs.some((t) => t.id === initial) ? initial : tabs[0].id);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const base = useId();

  function select(id: string, focus = false) {
    setActive(id);
    const i = tabs.findIndex((t) => t.id === id);
    if (focus) refs.current[i]?.focus();
    const sp = new URLSearchParams(params.toString());
    sp.set('tab', id);
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  function onKey(e: React.KeyboardEvent, i: number) {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const nextKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    const prevKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    let j: number | null = null;
    if (e.key === nextKey) j = (i + 1) % tabs.length;
    else if (e.key === prevKey) j = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = tabs.length - 1;
    if (j == null) return;
    e.preventDefault();
    select(tabs[j].id, true);
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-line px-2">
        {tabs.map((t, i) => {
          const sel = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              id={`${base}-tab-${t.id}`}
              aria-selected={sel}
              aria-controls={`${base}-panel-${t.id}`}
              tabIndex={sel ? 0 : -1}
              onClick={() => select(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`-mb-px min-h-11 shrink-0 whitespace-nowrap border-b-[3px] px-3 text-sm ${
                sel ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink-2 hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={t.id !== active}
          className="min-w-0"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
