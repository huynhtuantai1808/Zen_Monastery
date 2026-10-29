import re

file_path = r"e:\a\game\src\canvas\Zen3DWorld.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update TEMPLE_ZONES for tower
old_zone = """  {
    id: 'tower',
    name: '3. Tháp Chuông (7 Tầng)',
    subtitle: 'Bảo tháp nhiều tầng uy nghi trên sườn núi đá',
    dimensions: '16 × 16 m',
    icon: '🏯',
    desc: 'Bảo tháp 7 tầng thanh thoát với hệ đấu củng gỗ và đỉnh bảo tháp hoàng kim rực sáng.',
    pos: { x: 38, z: -20 },
    actionKey: 'TOWER',
  },"""

new_zone = """  {
    id: 'tower',
    name: '3. Bảo Tháp Men Ngọc (3 Tầng)',
    subtitle: 'Bảo tháp ngói lưu ly xanh ngọc • Cửa vòm & Đỉnh búp sen vàng',
    dimensions: '18 × 18 m',
    icon: '🏯',
    desc: 'Bảo tháp kiến trúc truyền thống theo bản vẽ: 3 tầng mái cong ngói men ngọc, thân gỗ ấm, cửa vòm nguyệt môn, đài sen tam cấp và đỉnh búp sen hoàng kim.',
    pos: { x: 38, z: -20 },
    actionKey: 'TOWER',
  },"""

assert old_zone in content, "old_zone not found"
content = content.replace(old_zone, new_zone)

# 2. Add New Texture Generators after createStylizedStoneTexture
new_textures = """function createStylizedJadeRoofTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  // Jade emerald glazed base
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(0, 0, 256, 256);

  // Cylindrical glazed tile tubes (ngói ống men ngọc lưu ly)
  const colW = 28;
  for (let x = 0; x < 256; x += colW) {
    const grad = ctx.createLinearGradient(x, 0, x + colW, 0);
    grad.addColorStop(0, '#022c22');     // deep shadow groove
    grad.addColorStop(0.18, '#065f46');  // emerald tile body
    grad.addColorStop(0.45, '#10b981');  // jade green vibrant tone
    grad.addColorStop(0.65, '#6ee7b7');  // bright glazed ceramic specular highlight
    grad.addColorStop(0.85, '#059669');  // jade mid-tone
    grad.addColorStop(1, '#022c22');     // joint shadow
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, colW, 256);

    // Overlapping tile lip horizontal seams
    for (let y = 0; y < 256; y += 32) {
      ctx.fillStyle = 'rgba(2, 44, 34, 0.45)';
      ctx.fillRect(x, y, colW, 4);
      ctx.fillStyle = 'rgba(167, 243, 208, 0.35)';
      ctx.fillRect(x, y + 4, colW, 2);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createStylizedAmberWoodTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#b45309';
  ctx.fillRect(0, 0, 256, 256);

  // Warm sandalwood grain ribbons
  for (let y = 0; y < 256; y += 10) {
    ctx.fillStyle = y % 20 === 0 ? '#92400e' : '#d97706';
    ctx.fillRect(0, y, 256, 5);
    if (y % 40 === 0) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, y + 2, 256, 2);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createStylizedLotusPlinthTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#78350f';
  ctx.fillRect(0, 0, 256, 256);

  // Lotus petal relief carving pattern
  const pw = 42;
  const ph = 64;
  for (let y = 0; y < 256; y += ph) {
    for (let x = 0; x < 256; x += pw) {
      // Petal back
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.moveTo(x + pw / 2, y + 4);
      ctx.quadraticCurveTo(x + pw - 2, y + ph / 2, x + pw / 2, y + ph - 4);
      ctx.quadraticCurveTo(x + 2, y + ph / 2, x + pw / 2, y + 4);
      ctx.fill();

      // Petal highlight
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(x + pw / 2, y + 8);
      ctx.quadraticCurveTo(x + pw - 8, y + ph / 2, x + pw / 2, y + ph - 8);
      ctx.quadraticCurveTo(x + 8, y + ph / 2, x + pw / 2, y + 8);
      ctx.fill();

      // Golden center rib
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(x + pw / 2 - 1, y + 10, 2, ph - 24);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
"""

stone_end = """  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}"""

# Insert after the stone texture function
assert stone_end in content, "stone_end not found"
# Replace only the stone texture closing to append
content = content.replace(stone_end + "\n\nexport const Zen3DWorld", stone_end + "\n\n" + new_textures + "\nexport const Zen3DWorld")

