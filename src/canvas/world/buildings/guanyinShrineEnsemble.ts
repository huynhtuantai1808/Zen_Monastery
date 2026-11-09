import React from 'react';
import * as THREE from 'three';

export interface GuanyinShrineMaterials {
  matWhiteJade?: THREE.Material;
  matGold?: THREE.Material;
  matStoneGrey?: THREE.Material;
  matTileBrick?: THREE.Material;
  matBronze?: THREE.Material;
  matLotusPlinth?: THREE.Material;
  matWoodLim?: THREE.Material;
}

export interface GuanyinShrineReturnData {
  group: THREE.Group;
  waterStreamMesh: THREE.Mesh;
  waterParticles: THREE.Points;
  incenseSmoke: THREE.Points;
  altarPosition: THREE.Vector3;
  cushionPositions: THREE.Vector3[];
  incenseAttendantPos: THREE.Vector3;
  caretakerPos: THREE.Vector3;
  haloLight: THREE.PointLight;
  update: (delta: number, stepCount: number) => void;
  dispose: () => void;
}

/**
 * Procedural Factory: Tôn tạo Quần thể Quán Âm Đại Điện & Tôn Tượng Bạch Ngọc Chiêm Bái
 * Tọa độ trung tâm: X = 33.0, Z = 42.0 (Cánh Đông khuôn viên sơn tự)
 * Cao trình sàn sảnh: Y = 1.45m (Tôn cao bề thế so với mặt sân 0.42m)
 * Tổng chiều cao tôn tượng và đài sen: ~13.15m
 */
