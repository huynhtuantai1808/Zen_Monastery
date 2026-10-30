import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import type { CharacterAppearance } from '../types/game';

export interface RealisticCharacterRig {
  modelGroup: THREE.Group;
  mixer: THREE.AnimationMixer;
  actions: {
    walk: THREE.AnimationAction;
    idle: THREE.AnimationAction;
    sit: THREE.AnimationAction;
  };
}

function getBones(skeleton: THREE.Skeleton | THREE.Bone[]): THREE.Bone[] {
  return Array.isArray(skeleton) ? skeleton : skeleton.bones;
}

function getBoneByName(name: string, skeleton: THREE.Skeleton | THREE.Bone[]): THREE.Bone | undefined {
  const bones = getBones(skeleton);
  for (let i = 0; i < bones.length; i++) {
    if (name === bones[i].name) return bones[i];
  }
  return undefined;
}

interface RetargetOptions {
  hip?: string;
  names?: Record<string, string>;
  offsets?: Record<string, THREE.Quaternion>;
  positionMultiplier?: number;
  positionOffset?: number;
  ignoreBones?: string[];
  removeHipsForwardAnimation?: boolean;
  inverseBones?: boolean;
}

function simpleRetargetClip(targetMesh: THREE.SkinnedMesh, clip: THREE.AnimationClip, options: RetargetOptions = {}): THREE.AnimationClip {
  const names = options.names ?? {};
  const offsets = options.offsets ?? {};
  const positionMultiplier = options.positionMultiplier ?? 1.0;
  const inverseBones = options.inverseBones ?? false;
  const ignoreBones = options.ignoreBones ?? [];
  const removeHipsForwardAnimation = options.removeHipsForwardAnimation ?? false;
  const positionOffset = options.positionOffset ?? 0;
  const tracks: THREE.KeyframeTrack[] = [];
  const quat = new THREE.Quaternion();

  clip.tracks.forEach((track) => {
    const trackSplitted = track.name.split('.');
    const mixamoRigName = trackSplitted[0];
    const boneName = names[mixamoRigName] || mixamoRigName;
    const propertyName = trackSplitted[1];
    const boneTo = getBoneByName(boneName, targetMesh.skeleton);
    if (!boneTo && boneName !== 'Armature') return;
    if (ignoreBones.indexOf(boneName) > -1) {
      return;
    }

    if (track instanceof THREE.VectorKeyframeTrack && track.name.endsWith('position') && options.hip === boneName) {
      const times = track.times;
      const values: number[] = [];
      for (let i = 0; i < track.values.length; i++) {
        let v = track.values[i] * positionMultiplier;
        if (removeHipsForwardAnimation && i % 3 === 1) {
          v = 0;
        }
        if (positionOffset !== 0 && i % 3 === 2) {
          v += positionOffset;
        }
        values.push(v);
      }
      tracks.push(new THREE.VectorKeyframeTrack(`${boneName}.${propertyName}`, times, values));
    } else if (track instanceof THREE.QuaternionKeyframeTrack) {
      const times = track.times;
      const values = Array.from(track.values).map((v, i) => (inverseBones && i % 2 === 0 ? -v : v));
      const offset = offsets[boneName];
      if (offset) {
        const numFrames = values.length / 4;
        for (let i = 0; i < numFrames; ++i) {
          quat.fromArray(values, i * 4);
          quat.multiply(offset);
          quat.toArray(values, i * 4);
        }
      }
      tracks.push(new THREE.QuaternionKeyframeTrack(`${boneName}.${propertyName}`, times, values));
    }
  });

  return new THREE.AnimationClip(clip.name, clip.duration, tracks);
}

// Global cache for parsed animations to avoid redundant network/parsing work
const animationCache: {
  walkClipMale?: THREE.AnimationClip;
  walkClipFemale?: THREE.AnimationClip;
  idleClipMale?: THREE.AnimationClip;
  idleClipFemale?: THREE.AnimationClip;
  sitClipMan?: THREE.AnimationClip;
  sitClipWoman?: THREE.AnimationClip;
} = {};

