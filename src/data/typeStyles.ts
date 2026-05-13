import type { CSSProperties } from "react";
import type { ElementType } from "../game/types";

const typeColors: Record<ElementType, { bg: string; fg: string; border: string }> = {
  一般: { bg: "#ece6d8", fg: "#403a33", border: "#b7aa99" },
  火: { bg: "#ff6b3a", fg: "#fff8ec", border: "#9d321d" },
  水: { bg: "#3f8cff", fg: "#f5fbff", border: "#1f4f98" },
  电: { bg: "#ffd43b", fg: "#3a3100", border: "#a27a00" },
  草: { bg: "#62bd5a", fg: "#f5fff2", border: "#2f7330" },
  冰: { bg: "#73d7e8", fg: "#143f4b", border: "#2a7d8e" },
  格斗: { bg: "#c95a3d", fg: "#fff4ed", border: "#743020" },
  毒: { bg: "#a461c7", fg: "#fff6ff", border: "#68347e" },
  地面: { bg: "#d7a95b", fg: "#3d2d16", border: "#8a642c" },
  飞行: { bg: "#8ca7ff", fg: "#f8fbff", border: "#4a61ad" },
  超能力: { bg: "#f45fa4", fg: "#fff6fb", border: "#a12e69" },
  虫: { bg: "#9fbd32", fg: "#faffdf", border: "#657a19" },
  岩石: { bg: "#b49761", fg: "#fff8e9", border: "#6f5b32" },
  幽灵: { bg: "#6f5aa8", fg: "#faf7ff", border: "#423069" },
  龙: { bg: "#6c63ff", fg: "#f7f6ff", border: "#332ca8" },
  恶: { bg: "#5c4a44", fg: "#fff8f3", border: "#2f2522" },
  钢: { bg: "#9aa7b8", fg: "#16222f", border: "#596574" },
  妖精: { bg: "#f49ac2", fg: "#42182d", border: "#b65381" },
};

export function typeStyle(type: ElementType): CSSProperties {
  const color = typeColors[type];

  return {
    "--type-bg": color.bg,
    "--type-fg": color.fg,
    "--type-border": color.border,
  } as CSSProperties;
}

export function skillTypeStyle(type: ElementType): CSSProperties {
  const color = typeColors[type];

  return {
    "--skill-bg": color.bg,
    "--skill-fg": color.fg,
    "--skill-border": color.border,
  } as CSSProperties;
}
