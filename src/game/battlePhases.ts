import { creatureById } from "../data/creatures";
import { itemById } from "../data/items";
import { skillById } from "../data/skills";
import { createRng } from "./rng";
import type { Bag, BattleAction, BattleCreature, BattlePhase, RunState, Skill } from "./types";

export type BattleOutcome = "ongoing" | "won" | "lost";

export interface PhaseResolution {
  bag: Bag;
  captured: boolean;
  enemy: BattleCreature;
  outcome: BattleOutcome;
  phases: BattlePhase[];
  player: BattleCreature;
}

function cloneCreature(creature: BattleCreature): BattleCreature {
  return { ...creature, skillIds: [...creature.skillIds] };
}

function rollHit(skill: Skill): boolean {
  return Math.random() * 100 <= skill.accuracy;
}

const strongAgainst: Record<string, string[]> = {
  一般: [],
  火: ["草", "冰", "虫", "钢"],
  水: ["火", "地面", "岩石"],
  电: ["水", "飞行"],
  草: ["水", "地面", "岩石"],
  冰: ["草", "地面", "飞行", "龙"],
  格斗: ["一般", "冰", "岩石", "恶", "钢"],
  毒: ["草", "妖精"],
  地面: ["火", "电", "毒", "岩石", "钢"],
  飞行: ["草", "格斗", "虫"],
  超能力: ["格斗", "毒"],
  虫: ["草", "超能力", "恶"],
  岩石: ["火", "冰", "飞行", "虫"],
  幽灵: ["超能力", "幽灵"],
  龙: ["龙"],
  恶: ["超能力", "幽灵"],
  钢: ["冰", "岩石", "妖精"],
  妖精: ["格斗", "龙", "恶"],
};

const resistedBy: Record<string, string[]> = {
  一般: ["岩石", "钢"],
  火: ["火", "水", "岩石", "龙"],
  水: ["水", "草", "龙"],
  电: ["电", "草", "龙"],
  草: ["火", "草", "毒", "飞行", "虫", "龙", "钢"],
  冰: ["火", "水", "冰", "钢"],
  格斗: ["毒", "飞行", "超能力", "虫", "妖精"],
  毒: ["毒", "地面", "岩石", "幽灵"],
  地面: ["草", "虫"],
  飞行: ["电", "岩石", "钢"],
  超能力: ["超能力", "钢"],
  虫: ["火", "格斗", "毒", "飞行", "幽灵", "钢", "妖精"],
  岩石: ["格斗", "地面", "钢"],
  幽灵: ["恶"],
  龙: ["钢"],
  恶: ["格斗", "恶", "妖精"],
  钢: ["火", "水", "电", "钢"],
  妖精: ["火", "毒", "钢"],
};

function typeMultiplier(skill: Skill, defender: BattleCreature): number {
  const defenderTypes = creatureById[defender.speciesId].types;
  return defenderTypes.reduce((multiplier, type) => {
    if (strongAgainst[skill.element]?.includes(type)) {
      return multiplier * 1.5;
    }

    if (resistedBy[skill.element]?.includes(type)) {
      return multiplier * 0.75;
    }

    return multiplier;
  }, 1);
}

function calculateDamage(attacker: BattleCreature, defender: BattleCreature, skill: Skill): number {
  const species = creatureById[attacker.speciesId];
  const resonance = species.types.includes(skill.element) ? 2 + Math.floor(attacker.level / 6) : 0;
  return Math.max(1, Math.round((skill.power + resonance + attacker.attack - defender.defense * 0.5) * typeMultiplier(skill, defender)));
}

function effectivenessText(multiplier: number): string {
  if (multiplier >= 1.5) {
    return "克制命中";
  }

  if (multiplier <= 0.75) {
    return "效果偏弱";
  }

  return "正常命中";
}

function attack(actor: "player" | "enemy", attacker: BattleCreature, defender: BattleCreature, skill: Skill): BattlePhase {
  if (attacker.mp < skill.mpCost) {
    return {
      actor,
      message: `${attacker.name} 的能量不足，没能用出 ${skill.name}。`,
      type: actor === "enemy" ? "enemy-action" : "player-action",
    };
  }

  attacker.mp = Math.max(0, attacker.mp - skill.mpCost);

  if (!rollHit(skill)) {
    return {
      actor,
      message: `${attacker.name} 使用 ${skill.name}，但擦身而过。`,
      type: actor === "enemy" ? "enemy-action" : "player-action",
    };
  }

  const multiplier = typeMultiplier(skill, defender);
  const damage = calculateDamage(attacker, defender, skill);
  defender.hp = Math.max(0, defender.hp - damage);
  defender.status = defender.hp <= 0 ? "fainted" : defender.status;

  return {
    actor,
    message: `${attacker.name} 使用 ${skill.name}，${effectivenessText(multiplier)}，造成 ${damage} 点伤害。`,
    type: actor === "enemy" ? "enemy-action" : "player-action",
  };
}

