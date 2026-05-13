import { useEffect, useRef, useState } from "react";
import { Backpack, ChevronDown, ChevronUp, Heart, Shield, Skull, Sparkles, Swords, Trophy, Zap } from "lucide-react";
import { creatureById } from "../data/creatures";
import { itemById, items } from "../data/items";
import { relicById } from "../data/relics";
import { skillById } from "../data/skills";
import { temperamentById } from "../data/temperaments";
import { skillTypeStyle, typeStyle } from "../data/typeStyles";
import { getCaptureChance, MAX_FLOOR } from "../game/battle";
import type { BattleCreature, BattleEndSummary, ItemId, RewardOption, RunState } from "../game/types";
import { CreatureSigil } from "./CreatureSigil";
import { ItemIcon } from "./ItemIcon";
import { TowerMap } from "./TowerMap";

interface BattleScreenProps {
  run: RunState;
  battleEnd?: "won" | "lost" | null;
  battleEndSummary?: BattleEndSummary | null;
  rewards: RewardOption[];
  onBattleEndContinue: () => void;
  onChooseReward: (reward: RewardOption) => void;
  onUseSkill: (skillId: string) => void;
  onUseItem: (itemId: ItemId) => void;
}

function hpPercent(creature: BattleCreature): number {
  return Math.max(0, Math.round((creature.hp / creature.maxHp) * 100));
}

function actionOrder(run: RunState): [BattleCreature, BattleCreature] {
  return run.player.speed >= run.enemy.speed ? [run.player, run.enemy] : [run.enemy, run.player];
}

function statDelta(after: number, before: number): string {
  const delta = after - before;
  return delta > 0 ? `+${delta}` : String(delta);
}

function CombatantPanel({ creature, align }: { creature: BattleCreature; align: "player" | "enemy" }) {
  const species = creatureById[creature.speciesId];
  const temperament = temperamentById[creature.temperamentId];

  return (
    <article className={`combatant ${align} ${creature.status === "fainted" ? "is-fainted" : ""}`}>
      <CreatureSigil creature={species} />
      <div className="combatant-copy">
        <p className="eyebrow">{align === "player" ? "同行者" : "塔层守卫"}</p>
        <h2>{creature.name}</h2>
        <div className="creature-tags">
          <span>Lv.{creature.level}</span>
          <span>{temperament.name}</span>
          {species.types.map((type) => (
            <span className="type-badge" key={type} style={typeStyle(type)}>
              {type}
            </span>
          ))}
        </div>
        <div className="hp-row">
          <span>
            生命 {creature.hp} / {creature.maxHp}
          </span>
          <div className="hp-bar">
            <i style={{ width: `${hpPercent(creature)}%` }} />
          </div>
        </div>
        <div className="mp-row">
          能量 {creature.mp} / {creature.maxMp}
        </div>
        <div className="battle-stats">
          <span>
            <Swords size={14} /> {creature.attack}
          </span>
          <span>
            <Shield size={14} /> {creature.defense}
          </span>
          <span>
            <Zap size={14} /> {creature.speed}
          </span>
        </div>
        {align === "player" && (
          <div className="exp-line">
            经验 {creature.exp} / {creature.level * 12}
          </div>
        )}
      </div>
    </article>
  );
}

