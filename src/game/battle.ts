import { creatureById, wildCreatures } from "../data/creatures";
import { createStartingBag, itemById } from "../data/items";
import { relicById } from "../data/relics";
import { skillById } from "../data/skills";
import { temperamentById, temperaments } from "../data/temperaments";
import { phasesToLog, predictEnemySkill, resolveBattleAction } from "./battlePhases";
import { createRng, createSeed } from "./rng";
import { generateTowerRoute, getNode } from "./towerMap";
import type { BattleCreature, CreatureSpecies, ItemId, RunState } from "./types";

export const MAX_FLOOR = 10;
export const MAX_PARTY_SIZE = 3;
export const ACTIVE_PARTY_SIZE = 1;
export const MAX_KNOWN_SKILLS = 4;

type BattleOutcome = "ongoing" | "won" | "lost";

export interface BattleResult {
  run: RunState;
  outcome: BattleOutcome;
}

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function clampStat(value: number): number {
  return Math.max(1, value);
}

function createCreatureUid(speciesId: string): string {
  return `${speciesId}-${Math.floor(Math.random() * 1_000_000)}`;
}

function getSkillIdsForLevel(species: CreatureSpecies, level: number): string[] {
  const learnedSkillIds = (species.learnset ?? species.skillIds.map((skillId, index) => ({ level: index * 2 + 1, skillId })))
    .filter((entry) => entry.level <= level)
    .map((entry) => entry.skillId);
  const fallbackSkillIds = learnedSkillIds.length > 0 ? learnedSkillIds : species.skillIds;
  return Array.from(new Set(fallbackSkillIds)).slice(-MAX_KNOWN_SKILLS);
}

function getGrowth(species: CreatureSpecies): NonNullable<CreatureSpecies["growth"]> {
  return species.growth ?? { maxHp: 4, attack: 1.1, defense: 1.1, speed: 1 };
}

function calculateStatsForLevel(
  species: CreatureSpecies,
  level: number,
  temperamentId: string,
  enemy = false,
): Pick<BattleCreature, "attack" | "defense" | "maxHp" | "maxMp" | "speed"> {
  const growth = getGrowth(species);
  const temperament = temperamentById[temperamentId];
  const levelBonus = Math.max(0, level - 5);
  const enemyMultiplier = enemy ? 0.88 : 1;
  const maxHp = Math.round((species.maxHp + growth.maxHp * levelBonus) * enemyMultiplier) + (temperament.modifiers.maxHp ?? 0);
  const attack = Math.round((species.attack + growth.attack * levelBonus) * enemyMultiplier) + (temperament.modifiers.attack ?? 0);
  const defense = Math.round((species.defense + growth.defense * levelBonus) * enemyMultiplier) + (temperament.modifiers.defense ?? 0);
  const speed = Math.round(species.speed + growth.speed * levelBonus) + (temperament.modifiers.speed ?? 0);
  const maxMp = 16 + Math.floor(level * 1.8) + Math.max(0, species.speed - 6);

  return {
    attack: clampStat(attack),
    defense: clampStat(defense),
    maxHp: clampStat(maxHp),
    maxMp,
    speed: clampStat(speed),
  };
}

function applyStatsForLevel(creature: BattleCreature, level: number): BattleCreature {
  const hpRatio = creature.maxHp > 0 ? creature.hp / creature.maxHp : 1;
  const mpRatio = creature.maxMp > 0 ? creature.mp / creature.maxMp : 1;
  const species = creatureById[creature.speciesId];
  const stats = calculateStatsForLevel(species, level, creature.temperamentId);

  creature.level = level;
  creature.maxHp = stats.maxHp;
  creature.maxMp = stats.maxMp;
  creature.attack = stats.attack;
  creature.defense = stats.defense;
  creature.speed = stats.speed;
  creature.hp = Math.max(1, Math.min(creature.maxHp, Math.round(creature.maxHp * hpRatio)));
  creature.mp = Math.max(0, Math.min(creature.maxMp, Math.round(creature.maxMp * mpRatio)));

  return creature;
}

export function learnSkill(creature: BattleCreature, skillId: string): string | null {
  if (creature.skillIds.includes(skillId)) {
    return null;
  }

  const skillName = skillById[skillId]?.name ?? skillId;

  if (creature.skillIds.length < MAX_KNOWN_SKILLS) {
    creature.skillIds = [...creature.skillIds, skillId];
    return `${creature.name} 学会了 ${skillName}。`;
  }

  return `${creature.name} 想学习 ${skillName}，但技能位已满。`;
}

