import { ChevronLeft } from "lucide-react";
import { creatures } from "../data/creatures";
import { CreatureCard } from "./CreatureCard";

interface CollectionScreenProps {
  unlockedCreatureIds: string[];
  onBack: () => void;
}

export function CollectionScreen({ unlockedCreatureIds, onBack }: CollectionScreenProps) {
  return (
    <main className="screen">
      <header className="screen-header">
        <button className="icon-button" onClick={onBack} aria-label="返回">
          <ChevronLeft size={20} />
        </button>
        <div>
          <p className="eyebrow">图鉴 / 收集</p>
          <h2>生命记录占位版</h2>
        </div>
      </header>

      <section className="collection-grid">
        {creatures.map((creature) => (
          <CreatureCard
            key={creature.id}
            creature={creature}
            locked={!unlockedCreatureIds.includes(creature.id)}
          />
        ))}
      </section>
    </main>
  );
}
