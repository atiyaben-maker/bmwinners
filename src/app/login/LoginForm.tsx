'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { sendCode, verifyCode, type LoginState } from './actions';

const initial: LoginState = { step: 'email', email: '', message: null, error: null };
const RESEND_AFTER = 60;

export function LoginForm({ next, initialError }: { next: string; initialError: string | null }) {
  const [sendState, send, sending] = useActionState(sendCode, { ...initial, error: initialError });
  const [verifyState, verify, verifying] = useActionState(verifyCode, initial);
  const [editing, setEditing] = useState(false);
  const [wait, setWait] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  const onCodeStep = sendState.step === 'code' && !editing;
  const email = sendState.email;
  const state = onCodeStep && (verifyState.error || verifyState.message) ? verifyState : sendState;

  useEffect(() => {
    if (!onCodeStep) return;
    codeRef.current?.focus();
    setWait(RESEND_AFTER);
    const t = setInterval(() => setWait((w) => (w > 0 ? w - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [onCodeStep, sendState]);

  const errorId = 'login-error';
  const statusId = 'login-status';

  return (
    <div className="space-y-5">
      <p id={statusId} role="status" aria-live="polite" className="min-h-0 text-sm text-ink-2 empty:hidden">
        {state.message}
      </p>
      <p id={errorId} role="alert" className="text-sm font-medium text-danger empty:hidden">
        {state.error}
      </p>

      {!onCodeStep ? (
        <form action={(fd) => { setEditing(false); send(fd); }} className="space-y-4" noValidate>
          <input type="hidden" name="next" value={next} />
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium">
              כתובת אימייל
            </label>
            <input
              id="email"
              name="email"
              type="email"
              dir="ltr"
              required
              autoComplete="email"
              inputMode="email"
              defaultValue={email}
              aria-invalid={Boolean(sendState.error) || undefined}
              aria-describedby={sendState.error ? errorId : undefined}
              className="block h-12 w-full rounded-lg border border-line-strong bg-surface px-3 text-base text-start shadow-xs placeholder:text-ink-3"
              placeholder="name@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="h-12 w-full rounded-lg bg-ink px-4 font-medium text-white hover:bg-ink/90 disabled:opacity-60"
          >
            {sending ? 'שולח…' : 'שלחו לי קוד כניסה'}
          </button>
        </form>
      ) : (
        <form action={verify} className="space-y-4" noValidate>
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="email" value={email} />
          <p className="text-sm">
            הקוד נשלח אל <bdi dir="ltr" className="font-medium break-all">{email}</bdi>
          </p>
          <div className="space-y-1.5">
            <label htmlFor="token" className="block text-sm font-medium">
              קוד בן 6 ספרות
            </label>
            <input
              ref={codeRef}
              id="token"
              name="token"
              dir="ltr"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              required
              aria-invalid={Boolean(verifyState.error) || undefined}
              aria-describedby={verifyState.error ? errorId : undefined}
              className="num block h-12 w-full rounded-lg border border-line-strong bg-surface px-3 text-center text-xl tracking-[0.4em]"
            />
          </div>
          <button
            type="submit"
            disabled={verifying}
            className="h-12 w-full rounded-lg bg-ink px-4 font-medium text-white hover:bg-ink/90 disabled:opacity-60"
          >
            {verifying ? 'בודק…' : 'כניסה'}
          </button>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <button type="button" onClick={() => setEditing(true)} className="min-h-11 px-1 underline underline-offset-4">
              שינוי כתובת
            </button>
            <button
              type="submit"
              formAction={send}
              disabled={wait > 0 || sending}
              className="min-h-11 px-1 underline underline-offset-4 disabled:no-underline disabled:text-ink-3"
            >
              {wait > 0 ? <>שליחה חוזרת בעוד <span className="num">{wait}</span> שנ׳</> : 'שליחת קוד חדש'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
