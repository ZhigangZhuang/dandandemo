import { CreatureSigil } from "./CreatureSigil";
import type { BattleCreature, CreatureSpecies } from "../game/types";
import { creatureById } from "../data/creatures";
import { typeStyle } from "../data/typeStyles";

interface CreatureCardProps {
  creature?: CreatureSpecies;
  creatureId?: string;
  locked?: boolean;
  selected?: boolean;
  battleCreature?: BattleCreature;
  actionLabel?: string;
  onClick?: () => void;
}

function percent(current: number, max: number): number {
  return Math.max(0, Math.min(100, Math.round((current / max) * 100)));
}

export function CreatureCard({
  creature,
  creatureId,
  locked = false,
  selected = false,
  battleCreature,
  actionLabel,
  onClick,
}: CreatureCardProps) {
  const resolvedCreature = creature ?? (creatureId ? creatureById[creatureId] : undefined);

  if (!resolvedCreature) {
    return null;
  }

  return (
    <button
      className={`creature-card ${locked ? "is-locked" : ""} ${selected ? "is-selected" : ""}`}
      onClick={onClick}
      disabled={locked && !onClick}
    >
      <CreatureSigil creature={resolvedCreature} />
      <div className="creature-card-copy">
        <div className="card-kicker">
          No.{String(resolvedCreature.dexNo).padStart(3, "0")} · {resolvedCreature.role}
        </div>
        <h3>{locked ? "未记录生命" : resolvedCreature.name}</h3>
        {!locked && (
          <div className="type-row">
            {resolvedCreature.types.map((type) => (
              <span className="type-badge" key={type} style={typeStyle(type)}>
                {type}
              </span>
            ))}
          </div>
        )}
        {!locked && resolvedCreature.animalBase && <p className="animal-base">原型：{resolvedCreature.animalBase}</p>}
        {!locked && (
          <p className="animal-base">
            栖息：{resolvedCreature.habitatFloors[0]}-{resolvedCreature.habitatFloors[1]} 层 · 捕捉难度{" "}
            {resolvedCreature.captureDifficulty}
          </p>
        )}
        <p>{locked ? "在高塔中完成收束后会显示详情。" : resolvedCreature.description}</p>
        {!locked && resolvedCreature.visualNote && <p className="visual-note">{resolvedCreature.visualNote}</p>}
        {!locked && battleCreature && (
          <div className="card-vitals" aria-label={`${battleCreature.name} 当前状态`}>
            <div className="vital-row">
              <span>
                生命 {battleCreature.hp} / {battleCreature.maxHp}
              </span>
              <div className="mini-bar hp-mini-bar">
                <i style={{ width: `${percent(battleCreature.hp, battleCreature.maxHp)}%` }} />
              </div>
            </div>
            <div className="vital-row">
              <span>
                能量 {battleCreature.mp} / {battleCreature.maxMp}
              </span>
              <div className="mini-bar mp-mini-bar">
                <i style={{ width: `${percent(battleCreature.mp, battleCreature.maxMp)}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>
      {!locked && (
        <dl className="stat-grid">
          <div>
            <dt>生命</dt>
            <dd>{resolvedCreature.maxHp}</dd>
          </div>
          <div>
            <dt>攻击</dt>
            <dd>{resolvedCreature.attack}</dd>
          </div>
          <div>
            <dt>防御</dt>
            <dd>{resolvedCreature.defense}</dd>
          </div>
          <div>
            <dt>速度</dt>
            <dd>{resolvedCreature.speed}</dd>
          </div>
        </dl>
      )}
      {!locked && resolvedCreature.evolution && (
        <span className="evolution-note">
          {resolvedCreature.evolution.level} 级蜕变：{creatureById[resolvedCreature.evolution.toId].name}
        </span>
      )}
      {actionLabel && <span className="card-action">{actionLabel}</span>}
    </button>
  );
}
