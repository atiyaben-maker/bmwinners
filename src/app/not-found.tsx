import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">העמוד לא נמצא</h1>
        <p className="mt-1 text-ink-2">ייתכן שהקישור שגוי או שהעמוד הוסר.</p>
        <Link href="/" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-ink px-4 text-white">
          ללוח המחזור
        </Link>
      </div>
    </main>
  );
}
