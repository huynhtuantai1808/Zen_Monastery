import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { CircleObstacle } from '../colliders';

// =======================================================================
// MAPLE TREE INTERFACES & CONFIGURATIONS
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
  /** Root Three.js group containing all instantiated trees */
  group: THREE.Group;
  /** Array of 2D circle obstacles for physical trunk collision */
  treeObstacles: CircleObstacle[];
  /** Cleanup callback to dispose geometries and materials on unmount */
  dispose: () => void;
}

// Target mature maple tree height in monastery world meters (wall height is ~4.5m)
const TARGET_MAPLE_TREE_HEIGHT = 7.5;
// Model file location in public folder
const MAPLE_TREE_GLTF_PATH = '/models/maple_tree/scene.gltf';

// Singleton loader cache
let prototypePromise: Promise<THREE.Group> | null = null;
let cachedPrototype: THREE.Group | null = null;

/**
 * Deterministic pseudo-random number generator for consistent tree variation
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9973.12345 + 1.2345) * 43758.5453123;
  return x - Math.floor(x);
}

/**
 * Generates configuration coordinates for all 26 perimeter maple trees:
 * - South Wall West Wing: 7 trees (X: -46.0 to -11.0, Z: 62.8)
 * - South Wall East Wing: 7 trees (X: 11.0 to 46.0, Z: 62.8)
 * - West Boundary Wall: 6 trees (X: -49.2, Z: 52.0 to -20.0)
 * - East Boundary Wall: 6 trees (X: +49.2, Z: 52.0 to -20.0)
 */
export function generateMapleTreeConfigs(): MapleTreeInstanceConfig[] {
  const configs: MapleTreeInstanceConfig[] = [];
  let seed = 42;

  // 1. South Wall West Wing (7 trees)
  const southWestCount = 7;
  const swStartX = -46.0;
  const swEndX = -11.0;
  for (let i = 0; i < southWestCount; i++) {
    const t = southWestCount > 1 ? i / (southWestCount - 1) : 0;
    const x = swStartX + (swEndX - swStartX) * t;
    const z = 62.8; // 2.7m clearance from wall at Z = 65.5
    const rScale = 0.88 + pseudoRandom(seed++) * 0.32; // 0.88 - 1.20
    const rotY = pseudoRandom(seed++) * Math.PI * 2;
    configs.push({
      id: `maple_sw_${i + 1}`,
      zone: 'SOUTH_WALL_WEST',
      x,
      y: 0.42,
      z,
      scale: rScale,
      rotationY: rotY,
      trunkRadius: 0.45 * rScale,
    });
  }

  // 2. South Wall East Wing (7 trees)
  const southEastCount = 7;
  const seStartX = 11.0;
  const seEndX = 46.0;
  for (let i = 0; i < southEastCount; i++) {
    const t = southEastCount > 1 ? i / (southEastCount - 1) : 0;
    const x = seStartX + (seEndX - seStartX) * t;
    const z = 62.8; // 2.7m clearance from wall at Z = 65.5
    const rScale = 0.88 + pseudoRandom(seed++) * 0.32; // 0.88 - 1.20
    const rotY = pseudoRandom(seed++) * Math.PI * 2;
    configs.push({
      id: `maple_se_${i + 1}`,
      zone: 'SOUTH_WALL_EAST',
      x,
      y: 0.42,
      z,
      scale: rScale,
      rotationY: rotY,
      trunkRadius: 0.45 * rScale,
    });
  }

  // 3. West Boundary Wall (6 trees)
  const westCount = 6;
  const wStartZ = 52.0;
  const wEndZ = -20.0;
  for (let i = 0; i < westCount; i++) {
    const t = westCount > 1 ? i / (westCount - 1) : 0;
    const x = -49.2; // 2.5m clearance from west wall at X = -51.7
    const z = wStartZ + (wEndZ - wStartZ) * t;
    const rScale = 0.85 + pseudoRandom(seed++) * 0.35;
    const rotY = pseudoRandom(seed++) * Math.PI * 2;
    configs.push({
      id: `maple_west_${i + 1}`,
      zone: 'WEST_WALL_PERIMETER',
      x,
      y: 0.42,
      z,
      scale: rScale,
      rotationY: rotY,
      trunkRadius: 0.45 * rScale,
    });
  }

  // 4. East Boundary Wall (6 trees)
  const eastCount = 6;
  const eStartZ = 52.0;
  const eEndZ = -20.0;
  for (let i = 0; i < eastCount; i++) {
    const t = eastCount > 1 ? i / (eastCount - 1) : 0;
    const x = 49.2; // 2.5m clearance from east wall at X = 51.7
    const z = eStartZ + (eEndZ - eStartZ) * t;
    const rScale = 0.85 + pseudoRandom(seed++) * 0.35;
    const rotY = pseudoRandom(seed++) * Math.PI * 2;
    configs.push({
      id: `maple_east_${i + 1}`,
      zone: 'EAST_WALL_PERIMETER',
      x,
      y: 0.42,
      z,
      scale: rScale,
      rotationY: rotY,
      trunkRadius: 0.45 * rScale,
    });
  }

  return configs;
}

