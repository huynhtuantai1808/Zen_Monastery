file_path = r"e:\a\game\src\canvas\Zen3DWorld.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update initial camera parameters
old_cam_params = """  // Third-Person Panoramic Eye-Level Camera Parameters (See full 360 surroundings and look up at pagodas)
  const cameraYawRef = useRef<number>(Math.PI); // Facing forward into monastery grounds
  const cameraPitchRef = useRef<number>(0.16); // Eye-level view seeing surroundings
  const cameraDistRef = useRef<number>(6.5); // Natural distance behind monk
  const cameraLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.6, 75));"""

new_cam_params = """  // Third-Person Panoramic Eye-Level Camera Parameters (Can look all the way UP at sky & pagoda)
  const cameraYawRef = useRef<number>(0); // 0 = Facing forward into monastery grounds towards north
  const cameraPitchRef = useRef<number>(-0.12); // Slightly looking up/level, showing surroundings & pagoda
  const cameraDistRef = useRef<number>(6.5); // Natural distance behind monk
  const cameraLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.6, 58));"""

assert old_cam_params in content, "old_cam_params not found"
content = content.replace(old_cam_params, new_cam_params)

# 2. Update toggleCameraMode
old_toggle = """      if (next === 'THIRD_PERSON') {
        cameraPitchRef.current = 0.16;
        cameraDistRef.current = 6.5;
        cameraYawRef.current = Math.PI;
      } else {
        cameraPitchRef.current = 0.86;
        cameraDistRef.current = 24.0;
        cameraYawRef.current = Math.PI * 0.78;
      }"""

new_toggle = """      if (next === 'THIRD_PERSON') {
        cameraPitchRef.current = -0.12;
        cameraDistRef.current = 6.5;
        cameraYawRef.current = 0;
      } else {
        cameraPitchRef.current = 0.86;
        cameraDistRef.current = 24.0;
        cameraYawRef.current = Math.PI * 0.78;
      }"""

assert old_toggle in content, "old_toggle not found"
content = content.replace(old_toggle, new_toggle)

# 3. Update restartFromGate
old_restart = """    if (cameraModeRef.current === 'THIRD_PERSON') {
      cameraPitchRef.current = 0.16;
      cameraDistRef.current = 6.5;
      cameraYawRef.current = Math.PI;
    } else {
      cameraPitchRef.current = 0.86;
      cameraDistRef.current = 24.0;
      cameraYawRef.current = Math.PI * 0.78;
    }"""

new_restart = """    if (cameraModeRef.current === 'THIRD_PERSON') {
      cameraPitchRef.current = -0.12;
      cameraDistRef.current = 6.5;
      cameraYawRef.current = 0;
    } else {
      cameraPitchRef.current = 0.86;
      cameraDistRef.current = 24.0;
      cameraYawRef.current = Math.PI * 0.78;
    }"""

assert old_restart in content, "old_restart not found"
content = content.replace(old_restart, new_restart)

# 4. Add floating clouds in sky
clouds_code = """
    // Stylized Puffy White Clouds in Sky (prominent when looking up)
    const cloudGroup = new THREE.Group();
    const matCloud = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      transparent: true,
      opacity: 0.85,
    });
    for (let c = 0; c < 10; c++) {
      const cloud = new THREE.Group();
      for (let p = 0; p < 5; p++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(4.5 + Math.random() * 3, 8, 8),
          matCloud
        );
        puff.position.set((p - 2) * 4.8, (Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 4.2);
        puff.scale.set(1.4, 0.75, 1.1);
        cloud.add(puff);
      }
      const cAngle = (c / 10) * Math.PI * 2;
      const cDist = 50 + Math.random() * 45;
      cloud.position.set(Math.cos(cAngle) * cDist, 46 + Math.random() * 18, Math.sin(cAngle) * cDist);
      cloudGroup.add(cloud);
    }
    scene.add(cloudGroup);
"""

