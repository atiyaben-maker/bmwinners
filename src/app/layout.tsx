import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

// Self-hosted variable fonts (no external request, no layout shift). Each script is its own
// file; the CSS stack falls back per glyph, so Hebrew and Latin each load only when used.
const heeboHebrew = localFont({
  src: '../../node_modules/@fontsource-variable/heebo/files/heebo-hebrew-wght-normal.woff2',
  variable: '--font-heebo-hebrew',
  weight: '100 900',
  display: 'swap',
  preload: true,
});
const heeboLatin = localFont({
  src: '../../node_modules/@fontsource-variable/heebo/files/heebo-latin-wght-normal.woff2',
  variable: '--font-heebo-latin',
  weight: '100 900',
  display: 'swap',
  preload: false,
});
const rubikHebrew = localFont({
  src: '../../node_modules/@fontsource-variable/rubik/files/rubik-hebrew-wght-normal.woff2',
  variable: '--font-rubik-hebrew',
  weight: '300 900',
  display: 'swap',
  preload: false,
});
const rubikLatin = localFont({
  src: '../../node_modules/@fontsource-variable/rubik/files/rubik-latin-wght-normal.woff2',
  variable: '--font-rubik-latin',
  weight: '300 900',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: { default: 'BM Winners', template: '%s · BM Winners' },
  description: 'מערכת אישית לניתוח טופסי ווינר 16',
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f5f6f3',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heeboHebrew.variable} ${heeboLatin.variable} ${rubikHebrew.variable} ${rubikLatin.variable}`}
    >
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-ink px-4 py-3 text-white focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
        >
          דלג לתוכן הראשי
        </a>
        {children}
      </body>
    </html>
  );
}
