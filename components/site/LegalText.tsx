import { formatDate } from "@/lib/format";
import { privacyNoticeVersion } from "@/lib/privacy-content";
import type { Locale } from "@/lib/routes";

/** Text of the firm's notices, with its email address made into a link. */
export function LinkedText({ text }: { text: string }) {
  const parts = text.split(/([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a key={i} href={`mailto:${part}`} className="link">
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** Date the notices were published or last revised. */
export function NoticeDate({ locale }: { locale: Locale }) {
  return (
    <p className="text-[0.9375rem] text-slate">
      {locale === "fr" ? "Dernière mise à jour : " : "Last updated: "}
      <time dateTime={privacyNoticeVersion}>{formatDate(`${privacyNoticeVersion}T12:00:00Z`, locale)}</time>
    </p>
  );
}
