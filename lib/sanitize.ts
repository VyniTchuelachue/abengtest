import sanitizeHtml from "sanitize-html";

const storageHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co").hostname;

/**
 * Allow-list for article bodies written in the dashboard editor. Runs when an
 * article is saved and again when it is rendered.
 */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "h2", "h3", "h4", "strong", "em", "u", "s", "a", "ul", "ol", "li", "blockquote", "hr", "br", "img", "figure", "figcaption"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    exclusiveFilter: (frame) => frame.tag === "img" && !isStorageImage(frame.attribs.src),
    transformTags: {
      a: (tagName, attribs) => {
        const link = attribs.href ?? "";
        const next: sanitizeHtml.Attributes = { href: link };
        if (/^https?:\/\//i.test(link)) {
          next.target = "_blank";
          next.rel = "noopener noreferrer";
        }
        return { tagName, attribs: next };
      },
      h1: "h2",
      b: "strong",
      i: "em",
    },
  });
}

function isStorageImage(src: string | undefined): boolean {
  if (!src) return false;
  try {
    return new URL(src).hostname === storageHost;
  } catch {
    return false;
  }
}

export function plainText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}
