import { MONASTERY_OBSTACLES, MONK_COLLISION_RADIUS } from './colliders';

export interface NavPoint {
  x: number;
  z: number;
  y?: number;
}

export interface NavNode {
  id: string;
  x: number;
  z: number;
  neighbors: string[];
}

/**
 * Checks if a straight line segment from (x1, z1) to (x2, z2) has an unobstructed line of sight,
 * accounting for monk collision radius against all monastery obstacles.
 */
export function hasLineOfSight(
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  bodyRadius: number = MONK_COLLISION_RADIUS + 0.15,
  currentY: number = 0.42
): boolean {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const lenSq = dx * dx + dz * dz;
  if (lenSq < 0.0001) return true;

  for (let i = 0; i < MONASTERY_OBSTACLES.length; i++) {
    const obs = MONASTERY_OBSTACLES[i];
    if (obs.minY !== undefined && currentY < obs.minY) continue;
    if (obs.maxY !== undefined && currentY > obs.maxY) continue;

    if (obs.type === 'circle') {
      const cx = obs.x;
      const cz = obs.z;
      const r = obs.r + bodyRadius;

      // Project circle center onto segment
      const t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cz - z1) * dz) / lenSq));
      const projX = x1 + t * dx;
      const projZ = z1 + t * dz;
      const distSq = (cx - projX) * (cx - projX) + (cz - projZ) * (cz - projZ);

      if (distSq < r * r) {
        return false;
      }
    } else if (obs.type === 'box') {
      const expMinX = obs.minX - bodyRadius;
      const expMaxX = obs.maxX + bodyRadius;
      const expMinZ = obs.minZ - bodyRadius;
      const expMaxZ = obs.maxZ + bodyRadius;

      // Liang-Barsky / Slab method for Segment-AABB intersection
      let tMin = 0;
      let tMax = 1;

      // X slab
      if (Math.abs(dx) < 0.00001) {
        if (x1 < expMinX || x1 > expMaxX) continue;
      } else {
        let t1 = (expMinX - x1) / dx;
        let t2 = (expMaxX - x1) / dx;
        if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
        tMin = Math.max(tMin, t1);
        tMax = Math.min(tMax, t2);
        if (tMin > tMax) continue;
      }

      // Z slab
      if (Math.abs(dz) < 0.00001) {
        if (z1 < expMinZ || z1 > expMaxZ) continue;
      } else {
        let t1 = (expMinZ - z1) / dz;
        let t2 = (expMaxZ - z1) / dz;
        if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
        tMin = Math.max(tMin, t1);
        tMax = Math.min(tMax, t2);
        if (tMin > tMax) continue;
      }

      // Segment intersects expanded obstacle box
      return false;
    }
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// MONASTERY NAVIGATION GRAPH
// Topological map of open, legal thoroughfares connecting all zones
// ─────────────────────────────────────────────────────────────────────────────
export const NAV_NODES: Record<string, NavNode> = {
  // Cổng Tam Quan & Sân Tiền
  gate_outer: { id: 'gate_outer', x: 0, z: 72, neighbors: ['gate_center'] },
  gate_center: { id: 'gate_center', x: 0, z: 66, neighbors: ['gate_outer', 'courtyard_south'] },
  courtyard_south: { id: 'courtyard_south', x: 0, z: 50, neighbors: ['gate_center', 'courtyard_center', 'pond_approach'] },
  courtyard_center: {
    id: 'courtyard_center',
    x: 0,
    z: 28,
    neighbors: ['courtyard_south', 'courtyard_north', 'pond_entrance', 'east_corridor_mid'],
  },
  courtyard_north: {
    id: 'courtyard_north',
    x: 0,
    z: 8,
    neighbors: ['courtyard_center', 'sanctuary_front_west', 'sanctuary_front_east'],
  },

  // Sân trước Chánh Điện
  sanctuary_front_west: {
    id: 'sanctuary_front_west',
    x: -10,
    z: 8,
    neighbors: ['courtyard_north', 'west_corridor_south', 'tea_pavilion_front'],
  },
  sanctuary_front_east: {
    id: 'sanctuary_front_east',
    x: 10,
    z: 8,
    neighbors: ['courtyard_north', 'east_corridor_south', 'east_bypass_south'],
  },

  // Hồ Sen & Chùa Một Cột
  pond_approach: { id: 'pond_approach', x: -6, z: 46, neighbors: ['courtyard_south', 'pond_entrance'] },
  pond_entrance: {
    id: 'pond_entrance',
    x: -11.5,
    z: 36,
    neighbors: ['courtyard_center', 'pond_approach', 'pond_bridge', 'tea_pavilion_front'],
  },
  pond_bridge: { id: 'pond_bridge', x: -16.0, z: 36, neighbors: ['pond_entrance', 'pond_platform', 'west_pier_main'] },
  pond_platform: { id: 'pond_platform', x: -20.0, z: 36, neighbors: ['pond_bridge'] },

  // Bến Nước & Hiên Nước Phía Tây
  west_pier_main: { id: 'west_pier_main', x: -33.5, z: 36.0, neighbors: ['pond_bridge', 'west_pier_steps'] },
  west_pier_steps: { id: 'west_pier_steps', x: -27.5, z: 36.0, neighbors: ['west_pier_main'] },

  // Thiền Trà Quán
  tea_pavilion_front: {
    id: 'tea_pavilion_front',
    x: -18,
    z: 14,
    neighbors: ['pond_entrance', 'sanctuary_front_west', 'west_corridor_south'],
  },

  // Hành lang Tây Chánh Điện (Vòng qua Tháp Chuông ra Hậu Viện)
  west_corridor_south: {
    id: 'west_corridor_south',
    x: -24.5,
    z: 2,
    neighbors: ['sanctuary_front_west', 'tea_pavilion_front', 'west_corridor_mid'],
  },
  west_corridor_mid: {
    id: 'west_corridor_mid',
    x: -24.5,
    z: -16,
    neighbors: ['west_corridor_south', 'west_corridor_north'],
  },
  west_corridor_north: {
    id: 'west_corridor_north',
    x: -24.5,
    z: -34,
    neighbors: ['west_corridor_mid', 'kitchen_entrance', 'back_avenue_south'],
  },

  // Dãy Hành Lang Cột Gỗ & Tàng Kinh Các
  east_corridor_south: {
    id: 'east_corridor_south',
    x: 17.5,
    z: 2,
    neighbors: ['sanctuary_front_east', 'east_corridor_mid'],
  },
  east_corridor_mid: {
    id: 'east_corridor_mid',
    x: 17.5,
    z: 14,
    neighbors: ['courtyard_center', 'east_corridor_south', 'east_corridor_north', 'library_front'],
  },
  east_corridor_north: {
    id: 'east_corridor_north',
    x: 17.5,
    z: 26,
    neighbors: ['east_corridor_mid'],
  },
  library_front: {
    id: 'library_front',
    x: 21.5,
    z: 13,
    neighbors: ['east_corridor_mid'],
  },

  // Hành lang Đông Chánh Điện (Vòng qua Bảo Tháp ra Hậu Viện)
  east_bypass_south: {
    id: 'east_bypass_south',
    x: 24.0,
    z: 2,
    neighbors: ['sanctuary_front_east', 'east_bypass_mid'],
  },
  east_bypass_mid: {
    id: 'east_bypass_mid',
    x: 24.0,
    z: -16,
    neighbors: ['east_bypass_south', 'east_bypass_north', 'pagoda_front'],
  },
  pagoda_front: {
    id: 'pagoda_front',
    x: 30.0,
    z: -18,
    neighbors: ['east_bypass_mid'],
  },
  east_bypass_north: {
    id: 'east_bypass_north',
    x: 24.0,
    z: -34,
    neighbors: ['east_bypass_mid', 'well_entrance', 'back_avenue_south'],
  },

  // Hậu Viện Sơn Tự & Thềm Sau Chánh Điện
  back_terrace_west: {
    id: 'back_terrace_west',
    x: -8.0,
    z: -26.0,
    neighbors: ['west_corridor_north', 'back_terrace_center'],
  },
  back_terrace_east: {
    id: 'back_terrace_east',
    x: 8.0,
    z: -26.0,
    neighbors: ['east_bypass_north', 'back_terrace_center'],
  },
  back_terrace_center: {
    id: 'back_terrace_center',
    x: 0,
    z: -26.0,
    neighbors: ['back_terrace_west', 'back_terrace_east', 'back_avenue_south'],
  },
  back_avenue_south: {
    id: 'back_avenue_south',
    x: 0,
    z: -34,
    neighbors: [
      'west_corridor_north',
      'east_bypass_north',
      'back_avenue_mid',
      'bamboo_walk_west',
      'bamboo_walk_east',
      'back_terrace_center',
      'wood_shed_lane',
    ],
  },
  back_avenue_mid: {
    id: 'back_avenue_mid',
    x: 0,
    z: -45,
    neighbors: ['back_avenue_south', 'back_avenue_north', 'wood_shed_front', 'kitchen_entrance', 'well_entrance'],
  },
  back_avenue_north: {
    id: 'back_avenue_north',
    x: 0,
    z: -54,
    neighbors: ['back_avenue_mid'],
  },

  // Bếp Chùa, Trai Đường, Kho Củi & Giếng Ngọc Cổ
  kitchen_entrance: {
    id: 'kitchen_entrance',
    x: -16.5,
    z: -45,
    neighbors: ['back_avenue_mid', 'west_corridor_north', 'wood_shed_front', 'kitchen_courtyard', 'dining_kitchen_link'],
  },
  kitchen_courtyard: {
    id: 'kitchen_courtyard',
    x: -16.5,
    z: -40.0,
    neighbors: ['kitchen_entrance', 'bamboo_walk_west', 'west_corridor_north', 'dining_hall_entrance'],
  },
  dining_hall_entrance: {
    id: 'dining_hall_entrance',
    x: -36.0,
    z: -42.0,
    neighbors: ['kitchen_courtyard', 'dining_hall_interior', 'back_west_wing'],
  },
  dining_hall_interior: {
    id: 'dining_hall_interior',
    x: -36.0,
    z: -48.0,
    neighbors: ['dining_hall_entrance', 'dining_kitchen_link'],
  },
  dining_kitchen_link: {
    id: 'dining_kitchen_link',
    x: -25.2,
    z: -49.0,
    neighbors: ['dining_hall_interior', 'kitchen_entrance'],
  },
  back_west_wing: {
    id: 'back_west_wing',
    x: -45.0,
    z: -42.0,
    neighbors: ['dining_hall_entrance'],
  },
  wood_shed_front: {
    id: 'wood_shed_front',
    x: -4.0,
    z: -45,
    neighbors: ['back_avenue_mid', 'kitchen_entrance', 'wood_shed_lane'],
  },
  wood_shed_lane: {
    id: 'wood_shed_lane',
    x: -5.5,
    z: -40.0,
    neighbors: ['wood_shed_front', 'bamboo_walk_west', 'back_avenue_south'],
  },
  well_entrance: {
    id: 'well_entrance',
    x: 12.0,
    z: -45,
    neighbors: ['back_avenue_mid', 'east_bypass_north', 'well_plaza'],
  },
  well_plaza: {
    id: 'well_plaza',
    x: 12.0,
    z: -40.0,
    neighbors: ['well_entrance', 'bamboo_walk_east', 'east_bypass_north', 'back_east_wing'],
  },
  back_east_wing: {
    id: 'back_east_wing',
    x: 42.0,
    z: -42.0,
    neighbors: ['well_plaza', 'east_bypass_north'],
  },

  // Lối dạo rặng tre trúc
  bamboo_walk_west: {
    id: 'bamboo_walk_west',
    x: -7.2,
    z: -40,
    neighbors: ['back_avenue_south', 'wood_shed_front', 'kitchen_courtyard', 'wood_shed_lane'],
  },
  bamboo_walk_east: {
    id: 'bamboo_walk_east',
    x: 7.2,
    z: -40,
    neighbors: ['back_avenue_south', 'well_entrance', 'well_plaza'],
  },
};