# 3. Camera Mode State & Default Parameters
old_cam_state = """  // Camera Mode: 'ISOMETRIC' (Top-down 3/4) vs 'THIRD_PERSON' (Over-shoulder)
  const [cameraMode, setCameraMode] = useState<'ISOMETRIC' | 'THIRD_PERSON'>('ISOMETRIC');
  const cameraModeRef = useRef<'ISOMETRIC' | 'THIRD_PERSON'>('ISOMETRIC');

  // State change trackers
  const isWalkingStateRef = useRef<boolean>(false);
  const currentBuildingStateRef = useRef<string | null>(null);
  const currentZoneIdRef = useRef<string>(TEMPLE_ZONES[0].id);

  // Isometric / Top-Down Camera Parameters (Elevated 3/4 diorama angle)
  const cameraYawRef = useRef<number>(Math.PI * 0.78); // Isometric diagonal angle
  const cameraPitchRef = useRef<number>(0.86); // ~50 degrees downward isometric elevation
  const cameraDistRef = useRef<number>(24.0); // High vantage distance
  const cameraLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.2, 70));"""

new_cam_state = """  // Camera Mode: 'THIRD_PERSON' (Panoramic surroundings at eye level) vs 'ISOMETRIC' (Top-down)
  const [cameraMode, setCameraMode] = useState<'ISOMETRIC' | 'THIRD_PERSON'>('THIRD_PERSON');
  const cameraModeRef = useRef<'ISOMETRIC' | 'THIRD_PERSON'>('THIRD_PERSON');

  // State change trackers
  const isWalkingStateRef = useRef<boolean>(false);
  const currentBuildingStateRef = useRef<string | null>(null);
  const currentZoneIdRef = useRef<string>(TEMPLE_ZONES[0].id);

  // Third-Person Panoramic Eye-Level Camera Parameters (See full 360 surroundings and look up at pagodas)
  const cameraYawRef = useRef<number>(Math.PI); // Facing forward into monastery grounds
  const cameraPitchRef = useRef<number>(0.16); // Eye-level view seeing surroundings
  const cameraDistRef = useRef<number>(6.5); // Natural distance behind monk
  const cameraLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.6, 75));"""

assert old_cam_state in content, "old_cam_state not found"
content = content.replace(old_cam_state, new_cam_state)

# 4. toggleCameraMode and restartFromGate
old_toggle = """  // Toggle Camera Mode: Isometric Top-Down vs 3rd-Person
  const toggleCameraMode = () => {
    setCameraMode((prev) => {
      const next = prev === 'ISOMETRIC' ? 'THIRD_PERSON' : 'ISOMETRIC';
      if (next === 'ISOMETRIC') {
        cameraPitchRef.current = 0.86;
        cameraDistRef.current = 24.0;
        cameraYawRef.current = Math.PI * 0.78;
      } else {
        cameraPitchRef.current = 0.22;
        cameraDistRef.current = 6.2;
        cameraYawRef.current = Math.PI;
      }
      return next;
    });
  };"""

new_toggle = """  // Toggle Camera Mode: 3rd-Person Eye-Level (Surroundings) vs Isometric Top-Down
  const toggleCameraMode = () => {
    setCameraMode((prev) => {
      const next = prev === 'THIRD_PERSON' ? 'ISOMETRIC' : 'THIRD_PERSON';
      if (next === 'THIRD_PERSON') {
        cameraPitchRef.current = 0.16;
        cameraDistRef.current = 6.5;
        cameraYawRef.current = Math.PI;
      } else {
        cameraPitchRef.current = 0.86;
        cameraDistRef.current = 24.0;
        cameraYawRef.current = Math.PI * 0.78;
      }
      return next;
    });
  };"""

assert old_toggle in content, "old_toggle not found"
content = content.replace(old_toggle, new_toggle)

old_restart = """    if (cameraModeRef.current === 'ISOMETRIC') {
      cameraPitchRef.current = 0.86;
      cameraDistRef.current = 24.0;
      cameraYawRef.current = Math.PI * 0.78;
    } else {
      cameraPitchRef.current = 0.22;
      cameraDistRef.current = 6.2;
      cameraYawRef.current = Math.PI;
    }"""

new_restart = """    if (cameraModeRef.current === 'THIRD_PERSON') {
      cameraPitchRef.current = 0.16;
      cameraDistRef.current = 6.5;
      cameraYawRef.current = Math.PI;
    } else {
      cameraPitchRef.current = 0.86;
      cameraDistRef.current = 24.0;
      cameraYawRef.current = Math.PI * 0.78;
    }"""

assert old_restart in content, "old_restart not found"
content = content.replace(old_restart, new_restart)

# 5. Camera initialization in useEffect
old_cam_init = """    // 2. Camera with Narrower FOV for Stylized Isometric Look
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 600);
    camera.position.set(20, 20, 85);
    cameraRef.current = camera;"""

new_cam_init = """    // 2. Camera with Generous FOV for Panoramic Surrounding View
    const camera = new THREE.PerspectiveCamera(54, width / height, 0.5, 650);
    camera.position.set(0, 2.8, 86.5);
    cameraRef.current = camera;"""

assert old_cam_init in content, "old_cam_init not found"
content = content.replace(old_cam_init, new_cam_init)

