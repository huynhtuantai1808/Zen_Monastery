import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import BuddhaModel from './BuddhaModel';
import {
  Eye,
  EyeOff,
  Camera,
  Box,
  Layers,
  Code,
  Download,
  RotateCcw,
  Sparkles,
  Play,
  Pause,
  Check,
  Copy,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export const BUDDHA_MODEL_GLTF_URL = '/models/buddha/scene.gltf';

interface Buddha3DViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PartName = 'Body' | 'Lotus_Throne' | 'Aureola';

interface MaterialPreset {
  name: string;
  metalness: number;
  roughness: number;
  color: string;
  isOriginalPBR?: boolean;
}

const MATERIAL_PRESETS: MaterialPreset[] = [
  { name: 'Gốc 2K PBR', metalness: 0.75, roughness: 0.35, color: '#ffffff', isOriginalPBR: true },
  { name: 'Đồng Cổ', metalness: 0.78, roughness: 0.34, color: '#b48a4e' },
  { name: 'Thếp Vàng', metalness: 0.92, roughness: 0.22, color: '#ffd700' },
  { name: 'Ngọc Bích', metalness: 0.15, roughness: 0.28, color: '#2e7d32' },
];

export const Buddha3DViewerModal: React.FC<Buddha3DViewerModalProps> = ({ isOpen, onClose }) => {
  const leftViewportRef = useRef<HTMLDivElement>(null);
  const rightViewportRef = useRef<HTMLDivElement>(null);

  const [activeWorkspace, setActiveWorkspace] = useState<string>('Chiêm Bái (BuddhaModel)');
  const [selectedPreset, setSelectedPreset] = useState<string>('Gốc 2K PBR');
  const [metalness, setMetalness] = useState<number>(0.78);
  const [roughness, setRoughness] = useState<number>(0.34);
  const [wireframeOpacity, setWireframeOpacity] = useState<number>(0.55);
  const [modelRotationY, setModelRotationY] = useState<number>(0);
  const [modelScale, setModelScale] = useState<number>(1.0);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [visibility, setVisibility] = useState<Record<PartName, boolean>>({
    Body: true,
    Lotus_Throne: true,
    Aureola: true,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // References for live 3D objects
  const sceneStateRef = useRef<{
    leftScene?: THREE.Scene;
    rightScene?: THREE.Scene;
    leftModel?: THREE.Group;
    rightModel?: THREE.Group;
    leftControls?: OrbitControls;
    rightControls?: OrbitControls;
    rightMaterials?: THREE.MeshStandardMaterial[];
    leftWireMaterials?: THREE.MeshBasicMaterial[];
    originalMaterials?: Map<THREE.Mesh, THREE.Material | THREE.Material[]>;
    partMeshes?: Record<PartName, THREE.Mesh[]>;
  }>({});

  useEffect(() => {
    if (!isOpen) return;

    let isSubscribed = true;
    setIsLoading(true);
    setLoadProgress(0);

    const timer = setTimeout(() => {
      const leftContainer = leftViewportRef.current;
      const rightContainer = rightViewportRef.current;
      if (!leftContainer || !rightContainer || !isSubscribed) return;

      // 1. SETUP LEFT VIEWPORT (Wireframe / Clay Mesh)
      const leftScene = new THREE.Scene();
      leftScene.background = new THREE.Color('#282828');

      const leftCamera = new THREE.PerspectiveCamera(
        38,
        leftContainer.clientWidth / (leftContainer.clientHeight || 1),
        0.1,
        100
      );
      leftCamera.position.set(0, 1.9, 5.2);

      const leftRenderer = new THREE.WebGLRenderer({ antialias: true });
      leftRenderer.setSize(leftContainer.clientWidth, leftContainer.clientHeight);
      leftRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      leftContainer.innerHTML = '';
      leftContainer.appendChild(leftRenderer.domElement);

      const leftGrid = new THREE.GridHelper(10, 20, '#555555', '#383838');
      leftGrid.position.y = 0;
      leftScene.add(leftGrid);

      const leftAxes = new THREE.AxesHelper(0.8);
      leftAxes.position.set(0, 0.05, 0);
      leftScene.add(leftAxes);

      const leftAmbient = new THREE.AmbientLight(0xffffff, 0.9);
      const leftDirLight = new THREE.DirectionalLight(0xffffff, 1.4);
      leftDirLight.position.set(5, 8, 6);
      leftScene.add(leftAmbient, leftDirLight);

      const leftControls = new OrbitControls(leftCamera, leftRenderer.domElement);
      leftControls.enableDamping = true;
      leftControls.dampingFactor = 0.06;
      leftControls.target.set(0, 1.7, 0);

      // 2. SETUP RIGHT VIEWPORT (Textured 2K PBR Viewport)
      const rightScene = new THREE.Scene();
      rightScene.background = new THREE.Color('#222222');

      const rightCamera = new THREE.PerspectiveCamera(
        38,
        rightContainer.clientWidth / (rightContainer.clientHeight || 1),
        0.1,
        100
      );
      rightCamera.position.set(0, 1.9, 5.2);

      const rightRenderer = new THREE.WebGLRenderer({ antialias: true });
      rightRenderer.setSize(rightContainer.clientWidth, rightContainer.clientHeight);
      rightRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      rightRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      rightRenderer.toneMappingExposure = 1.25;
      rightContainer.innerHTML = '';
      rightContainer.appendChild(rightRenderer.domElement);

      // Studio Lighting setup
      const rightAmbient = new THREE.AmbientLight(0xfffaed, 1.1);
      const keyLight = new THREE.DirectionalLight(0xfff3db, 2.2);
      keyLight.position.set(4, 7, 5);

      const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.0);
      fillLight.position.set(-5, 4, 3);

      const rimLight = new THREE.DirectionalLight(0xfef08a, 2.5);
      rimLight.position.set(0, 6, -5);

      const floorLight = new THREE.PointLight(0xd97706, 1.2, 8);
      floorLight.position.set(0, 0.3, 2);

      rightScene.add(rightAmbient, keyLight, fillLight, rimLight, floorLight);

      const rightControls = new OrbitControls(rightCamera, rightRenderer.domElement);
      rightControls.enableDamping = true;
      rightControls.dampingFactor = 0.06;
      rightControls.target.set(0, 1.7, 0);

      // Synchronize Controls between left & right viewports
      let isSyncingLeft = false;
      let isSyncingRight = false;

      leftControls.addEventListener('change', () => {
        if (isSyncingRight) return;
        isSyncingLeft = true;
        rightCamera.position.copy(leftCamera.position);
        rightCamera.rotation.copy(leftCamera.rotation);
        rightControls.target.copy(leftControls.target);
        rightControls.update();
        isSyncingLeft = false;
      });

      rightControls.addEventListener('change', () => {
        if (isSyncingLeft) return;
        isSyncingRight = true;
        leftCamera.position.copy(rightCamera.position);
        leftCamera.rotation.copy(rightCamera.rotation);
        leftControls.target.copy(rightControls.target);
        leftControls.update();
        isSyncingRight = false;
      });

      // 3. LOAD GLTF MODEL (/models/buddha/scene.gltf)
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(
        BUDDHA_MODEL_GLTF_URL,
        (gltf) => {
          if (!isSubscribed) return;

          const modelRoot = gltf.scene;

          // Compute bounding box and center model as in BuddhaModel
          const box = new THREE.Box3().setFromObject(modelRoot);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          modelRoot.position.sub(center);
          rightScene.add(modelRoot);

          // Automatically fit camera as in BuddhaModel
          const maxSize = Math.max(size.x, size.y, size.z);
          const distance = maxSize / (2 * Math.tan(THREE.MathUtils.degToRad(45) / 2));

          rightCamera.position.set(distance * 1.2, distance * 0.7, distance * 1.5);
          rightCamera.near = Math.max(maxSize / 1000, 0.01);
          rightCamera.far = Math.max(maxSize * 100, 1000);
          rightCamera.updateProjectionMatrix();

          leftCamera.position.copy(rightCamera.position);
          leftCamera.near = rightCamera.near;
          leftCamera.far = rightCamera.far;
          leftCamera.updateProjectionMatrix();

          rightControls.target.set(0, 0, 0);
          rightControls.update();
          leftControls.target.set(0, 0, 0);
          leftControls.update();

          // Categorize submeshes into Body, Lotus_Throne, Aureola
          const partMap: Record<PartName, THREE.Mesh[]> = {
            Body: [],
            Lotus_Throne: [],
            Aureola: [],
          };

          const rightMaterials: THREE.MeshStandardMaterial[] = [];
          const originalMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();

          modelRoot.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              originalMaterials.set(mesh, mesh.material);

              const name = (mesh.name || '').toLowerCase();
              if (name.includes('fo_l') || name.includes('polysurface18')) {
                partMap.Body.push(mesh);
              } else if (name.includes('di_zuo') || name.includes('zuo')) {
                partMap.Lotus_Throne.push(mesh);
              } else {
                partMap.Aureola.push(mesh);
              }

              if (mesh.material instanceof THREE.MeshStandardMaterial) {
                rightMaterials.push(mesh.material);
              }
            }
          });

          // 4. Create Left Model (Wireframe & Clay Clone)
          const leftModel = modelRoot.clone(true);
          leftModel.position.copy(modelRoot.position);
          const leftWireMaterials: THREE.MeshBasicMaterial[] = [];

          leftModel.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              // Clay base material
              mesh.material = new THREE.MeshStandardMaterial({
                color: 0x8a8a8a,
                roughness: 0.65,
                metalness: 0.1,
                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 1,
              });

              // Wireframe overlay
              const wireMat = new THREE.MeshBasicMaterial({
                color: 0x111111,
                wireframe: true,
                transparent: true,
                opacity: wireframeOpacity,
              });
              leftWireMaterials.push(wireMat);

              const wireMesh = new THREE.Mesh(mesh.geometry, wireMat);
              mesh.add(wireMesh);
            }
          });

          leftScene.add(leftModel);

          sceneStateRef.current = {
            leftScene,
            rightScene,
            leftModel,
            rightModel: modelRoot,
            leftControls,
            rightControls,
            rightMaterials,
            leftWireMaterials,
            originalMaterials,
            partMeshes: partMap,
          };

          setIsLoading(false);
        },
        (xhr) => {
          if (xhr.total > 0) {
            setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
          }
        },
        (error) => {
          console.warn('Lỗi khi tải mô hình GLTF Phật Tổ:', error);
          setIsLoading(false);
        }
      );

      // Animation Loop
      let animId: number;
      const animate = () => {
        animId = requestAnimationFrame(animate);

        leftControls.update();
        rightControls.update();

        if (autoRotate) {
          if (sceneStateRef.current.leftModel) {
            sceneStateRef.current.leftModel.rotation.y += 0.008;
          }
          if (sceneStateRef.current.rightModel) {
            sceneStateRef.current.rightModel.rotation.y += 0.008;
          }
        }

        leftRenderer.render(leftScene, leftCamera);
        rightRenderer.render(rightScene, rightCamera);
      };
      animate();

      // Window resize handler
      const handleResize = () => {
        if (!leftContainer || !rightContainer) return;
        leftCamera.aspect = leftContainer.clientWidth / (leftContainer.clientHeight || 1);
        leftCamera.updateProjectionMatrix();
        leftRenderer.setSize(leftContainer.clientWidth, leftContainer.clientHeight);

        rightCamera.aspect = rightContainer.clientWidth / (rightContainer.clientHeight || 1);
        rightCamera.updateProjectionMatrix();
        rightRenderer.setSize(rightContainer.clientWidth, rightContainer.clientHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        leftRenderer.dispose();
        rightRenderer.dispose();
      };
    }, 100);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [isOpen, autoRotate]);

  // Handle Material Preset Change
  const handleSelectPreset = (preset: MaterialPreset) => {
    setSelectedPreset(preset.name);
    setMetalness(preset.metalness);
    setRoughness(preset.roughness);

    const { rightMaterials, originalMaterials } = sceneStateRef.current;
    if (!rightMaterials) return;

    if (preset.isOriginalPBR && originalMaterials) {
      originalMaterials.forEach((origMat, mesh) => {
        mesh.material = origMat;
      });
      return;
    }

    const tintColor = new THREE.Color(preset.color);
    rightMaterials.forEach((mat) => {
      mat.color.copy(tintColor);
      mat.metalness = preset.metalness;
      mat.roughness = preset.roughness;
      mat.needsUpdate = true;
    });
  };

  // Handle Metalness / Roughness Slider
  const handleMetalnessChange = (val: number) => {
    setMetalness(val);
    sceneStateRef.current.rightMaterials?.forEach((mat) => {
      mat.metalness = val;
      mat.needsUpdate = true;
    });
  };

  const handleRoughnessChange = (val: number) => {
    setRoughness(val);
    sceneStateRef.current.rightMaterials?.forEach((mat) => {
      mat.roughness = val;
      mat.needsUpdate = true;
    });
  };

  // Handle Wireframe Opacity
  const handleWireframeOpacityChange = (val: number) => {
    setWireframeOpacity(val);
    sceneStateRef.current.leftWireMaterials?.forEach((mat) => {
      mat.opacity = val;
      mat.needsUpdate = true;
    });
  };

  // Handle Part Visibility Toggle
  const handleToggleVisibility = (part: PartName) => {
    const nextVal = !visibility[part];
    setVisibility((prev) => ({ ...prev, [part]: nextVal }));

    const meshes = sceneStateRef.current.partMeshes?.[part];
    if (meshes) {
      meshes.forEach((mesh) => {
        mesh.visible = nextVal;
      });
    }
  };

  // Handle Rotation Y & Scale
  const handleRotationYChange = (deg: number) => {
    setModelRotationY(deg);
    const rad = THREE.MathUtils.degToRad(deg);
    if (sceneStateRef.current.leftModel) sceneStateRef.current.leftModel.rotation.y = rad;
    if (sceneStateRef.current.rightModel) sceneStateRef.current.rightModel.rotation.y = rad;
  };

  const handleScaleChange = (s: number) => {
    setModelScale(s);
    if (sceneStateRef.current.leftModel) sceneStateRef.current.leftModel.scale.setScalar(s);
    if (sceneStateRef.current.rightModel) sceneStateRef.current.rightModel.scale.setScalar(s);
  };

  const handleResetTransform = () => {
    setModelRotationY(0);
    setModelScale(1.0);
    if (sceneStateRef.current.leftModel) {
      sceneStateRef.current.leftModel.rotation.y = 0;
      sceneStateRef.current.leftModel.scale.setScalar(1.0);
    }
    if (sceneStateRef.current.rightModel) {
      sceneStateRef.current.rightModel.rotation.y = 0;
      sceneStateRef.current.rightModel.scale.setScalar(1.0);
    }
  };

  // Export 3D .OBJ File
  const handleExportOBJ = () => {
    const model = sceneStateRef.current.rightModel;
    if (!model) return;

    const exporter = new OBJExporter();
    const result = exporter.parse(model);
    const blob = new Blob([result], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Phat_To_Nhu_Lai_3D.obj';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (!isOpen) return null;

  const workspaces = [
    'Chiêm Bái (BuddhaModel)',
    'Dual Viewport (Blender Studio)',
    'Solid & Wireframe',
    'Shading & PBR',
  ];

  const codeSnippet = `import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function BuddhaModel() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x171717);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );

    camera.position.set(5, 4, 8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(5, 10, 7);
    scene.add(light);

    // Controls
    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;

    // Load GLTF / GLB
    const loader = new GLTFLoader();

    loader.load(
      "/models/buddha/scene.gltf",
      (gltf) => {
        const model = gltf.scene;

        // Center model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.sub(center);
        scene.add(model);

        // Automatically fit camera
        const maxSize = Math.max(size.x, size.y, size.z);
        const distance =
          maxSize / (2 * Math.tan(THREE.MathUtils.degToRad(45) / 2));

        camera.position.set(
          distance * 1.2,
          distance * 0.7,
          distance * 1.5
        );

        camera.near = Math.max(maxSize / 1000, 0.01);
        camera.far = Math.max(maxSize * 100, 1000);
        camera.updateProjectionMatrix();

        controls.target.set(0, 0, 0);
        controls.update();
      },
      undefined,
      (error) => {
        console.error("Cannot load Buddha model:", error);
      }
    );

    // Animation
    let animationId = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Responsive
    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();

          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => material.dispose());
        }
      });

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "600px",
        overflow: "hidden",
        borderRadius: "12px",
      }}
    />
  );
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-1.5 sm:p-3 select-none">
      <div
        className={`flex flex-col w-full bg-[#1e1e1e] text-[#d4d4d4] font-sans rounded-xl border border-[#383838] shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'h-full max-w-[99vw] max-h-[98vh]' : 'h-full max-w-[96vw] max-h-[94vh]'
        }`}
      >
        {/* ====================================================================
            1. TOP BLENDER MENU BAR & WORKSPACE TABS
        ==================================================================== */}
        <header className="flex items-center justify-between h-8 bg-[#181818] border-b border-[#2d2d2d] px-2.5 shrink-0 text-xs">
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#282828] border border-[#3a3a3a] mr-1">
              <span className="w-4 h-4 rounded-full bg-[#ea7600] flex items-center justify-center text-[9px] font-black text-white">
                B
              </span>
              <span className="font-semibold text-[#e6e6e6] text-[11px]">Blender 3.6 LTS</span>
            </div>

            {['File', 'Edit', 'Render', 'Window', 'Help'].map((menu) => (
              <button
                key={menu}
                onClick={() => menu === 'File' && setShowCodeModal(true)}
                className="px-2 py-0.5 text-[11px] text-[#b0b0b0] hover:bg-[#333333] hover:text-white rounded transition"
              >
                {menu}
              </button>
            ))}

            <div className="h-3.5 w-[1px] bg-[#333333] mx-1" />

            {workspaces.map((ws) => (
              <button
                key={ws}
                onClick={() => setActiveWorkspace(ws)}
                className={`px-2.5 py-1 text-[11px] rounded-t transition ${
                  activeWorkspace === ws
                    ? 'bg-[#303030] text-white font-medium border-t-2 border-[#4772b3]'
                    : 'text-[#9e9e9e] hover:bg-[#252525] hover:text-[#d0d0d0]'
                }`}
              >
                {ws}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowCodeModal(true)}
              className="flex items-center space-x-1.5 bg-[#355a96] hover:bg-[#4772b3] text-white px-2.5 py-0.5 rounded text-[11px] font-medium shadow-sm transition cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Code Nhúng React</span>
            </button>

            <button
              onClick={handleExportOBJ}
              className="flex items-center space-x-1 bg-[#2d5a3c] hover:bg-[#3a754e] text-white px-2.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tải .OBJ</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 text-[#a0a0a0] hover:text-white hover:bg-[#333333] rounded transition cursor-pointer"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onClose}
              className="p-1 text-[#a0a0a0] hover:text-red-400 hover:bg-red-950/40 rounded transition cursor-pointer"
              title="Đóng Studio 3D"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ====================================================================
            2. MAIN DUAL VIEWPORT WORKSPACE & RIGHT CONTROL PANEL
        ==================================================================== */}
        <div className="flex flex-1 min-h-0 overflow-hidden relative">
          {activeWorkspace === 'Chiêm Bái (BuddhaModel)' ? (
            <div className="flex-1 w-full h-full relative overflow-hidden bg-[#171717]">
              <div className="absolute top-2 left-3 z-10 flex flex-col gap-0.5 text-[11px] text-[#9e9e9e] pointer-events-none drop-shadow">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tượng Phật Tổ Như Lai 3D (Source: /models/buddha/scene.gltf)</span>
                </span>
                <span className="text-[10px] text-amber-300 font-mono">
                  Auto Camera Framing • OrbitControls • 2K PBR Textures Gốc
                </span>
              </div>
              <BuddhaModel style={{ width: '100%', height: '100%', borderRadius: '0px' }} />
            </div>
          ) : (
            <>
              {/* Dual 3D Viewport Container */}
              <div className="flex-1 flex flex-col md:flex-row border-r border-[#333333] relative overflow-hidden">
            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-3">
                <div className="w-12 h-12 border-3 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                <div className="text-amber-200 font-heading text-sm font-bold animate-pulse">
                  Đang tải mô hình 3D Phật Tổ Như Lai (2K PBR)... {loadProgress > 0 && `${loadProgress}%`}
                </div>
                <div className="text-[11px] text-stone-400 font-mono">public/models/buddha/scene.gltf</div>
              </div>
            )}

            {/* LEFT VIEWPORT: Solid Clay & Wireframe Mode */}
            <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-[#333333] relative">
              <div className="absolute top-2 left-3 z-10 flex flex-col gap-0.5 text-[11px] text-[#9e9e9e] pointer-events-none drop-shadow">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-amber-400" />
                  <span>User Perspective (1) Tượng | Phật Tổ Như Lai (All)</span>
                </span>
                <span className="text-[10px] text-[#7a7a7a] font-mono">Format: .OBJ / .FBX / .GLTF</span>
                <span className="text-[10px] text-[#7a7a7a] font-mono">Vertices: ~12,540 | Triangles: ~25,000</span>
              </div>

              <div ref={leftViewportRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              <div className="absolute bottom-2 left-3 z-10 text-[10px] text-[#6e6e6e] pointer-events-none">
                LMB: Xoay 3D • Shift+LMB: Di chuyển • Scroll: Phóng to/thu nhỏ
              </div>
            </div>

            {/* RIGHT VIEWPORT: 2K PBR Textured Shader Viewport */}
            <div className="flex-1 flex flex-col relative">
              <div className="absolute top-2 left-3 z-10 flex flex-col gap-0.5 text-[11px] text-[#9e9e9e] pointer-events-none drop-shadow">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>User Perspective (3) Textured / 2K PBR Viewport</span>
                </span>
                <span className="text-[10px] text-amber-300 font-mono">Shader: {selectedPreset}</span>
              </div>

              <div ref={rightViewportRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

              {/* Quick Preset Floating Badge */}
              <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-[11px]">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`p-1 rounded transition cursor-pointer ${
                    autoRotate ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:bg-white/10'
                  }`}
                  title={autoRotate ? 'Tạm dừng tự xoay' : 'Tự động xoay 360°'}
                >
                  {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <span className="text-stone-300 font-mono text-[10px]">Tự xoay 360°</span>
              </div>
            </div>
          </div>

          {/* ====================================================================
              3. RIGHT CONTROL PANEL (SCENE COLLECTION & PBR SHADER SETTINGS)
          ==================================================================== */}
          <aside className="w-72 sm:w-80 bg-[#232323] flex flex-col shrink-0 overflow-y-auto no-scrollbar border-l border-[#333333] text-xs">
            {/* 3.1. SCENE COLLECTION TREE */}
            <div className="p-3 border-b border-[#333333]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#e0e0e0] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#4772b3]" />
                  <span>Scene Collection (Phật Tổ 3D)</span>
                </span>
              </div>

              <div className="space-y-1 bg-[#1a1a1a] p-2 rounded-lg border border-[#2e2e2e]">
                {/* Camera Node */}
                <div className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#282828] text-[#a0a0a0]">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    <span>Camera</span>
                  </span>
                  <Eye className="w-3.5 h-3.5 text-stone-400" />
                </div>

                {/* Body (Thân Tượng) */}
                <div className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#282828] text-[#d4d4d4]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Body (Thân Tượng Thon Gọn)</span>
                  </span>
                  <button
                    onClick={() => handleToggleVisibility('Body')}
                    className="p-0.5 hover:text-white transition cursor-pointer"
                  >
                    {visibility.Body ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                    )}
                  </button>
                </div>

                {/* Lotus Throne (Tòa Sen) */}
                <div className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#282828] text-[#d4d4d4]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                    <span>Lotus_Throne (Tòa Sen)</span>
                  </span>
                  <button
                    onClick={() => handleToggleVisibility('Lotus_Throne')}
                    className="p-0.5 hover:text-white transition cursor-pointer"
                  >
                    {visibility.Lotus_Throne ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                    )}
                  </button>
                </div>

                {/* Aureola (Hào Quang / Bệ Đài) */}
                <div className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#282828] text-[#d4d4d4]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span>Aureola (Hào Quang & Vách Đá)</span>
                  </span>
                  <button
                    onClick={() => handleToggleVisibility('Aureola')}
                    className="p-0.5 hover:text-white transition cursor-pointer"
                  >
                    {visibility.Aureola ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 3.2. PBR MATERIAL PRESETS */}
            <div className="p-3 border-b border-[#333333]">
              <span className="font-semibold text-[#e0e0e0] block mb-2">Vật Liệu 2K PBR</span>
              <div className="grid grid-cols-2 gap-1.5">
                {MATERIAL_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => handleSelectPreset(p)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                      selectedPreset === p.name
                        ? 'bg-[#3b5998] border-[#5d82d1] text-white shadow-sm'
                        : 'bg-[#1e1e1e] border-[#333333] text-[#b0b0b0] hover:bg-[#282828] hover:text-white'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3.3. PBR SHADER SLIDERS */}
            <div className="p-3 border-b border-[#333333] space-y-3">
              {/* Metalness */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#a0a0a0]">Độ Kim Loại (Metalness)</span>
                  <span className="font-mono text-amber-300">{metalness.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={metalness}
                  onChange={(e) => handleMetalnessChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-[#181818] h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Roughness */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#a0a0a0]">Độ Nhám (Roughness)</span>
                  <span className="font-mono text-amber-300">{roughness.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={roughness}
                  onChange={(e) => handleRoughnessChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-[#181818] h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Wireframe Opacity */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#a0a0a0]">Độ Đậm Lưới (Wireframe)</span>
                  <span className="font-mono text-amber-300">{Math.round(wireframeOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={wireframeOpacity}
                  onChange={(e) => handleWireframeOpacityChange(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 bg-[#181818] h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* 3.4. TRANSFORM CONTROLS */}
            <div className="p-3 border-b border-[#333333] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#e0e0e0]">Transform (Tỷ Lệ & Xoay)</span>
                <button
                  onClick={handleResetTransform}
                  className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#a0a0a0]">Rotation Y</span>
                  <span className="font-mono text-amber-300">{modelRotationY}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={modelRotationY}
                  onChange={(e) => handleRotationYChange(parseInt(e.target.value))}
                  className="w-full accent-amber-500 bg-[#181818] h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#a0a0a0]">Scale</span>
                  <span className="font-mono text-amber-300">{modelScale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={modelScale}
                  onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-[#181818] h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* 3.5. ACTION BUTTONS & MODEL STATS */}
            <div className="p-3 space-y-2 mt-auto">
              <button
                onClick={() => setShowCodeModal(true)}
                className="w-full py-2 bg-[#2a4d80] hover:bg-[#355a96] text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2 shadow transition cursor-pointer"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Xem Code React / Three.js</span>
              </button>

              <button
                onClick={handleExportOBJ}
                className="w-full py-2 bg-[#254b30] hover:bg-[#2d5a3c] text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2 shadow transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất File 3D (.OBJ)</span>
              </button>

              <div className="p-2.5 rounded-lg bg-[#181818] border border-[#2d2d2d] text-[10px] space-y-1 font-mono text-[#888888]">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="text-stone-300">.GLTF / .BIN / .OBJ</span>
                </div>
                <div className="flex justify-between">
                  <span>Triangles:</span>
                  <span className="text-stone-300">~25,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Textures:</span>
                  <span className="text-stone-300">2K PBR (Albedo, Normal, Roughness)</span>
                </div>
                <div className="text-amber-400 font-sans text-center pt-1 font-semibold">
                  Game-Ready Asset / Interactive 3D Model
                </div>
              </div>
            </div>
          </aside>
            </>
          )}
        </div>
      </div>

      {/* ====================================================================
          4. MODAL XEM CODE REACT / THREE.JS
      ==================================================================== */}
      {showCodeModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] border border-[#383838] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col text-xs">
            <div className="flex items-center justify-between p-3 border-b border-[#333333] bg-[#181818]">
              <span className="font-semibold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" />
                <span>Code Nhúng React Three Fiber & Three.js</span>
              </span>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-stone-400 hover:text-white p-1 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#141414] font-mono text-[11px] text-amber-200 overflow-x-auto">
              <pre className="whitespace-pre">{codeSnippet}</pre>
            </div>

            <div className="flex items-center justify-between p-3 border-t border-[#333333] bg-[#181818]">
              <span className="text-[11px] text-stone-400">Đường dẫn: public/models/buddha/scene.gltf</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codeSnippet);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Đã Sao Chép' : 'Sao Chép Code'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