export async function loadRealisticCharacter(character: CharacterAppearance): Promise<RealisticCharacterRig> {
  const isFemale = character.gender === 'female';
  const modelUrl = isFemale ? '/models/Asian_F_1_Casual.glb' : '/models/Asian_M_1_Casual.glb';
  const sitUrl = isFemale ? '/models/SittingIdle_woman.fbx' : '/models/SittingIdle_man.fbx';

  const gltfLoader = new GLTFLoader();
  gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  const fbxLoader = new FBXLoader();

  const cachedWalk = isFemale ? animationCache.walkClipFemale : animationCache.walkClipMale;
  const cachedIdle = isFemale ? animationCache.idleClipFemale : animationCache.idleClipMale;
  const cachedSit = isFemale ? animationCache.sitClipWoman : animationCache.sitClipMan;

  // Load avatar and animation assets concurrently
  const [gltf, walkFbx, idleFbx, sitFbx] = await Promise.all([
    gltfLoader.loadAsync(modelUrl),
    cachedWalk ? Promise.resolve(null) : fbxLoader.loadAsync('/models/Walking.fbx'),
    cachedIdle ? Promise.resolve(null) : fbxLoader.loadAsync('/models/BreathingIdle.fbx'),
    cachedSit ? Promise.resolve(null) : fbxLoader.loadAsync(sitUrl),
  ]);

  const model = gltf.scene;
  model.name = 'Armature';

  // Find the high-resolution skinned mesh in the model
  let skinnedMesh: THREE.SkinnedMesh | null = null;
  model.traverse((child) => {
    if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
      skinnedMesh = child as THREE.SkinnedMesh;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  if (!skinnedMesh) {
    throw new Error('SkinnedMesh not found in avatar GLB');
  }

  // Retarget animations if not already cached
  if (isFemale) {
    if (!animationCache.walkClipFemale && walkFbx?.animations?.[0]) {
      animationCache.walkClipFemale = simpleRetargetClip(skinnedMesh, walkFbx.animations[0], {
        hip: 'Hips',
        names: { Reference: 'Armature' },
        positionMultiplier: 0.01,
        positionOffset: 0,
        removeHipsForwardAnimation: true,
        ignoreBones: ['LeftEye', 'LeftEye_end', 'RightEye', 'RightEye_end'],
      });
      animationCache.walkClipFemale.name = 'walk';
    }
    if (!animationCache.idleClipFemale && idleFbx?.animations?.[0]) {
      animationCache.idleClipFemale = simpleRetargetClip(skinnedMesh, idleFbx.animations[0], {
        hip: 'Hips',
        names: { Reference: 'Armature' },
        positionMultiplier: 0.01,
        positionOffset: 0,
        ignoreBones: ['Spine1', 'Spine2', 'Neck', 'LeftEye', 'LeftEye_end', 'RightEye', 'RightEye_end'],
      });
      animationCache.idleClipFemale.name = 'idle';
    }
    if (!animationCache.sitClipWoman && sitFbx?.animations?.[0]) {
      animationCache.sitClipWoman = simpleRetargetClip(skinnedMesh, sitFbx.animations[0], {
        hip: 'Hips',
        names: { Reference: 'Armature' },
        positionMultiplier: 0.01,
        positionOffset: 0,
        ignoreBones: ['Spine1', 'Spine2', 'Neck', 'LeftEye', 'LeftEye_end', 'RightEye', 'RightEye_end'],
      });
      animationCache.sitClipWoman.name = 'sit';
    }
  } else {
    if (!animationCache.walkClipMale && walkFbx?.animations?.[0]) {
      animationCache.walkClipMale = simpleRetargetClip(skinnedMesh, walkFbx.animations[0], {
        hip: 'Hips',
        names: { Reference: 'Armature' },
        positionMultiplier: 0.01,
        positionOffset: 0,
        removeHipsForwardAnimation: true,
        ignoreBones: ['LeftEye', 'LeftEye_end', 'RightEye', 'RightEye_end'],
      });
      animationCache.walkClipMale.name = 'walk';
    }
    if (!animationCache.idleClipMale && idleFbx?.animations?.[0]) {
      animationCache.idleClipMale = simpleRetargetClip(skinnedMesh, idleFbx.animations[0], {
        hip: 'Hips',
        names: { Reference: 'Armature' },
        positionMultiplier: 0.01,
        positionOffset: 0,
        ignoreBones: ['Spine1', 'Spine2', 'Neck', 'LeftEye', 'LeftEye_end', 'RightEye', 'RightEye_end'],
      });
      animationCache.idleClipMale.name = 'idle';
    }
    if (!animationCache.sitClipMan && sitFbx?.animations?.[0]) {
      animationCache.sitClipMan = simpleRetargetClip(skinnedMesh, sitFbx.animations[0], {
        hip: 'Hips',
        names: { Reference: 'Armature' },
        positionMultiplier: 0.01,
        positionOffset: 0,
        ignoreBones: ['Spine1', 'Spine2', 'Neck', 'LeftEye', 'LeftEye_end', 'RightEye', 'RightEye_end'],
      });
      animationCache.sitClipMan.name = 'sit';
    }
  }

  const walkClip = isFemale ? animationCache.walkClipFemale! : animationCache.walkClipMale!;
  const idleClip = isFemale ? animationCache.idleClipFemale! : animationCache.idleClipMale!;
  const sitClip = (isFemale ? animationCache.sitClipWoman : animationCache.sitClipMan) || idleClip;

  const mixer = new THREE.AnimationMixer(model);
  const walkAction = mixer.clipAction(walkClip);
  const idleAction = mixer.clipAction(idleClip);
  const sitAction = mixer.clipAction(sitClip);

  walkAction.loop = THREE.LoopRepeat;
  idleAction.loop = THREE.LoopRepeat;
  sitAction.loop = THREE.LoopRepeat;

  // Stride-matched playback speed for 3.6 units/sec walking speed to eliminate foot-skating
  walkAction.timeScale = 1.15;
  idleAction.timeScale = 1.0;
  sitAction.timeScale = 1.0;

  // Elevate model position so shoe soles align flush with y = 0.00 inside monkGroup
  model.position.set(0, isFemale ? 0.082 : 0.121, 0);
  model.rotation.set(0, 0, 0);
  model.rotation.set(0, 0, 0);

  return {
    modelGroup: model,
    mixer,
    actions: {
      walk: walkAction,
      idle: idleAction,
      sit: sitAction,
    },
  };
}

