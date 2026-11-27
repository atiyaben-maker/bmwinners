import type { Metadata, Viewport } from 'next';
// Self-hosted variable fonts via Fontsource CSS: each script is its own @font-face with a
// unicode-range, so Hebrew and Latin glyphs each use Heebo/Rubik and load only when needed.
// (next/font/local with one file per script inserted an Arial fallback that swallowed Hebrew.)
import '@fontsource-variable/heebo/wght.css';
import '@fontsource-variable/rubik/wght.css';
import './globals.css';

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
    <html lang="he" dir="rtl">
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
