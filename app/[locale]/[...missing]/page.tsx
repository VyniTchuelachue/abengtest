import { notFound } from "next/navigation";

// Any unknown address under /en or /fr shows the site's own not-found page (header, footer, both languages).
export default function MissingPage() {
  notFound();
}
