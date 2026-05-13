import { itemById, items } from "../data/items";
import type { ItemId, RewardDrop, RewardOption, RunState } from "./types";

const dropTable: Array<{ itemId: ItemId; weight: number; amount: (floor: number) => number }> = [
  { itemId: "pulse-drop", weight: 28, amount: (floor) => (floor >= 6 ? 2 : 1) },
  { itemId: "clear-sap", weight: 22, amount: () => 1 },
  { itemId: "camp-biscuit", weight: 18, amount: () => 1 },
  { itemId: "thread-capsule", weight: 14, amount: () => 1 },
  { itemId: "might-candy", weight: 6, amount: () => 1 },
  { itemId: "guard-candy", weight: 6, amount: () => 1 },
  { itemId: "swift-candy", weight: 4, amount: () => 1 },
  { itemId: "vital-jelly", weight: 2, amount: () => 1 },
];

function shuffle<T>(itemsToShuffle: T[]): T[] {
  return [...itemsToShuffle].sort(() => Math.random() - 0.5);
}

export function generateRewards(_run: RunState): RewardOption[] {
  return shuffle(items).slice(0, 3).map((item) => ({
    id: `item-${item.id}-${Date.now()}`,
    type: "item",
    label: item.name,
    description: `${item.description} 获得 x1。`,
    itemId: item.id,
    amount: 1,
  }));
}

function pickDrop(floor: number): RewardDrop {
  const totalWeight = dropTable.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * totalWeight;
  const picked = dropTable.find((entry) => {
    roll -= entry.weight;
    return roll <= 0;
  }) ?? dropTable[0];

  return {
    itemId: picked.itemId,
    amount: picked.amount(floor),
  };
}

export function generateRandomDrops(run: RunState): RewardDrop[] {
  const baseChance = Math.min(0.82, 0.44 + run.floor * 0.04);
  if (Math.random() > baseChance) {
    return [];
  }

  const drops = [pickDrop(run.floor)];
  const bonusChance = run.floor >= 5 ? 0.18 + run.floor * 0.01 : 0.04;
  if (Math.random() < bonusChance) {
    const bonusDrop = pickDrop(run.floor);
    const existingDrop = drops.find((drop) => drop.itemId === bonusDrop.itemId);
    if (existingDrop) {
      existingDrop.amount += bonusDrop.amount;
    } else {
      drops.push(bonusDrop);
    }
  }

  return drops;
}

export function applyDrops(run: RunState, drops: RewardDrop[]): RunState {
  if (drops.length === 0) {
    return run;
  }

  const bag = { ...run.bag };
  drops.forEach((drop) => {
    bag[drop.itemId] += drop.amount;
  });

  const dropText = drops.map((drop) => `${itemById[drop.itemId].name} x${drop.amount}`).join("、");
  return {
    ...run,
    bag,
    battleLog: [`本层额外掉落：${dropText}。`, ...run.battleLog].slice(0, 8),
  };
}

export function applyReward(run: RunState, reward: RewardOption): RunState {
  const bag = { ...run.bag };
  const item = itemById[reward.itemId];
  bag[item.id] += reward.amount;

  return {
    ...run,
    bag,
    battleLog: [`获得 ${item.name} x${reward.amount}。`, ...run.battleLog].slice(0, 8),
  };
}
