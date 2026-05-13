import { Circle, Diamond, Flame, Moon, Package } from "lucide-react";
import type { MapNodeType, TowerRoute } from "../game/types";

interface TowerMapProps {
  route: TowerRoute;
  currentNodeId: string;
}

const nodeIcon: Record<MapNodeType, typeof Circle> = {
  battle: Circle,
  elite: Flame,
  rest: Moon,
  cache: Package,
};

const nodeLabel: Record<MapNodeType, string> = {
  battle: "战斗",
  elite: "强敌",
  rest: "静息",
  cache: "藏匣",
};

export function TowerMap({ route, currentNodeId }: TowerMapProps) {
  const activeSet = new Set(route.activePathIds);

  return (
    <section className="tower-map" aria-label="爬塔路线图">
      <div className="map-heading">
        <span>路线种子 {route.seed}</span>
        <span>本局路线</span>
      </div>
      <div className="map-floors">
        {route.floors.map((floor) => (
          <div className="map-floor" key={floor[0].floor}>
            <span className="floor-index">{floor[0].floor}</span>
            <div className="map-lanes">
              {floor.map((node) => {
                const Icon = nodeIcon[node.type] ?? Diamond;
                const isActive = activeSet.has(node.id);
                const isCurrent = node.id === currentNodeId;

                return (
                  <div
                    className={`map-node ${isActive ? "is-path" : ""} ${isCurrent ? "is-current" : ""}`}
                    key={node.id}
                    title={`${node.floor} 层 ${nodeLabel[node.type]}`}
                  >
                    <Icon size={14} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
