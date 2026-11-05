import { create } from 'zustand';
import type { CharacterAppearance, GraphicsQuality } from '../../types/game';
import type { BuddhistFortuneLot } from '../../data/buddhistFortuneLots';
import type { TempleZoneInfo } from '../Zen3DWorld';

export type { TempleZoneInfo };

export interface NearAction {
  title: string;
  action: () => void;
  icon: string;
}

export interface NpcDialogueData {
  speaker: string;
  role: string;
  avatar: string;
  text: string;
  gatha?: string;
  dharmaTopic?: string;
}

export type CameraModeType = 'ISOMETRIC' | 'THIRD_PERSON' | 'ON_RAINY_DAYS';
export type MonkPoseType = 'STAND' | 'LIE_DOWN' | 'SIT_EDGE' | 'INCENSE_BOW';
export type BreathPhaseType = 'IN' | 'HOLD' | 'OUT' | 'REST';

export interface ZenBridgeState {
  // Navigation & Zones
  currentZone: TempleZoneInfo | null;
  zoneBanner: TempleZoneInfo | null;
  currentBuilding: string | null;
  nearInteractions: NearAction[];

  // Camera & Poses
  cameraMode: CameraModeType;
  monkPose: MonkPoseType;
  isTourPlaying: boolean;
  tourIndex: number;
  isIncenseBowing: boolean;

  // Dialogues & Voice
  bellNpcDialogue: NpcDialogueData | null;
  abbotDialogue: NpcDialogueData | null;
  teaNpcDialogue: NpcDialogueData | null;
  isAbbotVoiceActive: boolean;
  abbotVoiceProgress: number;
  abbotVoiceDuration: { current: string; total: string };
  isTueTamVoiceActive: boolean;
  tueTamVoiceProgress: number;
  isAutoBellActive: boolean;

  // Lotus Pond Special Features
  isLanternModalOpen: boolean;
  isLotusMeditationActive: boolean;
  meditationBreathPhase: BreathPhaseType;
  meditationBreaths: number;

  // Xin Xăm Xin Lộc (Buddhist Fortune Divination)
  isFortuneModalOpen: boolean;
  currentFortune: BuddhistFortuneLot | null;
  isShakingLot: boolean;

  // State Mutators (Edge-triggered, low frequency)
  setCurrentZone: (zone: TempleZoneInfo) => void;
  setZoneBanner: (banner: TempleZoneInfo | null) => void;
  setCurrentBuilding: (building: string | null) => void;
  setNearInteractions: (actions: NearAction[]) => void;
  setCameraMode: (mode: CameraModeType) => void;
  setMonkPose: (pose: MonkPoseType) => void;
  setIsTourPlaying: (playing: boolean, index?: number) => void;
  setIsIncenseBowing: (bowing: boolean) => void;
  setBellNpcDialogue: (dialogue: NpcDialogueData | null) => void;
  setAbbotDialogue: (dialogue: NpcDialogueData | null) => void;
  setTeaNpcDialogue: (dialogue: NpcDialogueData | null) => void;
  setAbbotVoice: (active: boolean, progress?: number, duration?: { current: string; total: string }) => void;
  setTueTamVoice: (active: boolean, progress?: number) => void;
  setIsAutoBellActive: (active: boolean) => void;
  setLanternModalOpen: (open: boolean) => void;
  setLotusMeditation: (active: boolean, phase?: BreathPhaseType, count?: number) => void;
  setFortuneModalOpen: (open: boolean) => void;
  setCurrentFortune: (fortune: BuddhistFortuneLot | null) => void;
  setIsShakingLot: (shaking: boolean) => void;
}

export interface ZenWebGlCommands {
  navigateToZone: (zone: TempleZoneInfo) => void;
  setCameraMode: (mode: CameraModeType) => void;
  setMonkPose: (pose: MonkPoseType) => void;
  toggleTour: () => void;
  restartFromGate: () => void;
  triggerIncenseBow: () => void;
  ringBell: () => void;
  talkToMonk: () => void;
  talkToAbbot: () => void;
  startDharmaSession: () => void;
  startSitMeditationLecture: () => void;
  feedKoiFish: () => void;
  releaseLantern: (prayerText: string, prayerType: string) => void;
  toggleAutoBell: () => void;
  setMovementDirection: (direction: 'up' | 'down' | 'left' | 'right', pressed: boolean) => void;
  setSprintMode: (active: boolean) => void;
  tiltCameraUp: () => void;
  setDayNight: (isNight: boolean) => void;
  setGraphicsQuality: (quality: GraphicsQuality) => void;
  updateCharacter: (char: CharacterAppearance) => void;
  drawFortune: () => void;
  talkToTeaMaster: () => void;
  serveTea: () => void;
  playTueTamVoice: (clipKey?: 'GREETING' | 'SWEEP_START' | 'SWEEP_COMPLETE' | 'AN_LAC') => void;
  stopTueTamVoice: () => void;
}

/**
 * Giao ước tương tác Hồ Sen & Chùa Một Cột
 */