/**
 * Generates CircleObstacle collision definitions for all tree trunks
 */
export function getMapleTreeColliders(): CircleObstacle[] {
  const configs = generateMapleTreeConfigs();
  return configs.map((c) => ({
    type: 'circle' as const,
    x: c.x,
    z: c.z,
    r: c.trunkRadius,
    name: `Maple Tree Trunk (${c.id})`,
  }));
}

/**
 * Creates a stylized anime maple tree fallback placeholder while GLTF is loading
 */
function createFallbackMapleTree(scale: number): THREE.Group {
  const group = new THREE.Group();

  // Trunk: warm ancient bark cylinder
  const trunkGeo = new THREE.CylinderGeometry(0.28 * scale, 0.42 * scale, 3.8 * scale, 8);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a2e1b });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = (3.8 * scale) / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  // Red foliage clusters (vibrant maple leaf gradient)
  const leafMatRed = new THREE.MeshLambertMaterial({ color: 0xc8321e });
  const leafMatOrange = new THREE.MeshLambertMaterial({ color: 0xdf5a22 });
  const leafMatGold = new THREE.MeshLambertMaterial({ color: 0xe07828 });

  const foliageClusters = [
    { r: 1.6 * scale, x: 0, y: 4.8 * scale, z: 0, mat: leafMatRed },
    { r: 1.3 * scale, x: -0.7 * scale, y: 4.3 * scale, z: 0.4 * scale, mat: leafMatOrange },
    { r: 1.4 * scale, x: 0.8 * scale, y: 4.5 * scale, z: -0.3 * scale, mat: leafMatRed },
    { r: 1.2 * scale, x: 0.2 * scale, y: 5.4 * scale, z: 0.5 * scale, mat: leafMatGold },
    { r: 1.1 * scale, x: -0.5 * scale, y: 5.2 * scale, z: -0.5 * scale, mat: leafMatOrange },
  ];

  for (const f of foliageClusters) {
    const geo = new THREE.DodecahedronGeometry(f.r, 1);
    const m = new THREE.Mesh(geo, f.mat);
    m.position.set(f.x, f.y, f.z);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  }

  return group;
}

/**
 * Loads the 3D maple tree GLTF model asynchronously with singleton caching and bounds normalization
 */
