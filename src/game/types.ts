export type Screen = "title" | "starter" | "battle" | "lineup" | "collection" | "defeat";

export type SkillTag = "impact" | "pierce" | "echo" | "growth" | "dust" | "tide";
export type ElementType =
  | "一般"
  | "火"
  | "水"
  | "电"
  | "草"
  | "冰"
  | "格斗"
  | "毒"
  | "地面"
  | "飞行"
  | "超能力"
  | "虫"
  | "岩石"
  | "幽灵"
  | "龙"
  | "恶"
  | "钢"
  | "妖精";
export type TemperamentId = "bold" | "keen" | "calm" | "swift" | "stubborn" | "wild";

export interface Skill {
  id: string;
  name: string;
  power: number;
  accuracy: number;
  mpCost: number;
  element: ElementType;
  tag: SkillTag;
  description: string;
}

export type CreatureRarity = "starter" | "wild" | "evolved";

export type CreatureShape = "core" | "shell" | "sprout" | "shard" | "veil" | "ring";

export interface CreatureSpecies {
  id: string;
  dexNo: number;
  name: string;
  rarity: CreatureRarity;
  role: string;
  habitatFloors: [number, number];
  captureDifficulty: number;
  types: ElementType[];
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  growth?: {
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  skillIds: string[];
  learnset?: Array<{
    level: number;
    skillId: string;
  }>;
  evolution?: {
    toId: string;
    level: number;
  };
  shape: CreatureShape;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  description: string;
  visualNote?: string;
  animalBase?: string;
}

export interface BattleCreature {
  uid: string;
  speciesId: string;
  name: string;
  level: number;
  exp: number;
  temperamentId: TemperamentId;
  maxHp: number;
  hp: number;
  maxMp: number;
  mp: number;
  attack: number;
  defense: number;
  speed: number;
  skillIds: string[];
  status: "healthy" | "fainted";
}

export type BattleAction =
  | { type: "skill"; skillId: string }
  | { type: "item"; itemId: ItemId; captureSuccess?: boolean };

export type BattlePhaseType =
  | "player-action"
  | "enemy-action"
  | "capture-check"
  | "turn-end"
  | "victory-check"
  | "loss-check";

export interface BattlePhase {
  type: BattlePhaseType;
  actor: "player" | "enemy" | "system";
  message: string;
}

export type ItemId =
  | "pulse-drop"
  | "clear-sap"
  | "camp-biscuit"
  | "might-candy"
  | "guard-candy"
  | "swift-candy"
  | "vital-jelly"
  | "thread-capsule";

export interface BagItem {
  id: ItemId;
  name: string;
  description: string;
  kind: "healHp" | "healMp" | "healBoth" | "boostAttack" | "boostDefense" | "boostSpeed" | "boostMaxHp" | "capture";
  value: number;
}

export type Bag = Record<ItemId, number>;

export interface Temperament {
  id: TemperamentId;
  name: string;
  description: string;
  modifiers: {
    maxHp?: number;
    attack?: number;
    defense?: number;
    speed?: number;
  };
}

export type MapNodeType = "battle" | "elite" | "rest" | "cache";

export interface TowerNode {
  id: string;
  floor: number;
  lane: number;
  type: MapNodeType;
  nextIds: string[];
}

export interface TowerRoute {
  seed: number;
  floors: TowerNode[][];
  activePathIds: string[];
}

export interface Relic {
  id: string;
  name: string;
  description: string;
  effect: {
    type: "attack" | "defense" | "speed" | "maxHp" | "capture";
    value: number;
  };
}

export interface RunState {
  seed: number;
  floor: number;
  route: TowerRoute;
  currentNodeId: string;
  player: BattleCreature;
  party: BattleCreature[];
  activePartyUids: string[];
  bag: Bag;
  enemy: BattleCreature;
  enemyIntentSkillId: string;
  turn: number;
  relicIds: string[];
  battleLog: string[];
  completed: boolean;
}

export interface BattleEndSummary {
  after: {
    attack: number;
    defense: number;
    exp: number;
    level: number;
    maxHp: number;
    name: string;
    speed: number;
  };
  before: {
    attack: number;
    defense: number;
    exp: number;
    level: number;
    maxHp: number;
    name: string;
    speed: number;
  };
  expGained: number;
  learnedSkillIds: string[];
  drops: RewardDrop[];
}

export interface RewardDrop {
  itemId: ItemId;
  amount: number;
}

export type RewardOption =
  {
    id: string;
    type: "item";
    label: string;
    description: string;
    itemId: ItemId;
    amount: number;
  };

export interface SaveData {
  unlockedCreatureIds: string[];
}
