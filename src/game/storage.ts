import { starterCreatures } from "../data/creatures";
import type { SaveData } from "./types";

const SAVE_KEY = "eggspire-save-v1";

const starterIds = starterCreatures.map((creature) => creature.id);

export function loadSave(): SaveData {
  const fallback: SaveData = { unlockedCreatureIds: starterIds };

  try {
    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const unlockedCreatureIds = Array.from(new Set([...starterIds, ...(parsed.unlockedCreatureIds ?? [])]));

    return { unlockedCreatureIds };
  } catch {
    return fallback;
  }
}

export function saveGame(save: SaveData): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

export function unlockCreature(save: SaveData, creatureId: string): SaveData {
  const unlockedCreatureIds = Array.from(new Set([...save.unlockedCreatureIds, creatureId]));
  const nextSave = { ...save, unlockedCreatureIds };
  saveGame(nextSave);
  return nextSave;
}