mtn_end = "scene.add(mtnGroup);"
assert mtn_end in content, "mtn_end not found"
content = content.replace(mtn_end, mtn_end + clouds_code)

# 5. Pointer and Touch Move: allow negative pitch (looking up)
old_pointer_move = """        cameraYawRef.current -= dx * 0.007;
        // Allows player to tilt up to see the towering pagoda spire and sky, or look down at the ground
        cameraPitchRef.current = Math.max(0.02, Math.min(1.15, cameraPitchRef.current + dy * 0.005));"""

new_pointer_move = """        cameraYawRef.current -= dx * 0.007;
        // Allows player to tilt UP into the sky (pitch down to -0.92 rad / ~53 degrees up)
        // or tilt DOWN towards the ground (pitch up to +0.95 rad / ~55 degrees down)
        cameraPitchRef.current = Math.max(-0.92, Math.min(0.95, cameraPitchRef.current + dy * 0.005));"""

assert old_pointer_move in content, "old_pointer_move not found"
content = content.replace(old_pointer_move, new_pointer_move)

old_touch_move = """      cameraYawRef.current -= dx * 0.008;
      cameraPitchRef.current = Math.max(0.02, Math.min(1.15, cameraPitchRef.current + dy * 0.006));"""

new_touch_move = """      cameraYawRef.current -= dx * 0.008;
      cameraPitchRef.current = Math.max(-0.92, Math.min(0.95, cameraPitchRef.current + dy * 0.006));"""

assert old_touch_move in content, "old_touch_move not found"
content = content.replace(old_touch_move, new_touch_move)

