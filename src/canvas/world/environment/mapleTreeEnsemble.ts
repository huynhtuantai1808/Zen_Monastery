import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { CircleObstacle } from '../colliders';

// =======================================================================
// MAPLE TREE ENSEMBLE — PERFORMANCE-OPTIMIZED WITH INSTANCED MESH
// Strategy: merge all sub-geometries per-material → 4 InstancedMesh for 26 trees
// Result: ~53,820 draw calls → 4 draw calls
// =======================================================================

export type MapleTreeRowZoneId =
  | 'SOUTH_WALL_WEST'
  | 'SOUTH_WALL_EAST'
  | 'WEST_WALL_PERIMETER'
  | 'EAST_WALL_PERIMETER';

export interface MapleTreeInstanceConfig {
  id: string;
  zone: MapleTreeRowZoneId;
  x: number;
  y: number;
  z: number;
  scale: number;
  rotationY: number;
  trunkRadius: number;
}

export interface MapleTreeEnsembleResult {
  group: THREE.Group;
  treeObstacles: CircleObstacle[];
  dispose: () => void;
}

const TARGET_MAPLE_TREE_HEIGHT = 7.5;
const MAPLE_TREE_GLTF_PATH = '/models/maple_tree/scene.gltf';

// Singleton: merged geometry set per material (computed once per session)
type MergedSlot = { geo: THREE.BufferGeometry; mat: THREE.Material };
let mergedSetPromise: Promise<MergedSlot[]> | null = null;
let cachedMergedSet: MergedSlot[] | null = null;

/** Deterministic seeded random — same values on every reload */
function seededRng(seed: number): number {
  const x = Math.sin(seed * 9973.12345 + 1.2345) * 43758.5453123;
  return x - Math.floor(x);
}

// Memoized — configs never change at runtime
let _cachedConfigs: MapleTreeInstanceConfig[] | null = null;

export function generateMapleTreeConfigs(): MapleTreeInstanceConfig[] {
  if (_cachedConfigs) return _cachedConfigs;
  const configs: MapleTreeInstanceConfig[] = [];
  let seed = 42;

  // South Wall West Wing (7 trees) — X: -46.0 → -11.0, Z: 62.8
  for (let i = 0; i < 7; i++) {
    const x = -46.0 + (i / 6) * 35.0;
    const scale = 0.88 + seededRng(seed++) * 0.32;
    configs.push({ id: `maple_sw_${i + 1}`, zone: 'SOUTH_WALL_WEST', x, y: 0.42, z: 62.8, scale, rotationY: seededRng(seed++) * Math.PI * 2, trunkRadius: 0.45 * scale });
  }
  // South Wall East Wing (7 trees) — X: 11.0 → 46.0, Z: 62.8
  for (let i = 0; i < 7; i++) {
    const x = 11.0 + (i / 6) * 35.0;
    const scale = 0.88 + seededRng(seed++) * 0.32;
    configs.push({ id: `maple_se_${i + 1}`, zone: 'SOUTH_WALL_EAST', x, y: 0.42, z: 62.8, scale, rotationY: seededRng(seed++) * Math.PI * 2, trunkRadius: 0.45 * scale });
  }
  // West Boundary Wall (6 trees) — X: -49.2, Z: 52 → -20
  for (let i = 0; i < 6; i++) {
    const z = 52.0 - (i / 5) * 72.0;
    const scale = 0.85 + seededRng(seed++) * 0.35;
    configs.push({ id: `maple_west_${i + 1}`, zone: 'WEST_WALL_PERIMETER', x: -49.2, y: 0.42, z, scale, rotationY: seededRng(seed++) * Math.PI * 2, trunkRadius: 0.45 * scale });
  }
  // East Boundary Wall (6 trees) — X: +49.2, Z: 52 → -20
  for (let i = 0; i < 6; i++) {
    const z = 52.0 - (i / 5) * 72.0;
    const scale = 0.85 + seededRng(seed++) * 0.35;
    configs.push({ id: `maple_east_${i + 1}`, zone: 'EAST_WALL_PERIMETER', x: 49.2, y: 0.42, z, scale, rotationY: seededRng(seed++) * Math.PI * 2, trunkRadius: 0.45 * scale });
  }

  _cachedConfigs = configs;
  return configs;
}

export function getMapleTreeColliders(): CircleObstacle[] {
  return generateMapleTreeConfigs().map((c) => ({
    type: 'circle' as const,
    x: c.x,
    z: c.z,
    r: c.trunkRadius,
    name: `Maple Tree Trunk (${c.id})`,
  }));
}

// =======================================================================
// PLACEHOLDER (shown instantly — 2 draw calls for all 26 trees combined)
// =======================================================================

const _dummy = new THREE.Object3D();

