import "server-only";
import { getDictionary } from "@/lib/dictionaries";
import { privacyNoticeVersion } from "@/lib/privacy-content";
import { siteUrl } from "@/lib/routes";

/** The firm's inbox; CONTACT_NOTIFY_EMAIL overrides it (e.g. for testing). */
const firmInbox = "contact@theabenglawfirm.com";
/** Subjects used by the careers form ("Careers" / "Recrutement"). */
const applicationSubjects = new Set((["en", "fr"] as const).map((l) => getDictionary(l).contactPage.subjects[2]));

/**
 * Emails each message to the firm through Resend once RESEND_API_KEY is set.
 * Messages are stored in the dashboard either way, so a failed email loses nothing.
 */
export async function notifyByEmail(
  m: { name: string; email: string; phone?: string; subject?: string; message: string; locale: string; consentAt: string },
  attachment?: { filename: string; content: Buffer },
) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const isApplication = Boolean(attachment) || applicationSubjects.has(m.subject ?? "");
  const lines = [
    isApplication ? "Nouvelle candidature reçue depuis la page Recrutement du site." : "Nouveau message reçu depuis le formulaire de contact du site.",
    "",
    `Nom : ${m.name}`,
    `Email : ${m.email}`,
    m.phone ? `Téléphone : ${m.phone}` : null,
    `Objet : ${m.subject || "Demande générale"}`,
    `Langue : ${m.locale === "fr" ? "français" : "anglais"}`,
    `Consentement donné le ${new Date(m.consentAt).toLocaleString("fr-FR", { timeZone: "Africa/Douala" })} (avis de confidentialité du ${privacyNoticeVersion})`,
    attachment ? `CV joint : ${attachment.filename}` : null,
    "",
    m.message,
    "",
    "—",
    `Répondez directement à cet email pour écrire à ${m.name}.`,
    `Tous les messages : ${siteUrl}/admin/messages`,
  ].filter((l) => l !== null);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL ?? "Site Abeng Law <onboarding@resend.dev>",
        to: [process.env.CONTACT_NOTIFY_EMAIL || firmInbox],
        reply_to: m.email,
        subject: isApplication ? `Nouvelle candidature : ${m.name}` : `Nouveau message du site : ${m.subject || "Demande"} — ${m.name}`,
        text: lines.join("\n"),
        ...(attachment ? { attachments: [{ filename: attachment.filename, content: attachment.content.toString("base64") }] } : {}),
      }),
    });
    if (!res.ok) console.error("contact notification rejected", res.status, await res.text());
  } catch (err) {
    console.error("contact notification failed", err);
  }
}
