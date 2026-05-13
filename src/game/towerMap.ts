import type { MapNodeType, TowerNode, TowerRoute } from "./types";
import { createRng } from "./rng";

const nodeTypes: MapNodeType[] = ["battle", "battle", "battle", "cache", "rest", "elite"];

function nodeTypeForFloor(floor: number, lane: number, roll: number): MapNodeType {
  if (floor === 10) {
    return "elite";
  }

  if (floor === 1) {
    return "battle";
  }

  return nodeTypes[(roll + floor + lane) % nodeTypes.length];
}

export function generateTowerRoute(seed: number): TowerRoute {
  const rng = createRng(seed);
  const floors: TowerNode[][] = [];

  for (let floor = 1; floor <= 10; floor += 1) {
    const laneCount = floor === 1 || floor === 10 ? 1 : rng.int(2, 3);
    const nodes: TowerNode[] = [];

    for (let lane = 0; lane < laneCount; lane += 1) {
      nodes.push({
        id: `f${floor}-n${lane}-${rng.int(100, 999)}`,
        floor,
        lane,
        type: nodeTypeForFloor(floor, lane, rng.int(0, 99)),
        nextIds: [],
      });
    }

    floors.push(nodes);
  }

  for (let floorIndex = 0; floorIndex < floors.length - 1; floorIndex += 1) {
    const current = floors[floorIndex];
    const next = floors[floorIndex + 1];

    current.forEach((node) => {
      const linked = next.filter((candidate) => Math.abs(candidate.lane - node.lane) <= 1);
      const fallback = linked.length > 0 ? linked : next;
      node.nextIds = fallback.map((candidate) => candidate.id);
    });
  }

  const activePathIds = [floors[0][0].id];
  let cursor = floors[0][0];

  for (let floorIndex = 1; floorIndex < floors.length; floorIndex += 1) {
    const candidates = floors[floorIndex].filter((node) => cursor.nextIds.includes(node.id));
    cursor = rng.pick(candidates.length > 0 ? candidates : floors[floorIndex]);
    activePathIds.push(cursor.id);
  }

  return { seed, floors, activePathIds };
}

export function getNode(route: TowerRoute, nodeId: string): TowerNode {
  for (const floor of route.floors) {
    const node = floor.find((candidate) => candidate.id === nodeId);

    if (node) {
      return node;
    }
  }

  return route.floors[0][0];
}
