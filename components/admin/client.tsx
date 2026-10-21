"use client";

import { startTransition, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

/**
 * Submits a form to a useActionState dispatcher without React's automatic
 * form reset, so typed values survive validation errors and saves. Returns
 * the value of the button that was used, to show progress on that button.
 */
export function useKeepValuesSubmit(dispatch: (formData: FormData) => void) {
  const [intent, setIntent] = useState<string | null>(null);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const formData = new FormData(e.currentTarget, submitter);
    setIntent(submitter?.value || "submit");
    startTransition(() => dispatch(formData));
  };
  return { onSubmit, intent };
}

/** Button for forms submitted with useKeepValuesSubmit. */
export function ActionButton({
  children,
  pendingLabel,
  pending,
  busy,
  name,
  value,
  className = "btn btn-primary",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  pending: boolean;
  busy: boolean;
  name?: string;
  value?: string;
  className?: string;
}) {
  return (
    <button type="submit" name={name} value={value} disabled={pending} aria-busy={busy} className={`${className} disabled:cursor-wait disabled:opacity-60`}>
      {busy ? (
        <>
          <Spinner />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Submit button that shows progress while its form's server action runs. */
export function SubmitButton({
  children,
  pendingLabel,
  className = "btn btn-primary",
  name,
  value,
  formAction,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
  name?: string;
  value?: string;
  formAction?: (formData: FormData) => void;
}) {
  const { pending, data } = useFormStatus();
  const mine = pending && (!name || data?.get(name) === value);
  return (
    <button type="submit" name={name} value={value} formAction={formAction} disabled={pending} aria-busy={mine} className={`${className} disabled:cursor-wait disabled:opacity-60`}>
      {mine ? (
        <>
          <Spinner />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function Spinner() {
  return <span aria-hidden className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />;
}

/**
 * Destructive action guarded by a confirmation dialog. The confirm button
 * submits a hidden form bound to the server action.
 */
export function ConfirmAction({
  action,
  fields,
  label,
  title,
  body,
  confirmLabel,
  className = "btn btn-quiet text-danger hover:border-danger",
}: {
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  label: string;
  title: string;
  body: string;
  confirmLabel: string;
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  return (
    <>
      <button type="button" className={className} onClick={() => dialog.current?.showModal()}>
        {label}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-sm border border-rule bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/40"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        <form action={action} className="p-7">
          {Object.entries(fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <h2 id={titleId} className="heading text-[1.5rem]">
            {title}
          </h2>
          <p className="mt-3 text-[0.9375rem] text-ink-soft">{body}</p>
          <div className="mt-7 flex justify-end gap-3">
            <button type="button" className="btn btn-quiet" onClick={() => dialog.current?.close()}>
              Annuler
            </button>
            <SubmitButton pendingLabel="Suppression…" className="btn bg-danger text-white hover:bg-[#7f2222]">
              {confirmLabel}
            </SubmitButton>
          </div>
        </form>
      </dialog>
    </>
  );
}

/** Warns before leaving a form with unsaved edits. */
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}

/**
 * Flash message that fades after a few seconds (kept in the DOM for screen
 * readers until then). Give it a `key` per message so each one starts visible.
 */
export function Flash({ message, tone = "success" }: { message?: string; tone?: "success" | "error" }) {
  const [visible, setVisible] = useState(Boolean(message));
  useEffect(() => {
    if (!message || tone === "error") return;
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, [message, tone]);
  if (!message || !visible) return null;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`mb-6 flex items-start justify-between gap-4 border-l-2 px-4 py-3 text-[0.9375rem] ${
        tone === "error" ? "border-danger bg-[#fbefef] text-danger" : "border-success bg-[#eef6f1] text-success"
      }`}
    >
      <span>{message}</span>
      <button type="button" onClick={() => setVisible(false)} className="text-[0.8125rem] underline">
        Fermer
      </button>
    </div>
  );
}