# 6. Materials in useEffect
old_materials = """    // 5. Stylized Hand-Crafted Textures & Materials
    const texWood = createStylizedWoodTexture();
    texWood.repeat.set(2, 4);
    const texBrick = createStylizedBrickTexture();
    texBrick.repeat.set(8, 8);
    const texRoof = createStylizedRoofTexture();
    texRoof.repeat.set(3, 6);
    const texStone = createStylizedStoneTexture();
    texStone.repeat.set(4, 4);

    const matGrass = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.85 });
    const matWoodLim = new THREE.MeshStandardMaterial({ map: texWood, roughness: 0.65 });
    const matWoodWarm = new THREE.MeshStandardMaterial({ map: texWood, color: 0xb45309, roughness: 0.65 });
    const matRoofTile = new THREE.MeshStandardMaterial({ map: texRoof, roughness: 0.45, transparent: true, opacity: 1.0 });
    const matTileBrick = new THREE.MeshStandardMaterial({ map: texBrick, roughness: 0.7 });
    const matStoneGrey = new THREE.MeshStandardMaterial({ map: texStone, roughness: 0.8 });
    const matBronze = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.75 });
    const matGold = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25, metalness: 0.85 });
    const matWater = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.85 });
    const matLanternRed = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.65, roughness: 0.5 });"""

new_materials = """    // 5. Stylized Hand-Crafted Textures & Authentic Architecture Materials
    const texWood = createStylizedWoodTexture();
    texWood.repeat.set(2, 4);
    const texBrick = createStylizedBrickTexture();
    texBrick.repeat.set(8, 8);
    const texRoof = createStylizedRoofTexture();
    texRoof.repeat.set(3, 6);
    const texStone = createStylizedStoneTexture();
    texStone.repeat.set(4, 4);

    // Authentic Jade Glazed Tiles & Amber Sandalwood from Reference Drawing
    const texJadeRoof = createStylizedJadeRoofTexture();
    texJadeRoof.repeat.set(3, 4);
    const texAmberWood = createStylizedAmberWoodTexture();
    texAmberWood.repeat.set(2, 4);
    const texLotusPlinth = createStylizedLotusPlinthTexture();
    texLotusPlinth.repeat.set(4, 2);

    const matGrass = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.85 });
    const matWoodLim = new THREE.MeshStandardMaterial({ map: texWood, roughness: 0.65 });
    const matWoodWarm = new THREE.MeshStandardMaterial({ map: texWood, color: 0xb45309, roughness: 0.65 });
    const matDarkTimber = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
    const matAmberWood = new THREE.MeshStandardMaterial({ map: texAmberWood, roughness: 0.55 });
    const matLotusPlinth = new THREE.MeshStandardMaterial({ map: texLotusPlinth, roughness: 0.65 });

    // Signature Jade Green Glazed Ceramic Tile with Specular Sheen (Ngói lưu ly men ngọc)
    const matJadeRoofTile = new THREE.MeshStandardMaterial({
      map: texJadeRoof,
      roughness: 0.32,
      metalness: 0.18,
      transparent: true,
      opacity: 1.0,
    });
    const matRoofTile = matJadeRoofTile; // Harmonize all monastery roofs with signature jade-green glazed tiles
    const matTileBrick = new THREE.MeshStandardMaterial({ map: texBrick, roughness: 0.7 });
    const matStoneGrey = new THREE.MeshStandardMaterial({ map: texStone, roughness: 0.8 });
    const matBronze = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.75 });
    const matGold = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.22, metalness: 0.88 });
    const matWater = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.85 });
    const matLanternRed = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.65, roughness: 0.5 });"""

assert old_materials in content, "old_materials not found"
content = content.replace(old_materials, new_materials)

# 7. Pagoda building in Zone 3
old_zone3 = """    // [ZONE 3: THÁP CHUÔNG 7 TẦNG]
    const pagodaTower = createStylized7TierPagoda(matWoodLim, matRoofTile, matStoneGrey);
    pagodaTower.position.set(38, 0, -20);
    scene.add(pagodaTower);"""

new_zone3 = """    // [ZONE 3: BẢO THÁP MEN NGỌC 3 TẦNG (KIẾN TRÚC MẪU MỚI THEO BẢN VẼ)]
    const pagodaTower = createAuthenticJadePagoda(matJadeRoofTile, matAmberWood, matDarkTimber, matLotusPlinth, matGold, nightLightsRef);
    pagodaTower.position.set(38, 0, -20);
    scene.add(pagodaTower);"""

assert old_zone3 in content, "old_zone3 not found"
content = content.replace(old_zone3, new_zone3)

# 8. Pointer movement pitch bounds and wheel zoom
old_orbit = """        cameraYawRef.current -= dx * 0.006;
        cameraPitchRef.current = Math.max(0.35, Math.min(1.2, cameraPitchRef.current + dy * 0.005));"""

new_orbit = """        cameraYawRef.current -= dx * 0.007;
        // Allows player to tilt up to see the towering pagoda spire and sky, or look down at the ground
        cameraPitchRef.current = Math.max(0.02, Math.min(1.15, cameraPitchRef.current + dy * 0.005));"""

assert old_orbit in content, "old_orbit not found"
content = content.replace(old_orbit, new_orbit)

