import { computeStatus } from '../src/store/useGameStore.js';

const statusAtLimit = computeStatus({
  turn: 24,
  maxTurns: 24,
  trust: 50,
  order: 50,
  budget: 50,
  momentum: 50,
});

if (!statusAtLimit.over || !statusAtLimit.victory) {
  console.error('FAIL: expected game over victory when turn reaches maxTurns', statusAtLimit);
  process.exit(1);
}

console.log('PASS: game ends with victory exactly at maxTurns');