export function toBattleCreature(
  species: CreatureSpecies,
  floor = 1,
  enemy = false,
  temperamentId = pickOne(temperaments).id,
): BattleCreature {
  const level = enemy ? Math.max(2, floor + 1) : 5;
  const stats = calculateStatsForLevel(species, level, temperamentId, enemy);

  return {
    uid: createCreatureUid(species.id),
    speciesId: species.id,
    name: species.name,
    level,
    exp: 0,
    temperamentId,
    maxHp: stats.maxHp,
    hp: stats.maxHp,
    maxMp: stats.maxMp,
    mp: stats.maxMp,
    attack: stats.attack,
    defense: stats.defense,
    speed: stats.speed,
    skillIds: getSkillIdsForLevel(species, level),
    status: "healthy",
  };
}

export function createEnemy(floor: number, seed = Math.random() * 1_000_000): BattleCreature {
  const rng = createRng(Math.floor(seed) + floor * 991);
  const habitatPool = wildCreatures.filter(
    (creature) => floor >= creature.habitatFloors[0] && floor <= creature.habitatFloors[1],
  );
  const pool = habitatPool.length > 0 ? habitatPool : wildCreatures.slice(0, Math.min(wildCreatures.length, 3 + floor));
  return toBattleCreature(rng.pick(pool), floor, true, rng.pick(temperaments).id);
}

export function createRun(starterId: string): RunState {
  const seed = createSeed();
  const route = generateTowerRoute(seed);
  const firstNodeId = route.activePathIds[0];
  const player = toBattleCreature(creatureById[starterId], 1, false);
  const enemy = createEnemy(1, seed);

  return {
    seed,
    floor: 1,
    route,
    currentNodeId: firstNodeId,
    player,
    party: [player],
    activePartyUids: [player.uid],
    bag: createStartingBag(),
    enemy,
    enemyIntentSkillId: predictEnemySkill(enemy, 1, seed).id,
    turn: 1,
    relicIds: [],
    battleLog: [`${player.name} 醒来了。种子 ${seed} 的塔路正在展开。`],
    completed: false,
  };
}

function cloneCreature(creature: BattleCreature): BattleCreature {
  return { ...creature, skillIds: [...creature.skillIds] };
}

function cloneParty(run: RunState, player: BattleCreature): BattleCreature[] {
  const party = run.party.map(cloneCreature);
  const activeIndex = Math.max(0, party.findIndex((pet) => pet.uid === player.uid));
  party[activeIndex] = cloneCreature(player);
  return party;
}

function appendLog(existing: string[], entries: string[]): string[] {
  return [...entries, ...existing].slice(0, 8);
}

function levelUp(player: BattleCreature): string[] {
  const log: string[] = [];
  let leveled = { ...player };

  while (leveled.exp >= leveled.level * 12) {
    leveled.exp -= leveled.level * 12;
    applyStatsForLevel(leveled, leveled.level + 1);
    const currentSpecies = creatureById[leveled.speciesId];
    currentSpecies.learnset
      ?.filter((entry) => entry.level === leveled.level)
      .forEach((entry) => {
        const learnedLog = learnSkill(leveled, entry.skillId);
        if (learnedLog) {
          log.push(learnedLog);
        }
      });
    log.push(`${leveled.name} 升到 ${leveled.level} 级。`);
  }

  const currentSpecies = creatureById[leveled.speciesId];

  if (currentSpecies.evolution && leveled.level >= currentSpecies.evolution.level) {
    const nextSpecies = creatureById[currentSpecies.evolution.toId];
    leveled = {
      ...leveled,
      speciesId: nextSpecies.id,
      name: nextSpecies.name,
      skillIds: getSkillIdsForLevel(nextSpecies, leveled.level),
    };
    applyStatsForLevel(leveled, leveled.level);
    log.push(`${currentSpecies.name} 蜕变成 ${nextSpecies.name}。`);
  }

  Object.assign(player, leveled);
  return log;
}

