import { useState } from "react";
import { Backpack, Swords } from "lucide-react";
import { items } from "../data/items";
import { ACTIVE_PARTY_SIZE } from "../game/battle";
import type { ItemId, RunState } from "../game/types";
import { CreatureCard } from "./CreatureCard";
import { ItemIcon } from "./ItemIcon";

interface LineupScreenProps {
  run: RunState;
  onConfirm: (activePartyUids: string[]) => void;
  onUseItem: (itemId: ItemId, targetUid: string) => void;
}

export function LineupScreen({ run, onConfirm, onUseItem }: LineupScreenProps) {
  const initial = run.activePartyUids.length > 0 ? run.activePartyUids : run.party.slice(0, ACTIVE_PARTY_SIZE).map((pet) => pet.uid);
  const [selectedIds, setSelectedIds] = useState<string[]>(initial);

  function togglePet(uid: string) {
    if (selectedIds.includes(uid)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== uid));
      return;
    }

    if (selectedIds.length < ACTIVE_PARTY_SIZE) {
      setSelectedIds([...selectedIds, uid]);
    }
  }

  const canContinue = selectedIds.length > 0 && selectedIds.length <= ACTIVE_PARTY_SIZE;
  const targetUid = selectedIds[0] ?? run.party[0]?.uid;

  return (
    <main className="screen">
      <header className="screen-header reward-header">
        <div>
          <p className="eyebrow">进入第 {run.floor} 层前</p>
          <h2>选择本关出战精灵</h2>
        </div>
        <button className="primary-action" disabled={!canContinue} onClick={() => onConfirm(selectedIds)}>
          <Swords size={18} />
          出战 {selectedIds.length} / {ACTIVE_PARTY_SIZE}
        </button>
      </header>

      <section className="starter-grid">
        {run.party.map((pet) => (
          <CreatureCard
            key={pet.uid}
            creatureId={pet.speciesId}
            battleCreature={pet}
            selected={selectedIds.includes(pet.uid)}
            actionLabel={selectedIds.includes(pet.uid) ? "已选择" : "选择出战"}
            onClick={() => togglePet(pet.uid)}
          />
        ))}
      </section>

      <section className="bag-panel lineup-bag" aria-label="战前背包">
        <div className="log-title">
          <Backpack size={15} />
          战前背包
        </div>
        <div className="bag-grid">
          {items
            .filter((item) => item.kind !== "capture")
            .map((item) => (
              <button
                className="bag-button"
                disabled={!targetUid || run.bag[item.id] <= 0}
                key={item.id}
                onClick={() => targetUid && onUseItem(item.id, targetUid)}
              >
                <ItemIcon itemId={item.id} size="small" />
                <span className="bag-copy">
                  <strong>{item.name}</strong>
                  <span>
                    x{run.bag[item.id]} · {item.description}
                  </span>
                </span>
              </button>
            ))}
        </div>
      </section>
    </main>
  );
}
