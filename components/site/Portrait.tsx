import Image from "next/image";
import { initials } from "@/lib/format";

type Props = {
  name: string;
  src: string | null;
  position?: string;
  sizes: string;
  pendingLabel: string;
  priority?: boolean;
  className?: string;
};

/** 4:5 portrait on the studio-grey ground; initials stand in until a photo is uploaded. */
export function Portrait({ name, src, position = "50% 20%", sizes, pendingLabel, priority, className = "" }: Props) {
  return (
    <div className={`relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-stone-deep ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          quality={80}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          style={{ objectPosition: position }}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-[#dcdddb] to-[#c3c5c2] text-ink-soft">
          <span aria-hidden className="heading text-[clamp(2.5rem,6vw,4rem)] text-ink/60">
            {initials(name)}
          </span>
          <span className="mt-2 text-2xs text-slate">{pendingLabel}</span>
          <span className="sr-only">{name}</span>
        </div>
      )}
    </div>
  );
}

/** Team card: portrait, gold-rule name plate, role. */
export function MemberCard({
  name,
  title,
  src,
  position,
  pendingLabel,
  sizes,
  detail,
}: {
  name: string;
  title: string;
  src: string | null;
  position?: string;
  pendingLabel: string;
  sizes: string;
  detail?: string;
}) {
  return (
    <div className="group">
      <div className="relative">
        <Portrait name={name} src={src} position={position} sizes={sizes} pendingLabel={pendingLabel} />
        <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 px-4 py-3 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.5)] backdrop-blur transition-colors group-hover:bg-white">
          <p className="font-display text-[1.0625rem] font-semibold leading-tight text-ink">{name}</p>
          <p className="mt-0.5 text-[0.8125rem] font-medium text-gold-dark">{title}</p>
        </div>
      </div>
      {detail && <p className="mt-3 px-1 text-[0.875rem] leading-snug text-ink-soft">{detail}</p>}
    </div>
  );
}