function createPlaceholderInstances(configs: MapleTreeInstanceConfig[]): THREE.Group {
  const group = new THREE.Group();
  group.name = 'MapleTreePlaceholders';
  const N = configs.length;

  // Shared instanced trunk
  const trunkGeo = new THREE.CylinderGeometry(0.30, 0.42, 3.8, 7, 1);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a2e1b });
  const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, N);
  trunkMesh.castShadow = false;
  trunkMesh.receiveShadow = false;
  trunkMesh.name = 'PlaceholderTrunks';

  // Shared instanced foliage
  const leafGeo = new THREE.DodecahedronGeometry(1.6, 1);
  const leafMat = new THREE.MeshLambertMaterial({ color: 0xc8321e });
  const leafMesh = new THREE.InstancedMesh(leafGeo, leafMat, N);
  leafMesh.castShadow = false;
  leafMesh.receiveShadow = false;
  leafMesh.name = 'PlaceholderLeaves';

  for (let i = 0; i < N; i++) {
    const c = configs[i];
    // Trunk
    _dummy.position.set(c.x, c.y + (3.8 * c.scale) / 2, c.z);
    _dummy.rotation.set(0, 0, 0);
    _dummy.scale.setScalar(c.scale);
    _dummy.updateMatrix();
    trunkMesh.setMatrixAt(i, _dummy.matrix);
    // Foliage
    _dummy.position.set(c.x, c.y + 4.8 * c.scale, c.z);
    _dummy.rotation.set(0, c.rotationY, 0);
    _dummy.scale.setScalar(c.scale);
    _dummy.updateMatrix();
    leafMesh.setMatrixAt(i, _dummy.matrix);
  }
  trunkMesh.instanceMatrix.needsUpdate = true;
  leafMesh.instanceMatrix.needsUpdate = true;

  group.add(trunkMesh, leafMesh);
  return group;
}

// =======================================================================
// LOAD & MERGE GLTF GEOMETRIES PER MATERIAL (singleton, run once per session)
// Merges 2070 sub-meshes into one geometry per material (4 total)
// =======================================================================

async function loadMergedMaterialSet(): Promise<MergedSlot[]> {
  if (cachedMergedSet) return cachedMergedSet;
  if (mergedSetPromise) return mergedSetPromise;

  mergedSetPromise = new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      MAPLE_TREE_GLTF_PATH,
      (gltf) => {
        const root = gltf.scene;

        // Measure model height for normalization
        const bbox = new THREE.Box3().setFromObject(root);
        const modelHeight = bbox.max.y - bbox.min.y;
        const normalizeScale = modelHeight > 0 ? TARGET_MAPLE_TREE_HEIGHT / modelHeight : 1.0;
        const groundOffsetY = -bbox.min.y * normalizeScale;

        // Build scale+ground-offset matrix (applied to every geometry)
        const normalizeMatrix = new THREE.Matrix4()
          .makeScale(normalizeScale, normalizeScale, normalizeScale)
          .premultiply(new THREE.Matrix4().makeTranslation(0, groundOffsetY, 0));

        // Group cloned world-space geometries by material UUID
        const geosByMat = new Map<string, { geos: THREE.BufferGeometry[]; mat: THREE.Material }>();

        root.updateWorldMatrix(true, true); // ensure all matrices up-to-date

        root.traverse((node) => {
          if (!(node instanceof THREE.Mesh)) return;
          const mesh = node as THREE.Mesh;

          node.updateWorldMatrix(true, false);
          // Combined: normalize + world transform baked in
          const matrix = new THREE.Matrix4().copy(normalizeMatrix).multiply(node.matrixWorld);

          const handlePrimitive = (geo: THREE.BufferGeometry, mat: THREE.Material) => {
            if (!mat || !geo) return;
            const key = mat.uuid;
            if (!geosByMat.has(key)) {
              const clonedMat = mat.clone();
              // Leaf material: keep DoubleSide for thin surfaces
              clonedMat.side = THREE.DoubleSide;
              (clonedMat as THREE.MeshStandardMaterial).shadowSide = THREE.DoubleSide;
              geosByMat.set(key, { geos: [], mat: clonedMat });
            }
            const clonedGeo = geo.clone();
            clonedGeo.applyMatrix4(matrix);
            // Drop unused attributes to reduce VRAM
            clonedGeo.deleteAttribute('color');
            clonedGeo.deleteAttribute('tangent');
            geosByMat.get(key)!.geos.push(clonedGeo);
          };

          if (Array.isArray(mesh.material)) {
            // Multi-material: each group uses a different material
            for (const group of mesh.geometry.groups) {
              const mat = mesh.material[group.materialIndex ?? 0];
              if (!mat) continue;
              // Extract group range into a fresh BufferGeometry
              const geo = extractGeometryGroup(mesh.geometry, group.start, group.count);
              if (geo) handlePrimitive(geo, mat);
            }
          } else {
            handlePrimitive(mesh.geometry, mesh.material as THREE.Material);
          }
        });

        // Merge & build final slots
        const mergedSet: MergedSlot[] = [];
        for (const { geos, mat } of geosByMat.values()) {
          if (geos.length === 0) continue;
          try {
            const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
            if (!merged) { geos.forEach((g) => g.dispose()); continue; }
            mergedSet.push({ geo: merged, mat });
            if (geos.length > 1) geos.forEach((g) => g.dispose());
          } catch {
            geos.forEach((g) => g.dispose());
          }
        }

        cachedMergedSet = mergedSet;
        resolve(mergedSet);
      },
      undefined,
      (err) => {
        console.warn('[MapleTreeEnsemble] GLTF load error — using placeholders:', err);
        reject(err);
      }
    );
  });

  return mergedSetPromise;
}