function syncCreatureLevel(creature: BattleCreature, target: BattleCreature): string[] {
  const log: string[] = [];

  creature.exp = target.exp;

  while (creature.level < target.level) {
    creature.exp = creature.level * 12;
    log.push(...levelUp(creature));
  }

  if (creature.level > target.level) {
    applyStatsForLevel(creature, target.level);
  }

  creature.exp = target.exp;
  return log;
}

function createSyncedPartyCreature(enemy: BattleCreature, target: BattleCreature): BattleCreature {
  const species = creatureById[enemy.speciesId];
  const creature = toBattleCreature(species, 1, false, enemy.temperamentId);

  creature.uid = enemy.uid;
  syncCreatureLevel(creature, target);
  creature.level = target.level;
  creature.exp = target.exp;
  creature.hp = Math.max(1, Math.ceil(creature.maxHp * 0.35));
  creature.mp = Math.max(1, Math.ceil(creature.maxMp * 0.35));
  creature.status = "healthy";

  return creature;
}

export function gainVictoryProgress(run: RunState): RunState {
  const party = run.party.map(cloneCreature);
  const activeIndex = Math.max(0, party.findIndex((pet) => pet.uid === run.player.uid));
  const player = party[activeIndex] ?? cloneCreature(run.player);
  const gainedExp = 10 + run.floor * 5;
  const recoveredHp = Math.max(1, Math.ceil(player.maxHp * 0.45));
  const recoveredMp = Math.max(1, Math.ceil(player.maxMp * 0.35));
  player.exp += gainedExp;
  player.hp = Math.min(player.maxHp, player.hp + recoveredHp);
  player.mp = Math.min(player.maxMp, player.mp + recoveredMp);
  const progressLog = [
    `${player.name} 获得 ${gainedExp} 点经验。`,
    `${player.name} 稳住呼吸，回复 ${recoveredHp} 点生命和 ${recoveredMp} 点能量。`,
    "战斗结束，选择一件掉落道具。",
    ...levelUp(player),
  ];

  party[activeIndex] = player;

  party.forEach((pet, index) => {
    if (index === activeIndex) {
      return;
    }

    progressLog.push(...syncCreatureLevel(pet, player));

    if (pet.level === player.level) {
      progressLog.push(`${pet.name} 同步到 Lv.${player.level}。`);
    }
  });

  return {
    ...run,
    player,
    party,
    battleLog: appendLog(run.battleLog, progressLog),
  };
}

export function useSkill(run: RunState, skillId: string): BattleResult {
  const result = resolveBattleAction(run, { skillId, type: "skill" });

  return {
    outcome: result.outcome,
    run: {
      ...run,
      bag: result.bag,
      player: result.player,
      party: cloneParty(run, result.player),
      enemy: result.enemy,
      enemyIntentSkillId: predictEnemySkill(result.enemy, run.turn + 1, run.seed).id,
      turn: run.turn + 1,
      battleLog: appendLog(run.battleLog, phasesToLog(result.phases)),
    },
  };
}

export function getCaptureChance(run: RunState): number {
  const missingHpRatio = 1 - run.enemy.hp / run.enemy.maxHp;
  const species = creatureById[run.enemy.speciesId];
  const relicBonus = run.relicIds.reduce((sum, relicId) => {
    const relic = relicById[relicId];
    return relic.effect.type === "capture" ? sum + relic.effect.value : sum;
  }, 0);

  return Math.max(
    5,
    Math.min(92, Math.round(34 + missingHpRatio * 58 + relicBonus - run.floor * 1.2 - species.captureDifficulty * 0.55)),
  );
}

export function tryCapture(run: RunState): BattleResult {
  const chance = getCaptureChance(run);

  const result = resolveBattleAction(run, {
    type: "item",
    itemId: "thread-capsule",
    captureSuccess: Math.random() * 100 <= chance,
  });

  if (result.captured) {
    const party = cloneParty(run, result.player);
    const joinedParty = party.length < MAX_PARTY_SIZE;

    if (joinedParty) {
      party.push(createSyncedPartyCreature(result.enemy, result.player));
    }

    return {
      outcome: "won",
      run: {
        ...run,
        player: result.player,
        party,
        activePartyUids: run.activePartyUids,
        bag: result.bag,
        enemy: result.enemy,
        battleLog: appendLog(run.battleLog, [
          ...phasesToLog(result.phases),
          joinedParty
            ? `${result.enemy.name} 加入队伍。`
            : `${result.enemy.name} 已记录；队伍已满，暂未携带。`,
        ]),
      },
    };
  }

  return {
    outcome: result.outcome,
    run: {
      ...run,
      player: result.player,
      party: cloneParty(run, result.player),
      bag: result.bag,
      enemy: result.enemy,
      enemyIntentSkillId: predictEnemySkill(result.enemy, run.turn + 1, run.seed).id,
      turn: run.turn + 1,
      battleLog: appendLog(run.battleLog, phasesToLog(result.phases)),
    },
  };
}