old_touch = """      cameraYawRef.current -= dx * 0.008;
      cameraPitchRef.current = Math.max(0.35, Math.min(1.2, cameraPitchRef.current + dy * 0.006));"""

new_touch = """      cameraYawRef.current -= dx * 0.008;
      cameraPitchRef.current = Math.max(0.02, Math.min(1.15, cameraPitchRef.current + dy * 0.006));"""

assert old_touch in content, "old_touch not found"
content = content.replace(old_touch, new_touch)

old_wheel = """      cameraDistRef.current = Math.max(8.0, Math.min(38.0, cameraDistRef.current + e.deltaY * 0.018));"""
new_wheel = """      cameraDistRef.current = Math.max(3.5, Math.min(30.0, cameraDistRef.current + e.deltaY * 0.015));"""

assert old_wheel in content, "old_wheel not found"
content = content.replace(old_wheel, new_wheel)

# Also clamp ground raycaster hit so horizon doesn't glitch
old_ray = """      if (raycaster.ray.intersectPlane(groundPlane, hit)) {
        cursorGroundPosRef.current.copy(hit);
        hasGroundTargetRef.current = true;
      }"""

new_ray = """      if (raycaster.ray.intersectPlane(groundPlane, hit)) {
        hit.x = Math.max(-50, Math.min(50, hit.x));
        hit.z = Math.max(-75, Math.min(95, hit.z));
        cursorGroundPosRef.current.copy(hit);
        hasGroundTargetRef.current = true;
      }"""

assert old_ray in content, "old_ray not found"
content = content.replace(old_ray, new_ray)

# 9. Camera follow in animation loop
old_cam_follow = """        // ==========================================
        // ISOMETRIC / TOP-DOWN CAMERA INTERPOLATION
        // ==========================================
        const dist = cameraDistRef.current;
        const pitch = cameraPitchRef.current;
        const yaw = cameraYawRef.current;

        // Position camera high above & behind in 3/4 isometric projection
        const camOffsetX = Math.sin(yaw) * Math.cos(pitch) * dist;
        const camOffsetZ = Math.cos(yaw) * Math.cos(pitch) * dist;
        const camOffsetY = Math.sin(pitch) * dist + 2.5;

        const targetCamX = currentP.x + camOffsetX;
        const targetCamY = currentP.y + camOffsetY;
        const targetCamZ = currentP.z + camOffsetZ;

        camera.position.x += (targetCamX - camera.position.x) * 0.085;
        camera.position.y += (targetCamY - camera.position.y) * 0.085;
        camera.position.z += (targetCamZ - camera.position.z) * 0.085;

        // Smooth Look-at Target centered on character upper body
        const lookTargetX = currentP.x;
        const lookTargetY = currentP.y + 1.2;
        const lookTargetZ = currentP.z;

        cameraLookAtRef.current.x += (lookTargetX - cameraLookAtRef.current.x) * 0.12;
        cameraLookAtRef.current.y += (lookTargetY - cameraLookAtRef.current.y) * 0.12;
        cameraLookAtRef.current.z += (lookTargetZ - cameraLookAtRef.current.z) * 0.12;

        camera.lookAt(cameraLookAtRef.current);"""

new_cam_follow = """        // ==========================================
        // PANORAMIC 3RD-PERSON CAMERA INTERPOLATION (SEE SURROUNDINGS)
        // ==========================================
        const dist = cameraDistRef.current;
        const pitch = cameraPitchRef.current;
        const yaw = cameraYawRef.current;

        // Position camera behind monk at natural eye-level for full panoramic view of surroundings
        const camOffsetX = Math.sin(yaw) * Math.cos(pitch) * dist;
        const camOffsetZ = Math.cos(yaw) * Math.cos(pitch) * dist;
        const camOffsetY = Math.sin(pitch) * dist + 1.8;

        const targetCamX = currentP.x + camOffsetX;
        const targetCamY = Math.max(0.5, currentP.y + camOffsetY);
        const targetCamZ = currentP.z + camOffsetZ;

        camera.position.x += (targetCamX - camera.position.x) * 0.12;
        camera.position.y += (targetCamY - camera.position.y) * 0.12;
        camera.position.z += (targetCamZ - camera.position.z) * 0.12;

        // Smooth Look-at Target centered on monk eye/shoulder level
        const lookTargetX = currentP.x;
        const lookTargetY = currentP.y + 1.6;
        const lookTargetZ = currentP.z;

        cameraLookAtRef.current.x += (lookTargetX - cameraLookAtRef.current.x) * 0.15;
        cameraLookAtRef.current.y += (lookTargetY - cameraLookAtRef.current.y) * 0.15;
        cameraLookAtRef.current.z += (lookTargetZ - cameraLookAtRef.current.z) * 0.15;

        camera.lookAt(cameraLookAtRef.current);"""

assert old_cam_follow in content, "old_cam_follow not found"
content = content.replace(old_cam_follow, new_cam_follow)

