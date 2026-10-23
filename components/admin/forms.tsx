"use client";

import { useActionState, useRef } from "react";
import { changePassword } from "@/app/admin/actions/session";
import { inviteStaff, saveCategory } from "@/app/admin/actions/misc";
import type { ActionResult } from "@/lib/auth";
import { ActionButton, Flash, useKeepValuesSubmit } from "./client";
import { useT } from "./i18n";
import { hintClass, inputClass, labelClass } from "./ui";

/** Small dashboard form: keeps typed values on errors, clears them after a successful create. */
function useDashboardForm(run: (prev: ActionResult, data: FormData) => Promise<ActionResult>, clearOnSuccess: boolean) {
  const form = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionResult, FormData>(async (prev, data) => {
    const result = await run(prev, data);
    if (result.ok && clearOnSuccess) form.current?.reset();
    return result;
  }, { ok: true });
  const { onSubmit } = useKeepValuesSubmit(action);
  return { form, state, pending, onSubmit };
}

export function CategoryForm({ category }: { category?: { id: string; name_fr: string; name_en: string } }) {
  const { form, state, pending, onSubmit } = useDashboardForm(saveCategory, !category);
  const t = useT();
  return (
    <form ref={form} onSubmit={onSubmit} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <div className="sm:col-span-3">
        <Flash key={state.message} message={state.message} tone={state.ok ? "success" : "error"} />
      </div>
      <input type="hidden" name="id" value={category?.id ?? ""} />
      <label className={labelClass}>
        {t("Nom en français")}
        <input name="name_fr" required defaultValue={category?.name_fr} className={inputClass} />
      </label>
      <label className={labelClass}>
        {t("Nom en anglais")}
        <input name="name_en" required defaultValue={category?.name_en} className={inputClass} />
      </label>
      <ActionButton pending={pending} busy={pending} pendingLabel={t("Enregistrement…")} className={category ? "btn btn-quiet" : "btn btn-gold"}>
        {category ? t("Enregistrer") : t("Ajouter")}
      </ActionButton>
    </form>
  );
}

export function InviteForm({ enabled }: { enabled: boolean }) {
  const { form, state, pending, onSubmit } = useDashboardForm(inviteStaff, true);
  const t = useT();
  return (
    <form ref={form} onSubmit={onSubmit} className="space-y-4">
      <Flash key={state.message} message={state.message} tone={state.ok ? "success" : "error"} />
      <div className="grid gap-4 sm:grid-cols-3">
        <label className={labelClass}>
          {t("Adresse email")}
          <input name="email" type="email" required disabled={!enabled} className={inputClass} />
        </label>
        <label className={labelClass}>
          {t("Nom (facultatif)")}
          <input name="full_name" disabled={!enabled} className={inputClass} />
        </label>
        <label className={labelClass}>
          {t("Rôle")}
          <select name="role" defaultValue="editor" disabled={!enabled} className={inputClass}>
            <option value="editor">{t("Éditeur")}</option>
            <option value="admin">{t("Administrateur")}</option>
          </select>
        </label>
      </div>
      <p className={hintClass}>
        {t("Éditeur : gère les actualités, les profils et les messages. Administrateur : peut en plus supprimer des profils et gérer les accès.")}
      </p>
      <ActionButton pending={pending || !enabled} busy={pending} pendingLabel={t("Envoi de l'invitation…")}>
        {t("Envoyer l'invitation")}
      </ActionButton>
    </form>
  );
}

export function PasswordForm() {
  const { form, state, pending, onSubmit } = useDashboardForm(changePassword, true);
  const t = useT();
  const err = state.fieldErrors ?? {};
  return (
    <form ref={form} onSubmit={onSubmit} className="max-w-md space-y-4">
      <Flash key={state.message} message={state.message} tone={state.ok ? "success" : "error"} />
      <label className={labelClass}>
        {t("Nouveau mot de passe")}
        <input name="password" type="password" required minLength={10} autoComplete="new-password" aria-invalid={err.password ? true : undefined} className={inputClass} />
        <span className={hintClass}>{t("Au moins 10 caractères.")}</span>
        {err.password && <span className="mt-1 block text-[0.875rem] font-normal text-danger">{err.password}</span>}
      </label>
      <label className={labelClass}>
        {t("Confirmer le mot de passe")}
        <input name="confirm" type="password" required autoComplete="new-password" aria-invalid={err.confirm ? true : undefined} className={inputClass} />
        {err.confirm && <span className="mt-1 block text-[0.875rem] font-normal text-danger">{err.confirm}</span>}
      </label>
      <ActionButton pending={pending} busy={pending} pendingLabel={t("Enregistrement…")}>
        {t("Modifier le mot de passe")}
      </ActionButton>
    </form>
  );
}
