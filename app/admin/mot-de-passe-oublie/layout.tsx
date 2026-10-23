import type { Metadata } from "next";
import { getT } from "@/lib/admin-i18n/server";

// The page itself is a client component, so its title is set here.
export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Mot de passe oublié") };
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
