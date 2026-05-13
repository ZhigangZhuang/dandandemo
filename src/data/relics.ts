import type { Relic } from "../game/types";

export const relics: Relic[] = [
  {
    id: "tower-needle",
    name: "裂塔指针",
    description: "攻击提高 2。",
    effect: { type: "attack", value: 2 },
  },
  {
    id: "warm-husk",
    name: "暖壳碎片",
    description: "最大生命提高 8。",
    effect: { type: "maxHp", value: 8 },
  },
  {
    id: "quiet-brace",
    name: "静环",
    description: "防御提高 2。",
    effect: { type: "defense", value: 2 },
  },
  {
    id: "thin-step",
    name: "薄步片",
    description: "速度提高 2。",
    effect: { type: "speed", value: 2 },
  },
  {
    id: "hollow-salt",
    name: "空盐",
    description: "捕获概率提高 8%。",
    effect: { type: "capture", value: 8 },
  },
  {
    id: "amber-knot",
    name: "琥结",
    description: "攻击提高 1，防御型怪物也能稳步推进。",
    effect: { type: "attack", value: 1 },
  },
  {
    id: "dust-lens",
    name: "尘透镜",
    description: "攻击提高 3。",
    effect: { type: "attack", value: 3 },
  },
  {
    id: "ridge-scale",
    name: "脊纹片",
    description: "防御提高 3。",
    effect: { type: "defense", value: 3 },
  },
  {
    id: "pulse-thread",
    name: "脉线",
    description: "最大生命提高 5。",
    effect: { type: "maxHp", value: 5 },
  },
  {
    id: "catching-echo",
    name: "收束回音",
    description: "捕获概率提高 12%。",
    effect: { type: "capture", value: 12 },
  },
];

export const relicById = Object.fromEntries(relics.map((relic) => [relic.id, relic])) as Record<string, Relic>;
