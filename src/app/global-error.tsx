'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ fontFamily: 'Arial, sans-serif', padding: 24 }}>
        <h1>אירעה תקלה כללית</h1>
        <button onClick={reset} style={{ minHeight: 44, padding: '0 16px' }}>
          ניסיון נוסף
        </button>
      </body>
    </html>
  );
}
