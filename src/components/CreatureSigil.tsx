import type { CSSProperties, ReactNode } from "react";
import type { CreatureSpecies, ElementType } from "../game/types";

interface CreatureSigilProps {
  creature: CreatureSpecies;
  size?: "small" | "large";
}

type PortraitKind =
  | "turtle"
  | "deer"
  | "fox"
  | "catfish"
  | "hedgehog"
  | "snail"
  | "bunny"
  | "lizard"
  | "hippo"
  | "otter"
  | "pangolin"
  | "alpaca"
  | "hummingbird";

const portraitKindById: Record<string, PortraitKind> = {
  "lantern-husk": "turtle",
  "lantern-ark": "turtle",
  "vein-sprout": "deer",
  "vein-crown": "deer",
  "sand-chime": "fox",
  "dune-chord": "fox",
  "mist-knot": "catfish",
  "copper-thread": "hedgehog",
  "star-spiral": "snail",
  "moss-cap": "bunny",
  "rift-crystal": "lizard",
  "soft-tablet": "hippo",
  "tide-arc": "otter",
  "magnet-husk": "pangolin",
  "cinder-fleece": "alpaca",
  "clock-sprig": "hummingbird",
};

function Eyes({ sleepy = false }: { sleepy?: boolean }) {
  if (sleepy) {
    return (
      <>
        <path d="M35 44 Q40 40 45 44" fill="none" stroke="#1d2524" strokeWidth="3" strokeLinecap="round" />
        <path d="M55 44 Q60 40 65 44" fill="none" stroke="#1d2524" strokeWidth="3" strokeLinecap="round" />
        <path d="M45 56 Q50 60 55 56" fill="none" stroke="#1d2524" strokeWidth="3" strokeLinecap="round" />
      </>
    );
  }

  return (
    <>
      <rect x="36" y="40" width="8" height="10" rx="3" fill="#1d2524" />
      <rect x="56" y="40" width="8" height="10" rx="3" fill="#1d2524" />
      <rect x="39" y="41" width="3" height="3" fill="#fff8df" />
      <rect x="59" y="41" width="3" height="3" fill="#fff8df" />
      <rect x="34" y="53" width="7" height="4" rx="2" fill="#f1a6a0" opacity="0.72" />
      <rect x="61" y="53" width="7" height="4" rx="2" fill="#f1a6a0" opacity="0.72" />
      <path d="M45 57 Q50 61 55 57" fill="none" stroke="#1d2524" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

function ElementMotifs({ types, accent }: { types: ElementType[]; accent: string }) {
  const primaryType = types[0];

  if (primaryType === "火") {
    return (
      <>
        <path d="M76 22 Q84 34 75 41 Q70 35 74 30 Q68 34 67 24 Q72 27 76 22 Z" fill="#ff8a52" stroke="#1d2524" strokeWidth="3" />
        <rect x="18" y="72" width="5" height="5" fill="#ffd85c" stroke="#1d2524" strokeWidth="2" />
      </>
    );
  }

  if (primaryType === "水") {
    return (
      <>
        <circle cx="78" cy="24" r="5" fill="#bdf7ff" stroke="#1d2524" strokeWidth="2" />
        <circle cx="22" cy="73" r="4" fill="#bdf7ff" stroke="#1d2524" strokeWidth="2" />
        <path d="M72 70 Q78 64 84 70" fill="none" stroke="#bdf7ff" strokeWidth="4" strokeLinecap="round" />
      </>
    );
  }

  if (primaryType === "草") {
    return (
      <>
        <path d="M74 20 Q86 22 82 35 Q72 33 74 20 Z" fill="#9fd66b" stroke="#1d2524" strokeWidth="2" />
        <path d="M20 74 Q30 68 34 78 Q24 82 20 74 Z" fill="#9fd66b" stroke="#1d2524" strokeWidth="2" />
      </>
    );
  }

  if (primaryType === "电" || primaryType === "钢") {
    return (
      <>
        <path d="M78 16 L68 36 H77 L70 52 L88 29 H78 Z" fill="#ffd85c" stroke="#1d2524" strokeWidth="3" strokeLinejoin="round" />
        <rect x="20" y="72" width="6" height="6" fill={accent} stroke="#1d2524" strokeWidth="2" />
      </>
    );
  }

  if (primaryType === "冰" || primaryType === "岩石") {
    return (
      <>
        <path d="M77 18 L87 29 L79 40 L68 30 Z" fill={accent} stroke="#1d2524" strokeWidth="3" />
        <path d="M20 72 L29 65 L35 75 L26 82 Z" fill={accent} stroke="#1d2524" strokeWidth="2" />
      </>
    );
  }

  return (
    <>
      <rect x="74" y="18" width="6" height="6" fill={accent} stroke="#1d2524" strokeWidth="2" />
      <rect x="19" y="73" width="5" height="5" fill={accent} stroke="#1d2524" strokeWidth="2" />
    </>
  );
}

function Turtle({ primary, accent, evolved }: { primary: string; accent: string; evolved: boolean }) {
  return (
    <>
      <ellipse cx="50" cy="65" rx={evolved ? 34 : 30} ry={evolved ? 22 : 20} fill={primary} stroke="#1d2524" strokeWidth="4" />
      <path d="M24 62 H76 M34 48 L50 82 M66 48 L50 82" stroke="#1d2524" strokeWidth="3" opacity="0.35" />
      <circle cx="50" cy="44" r="23" fill={accent} stroke="#1d2524" strokeWidth="4" />
      <rect x="42" y={evolved ? "14" : "20"} width="16" height={evolved ? "22" : "16"} rx="4" fill="#fff8df" stroke="#1d2524" strokeWidth="3" />
      {evolved && <path d="M39 18 H61 M45 10 H55" stroke={accent} strokeWidth="4" strokeLinecap="round" />}
      <rect x="24" y="66" width="9" height="8" rx="3" fill={accent} stroke="#1d2524" strokeWidth="3" />
      <rect x="67" y="66" width="9" height="8" rx="3" fill={accent} stroke="#1d2524" strokeWidth="3" />
      <Eyes />
    </>
  );
}

function Deer({ primary, accent, evolved }: { primary: string; accent: string; evolved: boolean }) {
  return (
    <>
      <ellipse cx="50" cy="66" rx="24" ry="21" fill={primary} stroke="#1d2524" strokeWidth="4" />
      <path d="M35 34 L25 15 M35 31 L20 25 M65 34 L75 15 M65 31 L80 25" stroke="#1d2524" strokeWidth={evolved ? "6" : "5"} strokeLinecap="round" />
      <path d="M35 34 L25 15 M35 31 L20 25 M65 34 L75 15 M65 31 L80 25" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      {evolved && <path d="M30 28 Q50 8 70 28 Q58 31 50 22 Q42 31 30 28 Z" fill="#9fd66b" stroke="#1d2524" strokeWidth="3" />}
      <ellipse cx="50" cy="45" rx="24" ry="21" fill={accent} stroke="#1d2524" strokeWidth="4" />
      <path d="M39 26 Q50 16 61 26 Q54 32 50 31 Q46 32 39 26 Z" fill="#9fd66b" stroke="#1d2524" strokeWidth="3" />
      <Eyes />
    </>
  );
}

function Fox({ primary, accent, evolved }: { primary: string; accent: string; evolved: boolean }) {
  return (
    <>
      <path d="M23 38 L33 12 L45 39 Z" fill={primary} stroke="#1d2524" strokeWidth="4" />
      <path d="M55 39 L67 12 L77 38 Z" fill={primary} stroke="#1d2524" strokeWidth="4" />
      <path d="M31 34 L35 22 L40 36 Z M60 36 L65 22 L69 34 Z" fill={accent} opacity="0.82" />
      <path d={evolved ? "M60 69 Q88 58 83 32 Q70 45 58 62 Z" : "M62 70 Q82 58 77 39 Q67 49 58 63 Z"} fill="#bdf7ff" stroke="#1d2524" strokeWidth="4" />
      {evolved && <path d="M55 76 Q77 78 88 64" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" />}
      <ellipse cx="50" cy="50" rx="25" ry="23" fill={accent} stroke="#1d2524" strokeWidth="4" />
      <path d="M44 57 L50 63 L56 57 Z" fill={primary} stroke="#1d2524" strokeWidth="2" />
      <Eyes />
    </>
  );
}

function AnimalDetails({ kind, creature }: { kind: PortraitKind; creature: CreatureSpecies }): ReactNode {
  const { primary, accent } = creature.palette;
  const evolved = creature.rarity === "evolved";

  if (kind === "turtle") {
    return <Turtle primary={primary} accent={accent} evolved={evolved} />;
  }

  if (kind === "deer") {
    return <Deer primary={primary} accent={accent} evolved={evolved} />;
  }

  if (kind === "fox") {
    return <Fox primary={primary} accent={accent} evolved={evolved} />;
  }

  if (kind === "catfish") {
    return (
      <>
        <path d="M20 52 Q10 42 11 30 M80 52 Q90 42 89 30" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="50" cy="57" rx="28" ry="25" fill={accent} stroke="#1d2524" strokeWidth="4" />
        <path d="M28 69 Q15 79 30 84 M72 69 Q85 79 70 84" stroke="#1d2524" strokeWidth="4" strokeLinecap="round" />
        <path d="M38 30 Q50 19 62 30 Q53 35 50 33 Q47 35 38 30 Z" fill={primary} stroke="#1d2524" strokeWidth="3" />
        <Eyes sleepy />
      </>
    );
  }

  if (kind === "hedgehog") {
    return (
      <>
        <path
          d="M22 58 L12 48 L25 45 L18 33 L33 36 L35 20 L47 32 L58 18 L61 36 L76 32 L69 45 L82 48 L72 58 Z"
          fill={primary}
          stroke="#1d2524"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <ellipse cx="50" cy="58" rx="23" ry="22" fill={accent} stroke="#1d2524" strokeWidth="4" />
        <path d="M32 30 L39 37 M66 30 L60 37" stroke="#ffd85c" strokeWidth="4" strokeLinecap="round" />
        <Eyes />
      </>
    );
  }

  if (kind === "snail") {
    return (
      <>
        <circle cx="38" cy="58" r="24" fill={primary} stroke="#1d2524" strokeWidth="4" />
        <path d="M30 58 Q38 42 50 53 Q61 66 40 70" fill="none" stroke="#1d2524" strokeWidth="4" strokeLinecap="round" />
        <path d="M56 56 H78 Q84 56 84 64 Q84 72 74 72 H55" fill={accent} stroke="#1d2524" strokeWidth="4" />
        <path d="M64 53 L60 41 M73 53 L78 41" stroke="#1d2524" strokeWidth="3" strokeLinecap="round" />
        <Eyes sleepy />
      </>
    );
  }

  if (kind === "bunny") {
    return (
      <>
        <rect x="28" y="12" width="14" height="36" rx="7" fill={primary} stroke="#1d2524" strokeWidth="4" />
        <rect x="58" y="12" width="14" height="36" rx="7" fill={primary} stroke="#1d2524" strokeWidth="4" />
        <path d="M35 18 V38 M65 18 V38" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="50" cy="58" rx="27" ry="25" fill={accent} stroke="#1d2524" strokeWidth="4" />
        <path d="M37 26 Q50 17 63 26 Q59 35 50 35 Q41 35 37 26 Z" fill="#9fd66b" stroke="#1d2524" strokeWidth="3" />
        <circle cx="73" cy="67" r="9" fill="#fff8df" stroke="#1d2524" strokeWidth="3" />
        <Eyes />
      </>
    );
  }

  if (kind === "lizard") {
    return (
      <>
        <path d="M62 64 Q86 59 84 35 Q70 44 56 59 Z" fill={primary} stroke="#1d2524" strokeWidth="4" />
        <ellipse cx="49" cy="58" rx="27" ry="22" fill={primary} stroke="#1d2524" strokeWidth="4" />
        <path d="M37 29 L50 10 L63 29" fill={accent} stroke="#1d2524" strokeWidth="4" strokeLinejoin="round" />
        <ellipse cx="50" cy="46" rx="22" ry="20" fill={accent} stroke="#1d2524" strokeWidth="4" />
        <Eyes />
      </>
    );
  }

  if (kind === "hippo") {
    return (
      <>
        <ellipse cx="50" cy="61" rx="31" ry="23" fill={primary} stroke="#1d2524" strokeWidth="4" />
        <rect x="28" y="50" width="44" height="25" rx="11" fill={accent} stroke="#1d2524" strokeWidth="4" />
        <circle cx="37" cy="39" r="7" fill={primary} stroke="#1d2524" strokeWidth="3" />
        <circle cx="63" cy="39" r="7" fill={primary} stroke="#1d2524" strokeWidth="3" />
        <circle cx="40" cy="58" r="2.5" fill="#1d2524" />
        <circle cx="60" cy="58" r="2.5" fill="#1d2524" />
        <Eyes sleepy />
      </>
    );
  }

  if (kind === "otter") {
    return (
      <>
        <path d="M63 69 Q84 74 90 56 Q74 52 58 62 Z" fill="#bdf7ff" stroke="#1d2524" strokeWidth="4" />
        <ellipse cx="50" cy="61" rx="23" ry="25" fill={primary} stroke="#1d2524" strokeWidth="4" />
        <ellipse cx="50" cy="49" rx="22" ry="20" fill={accent} stroke="#1d2524" strokeWidth="4" />
        <path d="M29 63 Q20 70 27 77 M71 63 Q80 70 73 77" stroke="#1d2524" strokeWidth="4" strokeLinecap="round" />
        <Eyes />
      </>
    );
  }

  if (kind === "pangolin") {
    return (
      <>
        <path d="M27 50 Q45 21 75 43 Q68 74 32 78 Z" fill={primary} stroke="#1d2524" strokeWidth="4" />
        <path d="M37 45 H67 M34 56 H71 M38 67 H64" stroke="#1d2524" strokeWidth="3" opacity="0.46" />
        <ellipse cx="45" cy="50" rx="20" ry="19" fill={accent} stroke="#1d2524" strokeWidth="4" />
        <path d="M70 70 Q84 78 89 66" fill="none" stroke="#1d2524" strokeWidth="4" strokeLinecap="round" />
        <Eyes />
      </>
    );
  }

  if (kind === "alpaca") {
    return (
      <>
        <circle cx="35" cy="34" r="10" fill={accent} stroke="#1d2524" strokeWidth="3" />
        <circle cx="49" cy="26" r="12" fill={accent} stroke="#1d2524" strokeWidth="3" />
        <circle cx="64" cy="34" r="10" fill={accent} stroke="#1d2524" strokeWidth="3" />
        <rect x="39" y="46" width="22" height="31" rx="9" fill={primary} stroke="#1d2524" strokeWidth="4" />
        <ellipse cx="50" cy="45" rx="22" ry="20" fill={accent} stroke="#1d2524" strokeWidth="4" />
        <path d="M35 29 L30 14 M65 29 L70 14" stroke="#1d2524" strokeWidth="4" strokeLinecap="round" />
        <Eyes />
      </>
    );
  }

  return (
    <>
      <path d="M26 55 Q8 44 17 27 Q35 34 42 51 Z" fill={accent} stroke="#1d2524" strokeWidth="4" />
      <path d="M62 52 Q87 43 82 24 Q68 33 56 49 Z" fill={primary} stroke="#1d2524" strokeWidth="4" />
      <ellipse cx="50" cy="58" rx="21" ry="22" fill={accent} stroke="#1d2524" strokeWidth="4" />
      <path d="M68 69 Q80 75 88 67" stroke="#1d2524" strokeWidth="4" strokeLinecap="round" />
      <Eyes />
    </>
  );
}

export function CreatureSigil({ creature, size = "large" }: CreatureSigilProps) {
  const kind = portraitKindById[creature.id] ?? "turtle";
  const style = {
    "--primary": creature.palette.primary,
    "--secondary": creature.palette.secondary,
    "--accent": creature.palette.accent,
  } as CSSProperties;

  return (
    <div className={`portrait-frame ${size === "small" ? "portrait-frame-small" : ""}`} style={style}>
      <svg viewBox="0 0 100 100" role="img" aria-label={creature.name}>
        <rect x="4" y="4" width="92" height="92" rx="10" fill="var(--secondary)" stroke="#1d2524" strokeWidth="4" />
        <path d="M10 12 H90 M10 24 H90 M10 36 H90 M10 48 H90 M10 60 H90 M10 72 H90 M10 84 H90" stroke="#ffffff" strokeWidth="2" opacity="0.08" />
        <path d="M12 78 H88" stroke="#1d2524" strokeWidth="5" opacity="0.16" />
        <ellipse cx="50" cy="80" rx="30" ry="7" fill="#1d2524" opacity="0.16" />
        <AnimalDetails kind={kind} creature={creature} />
        <ElementMotifs types={creature.types} accent={creature.palette.accent} />
      </svg>
    </div>
  );
}
