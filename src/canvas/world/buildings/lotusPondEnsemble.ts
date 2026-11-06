import React from 'react';
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface KoiFishData {
  mesh: THREE.Group;
  angle: number;
  speed: number;
  radius: number;
  baseSpeed: number;
  baseRadius: number;
}

/**
 * Tôn tạo và khởi tạo toàn bộ cụm kiến trúc Hồ Sen Bích Ngọc & Chùa Một Cột (Liên Hoa Đài)
 * Vị trí trung tâm scene: X = -26, Z = 36
 */
export function createLotusPondEnsemble(
  matStoneGrey: THREE.Material,
  matLotusPlinth: THREE.Material,
  matGold: THREE.Material,
  nightLightsRef: React.MutableRefObject<THREE.PointLight[]>,
  koiFishListRef: React.MutableRefObject<KoiFishData[]>
): THREE.Group {
  const pondGroup = new THREE.Group();
  pondGroup.position.set(-26, 0, 36);

  // =========================================================================
  // 1. KÈ HỒ ĐÁ XANH CHU VI (4 BỜ KÈ RỖNG) & BỜ THÀNH HOA SEN (28m x 28m)
  // Lòng hồ hoàn toàn thông thoáng, mở cổng thông thủy 4.4m ở bờ Đông (hướng bên sân vào)
  // =========================================================================
  // Bờ kè thành hồ phía Bắc (North Wall: Z = -13.3)
  const pondRimN = new THREE.Mesh(new THREE.BoxGeometry(28.0, 0.8, 1.4), matStoneGrey);
  pondRimN.position.set(0, 0.4, -13.3);
  pondRimN.receiveShadow = true;
  pondGroup.add(pondRimN);

  // Bờ kè thành hồ phía Nam (South Wall: Z = +13.3)
  const pondRimS = new THREE.Mesh(new THREE.BoxGeometry(28.0, 0.8, 1.4), matStoneGrey);
  pondRimS.position.set(0, 0.4, 13.3);
  pondRimS.receiveShadow = true;
  pondGroup.add(pondRimS);

  // Bờ kè thành hồ phía Tây (West Wall: X = -13.3)
  const pondRimW = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 28.0), matStoneGrey);
  pondRimW.position.set(-13.3, 0.4, 0);
  pondRimW.receiveShadow = true;
  pondGroup.add(pondRimW);

  // Bờ kè thành hồ phía Đông (East Wall: X = +13.3, hướng bên sân vào - chừa cổng mở thông thủy 4.4m ở giữa)
  const pondRimE_North = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 11.8), matStoneGrey);
  pondRimE_North.position.set(13.3, 0.4, -8.1);
  pondRimE_North.receiveShadow = true;
  pondGroup.add(pondRimE_North);

  const pondRimE_South = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 11.8), matStoneGrey);
  pondRimE_South.position.set(13.3, 0.4, 8.1);
  pondRimE_South.receiveShadow = true;
  pondGroup.add(pondRimE_South);

  // Gờ đá chạm hoa sen bao quanh các bờ kè
  const rimTrimN = new THREE.Mesh(new THREE.BoxGeometry(28.2, 0.12, 1.4), matLotusPlinth);
  rimTrimN.position.set(0, 0.86, -13.3);
  pondGroup.add(rimTrimN);

  const rimTrimS = new THREE.Mesh(new THREE.BoxGeometry(28.2, 0.12, 1.4), matLotusPlinth);
  rimTrimS.position.set(0, 0.86, 13.3);
  pondGroup.add(rimTrimS);

  const rimTrimW = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 28.2), matLotusPlinth);
  rimTrimW.position.set(-13.3, 0.86, 0);
  pondGroup.add(rimTrimW);

  const rimTrimE_North = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 11.8), matLotusPlinth);
  rimTrimE_North.position.set(13.3, 0.86, -8.1);
  pondGroup.add(rimTrimE_North);

  const rimTrimE_South = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 11.8), matLotusPlinth);
  rimTrimE_South.position.set(13.3, 0.86, 8.1);
  pondGroup.add(rimTrimE_South);

  // Lan can đá chạm mây & búp sen bao bọc chu vi bờ Tây, Bắc, Nam
  // Bờ Tây (X = -13.3)
  for (let pz = -12; pz <= 12; pz += 4) {
    const postW = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.32), matStoneGrey);
    postW.position.set(-13.3, 1.3, pz);
    pondGroup.add(postW);
    const budW = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 6), matLotusPlinth);
    budW.position.set(-13.3, 1.88, pz);
    pondGroup.add(budW);
  }

  // Bờ Bắc (Z = -13.3) & Bờ Nam (Z = 13.3)
  for (let px = -12; px <= 12; px += 4) {
    const postN = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.32), matStoneGrey);
    postN.position.set(px, 1.3, -13.3);
    pondGroup.add(postN);
    const budN = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 6), matLotusPlinth);
    budN.position.set(px, 1.88, -13.3);
    pondGroup.add(budN);

    const postS = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.32), matStoneGrey);
    postS.position.set(px, 1.3, 13.3);
    pondGroup.add(postS);
    const budS = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 6), matLotusPlinth);
    budS.position.set(px, 1.88, 13.3);
    pondGroup.add(budS);
  }

  // Bờ Đông (X = 13.3): chừa lối cổng cầu đá ở giữa (|pz| > 2.5 mới dựng lan can)
  for (let pz = -12; pz <= 12; pz += 4) {
    if (Math.abs(pz) > 2.5) {
      const postE = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.32), matStoneGrey);
      postE.position.set(13.3, 1.3, pz);
      pondGroup.add(postE);
      const budE = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 6), matLotusPlinth);
      budE.position.set(13.3, 1.88, pz);
      pondGroup.add(budE);
    }
  }

  // 2. LÒNG HỒ RÊU PHONG & MẶT NƯỚC XANH NGỌC BÍCH TRONG SUỐT (JADE EMERALD)
  // =========================================================================
  const riverbed = new THREE.Mesh(
    new THREE.PlaneGeometry(25.4, 25.4),
    new THREE.MeshStandardMaterial({ color: 0x0f392b, roughness: 0.92 }) // Lòng hồ rêu sẫm hòa sắc nước
  );
  riverbed.rotateX(-Math.PI / 2);
  riverbed.position.set(0, 0.05, 0);
  pondGroup.add(riverbed);

  // Tảng đá rêu phong xanh tự nhiên điểm xuyết quanh chân bờ kè
  const stoneMats = [
    new THREE.MeshStandardMaterial({ color: 0x1e3a1e, roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.75 }),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 }),
    new THREE.MeshStandardMaterial({ color: 0x0f291e, roughness: 0.85 }),
  ];
  const boulderCoords = [
    [-10.5, -10.5, 2.2, 0.7, 1.8, 2],
    [10.8, -10.2, 1.8, 0.6, 1.6, 0],
    [-11.0, 10.5, 2.0, 0.7, 1.7, 1],
    [10.5, 11.0, 2.4, 0.8, 2.0, 2],
    [-11.2, 0.0, 1.6, 0.5, 1.4, 3],
    [11.2, 0.0, 1.5, 0.5, 1.3, 0],
    [0.0, 11.2, 1.7, 0.55, 1.5, 1],
  ];
  boulderCoords.forEach(([sx, sz, rx, ry, rz, mIdx]) => {
    const stone = new THREE.Mesh(new THREE.SphereGeometry(1.0, 10, 8), stoneMats[mIdx % stoneMats.length]);
    stone.scale.set(rx, ry, rz);
    stone.position.set(sx, ry * 0.45, sz);
    stone.receiveShadow = true;
    pondGroup.add(stone);
  });

  // Mặt nước hồ sen xanh ngọc bích Jade Emerald (0x0d9488) - trong suốt thanh tịnh
  const matJadeWater = new THREE.MeshStandardMaterial({
    color: 0x0d9488, // Xanh ngọc bích Jade Emerald trong vắt
    emissive: 0x042f2e, // Ánh bích ngọc sâu thẳm lung linh
    emissiveIntensity: 0.28,
    roughness: 0.03,
    metalness: 0.15,
    transparent: true,
    opacity: 0.80,
  });
  const waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(25.4, 25.4, 32, 32), matJadeWater);
  waterMesh.rotateX(-Math.PI / 2);
  waterMesh.position.set(0, 0.55, 0);
  pondGroup.add(waterMesh);

  // Vòng gợn sóng nước lăn tăn quanh trụ đá Chùa Một Cột (tại local Z = 1.2)
  const matWaterRipple = new THREE.MeshBasicMaterial({
    color: 0x5eead4,
    transparent: true,
    opacity: 0.38,
    side: THREE.DoubleSide,
  });
  for (let wr = 0; wr < 4; wr++) {
    const ripple = new THREE.Mesh(new THREE.RingGeometry(1.5 + wr * 0.85, 1.68 + wr * 0.85, 28), matWaterRipple);
    ripple.rotateX(-Math.PI / 2);
    ripple.position.set(0, 0.552 + wr * 0.001, 1.2);
    pondGroup.add(ripple);
  }

  // =========================================================================
  // 3. TÔN TẠO MÔ HÌNH CHÙA MỘT CỘT (LIÊN HOA ĐÀI)
  // =========================================================================
  try {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/models/one-pillar-pagoda/scene.gltf',
      (gltf: GLTF) => {
        const pagoda = gltf.scene;
        const box = new THREE.Box3().setFromObject(pagoda);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Chiều cao chuẩn 10.8m uy nghiêm giữa lòng hồ sen
        const targetH = 10.8;
        const s = targetH / (size.y || 1);
        pagoda.scale.setScalar(s);
        pagoda.position.set(-center.x * s, -box.min.y * s + 0.05, -center.z * s + 1.2);
        pagoda.rotation.y = 0; // Bậc thang hướng ra lối cầu phía Nam

        pagoda.traverse((child: THREE.Object3D) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.castShadow = true;
            m.receiveShadow = true;
            if (m.material) {
              const mat = m.material as THREE.MeshStandardMaterial;
              mat.roughness = 0.55;
              mat.metalness = 0.08;
              if (mat.map) {
                mat.map.colorSpace = THREE.SRGBColorSpace;
              }
            }
          }
        });

        pondGroup.add(pagoda);
      },
      undefined,
      (err: unknown) => {
        console.error('Không thể tải mô hình Chùa Một Cột:', err);
      }
    );
  } catch (err) {
    console.error('Lỗi nạp mô hình Chùa Một Cột:', err);
  }

  // =========================================================================
  // 4. LỐI CẦU ĐÁ HOA SEN TÔN CAO TỪ PHÍA BỜ ĐÔNG (HƯỚNG BÊN SÂN VÀO)
  // Kết nối trực diện theo đúng chiều cầu thang rồng bên trong mô hình Chùa Một Cột
  // Khởi đầu từ sân chùa (X_local = 15.4, world X = -10.6) dẫn thẳng vào chân cầu thang (X_local = 7.2)
  // Cao trình mặt cầu y = 0.93m nổi bật trên làn nước xanh ngọc
  // =========================================================================
  const bridgeGroup = new THREE.Group();

  // A. BẬC TAM CẤP ĐÓN TỪ SÂN CHÙA BƯỚC LÊN CẦU ĐÁ PHÍA ĐÔNG (X_local: 15.4 đến 13.4)
  const stepConfigs = [
    { y: 0.40, x: 14.85, w: 0.70, d: 4.4 },
    { y: 0.60, x: 14.15, w: 0.70, d: 4.1 },
    { y: 0.80, x: 13.45, w: 0.70, d: 3.8 },
  ];
  stepConfigs.forEach((st) => {
    const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(st.w, 0.20, st.d), matStoneGrey);
    stepMesh.position.set(st.x, st.y, 0);
    stepMesh.receiveShadow = true;
    bridgeGroup.add(stepMesh);

    const stepTrim = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, st.d + 0.05), matLotusPlinth);
    stepTrim.position.set(st.x - st.w / 2 + 0.06, st.y + 0.11, 0);
    bridgeGroup.add(stepTrim);
  });

  // Lan can mây đá hai bên bậc tam cấp phía Đông (dọc theo trục Z = ±2.2)
  for (const sSide of [-2.2, 2.2]) {
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.65, 0.24), matLotusPlinth);
    ramp.position.set(14.1, 0.75, sSide);
    ramp.rotation.z = -Math.PI / 10;
    bridgeGroup.add(ramp);

    const entryPost = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.85, 0.32), matStoneGrey);
    entryPost.position.set(15.2, 0.65, sSide);
    bridgeGroup.add(entryPost);

    const entryBud = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 6), matLotusPlinth);
    entryBud.position.set(15.2, 1.20, sSide);
    bridgeGroup.add(entryBud);
  }

  // B. THÂN CẦU ĐÁ HOA SEN BẮC QUA LÒNG HỒ PHÍA ĐÔNG (X_local: 13.4 đến 7.6, dài 5.8m, rộng 3.4m)
  const bridgeLength = 5.8;
  const bridgeCenterX = 10.5;
  const bridgeWidth = 3.4;

  const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(bridgeLength, 0.22, bridgeWidth), matStoneGrey);
  bridgeDeck.position.set(bridgeCenterX, 0.82, 0);
  bridgeDeck.receiveShadow = true;
  bridgeGroup.add(bridgeDeck);

  // Mố trụ đá chịu lực cắm sâu xuống đáy hồ
  for (const px of [9.0, 12.0]) {
    for (const pSide of [-1.35, 1.35]) {
      const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.85, 8), matStoneGrey);
      pier.position.set(px, 0.40, pSide);
      pier.receiveShadow = true;
      bridgeGroup.add(pier);
    }
  }

  // Gờ đá hoa sen và lan can búp sen hai bên mép cầu (dọc theo Z = ±1.75)
  for (const bSide of [-1.75, 1.75]) {
    const bTrim = new THREE.Mesh(new THREE.BoxGeometry(bridgeLength, 0.16, 0.18), matLotusPlinth);
    bTrim.position.set(bridgeCenterX, 0.98, bSide);
    bridgeGroup.add(bTrim);

    for (let bx = 8.0; bx <= 13.0; bx += 1.6) {
      const bPost = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.75, 0.24), matStoneGrey);
      bPost.position.set(bx, 1.35, bSide);
      bridgeGroup.add(bPost);

      const bBud = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 6), matLotusPlinth);
      bBud.position.set(bx, 1.78, bSide);
      bridgeGroup.add(bBud);
    }

    const bRail = new THREE.Mesh(new THREE.BoxGeometry(bridgeLength, 0.12, 0.16), matLotusPlinth);
    bRail.position.set(bridgeCenterX, 1.65, bSide);
    bridgeGroup.add(bRail);
  }

  // Đèn đá cổ hoa sen thắp sáng trên lan can cầu Đông
  for (const lSide of [-1.75, 1.75]) {
    const lanternBase = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.34), matLotusPlinth);
    lanternBase.position.set(11.0, 1.82, lSide);
    bridgeGroup.add(lanternBase);

    const lanternGlowMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.24, 6),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.6,
      })
    );
    lanternGlowMesh.position.set(11.0, 2.02, lSide);
    bridgeGroup.add(lanternGlowMesh);

    const bridgeLight = new THREE.PointLight(0xf59e0b, 0.6, 6.0);
    bridgeLight.position.set(11.0, 2.2, lSide);
    nightLightsRef.current.push(bridgeLight);
    bridgeGroup.add(bridgeLight);
  }

  // C. SÀN TIẾP CẬN NỐI THẲNG VÀO CHÂN CẦU THANG RỒNG CHÙA MỘT CỘT (X_local: 7.6 đến 6.2, rộng 4.2m)
  const arrivalDeck = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 4.2), matStoneGrey);
  arrivalDeck.position.set(6.9, 0.82, 0);
  arrivalDeck.receiveShadow = true;
  bridgeGroup.add(arrivalDeck);

  // Lan can hai bên sàn tiếp cận (dọc Z = ±2.1)
  for (const aSide of [-2.1, 2.1]) {
    const aRail = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.16), matLotusPlinth);
    aRail.position.set(6.9, 1.65, aSide);
    bridgeGroup.add(aRail);

    const aPost = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.75, 0.24), matStoneGrey);
    aPost.position.set(6.3, 1.35, aSide);
    bridgeGroup.add(aPost);

    const aBud = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 6), matLotusPlinth);
    aBud.position.set(6.3, 1.78, aSide);
    bridgeGroup.add(aBud);
  }

  pondGroup.add(bridgeGroup);

  // =========================================================================
  // 5. ÁN THỜ & LƯ HƯƠNG ĐÁ DÂNG HƯƠNG TẠI ĐẦU CẦU PHÍA ĐÔNG (HƯỚNG SÂN CHÙA)
  // Bố trí tại cánh tả lối vào cầu từ sân chùa (local X = 14.8, Z = 2.8; world X = -11.2, Z = 38.8)
  // =========================================================================
  const pondCenserGroup = new THREE.Group();
  pondCenserGroup.position.set(14.8, 0.40, 2.8);

  const pondCenserBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 2.4), matLotusPlinth);
  pondCenserBase.position.set(0, 0.175, 0);
  pondCenserBase.receiveShadow = true;
  pondCenserGroup.add(pondCenserBase);

  const stoneCenser = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.36, 0.52, 14), matStoneGrey);
  stoneCenser.position.set(0, 0.60, 0);
  pondCenserGroup.add(stoneCenser);

  const incenseStick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.38, 6), matGold);
  incenseStick.position.set(0, 0.95, 0);
  pondCenserGroup.add(incenseStick);

  const censerGlow = new THREE.PointLight(0xf97316, 0.65, 4.0);
  censerGlow.position.set(0, 1.15, 0);
  nightLightsRef.current.push(censerGlow);
  pondCenserGroup.add(censerGlow);

  pondGroup.add(pondCenserGroup);

  // 6. CẢNH QUAN SEN DÀY ĐẶC (68+ LÁ SEN, 34+ HOA SEN HỒNG & TRẮNG, 18+ BÚP SEN)
  // =========================================================================
  const lotusGroup = new THREE.Group();
  const matLotusLeaf1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.78 }); // Xanh biếc tươi sáng
  const matLotusLeaf2 = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.82 }); // Lục sẫm thanh nhã
  const matLotusPetalPink = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.38, side: THREE.DoubleSide });
  const matLotusPetalWhite = new THREE.MeshStandardMaterial({ color: 0xfdf2f8, roughness: 0.38, side: THREE.DoubleSide });
  const matLotusCenter = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.28, metalness: 0.22 });

  // A. 68+ Tán Lá Sen Bồng Bềnh Đa Kích Thước (Tây Nam, Đông Nam, Tây Bắc, Đông Bắc, Ven Bờ)
  const lotusLeafCoords = [
    // Góc Tây Nam (Z: -11 đến -3, X: -11 đến -3)
    [-6.5, -4.5, 0.88], [-8.2, -6.0, 0.72], [-5.0, -7.2, 0.82], [-9.5, -3.2, 0.75],
    [-7.0, -8.5, 0.95], [-4.0, -5.0, 0.58], [-8.8, -8.0, 0.68], [-10.2, -5.5, 0.78],
    [-6.2, -9.8, 0.84], [-7.8, -3.8, 0.62], [-4.8, -9.0, 0.70], [-9.0, -10.0, 0.82],
    [-3.8, -7.8, 0.54], [-8.0, -11.0, 0.76], [-5.6, -11.2, 0.68],

    // Góc Đông Nam (Z: -11 đến -3, X: 3 đến 11)
    [6.5, -4.5, 0.85], [8.0, -6.5, 0.78], [5.2, -7.0, 0.90], [9.2, -4.0, 0.72],
    [7.5, -8.2, 0.80], [4.5, -5.2, 0.65], [8.5, -8.5, 0.76], [10.2, -5.8, 0.82],
    [6.2, -9.5, 0.86], [7.8, -3.5, 0.64], [4.8, -8.8, 0.72], [9.2, -9.8, 0.80],
    [3.8, -7.5, 0.56], [8.2, -11.0, 0.74], [5.8, -11.2, 0.66],

    // Góc Tây Bắc (Z: 3 đến 11, X: -11 đến -3)
    [-7.5, 5.0, 0.90], [-9.0, 6.8, 0.76], [-5.5, 7.5, 0.86], [-8.2, 8.8, 0.72],
    [-6.0, 9.5, 0.82], [-4.2, 6.0, 0.60], [-9.5, 4.5, 0.68], [-10.5, 7.5, 0.84],
    [-7.2, 10.8, 0.78], [-5.0, 10.5, 0.70], [-8.5, 3.5, 0.62], [-4.0, 8.5, 0.58],
    [-9.2, 9.5, 0.75], [-6.8, 3.2, 0.65], [-3.5, 10.2, 0.55],

    // Góc Đông Bắc (Z: 3 đến 11, X: 3 đến 11)
    [7.5, 5.0, 0.88], [9.0, 6.5, 0.82], [5.8, 7.2, 0.92], [8.5, 8.5, 0.72],
    [6.2, 9.2, 0.78], [4.5, 6.2, 0.65], [9.2, 4.2, 0.70], [10.5, 7.2, 0.80],
    [7.0, 10.5, 0.82], [5.2, 10.2, 0.74], [8.8, 3.5, 0.64], [4.0, 8.2, 0.60],
    [9.0, 9.8, 0.76], [6.5, 3.0, 0.62], [3.6, 9.8, 0.58],

    // Phía sau Chùa Một Cột (Bờ Bắc: Z: 6 đến 11, X: -3 đến 3)
    [-2.5, 6.5, 0.80], [2.2, 6.8, 0.76], [0.0, 8.0, 0.92], [-1.8, 9.0, 0.68],
    [1.5, 9.2, 0.72], [-3.2, 8.2, 0.76], [3.0, 8.5, 0.80], [0.0, 10.5, 0.85],
  ];

  lotusLeafCoords.forEach(([lx, lz, lr], idx) => {
    const leafMesh = new THREE.Mesh(
      new THREE.CircleGeometry(lr, 14),
      idx % 2 === 0 ? matLotusLeaf1 : matLotusLeaf2
    );
    leafMesh.rotateX(-Math.PI / 2);
    // Độ nhấp nhô nhẹ trên mặt nước xanh ngọc
    leafMesh.position.set(lx, 0.56 + (idx % 5) * 0.002, lz);
    leafMesh.rotation.z = (idx * 0.42) % (Math.PI * 2);
    leafMesh.rotation.x = -Math.PI / 2 + (Math.sin(idx) * 0.04);
    lotusGroup.add(leafMesh);
  });

  // B. 34+ Đóa Hoa Sen Nở Xòe (Hồng Sen & Bạch Liên)
  const flowerCoords: [number, number, boolean][] = [
    // Tây Nam
    [-6.8, -4.2, true], [-5.2, -7.0, false], [-7.5, -8.2, true], [-9.2, -3.5, true],
    [-10.0, -5.8, false], [-6.5, -10.0, true], [-4.2, -8.8, false], [-8.5, -10.5, true],
    // Đông Nam
    [6.8, -4.2, false], [5.5, -6.8, true], [7.8, -8.0, true], [9.0, -4.5, false],
    [10.0, -6.2, true], [6.0, -9.8, false], [4.5, -8.5, true], [8.8, -10.5, false],
    // Tây Bắc
    [-7.2, 5.2, true], [-5.8, 7.2, false], [-8.5, 8.5, true], [-4.5, 6.2, true],
    [-10.2, 7.0, false], [-6.8, 10.5, true], [-9.0, 4.0, false], [-3.8, 9.2, true],
    // Đông Bắc
    [7.2, 5.2, false], [6.0, 7.0, true], [8.2, 8.2, true], [4.8, 6.5, false],
    [10.2, 7.0, true], [6.8, 10.2, false], [9.0, 3.8, true], [4.2, 8.8, false],
    // Bắc hồ
    [0.0, 8.2, true], [-2.2, 6.8, false], [2.0, 7.0, true], [0.0, 10.0, false],
  ];

  flowerCoords.forEach(([fx, fz, isPink]) => {
    const flower = new THREE.Group();
    flower.position.set(fx, 0.58, fz);
    const petalMat = isPink ? matLotusPetalPink : matLotusPetalWhite;

    // Nhụy sen vàng hoàng yến
    const centerPod = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.16, 8), matLotusCenter);
    centerPod.position.set(0, 0.08, 0);
    flower.add(centerPod);

    // Cánh sen 2 lớp nở xòe duyên dáng
    for (let layer = 0; layer < 2; layer++) {
      const count = layer === 0 ? 6 : 8;
      const rad = layer === 0 ? 0.22 : 0.35;
      const angleOffset = (layer * Math.PI) / count;
      for (let p = 0; p < count; p++) {
        const a = (p / count) * Math.PI * 2 + angleOffset;
        const petal = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 5), petalMat);
        petal.position.set(Math.cos(a) * rad, 0.12 + layer * 0.04, Math.sin(a) * rad);
        petal.rotation.x = Math.sin(a) * (0.42 + layer * 0.2);
        petal.rotation.z = -Math.cos(a) * (0.42 + layer * 0.2);
        flower.add(petal);
      }
    }
    lotusGroup.add(flower);
  });

  // C. 18+ Búp Sen E Ấp Vươn Cao
  const budCoords = [
    [-7.8, -5.5], [7.2, -6.0], [-6.2, 6.0], [6.5, 6.2], [-1.2, 7.5], [1.8, 8.2],
    [-9.0, -7.5], [8.6, -7.2], [-8.2, 9.2], [7.8, 9.5], [-5.0, -10.2], [5.2, -10.5],
    [-10.2, 4.8], [9.8, 4.8], [-2.8, 9.5], [2.6, 9.8], [-4.8, 5.0], [4.5, 5.2]
  ];
  budCoords.forEach(([bx, bz]) => {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.025, 0.65, 6),
      matLotusLeaf1
    );
    stem.position.set(bx, 0.72, bz);
    lotusGroup.add(stem);

    const budMesh = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.26, 6), matLotusPetalPink);
    budMesh.position.set(bx, 1.10, bz);
    lotusGroup.add(budMesh);
  });

  pondGroup.add(lotusGroup);

  // =========================================================================
  // 7. ĐÈN ĐÁ CỔ HOA SEN & HOA ĐĂNG THẢ NỔI TRÊN MẶT HỒ SEN
  // =========================================================================
  const pondLanternCoords: [number, number][] = [
    [-13.2, -13.2], [13.2, -13.2], [-13.2, 13.2], [13.2, 13.2],
    [-2.4, -13.2], [2.4, -13.2]
  ];
  pondLanternCoords.forEach(([lx, lz]) => {
    const lanternG = new THREE.Group();
    lanternG.position.set(lx, 0.86, lz);

    const lBase = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 0.35, 6), matStoneGrey);
    lanternG.add(lBase);

    const lStem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.65, 6), matStoneGrey);
    lStem.position.set(0, 0.48, 0);
    lanternG.add(lStem);

    const lChamber = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 0.42, 6),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.85 })
    );
    lChamber.position.set(0, 0.98, 0);
    lanternG.add(lChamber);

    const lRoof = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.32, 6), matStoneGrey);
    lRoof.position.set(0, 1.32, 0);
    lanternG.add(lRoof);

    const lLight = new THREE.PointLight(0xfef08a, 1.2, 9.0);
    lLight.position.set(0, 1.1, 0);
    nightLightsRef.current.push(lLight);
    lanternG.add(lLight);

    pondGroup.add(lanternG);
  });

  // Hoa đăng thả nổi bồng bềnh trên mặt hồ sen
  for (let hd = 0; hd < 5; hd++) {
    const hAngle = (hd / 5) * Math.PI * 2 + 0.3;
    const hDist = 6.5 + (hd % 2) * 2.5;
    const hdGroup = new THREE.Group();
    hdGroup.position.set(Math.cos(hAngle) * hDist, 0.58, Math.sin(hAngle) * hDist);

    const hdBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.08, 8), matGold);
    hdGroup.add(hdBase);

    for (let p = 0; p < 6; p++) {
      const pa = (p / 6) * Math.PI * 2;
      const hPetal = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 4), matLotusPetalPink);
      hPetal.position.set(Math.cos(pa) * 0.16, 0.08, Math.sin(pa) * 0.16);
      hPetal.rotation.z = -Math.cos(pa) * 0.35;
      hPetal.rotation.x = Math.sin(pa) * 0.35;
      hdGroup.add(hPetal);
    }

    const hdLight = new THREE.PointLight(0xfacc15, 0.45, 3.5);
    hdLight.position.set(0, 0.18, 0);
    nightLightsRef.current.push(hdLight);
    hdGroup.add(hdLight);

    pondGroup.add(hdGroup);
  }

  // =========================================================================
  // 8. ĐÀN CÁ KOI 16 CON ĐA SẮC MÀU BƠI LƯỢN QUANH CHÂN CHÙA MỘT CỘT
  // =========================================================================
  koiFishListRef.current = [];
  const koiPatterns = [
    { name: 'Kohaku', body: 0xf8fafc, accent: 0xdc2626, fin: 0xffffff, scale: 1.25, hasCrown: false },
    { name: 'Yamabuki Ogon', body: 0xfacc15, accent: 0xf59e0b, fin: 0xfef08a, scale: 1.35, hasCrown: false },
    { name: 'Sanke', body: 0xffffff, accent: 0xef4444, spot: 0x0f172a, fin: 0xffffff, scale: 1.2, hasCrown: false },
    { name: 'Tancho', body: 0xf8fafc, accent: 0xf8fafc, fin: 0xffffff, scale: 1.22, hasCrown: true },
    { name: 'Showa', body: 0x1e293b, accent: 0xdc2626, white: 0xf8fafc, fin: 0xe2e8f0, scale: 1.3, hasCrown: false },
    { name: 'Ki Utsuri', body: 0x0f172a, accent: 0xf59e0b, fin: 0xfef08a, scale: 1.15, hasCrown: false },
    { name: 'Benigoi', body: 0xef4444, accent: 0xb91c1c, fin: 0xfca5a5, scale: 1.25, hasCrown: false },
    { name: 'Asagi', body: 0x64748b, accent: 0xea580c, fin: 0xfed7aa, scale: 1.18, hasCrown: false },
    { name: 'Chagoi', body: 0xb45309, accent: 0x92400e, fin: 0xfcd34d, scale: 1.4, hasCrown: false },
    { name: 'Platinum Ogon', body: 0xf1f5f9, accent: 0xe2e8f0, fin: 0xffffff, scale: 1.2, hasCrown: false },
    { name: 'Kohaku Small', body: 0xf8fafc, accent: 0xef4444, fin: 0xffffff, scale: 0.85, hasCrown: false },
    { name: 'Yamabuki Small', body: 0xfacc15, accent: 0xf59e0b, fin: 0xfef08a, scale: 0.8, hasCrown: false },
    { name: 'Tancho Small', body: 0xf8fafc, accent: 0xf8fafc, fin: 0xffffff, scale: 0.82, hasCrown: true },
    { name: 'Showa Small', body: 0x1e293b, accent: 0xef4444, fin: 0xffffff, scale: 0.85, hasCrown: false },
    { name: 'Hi Utsuri', body: 0x0f172a, accent: 0xdc2626, fin: 0xfca5a5, scale: 1.15, hasCrown: false },
    { name: 'Golden Comet', body: 0xf59e0b, accent: 0xd97706, fin: 0xfef08a, scale: 1.1, hasCrown: false },
  ];

  for (let k = 0; k < koiPatterns.length; k++) {
    const koiG = new THREE.Group();
    const p = koiPatterns[k];
    const s = p.scale;

    // 1. Thân cá hình con thoi thuôn mượt
    const matBody = new THREE.MeshStandardMaterial({
      color: p.body,
      roughness: 0.18,
      metalness: 0.22,
    });
    const koiBody = new THREE.Mesh(new THREE.ConeGeometry(0.30 * s, 1.5 * s, 10), matBody);
    koiBody.rotateZ(Math.PI / 2);
    koiG.add(koiBody);

    // Đầu cá bo tròn
    const koiHead = new THREE.Mesh(new THREE.SphereGeometry(0.26 * s, 8, 8), matBody);
    koiHead.position.set(0.68 * s, 0, 0);
    koiHead.scale.set(1.15, 0.85, 0.95);
    koiG.add(koiHead);

    // Mắt cá đen lánh hai bên
    const matEye = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    for (const eyeSide of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045 * s, 6, 6), matEye);
      eye.position.set(0.72 * s, 0.08 * s, eyeSide * 0.22 * s);
      koiG.add(eye);
    }

    // Đốm hoa văn trên lưng cá
    if (p.hasCrown) {
      const crown = new THREE.Mesh(
        new THREE.CircleGeometry(0.12 * s, 12),
        new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.25 })
      );
      crown.rotateX(-Math.PI / 2);
      crown.position.set(0.65 * s, 0.23 * s, 0);
      koiG.add(crown);
    } else if (p.accent && p.accent !== p.body) {
      const matAccent = new THREE.MeshStandardMaterial({ color: p.accent, roughness: 0.2 });
      const spot1 = new THREE.Mesh(new THREE.SphereGeometry(0.18 * s, 8, 8), matAccent);
      spot1.position.set(0.25 * s, 0.16 * s, 0);
      spot1.scale.set(1.4, 0.45, 0.85);
      koiG.add(spot1);

      const spot2 = new THREE.Mesh(new THREE.SphereGeometry(0.14 * s, 8, 8), matAccent);
      spot2.position.set(-0.25 * s, 0.14 * s, 0.04 * s);
      spot2.scale.set(1.2, 0.4, 0.8);
      koiG.add(spot2);
    }

    // Vây lưng
    const matFin = new THREE.MeshStandardMaterial({
      color: p.fin,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      roughness: 0.3,
    });
    const dorsalFin = new THREE.Mesh(new THREE.PlaneGeometry(0.6 * s, 0.22 * s), matFin);
    dorsalFin.position.set(0.05 * s, 0.30 * s, 0);
    dorsalFin.rotateX(Math.PI / 2);
    dorsalFin.rotateZ(Math.PI / 12);
    koiG.add(dorsalFin);

    // Đôi vây bơi hai bên
    for (const fs of [-1, 1]) {
      const pecFin = new THREE.Mesh(new THREE.PlaneGeometry(0.45 * s, 0.24 * s), matFin);
      pecFin.position.set(0.42 * s, -0.05 * s, fs * 0.30 * s);
      pecFin.rotateX((Math.PI / 2) * fs);
      pecFin.rotateY(fs * 0.35);
      koiG.add(pecFin);
    }

    // Cụm đuôi cá uốn lượn có thể xoay độc lập (userData.tailMesh)
    const tailG = new THREE.Group();
    tailG.position.set(-0.75 * s, 0, 0);

    const caudalFin = new THREE.Mesh(new THREE.ConeGeometry(0.22 * s, 0.65 * s, 4), matFin);
    caudalFin.rotateZ(Math.PI / 2);
    caudalFin.scale.set(0.25, 1.4, 1.0);
    tailG.add(caudalFin);

    koiG.add(tailG);
    koiG.userData.tailMesh = tailG;

    // Vị trí và quỹ đạo bơi lội tuần hoàn quanh hồ
    const baseAngle = (k / koiPatterns.length) * Math.PI * 2;
    const baseRadius = 4.2 + (k % 5) * 1.35;
    const baseSpeed = 0.007 + (k % 4) * 0.0022;

    koiG.position.set(Math.cos(baseAngle) * baseRadius, 0.46, Math.sin(baseAngle) * baseRadius);
    pondGroup.add(koiG);

    koiFishListRef.current.push({
      mesh: koiG,
      angle: baseAngle,
      speed: baseSpeed,
      radius: baseRadius,
      baseSpeed,
      baseRadius,
    });
  }

  return pondGroup;
}