export function BattleScreen({
  run,
  battleEnd = null,
  battleEndSummary,
  rewards,
  onBattleEndContinue,
  onChooseReward,
  onUseSkill,
  onUseItem,
}: BattleScreenProps) {
  const [mapOpen, setMapOpen] = useState(false);
  const [partyOpen, setPartyOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [motion, setMotion] = useState<"skill" | "item" | "capture" | null>(null);
  const motionTimerRef = useRef<number | undefined>(undefined);
  const captureChance = getCaptureChance(run);
  const enemyIntent = skillById[run.enemyIntentSkillId];
  const [firstActor, secondActor] = actionOrder(run);
  const commandsLocked = Boolean(battleEnd);
  const victoryRows =
    battleEndSummary === null || battleEndSummary === undefined
      ? []
      : [
          battleEndSummary.before.level !== battleEndSummary.after.level
            ? {
                label: "等级",
                value: `Lv.${battleEndSummary.before.level} → Lv.${battleEndSummary.after.level}`,
              }
            : null,
          { label: "经验", value: `+${battleEndSummary.expGained}` },
          battleEndSummary.before.name !== battleEndSummary.after.name
            ? { label: "形态", value: battleEndSummary.after.name }
            : null,
          battleEndSummary.learnedSkillIds.length > 0
            ? {
                label: "新技能",
                value: battleEndSummary.learnedSkillIds.map((skillId) => skillById[skillId]?.name ?? skillId).join("、"),
              }
            : null,
          battleEndSummary.before.maxHp !== battleEndSummary.after.maxHp
            ? {
                label: "生命",
                value: `${battleEndSummary.after.maxHp} (${statDelta(
                  battleEndSummary.after.maxHp,
                  battleEndSummary.before.maxHp
                )})`,
              }
            : null,
          battleEndSummary.before.attack !== battleEndSummary.after.attack
            ? {
                label: "攻击",
                value: `${battleEndSummary.after.attack} (${statDelta(
                  battleEndSummary.after.attack,
                  battleEndSummary.before.attack
                )})`,
              }
            : null,
          battleEndSummary.before.defense !== battleEndSummary.after.defense
            ? {
                label: "防御",
                value: `${battleEndSummary.after.defense} (${statDelta(
                  battleEndSummary.after.defense,
                  battleEndSummary.before.defense
                )})`,
              }
            : null,
          battleEndSummary.before.speed !== battleEndSummary.after.speed
            ? {
                label: "速度",
                value: `${battleEndSummary.after.speed} (${statDelta(
                  battleEndSummary.after.speed,
                  battleEndSummary.before.speed
                )})`,
              }
            : null,
        ].filter((row): row is { label: string; value: string } => row !== null);

  useEffect(() => {
    return () => {
      if (motionTimerRef.current) {
        window.clearTimeout(motionTimerRef.current);
      }
    };
  }, []);

  function triggerMotion(nextMotion: "skill" | "item" | "capture", action: () => void) {
    if (commandsLocked) {
      return;
    }

    if (motionTimerRef.current) {
      window.clearTimeout(motionTimerRef.current);
    }

    setMotion(null);
    window.requestAnimationFrame(() => {
      setMotion(nextMotion);
      motionTimerRef.current = window.setTimeout(() => setMotion(null), 560);
    });
    action();
  }

  return (
    <main className={`screen battle-screen ${motion ? `is-${motion}-motion` : ""}`}>
      <header className="battle-topbar">
        <div>
          <p className="eyebrow">第 {run.floor} / {MAX_FLOOR} 层</p>
          <h2>活塔战斗</h2>
        </div>
        <div className="relic-row">
          {run.relicIds.length === 0 ? (
            <span>暂无遗物</span>
          ) : (
            run.relicIds.map((relicId) => <span key={relicId}>{relicById[relicId].name}</span>)
          )}
        </div>
      </header>

      <section className="party-collapse" aria-label="携带精灵">
        <button className="party-summary" onClick={() => setPartyOpen((open) => !open)}>
          <span>
            <strong>携带精灵</strong>
            {run.party.length} / 3 · 当前出战 {run.player.name} Lv.{run.player.level}
          </span>
          {partyOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </button>
        {partyOpen && (
          <div className="party-strip">
            {run.party.map((pet) => {
              const species = creatureById[pet.speciesId];
              return (
                <div
                  className={`party-pet ${pet.uid === run.player.uid ? "is-active" : ""} ${
                    run.activePartyUids.includes(pet.uid) ? "is-selected" : ""
                  }`}
                  key={pet.uid}
                >
                  <CreatureSigil creature={species} size="small" />
                  <span>{pet.name}</span>
                  <small>
                    Lv.{pet.level} · 生命 {pet.hp}/{pet.maxHp} · 能量 {pet.mp}/{pet.maxMp}
                  </small>
                </div>
              );
            })}
            {Array.from({ length: Math.max(0, 3 - run.party.length) }).map((_, index) => (
              <div className="party-pet is-empty" key={`empty-${index}`}>
                <span>空位</span>
                <small>本局最多 3 只</small>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="map-toggle-row">
        <button className="secondary-action compact-action" onClick={() => setMapOpen((open) => !open)}>
          {mapOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
          {mapOpen ? "隐藏路线图" : "查看路线图"}
        </button>
      </section>
      {mapOpen && <TowerMap route={run.route} currentNodeId={run.currentNodeId} />}

      <section className="turn-order-panel" aria-label="行动顺序">
        <div>
          <p className="eyebrow">行动顺序</p>
          <strong>
            {firstActor.name} 先行动，{secondActor.name} 后行动
          </strong>
        </div>
        <span>
          速度 {firstActor.speed} / {secondActor.speed}
        </span>
      </section>

      <section className="arena">
        <CombatantPanel creature={run.enemy} align="enemy" />
        <div className="versus">
          <Swords size={26} />
        </div>
        <CombatantPanel creature={run.player} align="player" />
      </section>

      {battleEnd && (
        <section className={`battle-end-panel is-${battleEnd}`} aria-label="战斗结果">
          <div className="battle-end-icon">{battleEnd === "won" ? <Trophy size={34} /> : <Skull size={34} />}</div>
          <div>
            <p className="eyebrow">{battleEnd === "won" ? "战斗结束" : "登塔中断"}</p>
            <h2>{battleEnd === "won" ? `${run.enemy.name} 被击退了` : `${run.player.name} 倒下了`}</h2>
            <p>{battleEnd === "won" ? "稍作整理，选择一件本层奖励。" : "塔光正在暗下去，准备查看本次结算。"}</p>
            {battleEnd === "won" && battleEndSummary && (
              <>
                <div className="victory-summary">
                  {victoryRows.map((row) => (
                    <div key={row.label}>
                      <span>{row.label}</span>
                      <strong>{row.value}</strong>
                    </div>
                  ))}
                </div>
                {battleEndSummary.drops.length > 0 && (
                  <div className="victory-drops">
                    <span>随机掉落</span>
                    <div>
                      {battleEndSummary.drops.map((drop) => (
                        <strong key={drop.itemId}>
                          <ItemIcon itemId={drop.itemId} size="small" />
                          {itemById[drop.itemId].name} x{drop.amount}
                        </strong>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {battleEnd === "won" && rewards.length > 0 && (
              <div className="victory-rewards">
                <div className="victory-rewards-title">
                  <Sparkles size={16} />
                  <strong>选择一个掉落道具</strong>
                </div>
                <div className="victory-reward-grid">
                  {rewards.map((reward) => (
                    <button className="victory-reward-card" key={reward.id} onClick={() => onChooseReward(reward)}>
                      <ItemIcon itemId={reward.itemId} />
                      <span>
                        <strong>{reward.label}</strong>
                        <small>{reward.description}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {battleEnd === "lost" && (
            <button className="primary-action" onClick={onBattleEndContinue}>
              <Heart size={18} />
              查看结算
            </button>
          )}
        </section>
      )}

      {enemyIntent && (
        <section className="intent-panel" aria-label="敌方预告" style={skillTypeStyle(enemyIntent.element)}>
          <div className="intent-heading">
            <strong>敌方即将使用</strong>
            <span>{run.enemy.name}</span>
          </div>
          <div className="enemy-skill-card">
            <b className="skill-type-band" style={skillTypeStyle(enemyIntent.element)} />
            <div>
              <h3>{enemyIntent.name}</h3>
              <p>{enemyIntent.description}</p>
            </div>
            <div className="enemy-skill-meta">
              <i className="inline-type" style={typeStyle(enemyIntent.element)}>
                {enemyIntent.element}
              </i>
              <span>能量 {enemyIntent.mpCost}</span>
              <span>威力 {enemyIntent.power}</span>
              <span>命中 {enemyIntent.accuracy}%</span>
            </div>
          </div>
        </section>
      )}

      <section className="command-zone">
        <div className="skill-grid">
          {run.player.skillIds.map((skillId) => {
            const skill = skillById[skillId];
            return (
              <button
                key={skill.id}
                className="skill-button"
                disabled={commandsLocked}
                style={skillTypeStyle(skill.element)}
                onClick={() => triggerMotion("skill", () => onUseSkill(skill.id))}
              >
                <strong>{skill.name}</strong>
                <span>
                  <i className="inline-type" style={typeStyle(skill.element)}>
                    {skill.element}
                  </i>
                  能量 {skill.mpCost} · 威力 {skill.power} · 命中 {skill.accuracy}%
                </span>
                <b className="skill-type-band" style={skillTypeStyle(skill.element)} />
              </button>
            );
          })}
        </div>
      </section>

      <section className={`bag-panel ${bagOpen ? "is-open" : ""}`} aria-label="背包">
        <button className="panel-toggle" onClick={() => setBagOpen((open) => !open)}>
          <span className="log-title">
            <Backpack size={15} />
            背包（使用会占用 1 回合）
          </span>
          {bagOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </button>
        <div className="bag-grid">
          {items.map((item) => (
            <button
              className={`bag-button ${item.kind === "capture" ? "is-capture-item" : ""}`}
              disabled={commandsLocked || run.bag[item.id] <= 0}
              key={item.id}
              onClick={() => triggerMotion(item.kind === "capture" ? "capture" : "item", () => onUseItem(item.id))}
            >
              <ItemIcon itemId={item.id} size="small" />
              <span className="bag-copy">
                <strong>{item.name}</strong>
                <span>
                  x{run.bag[item.id]} · {item.kind === "capture" ? `收束 ${captureChance}%` : item.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className={`battle-log ${logOpen ? "is-open" : ""}`} aria-label="战斗记录">
        <button className="panel-toggle" onClick={() => setLogOpen((open) => !open)}>
          <span className="log-title">
            <Heart size={15} />
            战况
          </span>
          {logOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
        </button>
        <div className="battle-log-entries">
          {run.battleLog.map((entry, index) => (
            <p key={`${entry}-${index}`}>{entry}</p>
          ))}
        </div>
      </section>
    </main>
  );
}
