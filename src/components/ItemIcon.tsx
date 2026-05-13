import type { ItemId } from "../game/types";

interface ItemIconProps {
  itemId: ItemId;
  size?: "small" | "large";
}

const iconColors: Record<ItemId, { primary: string; secondary: string; accent: string }> = {
  "pulse-drop": { primary: "#ef5d6a", secondary: "#ffd7dc", accent: "#ffffff" },
  "clear-sap": { primary: "#4f8cff", secondary: "#d8ecff", accent: "#ffffff" },
  "camp-biscuit": { primary: "#d79b4b", secondary: "#fff0c8", accent: "#7a4b22" },
  "might-candy": { primary: "#f05a3f", secondary: "#ffd8ce", accent: "#fff4a8" },
  "guard-candy": { primary: "#8a97a8", secondary: "#e1e8f2", accent: "#ffffff" },
  "swift-candy": { primary: "#73c7e8", secondary: "#dcf6ff", accent: "#fff2a8" },
  "vital-jelly": { primary: "#78c66d", secondary: "#dcffd7", accent: "#ffffff" },
  "thread-capsule": { primary: "#8e68ff", secondary: "#efe7ff", accent: "#ffd85c" },
};

function ItemGlyph({ itemId, primary, accent }: { itemId: ItemId; primary: string; accent: string }) {
  if (itemId === "pulse-drop") {
    return <path d="M50 18 C37 34 29 45 29 58 C29 72 39 82 50 82 C61 82 71 72 71 58 C71 45 63 34 50 18 Z" fill={primary} stroke="#1d2524" strokeWidth="5" />;
  }

  if (itemId === "clear-sap") {
    return (
      <>
        <path d="M38 20 H62 L58 38 V76 H42 V38 Z" fill={primary} stroke="#1d2524" strokeWidth="5" strokeLinejoin="round" />
        <path d="M42 53 H58" stroke={accent} strokeWidth="5" strokeLinecap="round" />
      </>
    );
  }

  if (itemId === "camp-biscuit") {
    return (
      <>
        <circle cx="50" cy="52" r="27" fill={primary} stroke="#1d2524" strokeWidth="5" />
        <circle cx="39" cy="43" r="4" fill={accent} />
        <circle cx="57" cy="54" r="4" fill={accent} />
        <circle cx="46" cy="65" r="3" fill={accent} />
      </>
    );
  }

  if (itemId === "might-candy" || itemId === "guard-candy" || itemId === "swift-candy") {
    return (
      <>
        <path d="M25 40 L14 30 V70 L25 60 Z" fill={accent} stroke="#1d2524" strokeWidth="4" />
        <path d="M75 40 L86 30 V70 L75 60 Z" fill={accent} stroke="#1d2524" strokeWidth="4" />
        <rect x="25" y="35" width="50" height="30" rx="10" fill={primary} stroke="#1d2524" strokeWidth="5" />
        {itemId === "might-candy" && <path d="M42 56 L50 40 L58 56" fill="none" stroke="#fff8ec" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />}
        {itemId === "guard-candy" && <path d="M50 42 L62 48 V59 C58 65 53 68 50 69 C47 68 42 65 38 59 V48 Z" fill="#fff8ec" stroke="#1d2524" strokeWidth="3" />}
        {itemId === "swift-candy" && <path d="M37 56 H57 L48 44 H63" fill="none" stroke="#fff8ec" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />}
      </>
    );
  }

  if (itemId === "vital-jelly") {
    return (
      <>
        <path d="M29 47 C29 32 71 32 71 47 V66 C71 79 29 79 29 66 Z" fill={primary} stroke="#1d2524" strokeWidth="5" />
        <path d="M43 58 H57 M50 51 V65" stroke={accent} strokeWidth="5" strokeLinecap="round" />
      </>
    );
  }

  return (
    <>
      <circle cx="50" cy="50" r="29" fill={primary} stroke="#1d2524" strokeWidth="5" />
      <path d="M25 50 H75" stroke="#1d2524" strokeWidth="5" />
      <circle cx="50" cy="50" r="10" fill={accent} stroke="#1d2524" strokeWidth="4" />
      <path d="M36 30 Q50 20 64 30" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
    </>
  );
}

export function ItemIcon({ itemId, size = "large" }: ItemIconProps) {
  const colors = iconColors[itemId];

  return (
    <span className={`item-icon ${size === "small" ? "item-icon-small" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <rect x="8" y="8" width="84" height="84" rx="16" fill={colors.secondary} stroke="#1d2524" strokeWidth="4" />
        <ItemGlyph itemId={itemId} primary={colors.primary} accent={colors.accent} />
        <rect x="21" y="20" width="10" height="5" rx="2" fill="#ffffff" opacity="0.75" />
      </svg>
    </span>
  );
}