# 10. Toggle button UI
old_ui_toggle = """        {/* Isometric vs Third-Person Mode Switcher */}
        <button
          onClick={toggleCameraMode}
          className="px-3 py-2 rounded-2xl font-serif text-xs font-bold shadow-xl flex items-center gap-1.5 transition-all cursor-pointer border backdrop-blur-md bg-stone-900/90 hover:bg-stone-800 text-amber-300 border-amber-500/30"
          title="Chuyển đổi góc nhìn Isometric từ trên xuống / Góc nhìn người thứ ba"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>{cameraMode === 'ISOMETRIC' ? '📐 Góc Isometric (Top-Down)' : '🎥 Góc Người Thứ 3'}</span>
        </button>"""

new_ui_toggle = """        {/* Panoramic 3rd-Person vs Isometric Mode Switcher */}
        <button
          onClick={toggleCameraMode}
          className="px-3 py-2 rounded-2xl font-serif text-xs font-bold shadow-xl flex items-center gap-1.5 transition-all cursor-pointer border backdrop-blur-md bg-stone-900/90 hover:bg-stone-800 text-amber-300 border-amber-500/30"
          title="Chuyển đổi góc nhìn: Góc người thứ 3 (Thấy toàn cảnh xung quanh) / Góc từ trên xuống"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>{cameraMode === 'THIRD_PERSON' ? '🎥 Góc Toàn Cảnh (Xung Quanh)' : '📐 Góc Trên Cao (Top-Down)'}</span>
        </button>"""

assert old_ui_toggle in content, "old_ui_toggle not found"
content = content.replace(old_ui_toggle, new_ui_toggle)

# 11. Replace createStylized7TierPagoda with createAuthenticJadePagoda and helpers
old_pagoda_code = """// Stylized 7-Tier Pagoda Tower (Bảo Tháp 7 Tầng)
function createStylized7TierPagoda(matWood: THREE.Material, matTile: THREE.Material, matStone: THREE.Material): THREE.Group {
  const tower = new THREE.Group();
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(15, 2.2, 15), matStone);
  plinth.position.set(0, 1.1, 0);
  tower.add(plinth);

  let curY = 2.2;
  let curSize = 11.5;

  for (let tier = 1; tier <= 7; tier++) {
    const roomH = 3.4 * Math.pow(0.88, tier);
    const room = new THREE.Mesh(new THREE.BoxGeometry(curSize, roomH, curSize), matWood);
    room.position.set(0, curY + roomH / 2, 0);
    room.castShadow = true;
    tower.add(room);

    const roof = createStylizedCurvedRoof(curSize * 1.45, curSize * 1.45, matTile);
    roof.position.set(0, curY + roomH + 0.5, 0);
    tower.add(roof);

    curY += roomH + 0.85;
    curSize *= 0.84;
  }

  // Golden Spire on Top
  const spire = new THREE.Mesh(
    new THREE.ConeGeometry(0.85, 4.2, 8),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 })
  );
  spire.position.set(0, curY + 2.1, 0);
  tower.add(spire);

  return tower;
}"""

