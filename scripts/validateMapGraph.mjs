import franceAdjacency from '../src/data/franceAdjacency.json' with { type: 'json' };
import { franceRegions } from '../src/data/franceRegions.js';

const regionIds = new Set(franceRegions.map((region) => region.id));
const adjacencyIds = new Set(Object.keys(franceAdjacency));
const errors = [];

for (const region of franceRegions) {
  const neighbors = franceAdjacency[region.id];

  if (!neighbors) {
    errors.push(`Région sans entrée d'adjacence: ${region.id}`);
    continue;
  }

  if (neighbors.length === 0) {
    errors.push(`Région orpheline (sans voisin): ${region.id}`);
  }

  for (const neighborId of neighbors) {
    if (!regionIds.has(neighborId)) {
      errors.push(`Voisin inconnu: ${region.id} -> ${neighborId}`);
      continue;
    }

    const reverseNeighbors = franceAdjacency[neighborId] ?? [];
    if (!reverseNeighbors.includes(region.id)) {
      errors.push(`Adjacence non symétrique: ${region.id} -> ${neighborId} sans ${neighborId} -> ${region.id}`);
    }
  }
}

for (const id of adjacencyIds) {
  if (!regionIds.has(id)) {
    errors.push(`Entrée d'adjacence sans région: ${id}`);
  }
}

if (franceRegions.length > 0) {
  const visited = new Set();
  const queue = [franceRegions[0].id];

  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) {
      continue;
    }

    visited.add(current);

    for (const neighbor of franceAdjacency[current] ?? []) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  if (visited.size !== franceRegions.length) {
    const disconnected = franceRegions
      .map((region) => region.id)
      .filter((id) => !visited.has(id));
    errors.push(`Carte non connexe. Régions non atteintes: ${disconnected.join(', ')}`);
  }
}

if (errors.length > 0) {
  console.error('Validation du graphe des régions: ÉCHEC');
  for (const error of errors) {
    console.error(` - ${error}`);
  }
  process.exit(1);
}

console.log(`Validation du graphe des régions: OK (${franceRegions.length} régions, ${adjacencyIds.size} entrées d'adjacence).`);