export async function loadMapleTreePrototype(): Promise<THREE.Group> {
  if (cachedPrototype) {
    return cachedPrototype;
  }

  if (prototypePromise) {
    return prototypePromise;
  }

  prototypePromise = new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      MAPLE_TREE_GLTF_PATH,
      (gltf) => {
        const rawModel = gltf.scene;

        // Configure shadows and double-sided foliage rendering
        rawModel.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            if (node.material) {
              if (Array.isArray(node.material)) {
                node.material.forEach((mat) => {
                  mat.side = THREE.DoubleSide;
                  mat.shadowSide = THREE.DoubleSide;
                });
              } else {
                node.material.side = THREE.DoubleSide;
                node.material.shadowSide = THREE.DoubleSide;
              }
            }
          }
        });

        // Compute model bounding box to normalize scale and ground origin
        const bbox = new THREE.Box3().setFromObject(rawModel);
        const size = new THREE.Vector3();
        bbox.getSize(size);

        // Normalize base scale so model fits monastery scale
        const baseScale = size.y > 0 ? TARGET_MAPLE_TREE_HEIGHT / size.y : 1.0;

        // Center X & Z and ground bottom Y to 0
        const centerX = (bbox.min.x + bbox.max.x) / 2;
        const centerZ = (bbox.min.z + bbox.max.z) / 2;
        const groundY = bbox.min.y;

        rawModel.position.set(-centerX, -groundY, -centerZ);

        const normalizedRoot = new THREE.Group();
        normalizedRoot.name = 'MapleTree_NormalizedPrototype';
        normalizedRoot.userData.baseScale = baseScale;
        normalizedRoot.add(rawModel);

        cachedPrototype = normalizedRoot;
        resolve(cachedPrototype);
      },
      undefined,
      (err) => {
        console.warn('[MapleTreeEnsemble] Error loading GLTF model:', err);
        reject(err);
      }
    );
  });

  return prototypePromise;
}

/**
 * Creates and mounts the complete 3D maple tree ensemble into the monastery world.
 * Instantiates 26 trees with immediate stylized placeholders and swaps in the 3D GLTF
 * models seamlessly upon load completion.
 */
export function createMapleTreeEnsemble(onLoaded?: () => void): MapleTreeEnsembleResult {
  const masterGroup = new THREE.Group();
  masterGroup.name = 'Monastery_Perimeter_Maple_Trees';

  const configs = generateMapleTreeConfigs();
  const treeObstacles = getMapleTreeColliders();

  // Map to hold references to container groups for each tree
  const treeContainers: Map<string, { container: THREE.Group; config: MapleTreeInstanceConfig; placeholder: THREE.Group }> = new Map();

  // 1. Initial Pass: Create placeholders and anchor containers at target world positions
  for (const config of configs) {
    const container = new THREE.Group();
    container.name = `TreeContainer_${config.id}`;
    container.position.set(config.x, config.y, config.z);
    container.rotation.y = config.rotationY;

    // Stylized fallback
    const placeholder = createFallbackMapleTree(config.scale);
    placeholder.name = `Placeholder_${config.id}`;
    container.add(placeholder);

    masterGroup.add(container);
    treeContainers.set(config.id, { container, config, placeholder });
  }

  // 2. Asynchronous GLTF Load & Swap
  let isDisposed = false;
  loadMapleTreePrototype()
    .then((prototype) => {
      if (isDisposed) return;

      const baseScale = (prototype.userData.baseScale as number) || 1.0;

      for (const [id, item] of treeContainers.entries()) {
        const { container, config, placeholder } = item;

        // Clone the normalized prototype
        const treeInstance = prototype.clone(true);
        treeInstance.name = `MapleTreeInstance_${id}`;
        treeInstance.scale.setScalar(baseScale * config.scale);

        // Remove placeholder and add rich 3D GLTF instance
        container.remove(placeholder);
        placeholder.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else if (child.material) {
              child.material.dispose();
            }
          }
        });

        container.add(treeInstance);
      }

      if (onLoaded) {
        onLoaded();
      }
    })
    .catch((err) => {
      console.warn('[MapleTreeEnsemble] Retaining stylized placeholders due to GLTF load failure:', err);
    });

  // 3. Cleanup Routine
  const dispose = () => {
    isDisposed = true;
    masterGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
      }
    });
    masterGroup.clear();
  };

  return {
    group: masterGroup,
    treeObstacles,
    dispose,
  };
}

