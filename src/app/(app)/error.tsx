'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-lg rounded-xl border border-danger/30 bg-danger-soft p-5">
      <h1 className="text-lg font-bold text-danger">טעינת הנתונים נכשלה</h1>
      <p className="mt-1 text-sm">
        לא הצלחנו לקרוא ממסד הנתונים. הנתונים לא נמחקו – זו תקלת חיבור או הרשאה.
        {error.digest && (
          <span className="block text-xs text-ink-2">
            קוד תקלה: <span dir="ltr">{error.digest}</span>
          </span>
        )}
      </p>
      <button onClick={reset} className="mt-3 min-h-11 rounded-lg bg-ink px-4 text-sm font-medium text-white">
        ניסיון נוסף
      </button>
    </div>
  );
}
