'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/', label: 'לוח מחזור', short: 'מחזור', icon: 'M4 5h16M4 10h16M4 15h16M4 20h10' },
  { href: '/teams', label: 'קבוצות ומפות', short: 'קבוצות', icon: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z' },
  { href: '/learning', label: 'מדידה ולמידה', short: 'מדידה', icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
  { href: '/plan', label: 'תוכנית עבודה', short: 'תוכנית', icon: 'M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6' },
] as const;

function Icon({ d }: { d: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function isActive(path: string, href: string) {
  return href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);
}

export function SideNav() {
  const path = usePathname();
  return (
    <nav aria-label="ניווט ראשי">
      <ul className="space-y-1">
        {ITEMS.map((it) => {
          const active = isActive(path, it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-[0.95rem] ${
                  active ? 'bg-ink font-medium text-white' : 'text-ink-2 hover:bg-ground hover:text-ink'
                }`}
              >
                <Icon d={it.icon} />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="ניווט ראשי"
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {ITEMS.map((it) => {
          const active = isActive(path, it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs ${
                  active ? 'font-semibold text-ink' : 'text-ink-2'
                }`}
              >
                <span className={`grid h-7 w-12 place-items-center rounded-full ${active ? 'bg-ink text-white' : ''}`}>
                  <Icon d={it.icon} />
                </span>
                {it.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
