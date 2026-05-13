export interface Rng {
  next: () => number;
  int: (min: number, max: number) => number;
  pick: <T>(items: T[]) => T;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  function next() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  }

  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: (items) => items[Math.floor(next() * items.length)],
  };
}

export function createSeed(): number {
  return Math.floor(Date.now() % 1_000_000_000);
}
