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
    <div className={`relative aspect-[4/5] overflow-hidden bg-stone-deep ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          quality={80}
          className="object-cover"
          style={{ objectPosition: position }}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-[#dcdddb] to-[#c3c5c2] text-ink-soft">
          <span aria-hidden className="heading text-[clamp(2.5rem,6vw,4rem)] text-ink/70">
            {initials(name)}
          </span>
          <span className="mt-2 text-2xs text-slate">{pendingLabel}</span>
          <span className="sr-only">{name}</span>
        </div>
      )}
    </div>
  );
}