// Ensure symmetry in graph
for (const [nodeId, node] of Object.entries(NAV_NODES)) {
  for (const neighborId of node.neighbors) {
    const neighbor = NAV_NODES[neighborId];
    if (neighbor && !neighbor.neighbors.includes(nodeId)) {
      neighbor.neighbors.push(nodeId);
    }
  }
}

/**
 * Finds the shortest path between start and destination using A* on the Monastery NavGraph,
 * with direct line-of-sight shortcutting (string pulling).
 */
export function findSmartPath(
  startX: number,
  startZ: number,
  goalX: number,
  goalZ: number,
  currentY: number = 0.42
): NavPoint[] {
  // 1. Direct path check: If there's clear line of sight, walk directly!
  if (hasLineOfSight(startX, startZ, goalX, goalZ, MONK_COLLISION_RADIUS + 0.15, currentY)) {
    return [{ x: goalX, z: goalZ }];
  }

  // 2. Find accessible candidate nodes from start and to goal
  let bestStartNode: string | null = null;
  let bestStartDist = Infinity;
  let fallbackStartNode: string | null = null;
  let fallbackStartDist = Infinity;

  let bestGoalNode: string | null = null;
  let bestGoalDist = Infinity;
  let fallbackGoalNode: string | null = null;
  let fallbackGoalDist = Infinity;

  for (const [id, node] of Object.entries(NAV_NODES)) {
    const dStart = Math.hypot(node.x - startX, node.z - startZ);
    if (dStart < fallbackStartDist) {
      fallbackStartDist = dStart;
      fallbackStartNode = id;
    }
    if (hasLineOfSight(startX, startZ, node.x, node.z, MONK_COLLISION_RADIUS + 0.15, currentY)) {
      if (dStart < bestStartDist) {
        bestStartDist = dStart;
        bestStartNode = id;
      }
    }

    const dGoal = Math.hypot(node.x - goalX, node.z - goalZ);
    if (dGoal < fallbackGoalDist) {
      fallbackGoalDist = dGoal;
      fallbackGoalNode = id;
    }
    if (hasLineOfSight(node.x, node.z, goalX, goalZ, MONK_COLLISION_RADIUS + 0.15, currentY)) {
      if (dGoal < bestGoalDist) {
        bestGoalDist = dGoal;
        bestGoalNode = id;
      }
    }
  }

  const startNodeId = bestStartNode || fallbackStartNode;
  const goalNodeId = bestGoalNode || fallbackGoalNode;

  if (!startNodeId || !goalNodeId) {
    return [{ x: goalX, z: goalZ }];
  }

  if (startNodeId === goalNodeId) {
    return [{ x: NAV_NODES[startNodeId].x, z: NAV_NODES[startNodeId].z }, { x: goalX, z: goalZ }];
  }

  // 3. A* Search on NavGraph
  interface AStarNode {
    id: string;
    g: number;
    f: number;
  }

  const openSet = new Map<string, AStarNode>();
  const closedSet = new Set<string>();
  const parentMap = new Map<string, string | null>();

  parentMap.set(startNodeId, null);
  const startH = Math.hypot(NAV_NODES[startNodeId].x - goalX, NAV_NODES[startNodeId].z - goalZ);
  openSet.set(startNodeId, {
    id: startNodeId,
    g: 0,
    f: startH,
  });

  let found = false;

  while (openSet.size > 0) {
    // Get node with lowest f
    let current: AStarNode | null = null;
    for (const node of openSet.values()) {
      if (!current || node.f < current.f) {
        current = node;
      }
    }

    if (!current) break;

    if (current.id === goalNodeId) {
      found = true;
      break;
    }

    openSet.delete(current.id);
    closedSet.add(current.id);

    const currentNodeDef = NAV_NODES[current.id];
    for (const neighborId of currentNodeDef.neighbors) {
      if (closedSet.has(neighborId)) continue;

      const neighborDef = NAV_NODES[neighborId];
      if (!neighborDef) continue;

      const edgeCost = Math.hypot(neighborDef.x - currentNodeDef.x, neighborDef.z - currentNodeDef.z);
      const tentativeG = current.g + edgeCost;

      const existing = openSet.get(neighborId);
      if (!existing || tentativeG < existing.g) {
        parentMap.set(neighborId, current.id);
        const h = Math.hypot(neighborDef.x - goalX, neighborDef.z - goalZ);
        openSet.set(neighborId, {
          id: neighborId,
          g: tentativeG,
          f: tentativeG + h,
        });
      }
    }
  }

  // Reconstruct path
  const rawWaypoints: NavPoint[] = [];
  if (found) {
    const pathIds: string[] = [];
    let trackId: string | null = goalNodeId;
    while (trackId) {
      pathIds.push(trackId);
      if (trackId === startNodeId) break;
      trackId = parentMap.get(trackId) || null;
      if (pathIds.length > 50) break; // cycle protection
    }
    pathIds.reverse();

    for (const nid of pathIds) {
      const node = NAV_NODES[nid];
      if (node) {
        rawWaypoints.push({ x: node.x, z: node.z });
      }
    }
  } else {
    rawWaypoints.push({ x: NAV_NODES[startNodeId].x, z: NAV_NODES[startNodeId].z });
    if (startNodeId !== goalNodeId) {
      rawWaypoints.push({ x: NAV_NODES[goalNodeId].x, z: NAV_NODES[goalNodeId].z });
    }
  }

  rawWaypoints.push({ x: goalX, z: goalZ });

  // 4. String-Pulling & Shortcut Optimization (Smooth out redundant waypoints)
  if (rawWaypoints.length <= 1) return rawWaypoints;

  const smoothed: NavPoint[] = [];
  let currentIdx = 0;
  let currX = startX;
  let currZ = startZ;

  while (currentIdx < rawWaypoints.length) {
    // Look as far ahead as possible that maintains line-of-sight
    let furthestIdx = currentIdx;
    for (let j = rawWaypoints.length - 1; j >= currentIdx; j--) {
      const candidate = rawWaypoints[j];
      if (hasLineOfSight(currX, currZ, candidate.x, candidate.z, MONK_COLLISION_RADIUS + 0.15, currentY)) {
        furthestIdx = j;
        break;
      }
    }

    const nextWp = rawWaypoints[furthestIdx];
    smoothed.push(nextWp);
    currX = nextWp.x;
    currZ = nextWp.z;

    if (furthestIdx >= rawWaypoints.length - 1) {
      break;
    }
    currentIdx = furthestIdx + 1;
  }

  return smoothed.length > 0 ? smoothed : [{ x: goalX, z: goalZ }];
}
