import { ChevronLeft } from "lucide-react";
import { starterCreatures } from "../data/creatures";
import { CreatureCard } from "./CreatureCard";

interface StarterSelectProps {
  onBack: () => void;
  onSelect: (creatureId: string) => void;
}

export function StarterSelect({ onBack, onSelect }: StarterSelectProps) {
  return (
    <main className="screen">
      <header className="screen-header">
        <button className="icon-button" onClick={onBack} aria-label="返回">
          <ChevronLeft size={20} />
        </button>
        <div>
          <p className="eyebrow">选择初始怪物</p>
          <h2>第一枚生命核心正在响应</h2>
        </div>
      </header>

      <section className="starter-grid">
        {starterCreatures.map((creature) => (
          <CreatureCard key={creature.id} creature={creature} actionLabel="选择" onClick={() => onSelect(creature.id)} />
        ))}
      </section>
    </main>
  );
}
