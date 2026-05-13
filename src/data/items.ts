import type { Bag, BagItem, ItemId } from "../game/types";

export const items: BagItem[] = [
  {
    id: "pulse-drop",
    name: "脉露",
    description: "回复 18 点生命。",
    kind: "healHp",
    value: 18,
  },
  {
    id: "clear-sap",
    name: "清髓",
    description: "回复 10 点能量。",
    kind: "healMp",
    value: 10,
  },
  {
    id: "camp-biscuit",
    name: "营养脆饼",
    description: "回复 12 点生命和 6 点能量。",
    kind: "healBoth",
    value: 12,
  },
  {
    id: "might-candy",
    name: "力气糖",
    description: "永久提高当前精灵 1 点攻击。",
    kind: "boostAttack",
    value: 1,
  },
  {
    id: "guard-candy",
    name: "硬壳糖",
    description: "永久提高当前精灵 1 点防御。",
    kind: "boostDefense",
    value: 1,
  },
  {
    id: "swift-candy",
    name: "轻羽糖",
    description: "永久提高当前精灵 1 点速度。",
    kind: "boostSpeed",
    value: 1,
  },
  {
    id: "vital-jelly",
    name: "生命冻",
    description: "永久提高当前精灵 4 点最大生命，并回复 4 点生命。",
    kind: "boostMaxHp",
    value: 4,
  },
  {
    id: "thread-capsule",
    name: "灵契球",
    description: "用于收束并记录野生精灵，有失败概率。",
    kind: "capture",
    value: 1,
  },
];

export const itemById = Object.fromEntries(items.map((item) => [item.id, item])) as Record<ItemId, BagItem>;

export function createStartingBag(): Bag {
  return {
    "pulse-drop": 2,
    "clear-sap": 1,
    "camp-biscuit": 1,
    "might-candy": 0,
    "guard-candy": 0,
    "swift-candy": 0,
    "vital-jelly": 0,
    "thread-capsule": 3,
  };
}
