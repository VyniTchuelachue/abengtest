import {
  Anchor,
  Building2,
  Factory,
  FileSignature,
  Gavel,
  HandCoins,
  HeartPulse,
  Home,
  Landmark,
  Leaf,
  Lightbulb,
  Network,
  Plane,
  Radio,
  Receipt,
  Scale,
  ShieldCheck,
  Sprout,
  Users,
  Zap,
  Fuel,
  Pickaxe,
  Globe2,
  Briefcase,
  Bug,
  Shield,
  Umbrella,
  FileSearch,
  type LucideIcon,
} from "lucide-react";

/** Icon per practice area (by English slug); falls back to the scales. */
const practiceIcons: Record<string, LucideIcon> = {
  "corporate-commercial-ohada": Briefcase,
  "mergers-acquisitions": Network,
  "banking-finance": Landmark,
  "energy-infrastructure": Zap,
  "real-estate-construction": Building2,
  "tax-customs-exchange": Receipt,
  "regulatory-public-law": Scale,
  "compliance-investigations": ShieldCheck,
  "data-technology": Radio,
  "employment-immigration": Users,
  "intellectual-property": Lightbulb,
  "environment-esg": Leaf,
  "litigation-arbitration": Gavel,
  "debt-recovery-insolvency": HandCoins,
  "maritime-transport": Anchor,
  "private-client": Home,
  "cybercrime-digital-disputes": Bug,
  "criminal-law-proceedings": Shield,
  "insurance-law-disputes": Umbrella,
  "legal-due-diligence-audits": FileSearch,
};

export function PracticeIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = practiceIcons[slug] ?? FileSignature;
  return <Icon aria-hidden className={className} strokeWidth={1.75} />;
}

/** Same order as the sectors list in the dictionaries. */
const sectorIcons: LucideIcon[] = [Zap, Fuel, Pickaxe, Landmark, Radio, Building2, Anchor, Sprout, Home, HeartPulse, Factory, Globe2];

export function SectorIcon({ index, className }: { index: number; className?: string }) {
  const Icon = sectorIcons[index] ?? Plane;
  return <Icon aria-hidden className={className} strokeWidth={1.75} />;
}
