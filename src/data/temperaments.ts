import type { Temperament } from "../game/types";

export const temperaments: Temperament[] = [
  {
    id: "bold",
    name: "勇锐",
    description: "攻击更高，防御略低。",
    modifiers: { attack: 2, defense: -1 },
  },
  {
    id: "keen",
    name: "敏察",
    description: "速度更高，生命略低。",
    modifiers: { speed: 2, maxHp: -3 },
  },
  {
    id: "calm",
    name: "沉静",
    description: "防御更高，攻击略低。",
    modifiers: { defense: 2, attack: -1 },
  },
  {
    id: "swift",
    name: "轻捷",
    description: "速度更高，防御略低。",
    modifiers: { speed: 3, defense: -1 },
  },
  {
    id: "stubborn",
    name: "执拗",
    description: "生命更高，速度略低。",
    modifiers: { maxHp: 5, speed: -1 },
  },
  {
    id: "wild",
    name: "野性",
    description: "攻击和生命略高。",
    modifiers: { attack: 1, maxHp: 3 },
  },
];

export const temperamentById = Object.fromEntries(
  temperaments.map((temperament) => [temperament.id, temperament]),
) as Record<string, Temperament>;