/**
 * Extract a sub-geometry from an indexed BufferGeometry by draw-range.
 * Returns a new BufferGeometry that only contains the vertices referenced
 * by the index range [start, start+count).
 */
function extractGeometryGroup(
  srcGeo: THREE.BufferGeometry,
  start: number,
  count: number
): THREE.BufferGeometry | null {
  if (!srcGeo.index) return null;
  const idxArr = srcGeo.index.array as Uint16Array | Uint32Array;
  const end = start + count;

  // Find which vertices are used
  const usedVerts = new Set<number>();
  for (let i = start; i < end; i++) usedVerts.add(idxArr[i]);
  if (usedVerts.size === 0) return null;

  // Build old→new vertex mapping
  const oldToNew = new Map<number, number>();
  let newIdx = 0;
  for (const v of usedVerts) oldToNew.set(v, newIdx++);
  const totalVerts = newIdx;

  // Build new geometry
  const newGeo = new THREE.BufferGeometry();

  // Copy vertex attributes
  for (const [name, attr] of Object.entries(srcGeo.attributes)) {
    const src = attr as THREE.BufferAttribute;
    const itemSize = src.itemSize;
    const dstArray = new Float32Array(totalVerts * itemSize);
    for (const [oldV, newV] of oldToNew) {
      for (let k = 0; k < itemSize; k++) {
        dstArray[newV * itemSize + k] = src.array[oldV * itemSize + k];
      }
    }
    newGeo.setAttribute(name, new THREE.BufferAttribute(dstArray, itemSize));
  }

  // Build new index buffer
  const newIndex = new Uint32Array(count);
  for (let i = 0; i < count; i++) {
    newIndex[i] = oldToNew.get(idxArr[start + i])!;
  }
  newGeo.setIndex(new THREE.BufferAttribute(newIndex, 1));

  return newGeo;
}

// =======================================================================
// INSTANCED MESH BUILDER (uses merged geometries → 1 draw call per material)
// =======================================================================

function buildInstancedGroup(mergedSet: MergedSlot[], configs: MapleTreeInstanceConfig[]): THREE.Group {
  const group = new THREE.Group();
  group.name = 'MapleTreeInstanced';
  const N = configs.length;

  for (const { geo, mat } of mergedSet) {
    const iMesh = new THREE.InstancedMesh(geo, mat, N);
    iMesh.castShadow = true;
    iMesh.receiveShadow = true;
    iMesh.frustumCulled = true;
    iMesh.name = 'MapleTreeInstancedMesh';

    // Each instance: position + Y-rotation + per-tree scale jitter only
    // (geometry is already normalized to 7.5m height)
    for (let i = 0; i < N; i++) {
      const c = configs[i];
      _dummy.position.set(c.x, c.y, c.z);
      _dummy.rotation.set(0, c.rotationY, 0);
      _dummy.scale.setScalar(c.scale);
      _dummy.updateMatrix();
      iMesh.setMatrixAt(i, _dummy.matrix);
    }
    iMesh.instanceMatrix.needsUpdate = true;
    group.add(iMesh);
  }

  return group;
}

// =======================================================================
// PUBLIC API
// =======================================================================

export function createMapleTreeEnsemble(onLoaded?: () => void): MapleTreeEnsembleResult {
  const masterGroup = new THREE.Group();
  masterGroup.name = 'Monastery_Perimeter_Maple_Trees';

  const configs = generateMapleTreeConfigs();

  // Instant placeholders: 2 draw calls, zero load time
  const placeholder = createPlaceholderInstances(configs);
  masterGroup.add(placeholder);

  // Async: load → merge → swap to instanced GLTF
  let isDisposed = false;
  loadMergedMaterialSet()
    .then((mergedSet) => {
      if (isDisposed) return;
      const instancedGroup = buildInstancedGroup(mergedSet, configs);

      // Atomic swap
      masterGroup.remove(placeholder);
      placeholder.traverse((child) => {
        if (child instanceof THREE.InstancedMesh) {
          child.geometry.dispose();
          if (!Array.isArray(child.material)) child.material.dispose();
        }
      });
      masterGroup.add(instancedGroup);
      if (onLoaded) onLoaded();
    })
    .catch(() => {
      // Keep placeholders — no crash
    });

  const dispose = () => {
    isDisposed = true;
    masterGroup.traverse((child) => {
      if (child instanceof THREE.InstancedMesh || child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    });
    masterGroup.clear();
    // cachedMergedSet kept alive intentionally (singleton across hot-reload)
  };

  return {
    group: masterGroup,
    treeObstacles: getMapleTreeColliders(),
    dispose,
  };
}