# 6. Camera Interpolation and Look-At projection in animate loop
old_cam_interp = """        // ==========================================
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

new_cam_interp = """        // ==========================================
        // PANORAMIC 3RD-PERSON CAMERA INTERPOLATION (CAN LOOK UP & AROUND)
        // ==========================================
        const dist = cameraDistRef.current;
        const pitch = cameraPitchRef.current; // ranges from -0.92 (looking up at sky/pagoda) to 0.95 (looking down)
        const yaw = cameraYawRef.current;

        if (cameraModeRef.current === 'THIRD_PERSON') {
          // Unit vector for camera forward look direction
          const forwardDirX = -Math.sin(yaw) * Math.cos(pitch);
          const forwardDirY = -Math.sin(pitch); // When pitch < 0, forwardDirY > 0 (points UP into the sky!)
          const forwardDirZ = -Math.cos(yaw) * Math.cos(pitch);

          // Focus pivot point near character upper body
          const pivotX = currentP.x;
          const pivotY = currentP.y + 1.4;
          const pivotZ = currentP.z;

          // Camera placed behind character along reverse look vector
          const targetCamX = pivotX - forwardDirX * dist;
          // Clamp camera Y above ground so it never clips through floor when looking up
          const targetCamY = Math.max(0.45, pivotY - forwardDirY * dist);
          const targetCamZ = pivotZ - forwardDirZ * dist;

          camera.position.x += (targetCamX - camera.position.x) * 0.14;
          camera.position.y += (targetCamY - camera.position.y) * 0.14;
          camera.position.z += (targetCamZ - camera.position.z) * 0.14;

          // Look-at target placed well ahead along forward look direction
          // When looking up (pitch < 0), target elevates up to 25m into the sky!
          const lookAheadDist = 24.0;
          const targetLookX = pivotX + forwardDirX * lookAheadDist;
          const targetLookY = Math.max(0.2, pivotY + forwardDirY * lookAheadDist);
          const targetLookZ = pivotZ + forwardDirZ * lookAheadDist;

          cameraLookAtRef.current.x += (targetLookX - cameraLookAtRef.current.x) * 0.18;
          cameraLookAtRef.current.y += (targetLookY - cameraLookAtRef.current.y) * 0.18;
          cameraLookAtRef.current.z += (targetLookZ - cameraLookAtRef.current.z) * 0.18;

          camera.lookAt(cameraLookAtRef.current);
        } else {
          // ISOMETRIC 3/4 TOP-DOWN CAMERA
          const camOffsetX = Math.sin(yaw) * Math.cos(pitch) * dist;
          const camOffsetZ = Math.cos(yaw) * Math.cos(pitch) * dist;
          const camOffsetY = Math.sin(pitch) * dist + 2.5;

          const targetCamX = currentP.x + camOffsetX;
          const targetCamY = currentP.y + camOffsetY;
          const targetCamZ = currentP.z + camOffsetZ;

          camera.position.x += (targetCamX - camera.position.x) * 0.085;
          camera.position.y += (targetCamY - camera.position.y) * 0.085;
          camera.position.z += (targetCamZ - camera.position.z) * 0.085;

          const lookTargetX = currentP.x;
          const lookTargetY = currentP.y + 1.2;
          const lookTargetZ = currentP.z;

          cameraLookAtRef.current.x += (lookTargetX - cameraLookAtRef.current.x) * 0.12;
          cameraLookAtRef.current.y += (lookTargetY - cameraLookAtRef.current.y) * 0.12;
          cameraLookAtRef.current.z += (lookTargetZ - cameraLookAtRef.current.z) * 0.12;

          camera.lookAt(cameraLookAtRef.current);
        }"""

assert old_cam_interp in content, "old_cam_interp not found"
content = content.replace(old_cam_interp, new_cam_interp)

# 7. Add quick pitch button in UI controller bar
old_ui_btn = """        {/* Panoramic 3rd-Person vs Isometric Mode Switcher */}
        <button
          onClick={toggleCameraMode}
          className="px-3 py-2 rounded-2xl font-serif text-xs font-bold shadow-xl flex items-center gap-1.5 transition-all cursor-pointer border backdrop-blur-md bg-stone-900/90 hover:bg-stone-800 text-amber-300 border-amber-500/30"
          title="Chuyển đổi góc nhìn: Góc người thứ 3 (Thấy toàn cảnh xung quanh) / Góc từ trên xuống"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>{cameraMode === 'THIRD_PERSON' ? '🎥 Góc Toàn Cảnh (Xung Quanh)' : '📐 Góc Trên Cao (Top-Down)'}</span>
        </button>"""

new_ui_btn = """        {/* Panoramic 3rd-Person vs Isometric Mode Switcher */}
        <button
          onClick={toggleCameraMode}
          className="px-3 py-2 rounded-2xl font-serif text-xs font-bold shadow-xl flex items-center gap-1.5 transition-all cursor-pointer border backdrop-blur-md bg-stone-900/90 hover:bg-stone-800 text-amber-300 border-amber-500/30"
          title="Chuyển đổi góc nhìn: Góc người thứ 3 (Thấy toàn cảnh xung quanh) / Góc từ trên xuống"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>{cameraMode === 'THIRD_PERSON' ? '🎥 Góc Toàn Cảnh' : '📐 Góc Trên Cao'}</span>
        </button>

        {/* Quick Pitch Tilt Button (Look Up at Pagoda & Sky) */}
        <button
          onClick={() => {
            // Toggle between looking up at the pagoda spire (-0.62) and horizontal view (-0.08)
            cameraPitchRef.current = cameraPitchRef.current < -0.3 ? -0.08 : -0.62;
          }}
          className="px-2.5 py-2 rounded-2xl font-serif text-xs font-bold shadow-xl flex items-center gap-1.5 transition-all cursor-pointer border backdrop-blur-md bg-stone-900/90 hover:bg-stone-800 text-amber-300 border-amber-500/30"
          title="Bấm để ngước nhìn lên cao (ngắm tháp & mây trời) hoặc nhìn ngang"
        >
          <span>🔭 Ngước Lên Trời</span>
        </button>"""

assert old_ui_btn in content, "old_ui_btn not found"
content = content.replace(old_ui_btn, new_ui_btn)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS: Updated Zen3DWorld.tsx to fully support looking UP towards the sky and pagoda!")