export function advanceFloor(run: RunState): RunState {
  const nextFloor = run.floor + 1;

  if (nextFloor > MAX_FLOOR) {
    return {
      ...run,
      completed: true,
      battleLog: appendLog(run.battleLog, ["第 10 层的塔门安静下来，本次登塔完成。"]),
    };
  }

  const nextNodeId = run.route.activePathIds[nextFloor - 1];
  const nextNode = getNode(run.route, nextNodeId);
  const nodeLabel =
    nextNode.type === "elite"
      ? "强敌纹路"
      : nextNode.type === "rest"
        ? "静息纹路"
        : nextNode.type === "cache"
          ? "藏匣纹路"
          : "战斗纹路";
  const enemy = createEnemy(nextFloor, run.seed + nextFloor * 77);

  return {
    ...run,
    floor: nextFloor,
    currentNodeId: nextNodeId,
    enemy,
    enemyIntentSkillId: predictEnemySkill(enemy, 1, run.seed + nextFloor * 77).id,
    turn: 1,
    battleLog: [`第 ${nextFloor} 层进入${nodeLabel}，新的守卫出现了。`, ...run.battleLog].slice(0, 8),
  };
}

export function setActiveParty(run: RunState, activePartyUids: string[]): RunState {
  const validIds = activePartyUids.filter((uid) => run.party.some((pet) => pet.uid === uid)).slice(0, ACTIVE_PARTY_SIZE);
  const fallbackIds = validIds.length > 0 ? validIds : run.party.slice(0, ACTIVE_PARTY_SIZE).map((pet) => pet.uid);
  const nextPlayer = run.party.find((pet) => pet.uid === fallbackIds[0]) ?? run.player;

  return {
    ...run,
    activePartyUids: fallbackIds,
    player: cloneCreature(nextPlayer),
    battleLog: appendLog(run.battleLog, [`已选择 ${fallbackIds.length} 只精灵出战。`]),
  };
}

export function useBagItem(run: RunState, itemId: ItemId): RunState {
  return useBagItemOnPet(run, itemId, run.player.uid);
}

export function useBagItemOnPet(run: RunState, itemId: ItemId, targetUid: string): RunState {
  const item = itemById[itemId];
  const bag = { ...run.bag };
  const target = run.party.find((pet) => pet.uid === targetUid) ?? run.player;
  const player = cloneCreature(target);

  if (bag[itemId] <= 0 || item.kind === "capture") {
    return {
      ...run,
      battleLog: appendLog(run.battleLog, [`无法使用 ${item.name}。`]),
    };
  }

  bag[itemId] -= 1;

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

  const party = run.party.map((pet) => (pet.uid === player.uid ? cloneCreature(player) : cloneCreature(pet)));
  const nextPlayer = run.player.uid === player.uid ? player : run.player;

  return {
    ...run,
    player: nextPlayer,
    party,
    bag,
    battleLog: appendLog(run.battleLog, [`使用 ${item.name}。`]),
  };
}

export function useBattleBagItem(run: RunState, itemId: ItemId): BattleResult {
  if (itemById[itemId].kind === "capture") {
    return tryCapture(run);
  }

  if (run.bag[itemId] <= 0) {
    const failedRun = useBagItem(run, itemId);
    return { outcome: "ongoing", run: failedRun };
  }

  const result = resolveBattleAction(run, { itemId, type: "item" });

  return {
    outcome: result.outcome,
    run: {
      ...run,
      bag: result.bag,
      player: result.player,
      party: cloneParty(run, result.player),
      enemy: result.enemy,
      enemyIntentSkillId: predictEnemySkill(result.enemy, run.turn + 1, run.seed).id,
      turn: run.turn + 1,
      battleLog: appendLog(run.battleLog, phasesToLog(result.phases)),
    },
  };
}