export function createGuanyinShrineEnsemble(
  materials: GuanyinShrineMaterials,
  nightLightsRef?: React.MutableRefObject<THREE.PointLight[]>
): GuanyinShrineReturnData {
  const shrineGroup = new THREE.Group();
  shrineGroup.name = 'GuanyinShrineComplex';
  shrineGroup.position.set(33.0, 0, 42.0);

  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

  // =========================================================================
  // 1. VẬT LIỆU CHẾ TÁC BẠCH NGỌC, ĐỒNG TAM BẢO, VÀNG KIM & CẨM THẠCH
  // =========================================================================
  const matWhiteJade = materials.matWhiteJade ?? new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.18,
    metalness: 0.04,
  });
  disposables.push(matWhiteJade);

  const matJadePolished = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.10,
    metalness: 0.08,
  });
  disposables.push(matJadePolished);

  const matGoldHalo = materials.matGold ?? new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfde047,
    emissiveIntensity: 0.40,
    roughness: 0.20,
    metalness: 0.90,
  });

  const matGoldCrown = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.30,
    roughness: 0.25,
    metalness: 0.85,
  });
  disposables.push(matGoldCrown);

  const matMarblePlaza = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.35,
    metalness: 0.06,
  });
  disposables.push(matMarblePlaza);

  const matMarblePodium = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.50,
    metalness: 0.04,
  });
  disposables.push(matMarblePodium);

  const matBalustrade = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.40,
    metalness: 0.05,
  });
  disposables.push(matBalustrade);

  const matLotusPedalPink = new THREE.MeshStandardMaterial({
    color: 0xf472b6,
    roughness: 0.35,
    metalness: 0.05,
  });
  disposables.push(matLotusPedalPink);

  const matLotusPedalWhite = new THREE.MeshStandardMaterial({
    color: 0xfff1f2,
    roughness: 0.22,
    metalness: 0.03,
  });
  disposables.push(matLotusPedalWhite);

  const matWaterSurface = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.08,
    metalness: 0.15,
    transparent: true,
    opacity: 0.88,
  });
  disposables.push(matWaterSurface);

  const matWaterStream = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    roughness: 0.04,
    metalness: 0.06,
    transparent: true,
    opacity: 0.88,
  });
  disposables.push(matWaterStream);

  const matBronzeBurner = materials.matBronze ?? new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.35,
    metalness: 0.75,
  });

  const matRockery = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.92,
  });
  disposables.push(matRockery);

  const matWillowGreen = new THREE.MeshStandardMaterial({
    color: 0x16a34a,
    roughness: 0.45,
  });
  disposables.push(matWillowGreen);

  const matLotusPad = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.65,
    side: THREE.DoubleSide,
  });
  disposables.push(matLotusPad);

  const matCushion = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.55,
  });
  disposables.push(matCushion);

  const matFacialLine = new THREE.MeshBasicMaterial({
    color: 0x334155,
  });
  disposables.push(matFacialLine);

  const matUrnaPearl = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfef08a,
    emissiveIntensity: 0.65,
    roughness: 0.05,
    metalness: 0.2,
  });
  disposables.push(matUrnaPearl);

  const matLips = new THREE.MeshStandardMaterial({
    color: 0xfbcfe8,
    roughness: 0.3,
  });
  disposables.push(matLips);

  // =========================================================================
  // 2. KHỐI ĐẾ & SÀN SẢNH TÔN CAO BỀ THẾ (ELEVATED PODIUM: FLOOR Y = 1.45m)
  // Sảnh kích thước 26.0m x 26.0m, đôn cao 1.03m so với sân chùa (Y = 0.42m)
  // =========================================================================
  const FLOOR_Y = 1.45;
  const podiumHeight = FLOOR_Y - 0.42; // 1.03m

  // Khối móng đá cẩm thạch trắng nguyên khối
  const podiumBaseGeo = new THREE.BoxGeometry(26.0, podiumHeight, 26.0);
  disposables.push(podiumBaseGeo);
  const podiumBase = new THREE.Mesh(podiumBaseGeo, matMarblePodium);
  podiumBase.position.set(0, 0.42 + podiumHeight * 0.5, 0);
  podiumBase.receiveShadow = true;
  shrineGroup.add(podiumBase);

  // Mặt sàn lát đá cẩm thạch trắng thanh khiết (White Marble Paving)
  const floorPavingGeo = new THREE.BoxGeometry(26.2, 0.08, 26.2);
  disposables.push(floorPavingGeo);
  const floorPaving = new THREE.Mesh(floorPavingGeo, matMarblePlaza);
  floorPaving.position.set(0, FLOOR_Y + 0.04, 0);
  floorPaving.receiveShadow = true;
  shrineGroup.add(floorPaving);

  // Gờ chỉ đá trang trí viền quanh đài sảnh (Decorative Cornice)
  const corniceGeo = new THREE.BoxGeometry(26.4, 0.16, 26.4);
  disposables.push(corniceGeo);
  const cornice = new THREE.Mesh(corniceGeo, matBalustrade);
  cornice.position.set(0, FLOOR_Y - 0.08, 0);
  shrineGroup.add(cornice);

  // -------------------------------------------------------------------------
  // 2.1. HỆ BẬC TAM CẤP ĐÁ ĐÓN BƯỚC PHÍA TÂY (WEST STAIRS: 6 BẬC, RỘNG 8.0m)
  // Leo từ mặt sân Y = 0.42m lên sàn sảnh Y = 1.45m
  // -------------------------------------------------------------------------
  const stepCount = 6;
  const stepRise = (FLOOR_Y - 0.42) / stepCount; // ~0.171m
  const stepRun = 0.42; // 0.42m mỗi bậc
  const stairWidth = 8.0;

  for (let s = 0; s < stepCount; s++) {
    const stepGeo = new THREE.BoxGeometry(stepRun, stepRise * (s + 1), stairWidth);
    disposables.push(stepGeo);
    const stepMesh = new THREE.Mesh(stepGeo, matMarblePlaza);
    // Bậc tiến dần từ ngoài sân (X = -13.0 - (stepCount - s)*stepRun) vào mép sảnh (X = -13.0)
    const stepX = -13.0 - (stepCount - 1 - s) * stepRun - stepRun * 0.5;
    const stepY = 0.42 + (stepRise * (s + 1)) * 0.5;
    stepMesh.position.set(stepX, stepY, 0);
    stepMesh.receiveShadow = true;
    shrineGroup.add(stepMesh);
  }

  // -------------------------------------------------------------------------
  // 2.2. HỆ BẬC TAM CẤP ĐÁ ĐÓN BƯỚC PHÍA NAM (SOUTH STAIRS: 6 BẬC, RỘNG 8.0m)
  // Hướng từ Cổng Tam Quan và sân trước đi thẳng vào mặt tiền tượng
  // -------------------------------------------------------------------------
  for (let s = 0; s < stepCount; s++) {
    const stepGeo = new THREE.BoxGeometry(stairWidth, stepRise * (s + 1), stepRun);
    disposables.push(stepGeo);
    const stepMesh = new THREE.Mesh(stepGeo, matMarblePlaza);
    const stepZ = -13.0 - (stepCount - 1 - s) * stepRun - stepRun * 0.5;
    const stepY = 0.42 + (stepRise * (s + 1)) * 0.5;
    stepMesh.position.set(0, stepY, stepZ);
    stepMesh.receiveShadow = true;
    shrineGroup.add(stepMesh);
  }

  // -------------------------------------------------------------------------
  // 2.3. HỆ LAN CAN ĐÁ CHẠM MÂY (BALUSTRADE: CAO 0.85m TRÊN MẶT SÀN)
  // Bao quanh 4 cạnh sảnh, chừa lối vào 8.0m ở cổng Tây (Z in [-4, 4]) và cổng Nam (X in [-4, 4])
  // -------------------------------------------------------------------------
  const balHeight = 0.85;
  const railH = 0.16;

  // Lan can phía Bắc (Z = +13.0) - kín toàn bộ
  const railGeoN = new THREE.BoxGeometry(26.0, railH, 0.22);
  disposables.push(railGeoN);
  const railN = new THREE.Mesh(railGeoN, matBalustrade);
  railN.position.set(0, FLOOR_Y + balHeight * 0.8, 12.9);
  shrineGroup.add(railN);

  // Lan can phía Đông (X = +13.0) - kín toàn bộ
  const railGeoE = new THREE.BoxGeometry(0.22, railH, 26.0);
  disposables.push(railGeoE);
  const railE = new THREE.Mesh(railGeoE, matBalustrade);
  railE.position.set(12.9, FLOOR_Y + balHeight * 0.8, 0);
  shrineGroup.add(railE);

  // Lan can phía Tây (X = -13.0) - chừa cổng 8m ở giữa (Z in [-4.0, 4.0])
  const railGeoW_Half = new THREE.BoxGeometry(0.22, railH, 9.0);
  disposables.push(railGeoW_Half);
  const railW_North = new THREE.Mesh(railGeoW_Half, matBalustrade);
  railW_North.position.set(-12.9, FLOOR_Y + balHeight * 0.8, 8.5);
  shrineGroup.add(railW_North);

  const railW_South = new THREE.Mesh(railGeoW_Half, matBalustrade);
  railW_South.position.set(-12.9, FLOOR_Y + balHeight * 0.8, -8.5);
  shrineGroup.add(railW_South);

  // Lan can phía Nam (Z = -13.0) - chừa cổng 8m ở giữa (X in [-4.0, 4.0])
  const railGeoS_Half = new THREE.BoxGeometry(9.0, railH, 0.22);
  disposables.push(railGeoS_Half);
  const railS_West = new THREE.Mesh(railGeoS_Half, matBalustrade);
  railS_West.position.set(-8.5, FLOOR_Y + balHeight * 0.8, -12.9);
  shrineGroup.add(railS_West);

  const railS_East = new THREE.Mesh(railGeoS_Half, matBalustrade);
  railS_East.position.set(8.5, FLOOR_Y + balHeight * 0.8, -12.9);
  shrineGroup.add(railS_East);

  // Trụ đá và búp sen lan can
  const pillarGeo = new THREE.BoxGeometry(0.32, balHeight, 0.32);
  const lotusBudGeo = new THREE.SphereGeometry(0.18, 10, 10);
  disposables.push(pillarGeo, lotusBudGeo);

  const balPosts: [number, number][] = [
    [-12.9, -12.9], [12.9, -12.9], [-12.9, 12.9], [12.9, 12.9],
    [-12.9, -4.0], [-12.9, 4.0], // Trụ cổng Tây
    [-4.0, -12.9], [4.0, -12.9], // Trụ cổng Nam
    [0, 12.9], [12.9, 0],
    [-8.5, 12.9], [8.5, 12.9],
    [12.9, -8.5], [12.9, 8.5],
  ];

  balPosts.forEach(([px, pz]) => {
    const post = new THREE.Mesh(pillarGeo, matBalustrade);
    post.position.set(px, FLOOR_Y + balHeight * 0.5, pz);
    shrineGroup.add(post);

    const bud = new THREE.Mesh(lotusBudGeo, matLotusPedalWhite);
    bud.position.set(px, FLOOR_Y + balHeight + 0.16, pz);
    bud.scale.set(1, 1.45, 1);
    shrineGroup.add(bud);
  });

  // =========================================================================
  // 3. HỒ NON BỘ & ĐÀI SEN NGŨ CẤP (VỊ TRÍ TẠI X = 0, Z = +3.5)
  // Tôn tượng đặt ở phía sau sảnh, QUAY MẶT VỀ HƯỚNG NAM (-Z) ĐÓN KHÁCH CHIÊM BÁI
  // =========================================================================
  const statueBaseX = 0;
  const statueBaseZ = 3.5;
  const poolRadius = 4.4;

  // Bờ kè đá non bộ bao quanh hồ tròn
  const poolSegments = 24;
  for (let i = 0; i < poolSegments; i++) {
    const angle = (i / poolSegments) * Math.PI * 2;
    const rockW = 1.35 + (i % 3) * 0.25;
    const rockH = 0.55 + (i % 2) * 0.2;
    const rockGeo = new THREE.DodecahedronGeometry(rockW * 0.5, 1);
    disposables.push(rockGeo);
    const rock = new THREE.Mesh(rockGeo, matRockery);
    rock.position.set(
      statueBaseX + Math.cos(angle) * (poolRadius + 0.35),
      FLOOR_Y + rockH * 0.45,
      statueBaseZ + Math.sin(angle) * (poolRadius + 0.35)
    );
    rock.scale.set(1.1, 0.7, 0.9);
    rock.rotation.set((i * 1.3) % 1, (i * 0.7) % 2, (i * 2.1) % 1);
    shrineGroup.add(rock);
  }

  // Mặt nước hồ sen trong suốt
  const poolWaterGeo = new THREE.CylinderGeometry(poolRadius, poolRadius, 0.18, 32);
  disposables.push(poolWaterGeo);
  const poolWater = new THREE.Mesh(poolWaterGeo, matWaterSurface);
  poolWater.position.set(statueBaseX, FLOOR_Y + 0.09, statueBaseZ);
  shrineGroup.add(poolWater);

  // Lá sen và hoa sen hồng nở trên mặt hồ
  for (let l = 0; l < 18; l++) {
    const lAngle = (l / 18) * Math.PI * 2 + 0.15;
    const lDist = 2.6 + (l % 4) * 0.42;
    const lx = statueBaseX + Math.cos(lAngle) * lDist;
    const lz = statueBaseZ + Math.sin(lAngle) * lDist;

    const leafGeo = new THREE.CircleGeometry(0.38 + (l % 3) * 0.08, 12);
    disposables.push(leafGeo);
    const leaf = new THREE.Mesh(leafGeo, matLotusPad);
    leaf.rotation.x = -Math.PI / 2;
    leaf.position.set(lx, FLOOR_Y + 0.19, lz);
    shrineGroup.add(leaf);

    if (l % 3 === 0) {
      const flowerGroup = new THREE.Group();
      flowerGroup.position.set(lx + 0.12, FLOOR_Y + 0.24, lz + 0.12);
      for (let p = 0; p < 8; p++) {
        const pAng = (p / 8) * Math.PI * 2;
        const petalGeo = new THREE.ConeGeometry(0.08, 0.22, 5);
        disposables.push(petalGeo);
        const petal = new THREE.Mesh(petalGeo, matLotusPedalPink);
        petal.position.set(Math.cos(pAng) * 0.09, 0.08, Math.sin(pAng) * 0.09);
        petal.rotation.x = 0.35 * Math.sin(pAng);
        petal.rotation.z = -0.35 * Math.cos(pAng);
        flowerGroup.add(petal);
      }
      shrineGroup.add(flowerGroup);
    }
  }

  // -------------------------------------------------------------------------
  // 3.1. ĐÀI SEN NGŨ CẤP (5-TIERED LOTUS PEDESTAL: CAO 2.4m TRÊN MẶT SÀN)
  // Cánh sen chạm trổ sống gân nổi và uốn lượn mềm mại
  // -------------------------------------------------------------------------
  const lotusBaseRadius = 2.45;
  const lotusTiers = 5;

  for (let t = 0; t < lotusTiers; t++) {
    const tierFrac = t / (lotusTiers - 1);
    const tierR = lotusBaseRadius * (1.0 - tierFrac * 0.26);
    const tierY = FLOOR_Y + t * 0.46 + 0.23;

    // Bệ đá tròn của từng tầng
    const plinthGeo = new THREE.CylinderGeometry(tierR * 0.95, tierR, 0.46, 32);
    disposables.push(plinthGeo);
    const plinth = new THREE.Mesh(plinthGeo, matJadePolished);
    plinth.position.set(statueBaseX, tierY, statueBaseZ);
    plinth.receiveShadow = true;
    shrineGroup.add(plinth);

    // Cánh sen đắp nổi tinh xảo bao quanh mép mỗi tầng (20 cánh)
    const petalCount = 20;
    for (let p = 0; p < petalCount; p++) {
      const pAngle = (p / petalCount) * Math.PI * 2 + (t % 2 === 0 ? 0 : Math.PI / petalCount);
      const petalGeo = new THREE.ConeGeometry(tierR * 0.15, 0.54, 5);
      disposables.push(petalGeo);
      const petal = new THREE.Mesh(petalGeo, t >= lotusTiers - 2 ? matLotusPedalPink : matLotusPedalWhite);
      const px = statueBaseX + Math.cos(pAngle) * (tierR + 0.05);
      const pz = statueBaseZ + Math.sin(pAngle) * (tierR + 0.05);
      petal.position.set(px, tierY + 0.08, pz);
      petal.rotation.y = -pAngle;
      petal.rotation.x = -0.44; // Cánh sen nở hé
      shrineGroup.add(petal);

      // Sống gân giữa cánh sen dát vàng nhẹ
      if (t === lotusTiers - 1) {
        const ridgeGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.45, 4);
        disposables.push(ridgeGeo);
        const ridge = new THREE.Mesh(ridgeGeo, matGoldCrown);
        ridge.position.set(px, tierY + 0.1, pz);
        ridge.rotation.y = -pAngle;
        ridge.rotation.x = -0.44;
        shrineGroup.add(ridge);
      }
    }
  }

  // Bệ sen nở tầng trên cùng
  const topPadY = FLOOR_Y + lotusTiers * 0.46; // ~3.75m
  const topPadGeo = new THREE.CylinderGeometry(1.72, 1.82, 0.32, 36);
  disposables.push(topPadGeo);
  const topPad = new THREE.Mesh(topPadGeo, matLotusPedalWhite);
  topPad.position.set(statueBaseX, topPadY, statueBaseZ);
  shrineGroup.add(topPad);

  // Mây cát tường bao quanh chân tượng ngự
  for (let c = 0; c < 10; c++) {
    const cAng = (c / 10) * Math.PI * 2;
    const cloudGeo = new THREE.SphereGeometry(0.55 + (c % 2) * 0.18, 12, 10);
    disposables.push(cloudGeo);
    const cloud = new THREE.Mesh(cloudGeo, matJadePolished);
    cloud.position.set(statueBaseX + Math.cos(cAng) * 2.2, topPadY - 0.12, statueBaseZ + Math.sin(cAng) * 2.2);
    cloud.scale.set(1.4, 0.65, 1.1);
    shrineGroup.add(cloud);
  }

  // =========================================================================
  // 4. TÔN TƯỢNG QUÁN THẾ ÂM BỒ TÁT BẠCH NGỌC (QUAY MẶT VỀ HƯỚNG NAM: -Z)
  // Tổng chiều cao: 9.4m (Đỉnh miện đạt 3.75 + 9.4 = 13.15m)
  // Điêu khắc sắc nét: Gương mặt từ bi, mũ miện A Di Đà, dải lụa thiên y, anh lạc
  // =========================================================================
  const statueGroup = new THREE.Group();
  statueGroup.position.set(statueBaseX, topPadY + 0.16, statueBaseZ);
  // QUAN TRỌNG: Xoay toàn bộ tượng 180 độ (Math.PI) để mặt, tay, bình và nước quay về Hướng Nam (-Z)
  statueGroup.rotation.y = Math.PI;

  // 4.1. Bàn chân ngọc ngự đài sen
  for (const sx of [-0.28, 0.28]) {
    const footGeo = new THREE.BoxGeometry(0.32, 0.2, 0.55);
    disposables.push(footGeo);
    const foot = new THREE.Mesh(footGeo, matWhiteJade);
    foot.position.set(sx, 0.1, 0.12);
    statueGroup.add(foot);
  }

  // 4.2. Thân tượng hạ phần & Tà áo Cà-sa Bạch Ngọc tha thướt (Robe skirt)
  const skirtGeo = new THREE.CylinderGeometry(1.08, 1.58, 4.0, 32);
  disposables.push(skirtGeo);
  const skirt = new THREE.Mesh(skirtGeo, matWhiteJade);
  skirt.position.set(0, 2.0, 0);
  skirt.receiveShadow = true;
  skirt.castShadow = true;
  statueGroup.add(skirt);

  // Nếp gấp tà áo rủ sóng lượn (12 nếp áo mặt trước và hai bên)
  for (let f = 0; f < 12; f++) {
    const fAngle = (f / 12) * Math.PI - Math.PI / 2;
    const foldGeo = new THREE.CylinderGeometry(0.07, 0.15, 3.8, 8);
    disposables.push(foldGeo);
    const fold = new THREE.Mesh(foldGeo, matWhiteJade);
    fold.position.set(Math.cos(fAngle) * 1.38, 1.9, Math.sin(fAngle) * 1.38 * 0.75);
    fold.scale.set(0.65, 1.0, 1.4);
    statueGroup.add(fold);
  }

  // Dải lụa thắt lưng ngọc (Waist Sash & Double Ribbon Tassels)
  const sashGeo = new THREE.TorusGeometry(1.12, 0.14, 12, 32);
  disposables.push(sashGeo);
  const sash = new THREE.Mesh(sashGeo, matJadePolished);
  sash.position.set(0, 4.0, 0);
  sash.rotation.x = Math.PI / 2;
  statueGroup.add(sash);

  // Nơ thắt bướm và hai dải ruy-băng buông rủ
  const bowKnotGeo = new THREE.SphereGeometry(0.24, 10, 8);
  disposables.push(bowKnotGeo);
  const bowKnot = new THREE.Mesh(bowKnotGeo, matGoldCrown);
  bowKnot.position.set(0, 4.0, 1.15);
  bowKnot.scale.set(1.4, 0.8, 0.8);
  statueGroup.add(bowKnot);

  for (const rx of [-0.22, 0.22]) {
    const tasselCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(rx, 4.0, 1.15),
      new THREE.Vector3(rx * 1.6, 2.8, 1.25),
      new THREE.Vector3(rx * 1.2, 1.5, 1.35),
    ]);
    const tasselGeo = new THREE.TubeGeometry(tasselCurve, 16, 0.05, 6, false);
    disposables.push(tasselGeo);
    const tassel = new THREE.Mesh(tasselGeo, matWhiteJade);
    statueGroup.add(tassel);
  }

  // 4.3. Thân trên & Chuỗi Ngọc Anh Lạc Dát Vàng (Torso & Pectoral Necklace)
  const torsoGeo = new THREE.CylinderGeometry(0.88, 1.05, 2.3, 28);
  disposables.push(torsoGeo);
  const torso = new THREE.Mesh(torsoGeo, matWhiteJade);
  torso.position.set(0, 5.15, 0);
  torso.castShadow = true;
  statueGroup.add(torso);

  // Chuỗi ngọc Anh Lạc 3 tầng trước ngực
  for (let n = 0; n < 3; n++) {
    const nR = 0.52 + n * 0.14;
    const nGeo = new THREE.TorusGeometry(nR, 0.045, 8, 24, Math.PI * 0.9);
    disposables.push(nGeo);
    const neckRing = new THREE.Mesh(nGeo, matGoldCrown);
    neckRing.position.set(0, 5.75 - n * 0.26, 0.52 + n * 0.06);
    neckRing.rotation.x = Math.PI * 0.38;
    statueGroup.add(neckRing);
  }

  // Hoa sen ngọc bội tâm điểm trước ngực
  const chestPendantGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.05, 8);
  disposables.push(chestPendantGeo);
  const chestPendant = new THREE.Mesh(chestPendantGeo, matGoldCrown);
  chestPendant.position.set(0, 5.25, 0.72);
  chestPendant.rotation.x = Math.PI * 0.38;
  statueGroup.add(chestPendant);

  // Áo choàng rủ hai bên vai mềm mại
  for (const [side, sx] of [[-1, -1.18], [1, 1.18]] as const) {
    const capeGeo = new THREE.CylinderGeometry(0.36, 0.68, 4.4, 14);
    disposables.push(capeGeo);
    const cape = new THREE.Mesh(capeGeo, matWhiteJade);
    cape.position.set(sx, 4.0, 0);
    cape.rotation.z = -side * 0.12;
    statueGroup.add(cape);
  }

  // 4.4. Cổ và Khuôn Mặt Quán Thế Âm Từ Bi Sắc Nét
  const neckGeo = new THREE.CylinderGeometry(0.40, 0.46, 0.6, 18);
  disposables.push(neckGeo);
  const neck = new THREE.Mesh(neckGeo, matWhiteJade);
  neck.position.set(0, 6.45, 0);
  statueGroup.add(neck);

  const headGeo = new THREE.SphereGeometry(0.72, 28, 24);
  disposables.push(headGeo);
  const head = new THREE.Mesh(headGeo, matWhiteJade);
  head.position.set(0, 7.25, 0);
  head.scale.set(0.92, 1.18, 0.96);
  statueGroup.add(head);

  // -------------------------------------------------------------------------
  // ĐIÊU KHẮC CHI TIẾT GƯƠNG MẶT ĐỨC QUÁN ÂM (MẮT THIỀN, CHÂN MÀY, BẠCH HÀO, MÔI)
  // -------------------------------------------------------------------------
  // Mắt thiền định khép hờ từ bi (Thiền nhãn - Meditative Slit Eyes)
  for (const ex of [-0.26, 0.26]) {
    const eyeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(ex - 0.12, 7.28, 0.68),
      new THREE.Vector3(ex, 7.31, 0.71),
      new THREE.Vector3(ex + 0.12, 7.27, 0.68),
    ]);
    const eyeGeo = new THREE.TubeGeometry(eyeCurve, 12, 0.018, 6, false);
    disposables.push(eyeGeo);
    const eyeMesh = new THREE.Mesh(eyeGeo, matFacialLine);
    statueGroup.add(eyeMesh);

    // Chân mày thanh tú hình cánh cung (Graceful Arched Eyebrows)
    const browCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(ex - 0.14, 7.42, 0.67),
      new THREE.Vector3(ex, 7.49, 0.70),
      new THREE.Vector3(ex + 0.12, 7.43, 0.66),
    ]);
    const browGeo = new THREE.TubeGeometry(browCurve, 12, 0.016, 6, false);
    disposables.push(browGeo);
    const browMesh = new THREE.Mesh(browGeo, matFacialLine);
    statueGroup.add(browMesh);

    // Dái tai chảy dài cao quý (Elongated Monastic Earlobes)
    const earGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.58, 8);
    disposables.push(earGeo);
    const earMesh = new THREE.Mesh(earGeo, matWhiteJade);
    earMesh.position.set(ex > 0 ? 0.68 : -0.68, 7.15, -0.05);
    earMesh.rotation.z = ex > 0 ? -0.1 : 0.1;
    statueGroup.add(earMesh);

    // Khuyên tai ngọc tròn
    const earringGeo = new THREE.SphereGeometry(0.065, 8, 8);
    disposables.push(earringGeo);
    const earring = new THREE.Mesh(earringGeo, matGoldCrown);
    earring.position.set(ex > 0 ? 0.68 : -0.68, 6.82, -0.05);
    statueGroup.add(earring);
  }

  // Tướng Bạch Hào (Urna Pearl - Hạt ngọc trắng phát sáng giữa trán)
  const urnaGeo = new THREE.SphereGeometry(0.055, 12, 12);
  disposables.push(urnaGeo);
  const urna = new THREE.Mesh(urnaGeo, matUrnaPearl);
  urna.position.set(0, 7.46, 0.72);
  statueGroup.add(urna);

  // Nét môi mỉm cười từ ái (Compassionate Lips)
  const lipCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.13, 7.04, 0.68),
    new THREE.Vector3(0, 7.03, 0.72),
    new THREE.Vector3(0.13, 7.04, 0.68),
  ]);
  const lipGeo = new THREE.TubeGeometry(lipCurve, 12, 0.024, 6, false);
  disposables.push(lipGeo);
  const lipMesh = new THREE.Mesh(lipGeo, matLips);
  statueGroup.add(lipMesh);

  // -------------------------------------------------------------------------
  // 4.5. MŨ MIỆN PHẬT A DI ĐÀ DÁT VÀNG & KHĂN CHOÀNG PHIÊU BỒNG (AMITABHA CROWN)
  // -------------------------------------------------------------------------
  // Tóc búi cao Ushnisha
  const bunGeo = new THREE.SphereGeometry(0.44, 18, 16);
  disposables.push(bunGeo);
  const bun = new THREE.Mesh(bunGeo, matWhiteJade);
  bun.position.set(0, 8.15, -0.05);
  statueGroup.add(bun);

  // Vương Miện Ngũ Phụng dát vàng chạm trổ
  const crownGeo = new THREE.CylinderGeometry(0.66, 0.76, 0.85, 28, 1, true);
  disposables.push(crownGeo);
  const crown = new THREE.Mesh(crownGeo, matGoldCrown);
  crown.position.set(0, 8.0, 0.05);
  statueGroup.add(crown);

  // 5 Cánh lá vương miện đắp nổi
  for (let c = 0; c < 5; c++) {
    const cAng = (c - 2) * 0.32;
    const leafGeo = new THREE.ConeGeometry(0.14, 0.52, 5);
    disposables.push(leafGeo);
    const leaf = new THREE.Mesh(leafGeo, matGoldCrown);
    leaf.position.set(Math.sin(cAng) * 0.72, 8.45 + (2 - Math.abs(c - 2)) * 0.08, Math.cos(cAng) * 0.72);
    leaf.rotation.x = -0.15;
    leaf.rotation.y = cAng;
    statueGroup.add(leaf);
  }

  // Tôn tượng Phật A Di Đà ngồi kiết già trên đỉnh vương miện
  const buddhaGroup = new THREE.Group();
  buddhaGroup.position.set(0, 8.35, 0.75);

  const bHeadGeo = new THREE.SphereGeometry(0.12, 10, 10);
  disposables.push(bHeadGeo);
  const bHead = new THREE.Mesh(bHeadGeo, matGoldCrown);
  bHead.position.y = 0.38;
  buddhaGroup.add(bHead);

  const bBodyGeo = new THREE.ConeGeometry(0.24, 0.42, 8);
  disposables.push(bBodyGeo);
  const bBody = new THREE.Mesh(bBodyGeo, matGoldCrown);
  bBody.position.y = 0.16;
  buddhaGroup.add(bBody);

  const bLotusGeo = new THREE.CylinderGeometry(0.26, 0.28, 0.08, 12);
  disposables.push(bLotusGeo);
  const bLotus = new THREE.Mesh(bLotusGeo, matGoldCrown);
  bLotus.position.y = -0.04;
  buddhaGroup.add(bLotus);

  statueGroup.add(buddhaGroup);

  // Khăn trùm đầu ngọc buông xõa rủ vai (Celestial Veil)
  const veilGeo = new THREE.CylinderGeometry(0.76, 1.35, 3.5, 24, 1, true, Math.PI * 0.35, Math.PI * 1.3);
  disposables.push(veilGeo);
  const veil = new THREE.Mesh(veilGeo, matWhiteJade);
  veil.position.set(0, 7.15, -0.22);
  veil.rotation.y = Math.PI;
  statueGroup.add(veil);

  // -------------------------------------------------------------------------
  // 4.6. CÁNH TAY PHẢI: BẮT ẤN CÁT TƯỜNG CẦM NHÀNH DƯƠNG LIỄU (WILLOW BRANCH)
  // -------------------------------------------------------------------------
  const armRGeo = new THREE.CylinderGeometry(0.19, 0.25, 1.45, 12);
  disposables.push(armRGeo);
  const armR = new THREE.Mesh(armRGeo, matWhiteJade);
  armR.position.set(0.82, 5.5, 0.34);
  armR.rotation.set(-0.65, 0.3, -0.55);
  statueGroup.add(armR);

  const forearmRGeo = new THREE.CylinderGeometry(0.16, 0.19, 1.25, 12);
  disposables.push(forearmRGeo);
  const forearmR = new THREE.Mesh(forearmRGeo, matWhiteJade);
  forearmR.position.set(0.58, 6.05, 0.68);
  forearmR.rotation.set(-1.35, 0.2, -0.2);
  statueGroup.add(forearmR);

  const handRGeo = new THREE.SphereGeometry(0.17, 12, 10);
  disposables.push(handRGeo);
  const handR = new THREE.Mesh(handRGeo, matWhiteJade);
  handR.position.set(0.50, 6.58, 0.82);
  statueGroup.add(handR);

  // Nhành dương liễu xanh biếc uốn lượn
  const willowGroup = new THREE.Group();
  willowGroup.position.set(0.50, 6.58, 0.82);
  const willowStemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.18, 0.50, 0.15),
    new THREE.Vector3(0.42, 0.95, 0.08),
    new THREE.Vector3(0.65, 1.25, -0.15),
    new THREE.Vector3(0.85, 1.45, -0.35),
  ]);
  const willowStemGeo = new THREE.TubeGeometry(willowStemCurve, 20, 0.038, 8, false);
  disposables.push(willowStemGeo);
  const willowStem = new THREE.Mesh(willowStemGeo, matWillowGreen);
  willowGroup.add(willowStem);

  for (let w = 1; w <= 8; w++) {
    const t = w / 9;
    const pt = willowStemCurve.getPoint(t);
    const wLeafGeo = new THREE.ConeGeometry(0.048, 0.32, 5);
    disposables.push(wLeafGeo);
    const wLeaf = new THREE.Mesh(wLeafGeo, matWillowGreen);
    wLeaf.position.copy(pt);
    wLeaf.rotation.x = 0.55 + (w % 2) * 0.3;
    wLeaf.rotation.z = -0.42 - (w % 2) * 0.2;
    willowGroup.add(wLeaf);
  }
  statueGroup.add(willowGroup);

  // -------------------------------------------------------------------------
  // 4.7. CÁNH TAY TRÁI & TỊNH BÌNH CAM LỘ RÓT NƯỚC (CAM LỘ VASE)
  // -------------------------------------------------------------------------
  const armLGeo = new THREE.CylinderGeometry(0.19, 0.25, 1.55, 12);
  disposables.push(armLGeo);
  const armL = new THREE.Mesh(armLGeo, matWhiteJade);
  armL.position.set(-0.78, 5.45, 0.38);
  armL.rotation.set(-0.75, -0.2, 0.45);
  statueGroup.add(armL);

  const forearmLGeo = new THREE.CylinderGeometry(0.16, 0.19, 1.35, 12);
  disposables.push(forearmLGeo);
  const forearmL = new THREE.Mesh(forearmLGeo, matWhiteJade);
  forearmL.position.set(-0.36, 5.1, 0.90);
  forearmL.rotation.set(-1.15, -0.4, 0.65);
  statueGroup.add(forearmL);

  // Bình Cam Lộ (Tịnh bình ngọc)
  const vaseGroup = new THREE.Group();
  vaseGroup.position.set(-0.08, 4.98, 1.22);
  vaseGroup.rotation.set(0.68, 0, 0.15); // Nghiêng miệng bình chúc xuống phía trước

  const vaseBodyGeo = new THREE.SphereGeometry(0.30, 20, 16);
  disposables.push(vaseBodyGeo);
  const vaseBody = new THREE.Mesh(vaseBodyGeo, matJadePolished);
  vaseBody.scale.set(0.88, 1.45, 0.88);
  vaseGroup.add(vaseBody);

  const vaseNeckGeo = new THREE.CylinderGeometry(0.095, 0.17, 0.48, 16);
  disposables.push(vaseNeckGeo);
  const vaseNeck = new THREE.Mesh(vaseNeckGeo, matJadePolished);
  vaseNeck.position.set(0, 0.45, 0);
  vaseGroup.add(vaseNeck);

  const vaseRimGeo = new THREE.TorusGeometry(0.12, 0.035, 8, 20);
  disposables.push(vaseRimGeo);
  const vaseRim = new THREE.Mesh(vaseRimGeo, matGoldCrown);
  vaseRim.position.set(0, 0.68, 0);
  vaseRim.rotation.x = Math.PI / 2;
  vaseGroup.add(vaseRim);

  statueGroup.add(vaseGroup);

  // -------------------------------------------------------------------------
  // 4.8. VẦNG HÀO QUANG KÉP CHIẾU DIỆU (DOUBLE MANDALA HALO PHÍA SAU LƯNG)
  // Tia sáng mặt trời, mây cát tường cuộn sóng, ánh sáng vàng kim ấm áp
  // -------------------------------------------------------------------------
  const haloGroup = new THREE.Group();
  // Ở đây Z = -0.68 sau lưng tượng (trong hệ quy chiếu của statueGroup)
  haloGroup.position.set(0, 6.2, -0.68);

  // Vòng ngoài lớn (đường kính 6.4m)
  const haloOuterGeo = new THREE.TorusGeometry(3.2, 0.16, 16, 48);
  disposables.push(haloOuterGeo);
  const haloOuter = new THREE.Mesh(haloOuterGeo, matGoldHalo);
  haloGroup.add(haloOuter);

  // Vòng trong quanh đầu (đường kính 3.8m)
  const haloInnerGeo = new THREE.TorusGeometry(1.9, 0.12, 14, 36);
  disposables.push(haloInnerGeo);
  const haloInner = new THREE.Mesh(haloInnerGeo, matGoldHalo);
  haloGroup.add(haloInner);

  // 24 Tia hào quang mặt trời tỏa sáng (Sunburst Rays)
  for (let r = 0; r < 24; r++) {
    const rAng = (r / 24) * Math.PI * 2;
    const rayGeo = new THREE.ConeGeometry(0.06, 1.25, 4);
    disposables.push(rayGeo);
    const ray = new THREE.Mesh(rayGeo, matGoldHalo);
    ray.position.set(Math.cos(rAng) * 2.55, Math.sin(rAng) * 2.55, 0);
    ray.rotation.z = rAng - Math.PI / 2;
    haloGroup.add(ray);
  }

  // Đĩa hào quang phát quang mềm
  const haloDiscGeo = new THREE.CircleGeometry(3.15, 36);
  disposables.push(haloDiscGeo);
  const matHaloDisc = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfde047,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.38,
    side: THREE.DoubleSide,
  });
  disposables.push(matHaloDisc);
  const haloDisc = new THREE.Mesh(haloDiscGeo, matHaloDisc);
  haloGroup.add(haloDisc);

  // Mây cuộn phiêu bồng hai bên vòng hào quang
  for (let mc = 0; mc < 8; mc++) {
    const side = mc % 2 === 0 ? 1 : -1;
    const cloudHGeo = new THREE.SphereGeometry(0.48 + (mc % 3) * 0.16, 10, 8);
    disposables.push(cloudHGeo);
    const cloudH = new THREE.Mesh(cloudHGeo, matJadePolished);
    cloudH.position.set(side * (2.9 + (mc % 2) * 0.45), (mc - 3.5) * 0.95, -0.05);
    cloudH.scale.set(1.45, 0.7, 1.0);
    haloGroup.add(cloudH);
  }

  // Điểm sáng ấm tỏa ra từ vòng hào quang
  const haloLight = new THREE.PointLight(0xfef08a, 2.0, 24.0, 1.4);
  haloLight.position.set(0, 6.4, 0.6);
  statueGroup.add(haloLight);
  if (nightLightsRef) {
    nightLightsRef.current.push(haloLight);
  }

  statueGroup.add(haloGroup);
  shrineGroup.add(statueGroup);

  // =========================================================================
  // 5. HOẠT ẢNH DÒNG NƯỚC CAM LỘ RÓT XUỐNG HỒ SEN TRƯỚC TƯỢNG (CAM LỘ CASCADE)
  // Tọa độ miệng bình trong shrineGroup:
  // Vì statueGroup tại (0, topPadY + 0.16, statueBaseZ = 3.5) và quay Math.PI:
  // Miệng bình: X = -(-0.08) = 0.08, Z = 3.5 - 1.22 = 2.28, Y = topPadY + 0.16 + 4.98 + 0.6 = ~9.5m
  // Mặt nước hồ sen: Y = FLOOR_Y + 0.18 = 1.63m
  // =========================================================================
  const pourStartX = 0.08;
  const pourStartY = topPadY + 0.16 + 4.98 + 0.6; // ~9.5m
  const pourStartZ = statueBaseZ - 1.22; // ~2.28m

  const pourTargetX = 0;
  const pourTargetY = FLOOR_Y + 0.20; // Chạm mặt hồ sen
  const pourTargetZ = statueBaseZ - 2.15; // Rơi xuống lòng hồ phía trước

  // Dải băng nước Cam Lộ uốn lượn trong suốt
  const streamCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(pourStartX, pourStartY, pourStartZ),
    new THREE.Vector3(pourStartX - 0.04, pourStartY - 2.2, pourStartZ - 0.15),
    new THREE.Vector3(pourStartX + 0.02, pourStartY - 4.8, pourStartZ - 0.45),
    new THREE.Vector3(pourTargetX, pourTargetY, pourTargetZ),
  ]);
  const streamGeo = new THREE.TubeGeometry(streamCurve, 32, 0.09, 8, false);
  disposables.push(streamGeo);
  const waterStreamMesh = new THREE.Mesh(streamGeo, matWaterStream);
  shrineGroup.add(waterStreamMesh);

  // 32 Hạt nước Cam Lộ rơi theo chu kỳ (Zero-Allocation)
  const WATER_DROP_COUNT = 32;
  const waterDropPos = new Float32Array(WATER_DROP_COUNT * 3);
  const waterDropVel = new Float32Array(WATER_DROP_COUNT);
  const waterDropProg = new Float32Array(WATER_DROP_COUNT);

  for (let d = 0; d < WATER_DROP_COUNT; d++) {
    waterDropProg[d] = Math.random();
    waterDropVel[d] = 0.35 + Math.random() * 0.3;
    const pt = streamCurve.getPoint(waterDropProg[d]);
    waterDropPos[d * 3] = pt.x + (Math.random() - 0.5) * 0.08;
    waterDropPos[d * 3 + 1] = pt.y;
    waterDropPos[d * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.08;
  }

  const waterParticlesGeo = new THREE.BufferGeometry();
  waterParticlesGeo.setAttribute('position', new THREE.BufferAttribute(waterDropPos, 3));
  disposables.push(waterParticlesGeo);

  const matWaterParticle = new THREE.PointsMaterial({
    color: 0xe0f2fe,
    size: 0.18,
    transparent: true,
    opacity: 0.88,
  });
  disposables.push(matWaterParticle);

  const waterParticles = new THREE.Points(waterParticlesGeo, matWaterParticle);
  shrineGroup.add(waterParticles);

  // =========================================================================
  // 6. KHU VỰC HÀNH LỄ CHIÊM BÁI ĐẶT NGAY TRƯỚC MẶT TƯỢNG (FRONT WORSHIP PLAZA)
  // Bàn Hương Án, Đại Lư Hương Tam Bảo và Hàng Bồ Đoàn Hoa Sen
  // Tọa độ Z: Altar tại Z = -1.2, Lư hương tại Z = -2.8, Bồ đoàn tại Z = -5.0
  // =========================================================================
  const altarRelZ = -1.2;

  // 6.1. Bàn hương án cẩm thạch trắng
  const altarTableGeo = new THREE.BoxGeometry(4.4, 0.95, 1.4);
  disposables.push(altarTableGeo);
  const altarTable = new THREE.Mesh(altarTableGeo, matMarblePlaza);
  altarTable.position.set(0, FLOOR_Y + 0.95 * 0.5, altarRelZ);
  altarTable.receiveShadow = true;
  altarTable.castShadow = true;
  shrineGroup.add(altarTable);

  // Khăn trải bàn thờ gấm thêu hoa sen vàng
  const altarClothGeo = new THREE.BoxGeometry(4.44, 0.04, 1.44);
  disposables.push(altarClothGeo);
  const altarCloth = new THREE.Mesh(altarClothGeo, matCushion);
  altarCloth.position.set(0, FLOOR_Y + 0.95 + 0.02, altarRelZ);
  shrineGroup.add(altarCloth);

  // Bình hoa sen đồng hai bên bàn thờ
  for (const sx of [-1.6, 1.6]) {
    const vaseG = new THREE.CylinderGeometry(0.18, 0.12, 0.65, 12);
    disposables.push(vaseG);
    const vaseM = new THREE.Mesh(vaseG, matBronzeBurner);
    vaseM.position.set(sx, FLOOR_Y + 0.95 + 0.35, altarRelZ);
    shrineGroup.add(vaseM);

    const bLotusG = new THREE.ConeGeometry(0.12, 0.32, 6);
    disposables.push(bLotusG);
    const bLotus = new THREE.Mesh(bLotusG, matLotusPedalPink);
    bLotus.position.set(sx, FLOOR_Y + 0.95 + 0.75, altarRelZ);
    shrineGroup.add(bLotus);
  }

  // Đĩa ngũ quả thanh tịnh giữa bàn thờ
  const fruitPlateG = new THREE.CylinderGeometry(0.40, 0.28, 0.08, 16);
  disposables.push(fruitPlateG);
  const fruitPlate = new THREE.Mesh(fruitPlateG, matGoldCrown);
  fruitPlate.position.set(0, FLOOR_Y + 0.95 + 0.06, altarRelZ);
  shrineGroup.add(fruitPlate);

  // 6.2. Đại Lư Hương Đồng Tam Bảo (Tripod Bronze Incense Burner)
  const burnerRelZ = -2.8;
  const burnerGroup = new THREE.Group();
  burnerGroup.position.set(0, FLOOR_Y, burnerRelZ);

  const burnerBodyGeo = new THREE.SphereGeometry(0.68, 18, 14);
  disposables.push(burnerBodyGeo);
  const burnerBody = new THREE.Mesh(burnerBodyGeo, matBronzeBurner);
  burnerBody.position.set(0, 0.88, 0);
  burnerBody.scale.set(1.18, 0.86, 1.18);
  burnerGroup.add(burnerBody);

  const burnerRimGeo = new THREE.TorusGeometry(0.72, 0.09, 8, 24);
  disposables.push(burnerRimGeo);
  const burnerRim = new THREE.Mesh(burnerRimGeo, matBronzeBurner);
  burnerRim.position.set(0, 1.30, 0);
  burnerRim.rotation.x = Math.PI / 2;
  burnerGroup.add(burnerRim);

  for (let leg = 0; leg < 3; leg++) {
    const lAng = (leg / 3) * Math.PI * 2 + Math.PI / 6;
    const legGeo = new THREE.CylinderGeometry(0.09, 0.13, 0.58, 8);
    disposables.push(legGeo);
    const legMesh = new THREE.Mesh(legGeo, matBronzeBurner);
    legMesh.position.set(Math.cos(lAng) * 0.48, 0.29, Math.sin(lAng) * 0.48);
    legMesh.rotation.z = -Math.cos(lAng) * 0.25;
    legMesh.rotation.x = Math.sin(lAng) * 0.25;
    burnerGroup.add(legMesh);
  }

  for (const qx of [-0.82, 0.82]) {
    const handleGeo = new THREE.TorusGeometry(0.26, 0.065, 6, 14);
    disposables.push(handleGeo);
    const handle = new THREE.Mesh(handleGeo, matBronzeBurner);
    handle.position.set(qx, 0.98, 0);
    handle.rotation.y = Math.PI / 2;
    burnerGroup.add(handle);
  }

  // 3 Nén nhang trầm cắm trong lư
  for (let ic = 0; ic < 3; ic++) {
    const stickGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.78, 4);
    disposables.push(stickGeo);
    const matIncense = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 });
    disposables.push(matIncense);
    const stick = new THREE.Mesh(stickGeo, matIncense);
    stick.position.set((ic - 1) * 0.15, 1.40, 0);
    burnerGroup.add(stick);

    const tipGeo = new THREE.SphereGeometry(0.025, 4, 4);
    disposables.push(tipGeo);
    const matTip = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    disposables.push(matTip);
    const tip = new THREE.Mesh(tipGeo, matTip);
    tip.position.set((ic - 1) * 0.15, 1.78, 0);
    burnerGroup.add(tip);
  }

  shrineGroup.add(burnerGroup);

  // 6.3. Khói trầm bốc lên từ lư hương (24 hạt Zero-Allocation)
  const SMOKE_COUNT = 24;
  const smokePos = new Float32Array(SMOKE_COUNT * 3);
  const smokeProg = new Float32Array(SMOKE_COUNT);

  for (let s = 0; s < SMOKE_COUNT; s++) {
    smokeProg[s] = Math.random();
    smokePos[s * 3] = (Math.random() - 0.5) * 0.25;
    smokePos[s * 3 + 1] = FLOOR_Y + 1.78 + smokeProg[s] * 2.8;
    smokePos[s * 3 + 2] = burnerRelZ + (Math.random() - 0.5) * 0.25;
  }

  const smokeGeo = new THREE.BufferGeometry();
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
  disposables.push(smokeGeo);

  const matSmoke = new THREE.PointsMaterial({
    color: 0xd1d5db,
    size: 0.30,
    transparent: true,
    opacity: 0.45,
  });
  disposables.push(matSmoke);

  const incenseSmoke = new THREE.Points(smokeGeo, matSmoke);
  shrineGroup.add(incenseSmoke);

  // 6.4. Hàng Bồ Đoàn Hoa Sen Quỳ Lạy Trực Diện Trước Tượng
  // 3 Bồ đoàn hoa sen tại Z = -5.0 (Người chiêm bái quay mặt về hướng Bắc nhìn thẳng vào tượng)
  const cushionRelZ = -5.0;
  const cushionPositionsWorld: THREE.Vector3[] = [];

  [-1.6, 0, 1.6].forEach((cx) => {
    const cushionGroup = new THREE.Group();
    cushionGroup.position.set(cx, FLOOR_Y, cushionRelZ);

    const padGeo = new THREE.CylinderGeometry(0.58, 0.64, 0.18, 20);
    disposables.push(padGeo);
    const padMesh = new THREE.Mesh(padGeo, matCushion);
    padMesh.position.y = 0.09;
    cushionGroup.add(padMesh);

    for (let cp = 0; cp < 8; cp++) {
      const cpAng = (cp / 8) * Math.PI * 2;
      const cPetalGeo = new THREE.SphereGeometry(0.13, 6, 6);
      disposables.push(cPetalGeo);
      const cPetal = new THREE.Mesh(cPetalGeo, matLotusPedalPink);
      cPetal.position.set(Math.cos(cpAng) * 0.58, 0.09, Math.sin(cpAng) * 0.58);
      cPetal.scale.set(1.0, 0.5, 1.0);
      cushionGroup.add(cPetal);
    }

    shrineGroup.add(cushionGroup);
    cushionPositionsWorld.push(new THREE.Vector3(33.0 + cx, FLOOR_Y, 42.0 + cushionRelZ));
  });

  // =========================================================================
  // 7. ĐÈN ĐÁ & BÀN PHÁT NHANG TRÊN SÀN TÔN CAO
  // =========================================================================
  [[-9.5, -9.5], [9.5, -9.5]].forEach(([lx, lz]) => {
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(lx, FLOOR_Y, lz);

    const lBaseGeo = new THREE.BoxGeometry(0.7, 0.35, 0.7);
    disposables.push(lBaseGeo);
    const lBase = new THREE.Mesh(lBaseGeo, matBalustrade);
    lanternGroup.add(lBase);

    const lPoleGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.2, 8);
    disposables.push(lPoleGeo);
    const lPole = new THREE.Mesh(lPoleGeo, matBalustrade);
    lPole.position.y = 0.75;
    lanternGroup.add(lPole);

    const lHouseGeo = new THREE.BoxGeometry(0.65, 0.55, 0.65);
    disposables.push(lHouseGeo);
    const lHouse = new THREE.Mesh(lHouseGeo, matBalustrade);
    lHouse.position.y = 1.6;
    lanternGroup.add(lHouse);

    const lRoofGeo = new THREE.ConeGeometry(0.6, 0.45, 4);
    disposables.push(lRoofGeo);
    const lRoof = new THREE.Mesh(lRoofGeo, matBalustrade);
    lRoof.position.y = 2.1;
    lRoof.rotation.y = Math.PI / 4;
    lanternGroup.add(lRoof);

    const lanternLight = new THREE.PointLight(0xfef08a, 0.85, 9.0);
    lanternLight.position.set(0, 1.6, 0);
    lanternGroup.add(lanternLight);
    if (nightLightsRef) {
      nightLightsRef.current.push(lanternLight);
    }

    shrineGroup.add(lanternGroup);
  });

  // Bàn phát nhang trầm bên Tây-Bắc sảnh (X = -7.5, Z = -2.5 tương đối => Thế giới: 25.5, 39.5)
  const deskGroup = new THREE.Group();
  deskGroup.position.set(-7.5, FLOOR_Y, -2.5);

  const deskTableGeo = new THREE.BoxGeometry(2.0, 0.85, 0.9);
  disposables.push(deskTableGeo);
  const deskTable = new THREE.Mesh(deskTableGeo, materials.matWoodLim ?? matMarblePlaza);
  deskTable.position.y = 0.85 * 0.5;
  deskTable.receiveShadow = true;
  deskGroup.add(deskTable);

  const incenseVesselGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.42, 12);
  disposables.push(incenseVesselGeo);
  const incenseVessel = new THREE.Mesh(incenseVesselGeo, matBronzeBurner);
  incenseVessel.position.set(-0.55, 0.85 + 0.21, 0);
  deskGroup.add(incenseVessel);

  const incenseBundleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.55, 8);
  disposables.push(incenseBundleGeo);
  const matBundle = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
  disposables.push(matBundle);
  const incenseBundle = new THREE.Mesh(incenseBundleGeo, matBundle);
  incenseBundle.position.set(-0.55, 0.85 + 0.35, 0);
  deskGroup.add(incenseBundle);

  shrineGroup.add(deskGroup);

  // =========================================================================
  // 8. VÒNG LẶP HOẠT ẢNH HOÀN TOÀN ZERO-ALLOCATION (60 FPS)
  // =========================================================================
  let waterAnimTime = 0;

  const update = (delta: number, _stepCount: number) => {
    waterAnimTime += delta;

    // Dòng nước uốn lượn nhẹ
    const streamScale = 1.0 + Math.sin(waterAnimTime * 3.5) * 0.04;
    waterStreamMesh.scale.set(streamScale, 1.0, streamScale);

    // Hạt nước Cam Lộ rơi
    const wPositions = waterParticlesGeo.attributes.position.array as Float32Array;
    for (let d = 0; d < WATER_DROP_COUNT; d++) {
      waterDropProg[d] += delta * waterDropVel[d];
      if (waterDropProg[d] >= 1.0) {
        waterDropProg[d] -= 1.0;
      }
      const pt = streamCurve.getPoint(waterDropProg[d]);
      wPositions[d * 3] = pt.x + Math.sin(waterAnimTime * 6.0 + d) * 0.04;
      wPositions[d * 3 + 1] = pt.y;
      wPositions[d * 3 + 2] = pt.z + Math.cos(waterAnimTime * 6.0 + d) * 0.04;
    }
    waterParticlesGeo.attributes.position.needsUpdate = true;

    // Khói trầm bốc lên từ lư hương
    const sPositions = smokeGeo.attributes.position.array as Float32Array;
    for (let s = 0; s < SMOKE_COUNT; s++) {
      smokeProg[s] += delta * 0.18;
      if (smokeProg[s] >= 1.0) {
        smokeProg[s] -= 1.0;
        sPositions[s * 3] = Math.sin(s * 1.5) * 0.12;
        sPositions[s * 3 + 2] = burnerRelZ + Math.cos(s * 1.5) * 0.12;
      }
      sPositions[s * 3 + 1] = FLOOR_Y + 1.78 + smokeProg[s] * 2.6;
      sPositions[s * 3] += Math.sin(waterAnimTime * 2.0 + s) * 0.003;
      sPositions[s * 3 + 2] += Math.cos(waterAnimTime * 1.8 + s) * 0.003;
    }
    smokeGeo.attributes.position.needsUpdate = true;
  };

  const dispose = () => {
    disposables.forEach((item) => {
      item.dispose();
    });
  };

  return {
    group: shrineGroup,
    waterStreamMesh,
    waterParticles,
    incenseSmoke,
    altarPosition: new THREE.Vector3(33.0, FLOOR_Y, 42.0 + burnerRelZ),
    cushionPositions: cushionPositionsWorld,
    incenseAttendantPos: new THREE.Vector3(33.0 - 7.5, FLOOR_Y, 42.0 - 2.5),
    caretakerPos: new THREE.Vector3(33.0 + 4.2, FLOOR_Y, 42.0 - 2.0),
    haloLight,
    update,
    dispose,
  };
}
