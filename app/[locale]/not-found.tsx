import Link from "next/link";

// not-found receives no params, so the message is given in both languages.
export default function NotFound() {
  return (
    <section className="shell grid min-h-[60vh] content-center gap-12 py-24 md:grid-cols-2">
      <div>
        <h1 className="display text-[clamp(2.5rem,1.8rem+3vw,4.5rem)]">Page not found</h1>
        <p className="mt-6 text-ink-soft">The page you are looking for has moved or no longer exists.</p>
        <Link href="/en" className="link mt-6 inline-block font-medium">
          Go to the home page
        </Link>
      </div>
      <div lang="fr">
        <p className="display text-[clamp(2.5rem,1.8rem+3vw,4.5rem)] text-ink-soft">Page introuvable</p>
        <p className="mt-6 text-ink-soft">La page que vous cherchez a été déplacée ou n&apos;existe plus.</p>
        <Link href="/fr" className="link mt-6 inline-block font-medium">
          Revenir à l&apos;accueil
        </Link>
      </div>
    </section>
  );
}