export interface LotusPondInteractionContract {
  feedKoiFish: (originX?: number, originZ?: number) => boolean;
  lightLotusPondIncense: () => void;
  releaseLotusLantern: (wishText: string, lanternType: string) => void;
}

export const useZenBridge = create<ZenBridgeState>((set) => ({
  currentZone: null,
  zoneBanner: null,
  currentBuilding: null,
  nearInteractions: [],

  cameraMode: 'THIRD_PERSON',
  monkPose: 'STAND',
  isTourPlaying: false,
  tourIndex: 0,
  isIncenseBowing: false,

  bellNpcDialogue: null,
  abbotDialogue: null,
  teaNpcDialogue: null,
  isAbbotVoiceActive: false,
  abbotVoiceProgress: 0,
  abbotVoiceDuration: { current: '00:00', total: '00:00' },
  isTueTamVoiceActive: false,
  tueTamVoiceProgress: 0,
  isAutoBellActive: true,

  isLanternModalOpen: false,
  isLotusMeditationActive: false,
  meditationBreathPhase: 'IN',
  meditationBreaths: 0,

  isFortuneModalOpen: false,
  currentFortune: null,
  isShakingLot: false,

  setCurrentZone: (currentZone) => set({ currentZone }),
  setZoneBanner: (zoneBanner) => set({ zoneBanner }),
  setCurrentBuilding: (currentBuilding) => set({ currentBuilding }),
  setNearInteractions: (nearInteractions) => set({ nearInteractions }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setMonkPose: (monkPose) => set({ monkPose }),
  setIsTourPlaying: (isTourPlaying, tourIndex) =>
    set((prev) => ({
      isTourPlaying,
      tourIndex: tourIndex !== undefined ? tourIndex : prev.tourIndex,
    })),
  setIsIncenseBowing: (isIncenseBowing) => set({ isIncenseBowing }),
  setBellNpcDialogue: (bellNpcDialogue) => set({ bellNpcDialogue }),
  setAbbotDialogue: (abbotDialogue) => set({ abbotDialogue }),
  setTeaNpcDialogue: (teaNpcDialogue) => set({ teaNpcDialogue }),
  setAbbotVoice: (isAbbotVoiceActive, abbotVoiceProgress, abbotVoiceDuration) =>
    set((prev) => ({
      isAbbotVoiceActive,
      abbotVoiceProgress: abbotVoiceProgress !== undefined ? abbotVoiceProgress : prev.abbotVoiceProgress,
      abbotVoiceDuration: abbotVoiceDuration !== undefined ? abbotVoiceDuration : prev.abbotVoiceDuration,
    })),
  setTueTamVoice: (isTueTamVoiceActive, tueTamVoiceProgress) =>
    set((prev) => ({
      isTueTamVoiceActive,
      tueTamVoiceProgress: tueTamVoiceProgress !== undefined ? tueTamVoiceProgress : prev.tueTamVoiceProgress,
    })),
  setIsAutoBellActive: (isAutoBellActive) => set({ isAutoBellActive }),
  setLanternModalOpen: (isLanternModalOpen) => set({ isLanternModalOpen }),
  setLotusMeditation: (isLotusMeditationActive, phase, count) =>
    set((prev) => ({
      isLotusMeditationActive,
      meditationBreathPhase: phase !== undefined ? phase : prev.meditationBreathPhase,
      meditationBreaths: count !== undefined ? count : prev.meditationBreaths,
    })),
  setFortuneModalOpen: (isFortuneModalOpen) => set({ isFortuneModalOpen }),
  setCurrentFortune: (currentFortune) => set({ currentFortune }),
  setIsShakingLot: (isShakingLot) => set({ isShakingLot }),
}));

// Default no-op command implementations
const defaultCommands: ZenWebGlCommands = {
  navigateToZone: () => {},
  setCameraMode: () => {},
  setMonkPose: () => {},
  toggleTour: () => {},
  restartFromGate: () => {},
  triggerIncenseBow: () => {},
  ringBell: () => {},
  talkToMonk: () => {},
  talkToAbbot: () => {},
  startDharmaSession: () => {},
  startSitMeditationLecture: () => {},
  feedKoiFish: () => {},
  releaseLantern: () => {},
  toggleAutoBell: () => {},
  setMovementDirection: () => {},
  setSprintMode: () => {},
  tiltCameraUp: () => {},
  setDayNight: () => {},
  setGraphicsQuality: () => {},
  updateCharacter: () => {},
  drawFortune: () => {},
  talkToTeaMaster: () => {},
  serveTea: () => {},
  playTueTamVoice: () => {},
  stopTueTamVoice: () => {},
};

class ZenWorldBridgeManager {
  private _commands: ZenWebGlCommands = { ...defaultCommands };

  public get commands(): ZenWebGlCommands {
    return this._commands;
  }

  public registerCommands(commands: Partial<ZenWebGlCommands>): () => void {
    this._commands = { ...this._commands, ...commands };
    return () => {
      this._commands = { ...defaultCommands };
    };
  }
}

export const zenWorldBridge = new ZenWorldBridgeManager();
