import { useMemo, useState } from "react";
import { creatures } from "./data/creatures";
import {
  advanceFloor,
  createRun,
  gainVictoryProgress,
  setActiveParty,
  useBagItemOnPet,
  useBattleBagItem,
  useSkill,
} from "./game/battle";
import { applyDrops, applyReward, generateRandomDrops, generateRewards } from "./game/rewards";
import { loadSave, saveGame, unlockCreature } from "./game/storage";
import type { BattleCreature, BattleEndSummary, ItemId, RewardDrop, RewardOption, RunState, SaveData, Screen } from "./game/types";
import { BattleScreen } from "./components/BattleScreen";
import { CollectionScreen } from "./components/CollectionScreen";
import { StarterSelect } from "./components/StarterSelect";
import { TitleScreen } from "./components/TitleScreen";
import { LineupScreen } from "./components/LineupScreen";
import { DefeatScreen } from "./components/DefeatScreen";

function App() {
  const [screen, setScreen] = useState<Screen>("title");
  const [save, setSave] = useState<SaveData>(() => {
    const loaded = loadSave();
    saveGame(loaded);
    return loaded;
  });
  const [run, setRun] = useState<RunState | null>(null);
  const [defeatedRun, setDefeatedRun] = useState<RunState | null>(null);
  const [battleEnd, setBattleEnd] = useState<"won" | "lost" | null>(null);
  const [battleEndSummary, setBattleEndSummary] = useState<BattleEndSummary | null>(null);
  const [rewards, setRewards] = useState<RewardOption[]>([]);
  const [titleNote, setTitleNote] = useState("本地 Demo 已就绪。");

  const unlockedCount = useMemo(() => save.unlockedCreatureIds.length, [save.unlockedCreatureIds.length]);

  function returnToTitle(note: string) {
    setRun(null);
    setDefeatedRun(null);
    setBattleEnd(null);
    setBattleEndSummary(null);
    setRewards([]);
    setTitleNote(note);
    setScreen("title");
  }

  function startNewGame() {
    setTitleNote("");
    setRun(null);
    setBattleEnd(null);
    setBattleEndSummary(null);
    setRewards([]);
    setScreen("starter");
  }

  function chooseStarter(creatureId: string) {
    const nextSave = unlockCreature(save, creatureId);
    setSave(nextSave);
    setRun(createRun(creatureId));
    setScreen("lineup");
  }

  function createBattleEndSummary(
    before: BattleCreature,
    after: BattleCreature,
    floor: number,
    drops: RewardDrop[]
  ): BattleEndSummary {
    return {
      before: {
        attack: before.attack,
        defense: before.defense,
        exp: before.exp,
        level: before.level,
        maxHp: before.maxHp,
        name: before.name,
        speed: before.speed,
      },
      after: {
        attack: after.attack,
        defense: after.defense,
        exp: after.exp,
        level: after.level,
        maxHp: after.maxHp,
        name: after.name,
        speed: after.speed,
      },
      expGained: 10 + floor * 5,
      learnedSkillIds: after.skillIds.filter((skillId) => !before.skillIds.includes(skillId)),
      drops,
    };
  }

  function resolveBattleResult(result: ReturnType<typeof useSkill>) {
    if (!run) {
      return;
    }

    if (result.outcome === "lost") {
      setRun(result.run);
      setBattleEnd("lost");
      setBattleEndSummary(null);
      return;
    }

    if (result.outcome === "won") {
      if (result.run.bag["thread-capsule"] < run.bag["thread-capsule"]) {
        setSave(unlockCreature(save, result.run.enemy.speciesId));
      }
      const progressedRun = gainVictoryProgress(result.run);
      const drops = generateRandomDrops(progressedRun);
      const droppedRun = applyDrops(progressedRun, drops);
      setRun(droppedRun);
      setRewards(generateRewards(droppedRun));
      setBattleEndSummary(createBattleEndSummary(result.run.player, progressedRun.player, result.run.floor, drops));
      setBattleEnd("won");
      return;
    }

    setRun(result.run);
  }

  function handleUseSkill(skillId: string) {
    if (!run) {
      return;
    }

    resolveBattleResult(useSkill(run, skillId));
  }

  function handleUseItem(itemId: ItemId) {
    if (!run) {
      return;
    }

    resolveBattleResult(useBattleBagItem(run, itemId));
  }

  function handlePreBattleUseItem(itemId: ItemId, targetUid: string) {
    if (!run) {
      return;
    }

    setRun(useBagItemOnPet(run, itemId, targetUid));
  }

  function chooseReward(reward: RewardOption) {
    if (!run) {
      return;
    }

    const rewardedRun = applyReward(run, reward);
    const nextRun = advanceFloor(rewardedRun);

    if (nextRun.completed) {
      returnToTitle("第 10 层已完成，新的生命记录被保存。");
      return;
    }

    setRun(nextRun);
    setRewards([]);
    setBattleEnd(null);
    setBattleEndSummary(null);
    setScreen("lineup");
  }

  function chooseLineup(activePartyUids: string[]) {
    if (!run) {
      return;
    }

    setRun(setActiveParty(run, activePartyUids));
    setBattleEnd(null);
    setBattleEndSummary(null);
    setScreen("battle");
  }

  function continueAfterBattleEnd() {
    if (!run || !battleEnd) {
      return;
    }

    setBattleEnd(null);

    setBattleEndSummary(null);
    setDefeatedRun(run);
    setScreen("defeat");
  }

  if (screen === "starter") {
    return <StarterSelect onBack={() => setScreen("title")} onSelect={chooseStarter} />;
  }

  if (screen === "collection") {
    return <CollectionScreen unlockedCreatureIds={save.unlockedCreatureIds} onBack={() => setScreen("title")} />;
  }

  if (screen === "battle" && run) {
    return (
      <BattleScreen
        run={run}
        battleEnd={battleEnd}
        battleEndSummary={battleEndSummary}
        rewards={rewards}
        onBattleEndContinue={continueAfterBattleEnd}
        onChooseReward={chooseReward}
        onUseSkill={handleUseSkill}
        onUseItem={handleUseItem}
      />
    );
  }

  if (screen === "defeat" && defeatedRun) {
    return (
      <DefeatScreen
        run={defeatedRun}
        onReturn={() => returnToTitle(`${defeatedRun.player.name} 倒下了，本次登塔结束。`)}
      />
    );
  }

  if (screen === "lineup" && run) {
    return <LineupScreen run={run} onConfirm={chooseLineup} onUseItem={handlePreBattleUseItem} />;
  }

  return (
    <TitleScreen
      note={titleNote}
      unlockedCount={unlockedCount}
      totalCount={creatures.length}
      onNewGame={startNewGame}
      onCollection={() => setScreen("collection")}
    />
  );
}

export default App;
