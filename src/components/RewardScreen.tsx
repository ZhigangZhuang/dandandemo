import { Sparkles } from "lucide-react";
import type { RewardOption, RunState } from "../game/types";
import { ItemIcon } from "./ItemIcon";

interface RewardScreenProps {
  run: RunState;
  rewards: RewardOption[];
  onChoose: (reward: RewardOption) => void;
}

export function RewardScreen({ run, rewards, onChoose }: RewardScreenProps) {
  return (
    <main className="screen reward-screen">
      <header className="screen-header reward-header">
        <div>
          <p className="eyebrow">第 {run.floor} 层完成</p>
          <h2>选择一个掉落道具</h2>
        </div>
        <Sparkles size={28} />
      </header>

      <section className="reward-grid">
        {rewards.map((reward) => (
          <button key={reward.id} className="reward-card" onClick={() => onChoose(reward)}>
            <ItemIcon itemId={reward.itemId} />
            <strong>{reward.label}</strong>
            <span>{reward.description}</span>
          </button>
        ))}
      </section>
    </main>
  );
}
