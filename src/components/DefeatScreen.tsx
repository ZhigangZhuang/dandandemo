import { Home, Skull, Zap } from "lucide-react";
import { creatureById } from "../data/creatures";
import type { RunState } from "../game/types";
import { CreatureSigil } from "./CreatureSigil";

interface DefeatScreenProps {
  run: RunState;
  onReturn: () => void;
}

export function DefeatScreen({ run, onReturn }: DefeatScreenProps) {
  const species = creatureById[run.player.speciesId];

  return (
    <main className="screen defeat-screen">
      <section className="defeat-panel">
        <div className="defeat-portrait" aria-hidden="true">
          <CreatureSigil creature={species} />
        </div>
        <div className="defeat-copy">
          <p className="eyebrow">登塔中断</p>
          <h1>灵火熄灭</h1>
          <p>
            {run.player.name} 在第 {run.floor} 层失去战斗能力。塔路种子 {run.seed} 已沉入记录，下一次会展开新的路线。
          </p>
          <div className="defeat-stats">
            <span>
              <Skull size={16} /> 到达 {run.floor} / 10 层
            </span>
            <span>
              <Zap size={16} /> 最终速度 {run.player.speed}
            </span>
          </div>
          <button className="primary-action" onClick={onReturn}>
            <Home size={18} />
            回到首页
          </button>
        </div>
      </section>
    </main>
  );
}