new_pagoda_code = """// Sweeping Jade-Green Glazed Tile Roof with Upturned Corners and Ornamental Crests
function createJadeCurvedRoof(
  width: number,
  depth: number,
  height: number,
  matJadeTile: THREE.Material,
  matGold: THREE.Material
): THREE.Group {
  const roofGroup = new THREE.Group();

  // Main flared 4-sided pyramid roof
  const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.72, height, 4), matJadeTile);
  mainRoof.rotateY(Math.PI / 4);
  mainRoof.scale.set(1.0, 1.0, depth / width);
  mainRoof.position.set(0, height / 2, 0);
  mainRoof.castShadow = true;
  roofGroup.add(mainRoof);

  // Eave border trim (mép ngói trích thủy)
  const eaveTrim = new THREE.Mesh(new THREE.BoxGeometry(width * 0.98, 0.18, depth * 0.98), matJadeTile);
  eaveTrim.position.set(0, 0.09, 0);
  roofGroup.add(eaveTrim);

  // 4 Upturned Dragon-Tail Corner Eaves (Đao cong ngói ngọc)
  const r = width * 0.52;
  for (const a of [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4]) {
    const finial = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.22, 8, 16, Math.PI * 0.8), matJadeTile);
    finial.position.set(Math.cos(a) * r, 0.35, Math.sin(a) * r * (depth / width));
    finial.rotation.z = Math.PI / 3.5;
    finial.rotation.y = a - Math.PI / 4;
    roofGroup.add(finial);

    // Golden tip accent on the eave horn
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 6), matGold);
    tip.position.set(Math.cos(a) * (r + 0.35), 0.85, Math.sin(a) * (r + 0.35) * (depth / width));
    tip.rotation.z = -Math.PI / 4;
    roofGroup.add(tip);
  }

  // 4 Hip Ridge Cappers (Bờ giải ngói ống)
  for (let i = 0; i < 4; i++) {
    const ridgeAngle = (i * Math.PI) / 2 + Math.PI / 4;
    const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, width * 0.65, 6), matJadeTile);
    ridge.position.set(
      (Math.cos(ridgeAngle) * width) / 4,
      height / 2,
      (Math.sin(ridgeAngle) * depth) / 4
    );
    ridge.rotation.z = Math.PI / 4;
    ridge.rotation.y = ridgeAngle;
    roofGroup.add(ridge);
  }

  return roofGroup;
}

// Bracket Corbel Ring (Hệ Đấu Củng Tam Cấp)
function createBracketCorbelRing(width: number, y: number, matDarkTimber: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  g.position.set(0, y, 0);

  for (let s = 0; s < 4; s++) {
    const angle = (s * Math.PI) / 2;
    for (let bx = -width * 0.35; bx <= width * 0.35; bx += width * 0.28) {
      const bracket = new THREE.Group();
      // Tier 1 corbel
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.65), matDarkTimber);
      b1.position.set(0, -0.11, 0.2);
      bracket.add(b1);
      // Tier 2 corbel
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.18, 0.45), matDarkTimber);
      b2.position.set(0, 0.08, 0.35);
      bracket.add(b2);

      const rotX = Math.cos(angle) * bx - Math.sin(angle) * (width / 2);
      const rotZ = Math.sin(angle) * bx + Math.cos(angle) * (width / 2);
      bracket.position.set(rotX, 0, rotZ);
      bracket.rotation.y = angle;
      g.add(bracket);
    }
  }

  return g;
}

// Authentic 3-Tier Jade Buddhist Pagoda Tower (Bảo Tháp Men Ngọc 3 Tầng theo bản vẽ mẫu)
function createAuthenticJadePagoda(
  matJadeTile: THREE.Material,
  matAmberWood: THREE.Material,
  matDarkTimber: THREE.Material,
  matLotusPlinth: THREE.Material,
  matGold: THREE.Material,
  nightLightsRef: React.MutableRefObject<THREE.PointLight[]>
): THREE.Group {
  const pagoda = new THREE.Group();

  // 1. MULTI-TIER LOTUS PEDESTAL BASE (ĐÀI SEN TAM CẤP)
  // Step 1: Base plinth
  const base1 = new THREE.Mesh(new THREE.BoxGeometry(18, 1.2, 18), matLotusPlinth);
  base1.position.set(0, 0.6, 0);
  base1.receiveShadow = true;
  pagoda.add(base1);

  // Step 2: Middle plinth with chamfer
  const base2 = new THREE.Mesh(new THREE.BoxGeometry(15.5, 1.0, 15.5), matLotusPlinth);
  base2.position.set(0, 1.7, 0);
  base2.receiveShadow = true;
  pagoda.add(base2);

  // Step 3: Upper lotus seat platform with projecting lotus petal corbels
  const base3 = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.8, 13.5), matAmberWood);
  base3.position.set(0, 2.6, 0);
  base3.receiveShadow = true;
  pagoda.add(base3);

  // Carved lotus petals (24 petals around the 4 sides of the plinth)
  for (let side = 0; side < 4; side++) {
    const angle = (side * Math.PI) / 2;
    for (let p = -5; p <= 5; p += 2) {
      const petal = new THREE.Mesh(
        new THREE.ConeGeometry(0.75, 1.2, 5),
        matLotusPlinth
      );
      petal.rotation.x = Math.PI / 2;
      petal.rotation.z = Math.PI / 4;
      const px = p * 1.15;
      const pz = 6.9;
      petal.position.set(
        Math.cos(angle) * px - Math.sin(angle) * pz,
        2.5,
        Math.sin(angle) * px + Math.cos(angle) * pz
      );
      pagoda.add(petal);
    }
  }

  // Front stone steps leading to Tier 1 terrace
  for (let st = 0; st < 6; st++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.45, 0.8), matLotusPlinth);
    step.position.set(0, 0.22 + st * 0.45, 9.2 + (5 - st) * 0.65);
    pagoda.add(step);
  }

  // Tier 1 Terrace Balustrade Railing (Lan can chạm khắc)
  const railingGroup = new THREE.Group();
  for (const sideAngle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
    for (let rx = -6.2; rx <= 6.2; rx += 1.8) {
      if (sideAngle === 0 && Math.abs(rx) < 2.2) continue; // Entrance gap
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.05, 0.22), matDarkTimber);
      const postRotX = Math.cos(sideAngle) * rx - Math.sin(sideAngle) * 6.6;
      const postRotZ = Math.sin(sideAngle) * rx + Math.cos(sideAngle) * 6.6;
      post.position.set(postRotX, 3.5, postRotZ);
      railingGroup.add(post);

      const bud = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 6), matAmberWood);
      bud.position.set(postRotX, 4.15, postRotZ);
      railingGroup.add(bud);
    }
    if (sideAngle === 0) {
      const leftRail = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 0.18), matDarkTimber);
      leftRail.position.set(-4.2, 3.9, 6.6);
      railingGroup.add(leftRail);
      const rightRail = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 0.18), matDarkTimber);
      rightRail.position.set(4.2, 3.9, 6.6);
      railingGroup.add(rightRail);
    } else {
      const railBar = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.14, 0.18), matDarkTimber);
      railBar.position.set(
        -Math.sin(sideAngle) * 6.6,
        3.9,
        Math.cos(sideAngle) * 6.6
      );
      railBar.rotation.y = sideAngle;
      railingGroup.add(railBar);
    }
  }
  pagoda.add(railingGroup);

  // Helper to create Arched Door & Flanking Circular Medallions on a facade
  const createFacadeDecor = (width: number, height: number, hasDoor: boolean) => {
    const fGroup = new THREE.Group();

    if (hasDoor) {
      const dw = width * 0.28;
      const dh = height * 0.78;
      const fL = new THREE.Mesh(new THREE.BoxGeometry(0.18, dh * 0.75, 0.22), matDarkTimber);
      fL.position.set(-dw / 2, dh * 0.38, 0);
      fGroup.add(fL);
      const fR = new THREE.Mesh(new THREE.BoxGeometry(0.18, dh * 0.75, 0.22), matDarkTimber);
      fR.position.set(dw / 2, dh * 0.38, 0);
      fGroup.add(fR);

      const archTop = new THREE.Mesh(
        new THREE.TorusGeometry(dw / 2, 0.12, 8, 16, Math.PI),
        matDarkTimber
      );
      archTop.position.set(0, dh * 0.75, 0);
      fGroup.add(archTop);

      const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(dw - 0.15, dh * 0.72, 0.12), matAmberWood);
      doorPanel.position.set(0, dh * 0.36, -0.05);
      fGroup.add(doorPanel);

      const doorMoon = new THREE.Mesh(new THREE.CircleGeometry(dw / 2 - 0.08, 16, 0, Math.PI), matAmberWood);
      doorMoon.position.set(0, dh * 0.75, -0.05);
      fGroup.add(doorMoon);

      const divider = new THREE.Mesh(new THREE.BoxGeometry(0.06, dh * 0.72, 0.14), matDarkTimber);
      divider.position.set(0, dh * 0.36, 0);
      fGroup.add(divider);

      for (const kx of [-dw * 0.22, dw * 0.22]) {
        const knocker = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 6, 12), matGold);
        knocker.position.set(kx, dh * 0.45, 0.08);
        fGroup.add(knocker);
      }
    }

    // Circular Medallions (Họa tiết nguyệt luân hoa sen) on left and right
    for (const mx of [-width * 0.32, width * 0.32]) {
      for (const my of [height * 0.35, height * 0.7]) {
        const medallion = new THREE.Group();
        medallion.position.set(mx, my, 0.04);

        const outerRing = new THREE.Mesh(new THREE.TorusGeometry(width * 0.09, 0.05, 8, 16), matDarkTimber);
        medallion.add(outerRing);

        const innerFlower = new THREE.Mesh(new THREE.CircleGeometry(width * 0.08, 12), matAmberWood);
        medallion.add(innerFlower);

        const centerBoss = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), matGold);
        centerBoss.position.z = 0.06;
        medallion.add(centerBoss);

        fGroup.add(medallion);
      }
    }

    return fGroup;
  };

  // 2. TIER 1 (TẦNG 1): Wide lower pavilion
  const t1Y = 3.0;
  const t1W = 9.8;
  const t1H = 4.6;

  const t1Body = new THREE.Mesh(new THREE.BoxGeometry(t1W, t1H, t1W), matAmberWood);
  t1Body.position.set(0, t1Y + t1H / 2, 0);
  t1Body.castShadow = true;
  pagoda.add(t1Body);

  for (const cx of [-t1W / 2 + 0.35, t1W / 2 - 0.35]) {
    for (const cz of [-t1W / 2 + 0.35, t1W / 2 - 0.35]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, t1H + 0.2, 10), matDarkTimber);
      col.position.set(cx, t1Y + t1H / 2, cz);
      col.castShadow = true;
      pagoda.add(col);
    }
  }

  for (let f = 0; f < 4; f++) {
    const fAngle = (f * Math.PI) / 2;
    const decor = createFacadeDecor(t1W, t1H, true);
    decor.position.set(
      -Math.sin(fAngle) * (t1W / 2 + 0.02),
      t1Y,
      Math.cos(fAngle) * (t1W / 2 + 0.02)
    );
    decor.rotation.y = fAngle;
    pagoda.add(decor);
  }

  const t1Brackets = createBracketCorbelRing(t1W * 0.95, t1Y + t1H, matDarkTimber);
  pagoda.add(t1Brackets);

  const roof1 = createJadeCurvedRoof(16.5, 16.5, 3.8, matJadeTile, matGold);
  roof1.position.set(0, t1Y + t1H + 0.4, 0);
  pagoda.add(roof1);

  // 3. TIER 2 (TẦNG 2): Middle tier
  const t2Y = t1Y + t1H + 2.2;
  const t2W = 7.8;
  const t2H = 4.0;

  const t2Body = new THREE.Mesh(new THREE.BoxGeometry(t2W, t2H, t2W), matAmberWood);
  t2Body.position.set(0, t2Y + t2H / 2, 0);
  t2Body.castShadow = true;
  pagoda.add(t2Body);

  for (const cx of [-t2W / 2 + 0.3, t2W / 2 - 0.3]) {
    for (const cz of [-t2W / 2 + 0.3, t2W / 2 - 0.3]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, t2H + 0.2, 10), matDarkTimber);
      col.position.set(cx, t2Y + t2H / 2, cz);
      col.castShadow = true;
      pagoda.add(col);
    }
  }

  for (let f = 0; f < 4; f++) {
    const fAngle = (f * Math.PI) / 2;
    const decor = createFacadeDecor(t2W, t2H, true);
    decor.position.set(
      -Math.sin(fAngle) * (t2W / 2 + 0.02),
      t2Y,
      Math.cos(fAngle) * (t2W / 2 + 0.02)
    );
    decor.rotation.y = fAngle;
    pagoda.add(decor);
  }

  const t2Brackets = createBracketCorbelRing(t2W * 0.95, t2Y + t2H, matDarkTimber);
  pagoda.add(t2Brackets);

  const roof2 = createJadeCurvedRoof(13.2, 13.2, 3.4, matJadeTile, matGold);
  roof2.position.set(0, t2Y + t2H + 0.4, 0);
  pagoda.add(roof2);

  // 4. TIER 3 (TẦNG 3): Top chamber
  const t3Y = t2Y + t2H + 2.0;
  const t3W = 6.0;
  const t3H = 3.6;

  const t3Body = new THREE.Mesh(new THREE.BoxGeometry(t3W, t3H, t3W), matAmberWood);
  t3Body.position.set(0, t3Y + t3H / 2, 0);
  t3Body.castShadow = true;
  pagoda.add(t3Body);

  for (const cx of [-t3W / 2 + 0.25, t3W / 2 - 0.25]) {
    for (const cz of [-t3W / 2 + 0.25, t3W / 2 - 0.25]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, t3H + 0.2, 10), matDarkTimber);
      col.position.set(cx, t3Y + t3H / 2, cz);
      col.castShadow = true;
      pagoda.add(col);
    }
  }

  for (let f = 0; f < 4; f++) {
    const fAngle = (f * Math.PI) / 2;
    const decor = createFacadeDecor(t3W, t3H, true);
    decor.position.set(
      -Math.sin(fAngle) * (t3W / 2 + 0.02),
      t3Y,
      Math.cos(fAngle) * (t3W / 2 + 0.02)
    );
    decor.rotation.y = fAngle;
    pagoda.add(decor);
  }

  const t3Brackets = createBracketCorbelRing(t3W * 0.95, t3Y + t3H, matDarkTimber);
  pagoda.add(t3Brackets);

  const roof3 = createJadeCurvedRoof(10.5, 10.5, 3.0, matJadeTile, matGold);
  roof3.position.set(0, t3Y + t3H + 0.4, 0);
  pagoda.add(roof3);

  // 5. SUMMIT GOLDEN LOTUS BUD SPIRE (ĐỈNH THÁP BÚP SEN HOÀNG KIM)
  const spireY = t3Y + t3H + 3.2;

  const spireBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.1, 0.65, 12), matLotusPlinth);
  spireBase.position.set(0, spireY, 0);
  pagoda.add(spireBase);

  // Multi-tier Stupa Rings (Tương luân hoàng kim - 5 concentric golden bronze rings)
  for (let ring = 0; ring < 5; ring++) {
    const rSize = 1.45 - ring * 0.18;
    const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(rSize, 0.15, 8, 20), matGold);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, spireY + 0.6 + ring * 0.48, 0);
    pagoda.add(ringMesh);
  }

  const spireCone = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.42, 3.2, 8), matGold);
  spireCone.position.set(0, spireY + 2.4, 0);
  pagoda.add(spireCone);

  const budApex = new THREE.Mesh(new THREE.SphereGeometry(0.68, 12, 12), matGold);
  budApex.scale.set(0.9, 1.6, 0.9);
  budApex.position.set(0, spireY + 4.2, 0);
  pagoda.add(budApex);

  const budTip = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.85, 8), matGold);
  budTip.position.set(0, spireY + 5.2, 0);
  pagoda.add(budTip);

  // Golden Radiance Point Light at Apex
  const spireLight = new THREE.PointLight(0xfef08a, 1.8, 24);
  spireLight.position.set(0, spireY + 4.5, 0);
  nightLightsRef.current.push(spireLight);
  pagoda.add(spireLight);

  return pagoda;
}"""

assert old_pagoda_code in content, "old_pagoda_code not found"
content = content.replace(old_pagoda_code, new_pagoda_code)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS: Updated Zen3DWorld.tsx with authentic Jade Pagoda and panoramic 3rd-person eye-level camera!")