function applyItem(player: BattleCreature, bag: Bag, itemId: string): BattlePhase {
  const item = itemById[itemId as keyof typeof itemById];

  if (!item || bag[item.id] <= 0) {
    return { actor: "system", message: "这个道具现在不能使用。", type: "player-action" };
  }

  bag[item.id] -= 1;

  if (item.kind === "healHp" || item.kind === "healBoth") {
    player.hp = Math.min(player.maxHp, player.hp + item.value);
  }

  if (item.kind === "healMp") {
    player.mp = Math.min(player.maxMp, player.mp + item.value);
  }

  if (item.kind === "healBoth") {
    player.mp = Math.min(player.maxMp, player.mp + Math.ceil(item.value / 2));
  }

  if (item.kind === "boostAttack") {
    player.attack += item.value;
  }

  if (item.kind === "boostDefense") {
    player.defense += item.value;
  }

  if (item.kind === "boostSpeed") {
    player.speed += item.value;
  }

  if (item.kind === "boostMaxHp") {
    player.maxHp += item.value;
    player.hp = Math.min(player.maxHp, player.hp + item.value);
  }

  return { actor: "player", message: `${player.name} 使用 ${item.name}。`, type: "player-action" };
}

export function predictEnemySkill(enemy: BattleCreature, turn: number, seed: number): Skill {
  const rng = createRng(seed + turn * 409 + enemy.level * 17);
  return skillById[rng.pick(enemy.skillIds)];
}

export function resolveBattleAction(run: RunState, action: BattleAction): PhaseResolution {
  const player = cloneCreature(run.player);
  const enemy = cloneCreature(run.enemy);
  const bag = { ...run.bag };
  const enemySkill = skillById[run.enemyIntentSkillId] ?? predictEnemySkill(enemy, run.turn, run.seed);
  const phases: BattlePhase[] = [];
  let captured = false;

  if (action.type === "item") {
    const item = itemById[action.itemId];
    if (!item || bag[action.itemId] <= 0) {
      phases.push({ actor: "system", message: "这个道具现在不能使用。", type: "player-action" });
      return { bag, captured, enemy, outcome: "ongoing", phases, player };
    }
  }

  function usePlayerCommand() {
    if (action.type === "skill") {
      phases.push(attack("player", player, enemy, skillById[action.skillId]));
      return;
    }

    const item = itemById[action.itemId];

    if (item.kind === "capture") {
      bag[item.id] -= 1;
      captured = Boolean(action.captureSuccess);
      phases.push({
        actor: "player",
        message: captured
          ? `${player.name} 抛出 ${item.name}，光纹稳定收束。`
          : `${player.name} 抛出 ${item.name}，光纹散开了。`,
        type: "capture-check",
      });

      if (captured) {
        enemy.status = "fainted";
      }

      return;
    }

    phases.push(applyItem(player, bag, action.itemId));
  }

  function useEnemyCommand() {
    phases.push(attack("enemy", enemy, player, enemySkill));
  }

  const order: Array<"player" | "enemy"> = player.speed >= enemy.speed ? ["player", "enemy"] : ["enemy", "player"];

  for (const actor of order) {
    if (player.hp <= 0 || enemy.hp <= 0 || captured) {
      break;
    }

    if (actor === "player") {
      usePlayerCommand();
    } else {
      useEnemyCommand();
    }
  }

  const outcome: BattleOutcome = player.hp <= 0 ? "lost" : enemy.hp <= 0 || captured ? "won" : "ongoing";
  phases.push({
    actor: "system",
    message: outcome === "won" ? "战斗胜利。" : outcome === "lost" ? `${player.name} 失去战斗能力。` : "回合结束。",
    type: outcome === "won" ? "victory-check" : outcome === "lost" ? "loss-check" : "turn-end",
  });

  return { bag, captured, enemy, outcome, phases, player };
}

export function phasesToLog(phases: BattlePhase[]): string[] {
  return phases.map((phase) => phase.message);
}
