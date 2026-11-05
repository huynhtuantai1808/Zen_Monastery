// ============================================================================
// CỔNG TAM QUAN 3 GIAN CỔ KÍNH & TƯỜNG BAO SƠN TỰ (TEMPLE GATE & PERIMETER WALLS)
// Tái thiết Cổng Tam Quan 3 gian truyền thống uy nghiêm & Hệ thống tường thành
// khép kín bao bọc 4 phương sơn tự (104m x 124m)
// ============================================================================

import * as THREE from 'three';
import { createStylizedStoneLantern, createStylizedSilkLantern } from './environmentProps';
import {
  getSharedTexture,
  createChuaVanAnGatePlaqueTexture,
  createTinhTamGatePlaqueTexture,
  createCoupletTexture,
} from '../textures';

export interface PerimeterWallMaterials {
  matStoneGrey: THREE.Material;
  matRoofTile: THREE.Material;
  matBrick: THREE.Material;
  matWoodWarm: THREE.Material;
  matDarkTimber: THREE.Material;
  matGold: THREE.Material;
  matLanternRed: THREE.Material;
}

/**
 * TẠO MÁI NGÓI ĐAO CONG CHÙA CỔ TRUYỀN (VIETNAMESE AUTHENTIC TEMPLE GATE ROOF)
 * Có bề dày kết cấu thực sự, độ dốc cong lòng máng, bờ nóc Kìm Nóc và 4 đao cong vút lên trời.
 */
function createAuthenticGateCurvedRoof(
  width: number,
  depth: number,
  height: number,
  matTile: THREE.Material,
  matDarkTimber: THREE.Material,
  matGold: THREE.Material,
  hasRidgeFinials: boolean = true
): THREE.Group {
  const roofGroup = new THREE.Group();

  const halfW = width / 2;
  const halfD = depth / 2;
  const numX = 20;
  const numZ = 14;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const ridgeSpan = width * 0.48; // Bờ nóc dài ~48% bề rộng mái

  for (let iz = 0; iz <= numZ; iz++) {
    const fz = iz / numZ;
    const z = -halfD + fz * depth;
    const normZ = Math.abs(z) / halfD; // 0 ở giữa, 1 ở mép ngói

    for (let ix = 0; ix <= numX; ix++) {
      const fx = ix / numX;
      const x = -halfW + fx * width;
      const absX = Math.abs(x);

      // Khoảng cách chuẩn hóa từ điểm (x, z) tới bờ nóc
      let d = 0;
      if (absX <= ridgeSpan / 2) {
        d = normZ;
      } else {
        const dx = (absX - ridgeSpan / 2) / (halfW - ridgeSpan / 2);
        d = Math.sqrt(dx * dx + normZ * normZ);
      }
      d = Math.min(1.0, d);

      // Độ dốc cong lòng máng truyền thống (concave power curve)
      let y = height * Math.pow(Math.max(0, 1.0 - d), 1.32);

      // 4 Đao cong vút lên ở các góc mái
      const cornerX = Math.max(0, (absX - halfW * 0.62) / (halfW * 0.38));
      const cornerZ = Math.max(0, (Math.abs(z) - halfD * 0.62) / (halfD * 0.38));
      if (cornerX > 0 && cornerZ > 0) {
        y += Math.pow(cornerX * cornerZ, 1.45) * height * 0.42;
      }

      positions.push(x, y, z);
      uvs.push(fx * 3.5, fz * 4.0);
    }
  }

  for (let iz = 0; iz < numZ; iz++) {
    for (let ix = 0; ix < numX; ix++) {
      const a = iz * (numX + 1) + ix;
      const b = iz * (numX + 1) + (ix + 1);
      const c = (iz + 1) * (numX + 1) + ix;
      const d = (iz + 1) * (numX + 1) + (ix + 1);

      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const roofGeo = new THREE.BufferGeometry();
  roofGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  roofGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  roofGeo.setIndex(indices);
  roofGeo.computeVertexNormals();

  const roofMesh = new THREE.Mesh(roofGeo, matTile);
  roofMesh.castShadow = true;
  roofMesh.receiveShadow = true;
  roofGroup.add(roofMesh);

  // Trần rui mè gỗ lim mui lót dạ mái (Thấy rõ kết cấu dày dặn nhìn từ dưới lên)
  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.86, 0.12, depth * 0.86),
    matDarkTimber
  );
  ceiling.position.set(0, -0.06, 0);
  roofGroup.add(ceiling);

  // Diềm mái ngói trích thủy chạy quanh viền mép
  const eaveTrim = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.96, 0.16, depth * 0.96),
    matDarkTimber
  );
  eaveTrim.position.set(0, 0.02, 0);
  roofGroup.add(eaveTrim);

  // Bờ nóc ngói ngọc chạy ngang đỉnh (Horizontal Ridge Beam)
  const ridgeLen = ridgeSpan * 1.05;
  const ridgeBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, ridgeLen, 8),
    matTile
  );
  ridgeBeam.rotation.z = Math.PI / 2;
  ridgeBeam.position.set(0, height + 0.06, 0);
  roofGroup.add(ridgeBeam);

  const ridgeGold = new THREE.Mesh(
    new THREE.BoxGeometry(ridgeLen * 0.95, 0.10, 0.12),
    matGold
  );
  ridgeGold.position.set(0, height + 0.18, 0);
  roofGroup.add(ridgeGold);

  // Kìm Nóc (Dragon-fish finials) tại hai đầu đỉnh nóc
  if (hasRidgeFinials) {
    for (const rx of [-ridgeLen / 2, ridgeLen / 2]) {
      const finialGroup = new THREE.Group();
      finialGroup.position.set(rx, height + 0.22, 0);

      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.14, 6, 14, Math.PI * 0.75),
        matGold
      );
      arc.rotation.y = rx < 0 ? -Math.PI / 2 : Math.PI / 2;
      arc.rotation.z = rx < 0 ? Math.PI / 4 : -Math.PI / 4;
      finialGroup.add(arc);

      roofGroup.add(finialGroup);
    }
  }

  // 4 Đao cong góc mái mạ vàng vút lên
  const eaveOffsets = [
    { x: -halfW * 0.94, z: -halfD * 0.94, rotY: Math.PI * 0.25 },
    { x: halfW * 0.94, z: -halfD * 0.94, rotY: -Math.PI * 0.25 },
    { x: -halfW * 0.94, z: halfD * 0.94, rotY: Math.PI * 0.75 },
    { x: halfW * 0.94, z: halfD * 0.94, rotY: -Math.PI * 0.75 },
  ];

  for (const c of eaveOffsets) {
    const eaveTail = new THREE.Mesh(
      new THREE.TorusGeometry(0.68, 0.12, 6, 12, Math.PI * 0.65),
      matGold
    );
    eaveTail.position.set(c.x, height * 0.26, c.z);
    eaveTail.rotation.y = c.rotY;
    eaveTail.rotation.x = Math.PI / 4;
    roofGroup.add(eaveTail);
  }

  return roofGroup;
}

/**
 * TÁI THIẾT CỔNG TAM QUAN 3 GIAN CỔ TRUYỀN (ZONE 1: CỔNG CHÙA TAM QUAN)
 * Tọa độ trung tâm: (0, 0, 66)
 * Kiến trúc 3 gian 2 tầng mái (chồng diêm), treo hoành phi "CHÙA VÂN ẨN" & "TỊNH TÂM SƠN TỰ"
 */
export function createRedesignedTempleGate(mats: PerimeterWallMaterials): THREE.Group {
  const gateGroup = new THREE.Group();
  gateGroup.position.set(0, 0, 66);

  // 1. BỆ ĐÁ TAM CẤP & SÂN CỔNG HOA CƯƠNG RÊU PHONG
  // Bậc thềm đá dẫn từ bên ngoài Z = 72 lên sân cổng Z = 66
  for (let step = 0; step < 4; step++) {
    const stepDepth = 1.4;
    const stepWidth = 24.0 - step * 1.5;
    const stepHeight = 0.18;
    const stepMesh = new THREE.Mesh(
      new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth),
      mats.matStoneGrey
    );
    stepMesh.position.set(0, 0.09 + step * 0.14, 71.5 - step * 1.3);
    stepMesh.receiveShadow = true;
    gateGroup.add(stepMesh);
  }

  // Bệ móng đá hoa cương đỡ toàn bộ 4 trụ cổng
  const foundation = new THREE.Mesh(
    new THREE.BoxGeometry(19.2, 0.36, 4.8),
    mats.matStoneGrey
  );
  foundation.position.set(0, 0.18, 0);
  foundation.receiveShadow = true;
  gateGroup.add(foundation);

  // 2. 4 TRỤ ĐÁ HOA CƯƠNG BÁT GIÁC CỔ KÍNH
  // Cột phụ gian tả/hữu (X = -7.2, +7.2) cao đến dầm mái phụ tại y = 5.3m
  // Cột cái gian giữa (X = -2.4, +2.4) cao đến dầm mái hạ tại y = 6.6m
  // TUYỆT ĐỐI KHÔNG CÓ CỘT ĐÂM XUYÊN LÊN TRỜI

  // 2.1 Cột phụ hai bên gian tả/hữu (X = ±7.2)
  for (const sx of [-7.2, 7.2]) {
    // Chân tảng sen
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.85, 0.50, 8),
      mats.matStoneGrey
    );
    plinth.position.set(sx, 0.25, 0);
    plinth.castShadow = true;
    gateGroup.add(plinth);

    // Thân cột đá bát giác (cao 4.8m)
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.44, 0.48, 4.8, 8),
      mats.matStoneGrey
    );
    col.position.set(sx, 2.9, 0);
    col.castShadow = true;
    gateGroup.add(col);

    // Đấu củng đỡ dầm xà gian phụ
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.35, 1.15),
      mats.matWoodWarm
    );
    cap.position.set(sx, 5.45, 0);
    gateGroup.add(cap);
  }

  // 2.2 Cột cái gian giữa (X = ±2.4)
  for (const mx of [-2.4, 2.4]) {
    // Chân tảng sen đại
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.98, 0.60, 8),
      mats.matStoneGrey
    );
    plinth.position.set(mx, 0.30, 0);
    plinth.castShadow = true;
    gateGroup.add(plinth);

    // Thân cột đá cái bát giác (cao 5.8m)
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.54, 0.58, 5.8, 8),
      mats.matStoneGrey
    );
    col.position.set(mx, 3.5, 0);
    col.castShadow = true;
    gateGroup.add(col);

    // Đấu củng đại đỡ xà cái
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.40, 1.45),
      mats.matWoodWarm
    );
    cap.position.set(mx, 6.6, 0);
    gateGroup.add(cap);
  }

  // 3. HỆ DẦM XÀ GỖ LIM & CỬA VÕNG CHẠM KHẮC CỔ TRUYỀN
  // Xà nách gian phụ (Tả: -7.2 đến -2.4, Hữu: +2.4 đến +7.2)
  for (const lx of [-4.8, 4.8]) {
    const lintelSide = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.55, 0.75),
      mats.matWoodWarm
    );
    lintelSide.position.set(lx, 5.3, 0);
    lintelSide.castShadow = true;
    gateGroup.add(lintelSide);

    // Con bọ / củng đỡ xà hai bên vòm phụ
    for (const bx of [-2.2, 2.2]) {
      const corbel = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.55, 0.6),
        mats.matDarkTimber
      );
      corbel.position.set(lx + bx, 4.85, 0);
      gateGroup.add(corbel);
    }
  }

  // Xà cái gian giữa (nối 2 cột cái)
  const lintelMain = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 0.65, 0.85),
    mats.matWoodWarm
  );
  lintelMain.position.set(0, 6.5, 0);
  lintelMain.castShadow = true;
  gateGroup.add(lintelMain);

  // Con bọ / củng đỡ xà cái hai bên
  for (const bx of [-2.0, 2.0]) {
    const corbel = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.70, 0.7),
      mats.matDarkTimber
    );
    corbel.position.set(bx, 5.95, 0);
    gateGroup.add(corbel);
  }

  // 4. HAI MÁI PHỤ GIAN TẢ & GIAN HỮU (SIDE ROOFS)
  // Đặt ngay trên xà phụ và đầu cột phụ tại y = 5.65m
  const sideRoofL = createAuthenticGateCurvedRoof(
    7.2, 5.2, 1.7,
    mats.matRoofTile, mats.matDarkTimber, mats.matGold
  );
  sideRoofL.position.set(-5.4, 5.65, 0);
  gateGroup.add(sideRoofL);

  const sideRoofR = createAuthenticGateCurvedRoof(
    7.2, 5.2, 1.7,
    mats.matRoofTile, mats.matDarkTimber, mats.matGold
  );
  sideRoofR.position.set(5.4, 5.65, 0);
  gateGroup.add(sideRoofR);

  // 5. MÁI HẠ GIAN GIỮA (LOWER CENTRAL ROOF)
  // Đặt ngay trên xà cái tại y = 6.8m
  const lowerMainRoof = createAuthenticGateCurvedRoof(
    11.6, 6.4, 1.8,
    mats.matRoofTile, mats.matDarkTimber, mats.matGold
  );
  lowerMainRoof.position.set(0, 6.8, 0);
  gateGroup.add(lowerMainRoof);

  // 6. CỔ DIÊM / GÁC LẦU GỖ LIM (ATTIC CLERESTORY CHAMBER)
  // Nằm giữa Mái Hạ và Mái Thượng (y từ 7.4m đến 9.4m)
  // Nơi treo Bức Hoành Phi Đại Tự "CHÙA VÂN ẨN"
  const clerestoryGroup = new THREE.Group();
  clerestoryGroup.position.set(0, 7.4, 0);

  // 4 Trụ trối gỗ lim ở 4 góc cổ diêm
  const postOffsets = [
    { x: -2.1, z: -1.2 },
    { x: 2.1, z: -1.2 },
    { x: -2.1, z: 1.2 },
    { x: 2.1, z: 1.2 },
  ];
  for (const po of postOffsets) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.20, 2.0, 8),
      mats.matDarkTimber
    );
    post.position.set(po.x, 1.0, po.z);
    clerestoryGroup.add(post);
  }

  // Vách chấn song con tiện gỗ truyền thống quanh cổ diêm
  const atticWallL = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 1.6, 2.2),
    mats.matWoodWarm
  );
  atticWallL.position.set(-2.0, 1.0, 0);
  clerestoryGroup.add(atticWallL);

  const atticWallR = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 1.6, 2.2),
    mats.matWoodWarm
  );
  atticWallR.position.set(2.0, 1.0, 0);
  clerestoryGroup.add(atticWallR);

  // Khung dầm xà trên đỉnh cổ diêm
  const atticBeamX = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 0.35, 2.8),
    mats.matDarkTimber
  );
  atticBeamX.position.set(0, 2.0, 0);
  clerestoryGroup.add(atticBeamX);

  // --- MẶT TIỀN: BỨC HOÀNH PHI ĐẠI TỰ "CHÙA VÂN ẨN" ---
  // Khung gỗ thếp vàng trang trọng
  const plaqueFrameFront = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 1.55, 0.16),
    mats.matDarkTimber
  );
  plaqueFrameFront.position.set(0, 1.0, 1.30);
  clerestoryGroup.add(plaqueFrameFront);

  // Mặt biển sơn son chữ vàng thếp phát sáng
  const plaqueMatFront = new THREE.MeshStandardMaterial({
    map: getSharedTexture('plaque_chua_van_an_gate', createChuaVanAnGatePlaqueTexture),
    roughness: 0.25,
    metalness: 0.35,
  });
  const plaqueMeshFront = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 1.45),
    plaqueMatFront
  );
  plaqueMeshFront.position.set(0, 1.0, 1.39);
  clerestoryGroup.add(plaqueMeshFront);

  // --- MẶT HẬU: HOÀNH PHI "TỊNH TÂM SƠN TỰ" ---
  const plaqueFrameBack = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 1.55, 0.16),
    mats.matDarkTimber
  );
  plaqueFrameBack.position.set(0, 1.0, -1.30);
  clerestoryGroup.add(plaqueFrameBack);

  const plaqueMatBack = new THREE.MeshStandardMaterial({
    map: getSharedTexture('plaque_tinh_tam_son_tu_gate', createTinhTamGatePlaqueTexture),
    roughness: 0.25,
    metalness: 0.35,
  });
  const plaqueMeshBack = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 1.45),
    plaqueMatBack
  );
  plaqueMeshBack.rotation.y = Math.PI;
  plaqueMeshBack.position.set(0, 1.0, -1.39);
  clerestoryGroup.add(plaqueMeshBack);

  gateGroup.add(clerestoryGroup);

  // 7. MÁI THƯỢNG GIAN GIỮA (UPPER CENTRAL ROOF - TẦNG 2)
  // Đặt trên đỉnh cổ diêm tại y = 9.4m
  const upperMainRoof = createAuthenticGateCurvedRoof(
    9.2, 5.6, 2.2,
    mats.matRoofTile, mats.matDarkTimber, mats.matGold
  );
  upperMainRoof.position.set(0, 9.4, 0);
  gateGroup.add(upperMainRoof);

  // Búp sen hoàng kim (Golden Lotus Bud) đắp trên đỉnh bờ nóc mái thượng
  const lotusFinial = new THREE.Mesh(
    new THREE.SphereGeometry(0.60, 10, 10),
    mats.matGold
  );
  lotusFinial.scale.set(0.75, 1.6, 0.75);
  lotusFinial.position.set(0, 12.1, 0);
  gateGroup.add(lotusFinial);

  // 8. ĐÔI CÂU ĐỐI CHỮ THẾP VÀNG GẮN TRÊN 2 CỘT CÁI
  // Cột Trái (X = -2.4): "雲隱山峰流正道"
  const coupletMatL = new THREE.MeshStandardMaterial({
    map: getSharedTexture('couplet_van_an_L', () => createCoupletTexture('雲隱山峰流正道')),
    roughness: 0.35,
  });
  const coupletL = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 3.8, 0.08),
    coupletMatL
  );
  coupletL.position.set(-2.4, 3.6, 0.62);
  gateGroup.add(coupletL);

  // Cột Phải (X = +2.4): "淨心禪境悟菩提"
  const coupletMatR = new THREE.MeshStandardMaterial({
    map: getSharedTexture('couplet_van_an_R', () => createCoupletTexture('淨心禪境悟菩提')),
    roughness: 0.35,
  });
  const coupletR = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 3.8, 0.08),
    coupletMatR
  );
  coupletR.position.set(2.4, 3.6, 0.62);
  gateGroup.add(coupletR);

  // 9. ĐÈN LỒNG LỤA ĐỎ TREO DƯỚI XÀ CÁC GIAN CỔNG
  // Dây treo thanh mảnh, đèn buông tự nhiên cân đối
  // 2 đèn gian chính
  for (const lx of [-1.3, 1.3]) {
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.85, 4),
      mats.matDarkTimber
    );
    cord.position.set(lx, 6.05, 0.4);
    gateGroup.add(cord);

    const lantern = createStylizedSilkLantern(mats.matLanternRed);
    lantern.position.set(lx, 5.4, 0.4);
    gateGroup.add(lantern);
  }

  // 2 đèn hai gian phụ
  for (const lx of [-4.8, 4.8]) {
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.70, 4),
      mats.matDarkTimber
    );
    cord.position.set(lx, 4.85, 0.4);
    gateGroup.add(cord);

    const lantern = createStylizedSilkLantern(mats.matLanternRed);
    lantern.position.set(lx, 4.3, 0.4);
    gateGroup.add(lantern);
  }

  // 10. ĐÔI LINH THÚ / NGHÊ ĐÁ CHẦU & ĐÈN ĐÁ SÂN CỔNG
  for (const side of [-1, 1]) {
    const lionGroup = new THREE.Group();
    lionGroup.position.set(side * 3.8, 0.35, 69.2);

    const lionBase = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 1.4), mats.matStoneGrey);
    lionBase.position.set(0, 0.35, 0);
    lionGroup.add(lionBase);

    const lionBody = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.9, 1.1), mats.matStoneGrey);
    lionBody.position.set(0, 1.05, -0.1);
    lionGroup.add(lionBody);

    const lionHead = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 8), mats.matStoneGrey);
    lionHead.position.set(0, 1.65, 0.25);
    lionGroup.add(lionHead);

    lionGroup.castShadow = true;
    gateGroup.add(lionGroup);

    // Đèn đá chạm mây cổ kính ở hai góc ngoài
    const lan = createStylizedStoneLantern(mats.matStoneGrey);
    lan.position.set(side * 8.2, 0.35, 67.8);
    gateGroup.add(lan);
  }

  // 11. CỜ NGŨ SẮC PHẬT GIÁO
  for (const fx of [-8.6, 8.6]) {
    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 10.0, 8), mats.matWoodWarm);
    flagPole.position.set(fx, 5.0, 1.2);
    gateGroup.add(flagPole);

    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 1.6, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35 })
    );
    flag.position.set(fx, 9.0, 2.3);
    gateGroup.add(flag);
  }

  return gateGroup;
}

export function createMonasteryPerimeterWalls(mats: PerimeterWallMaterials): THREE.Group {
  const perimeterGroup = new THREE.Group();

  // Helper tạo 1 đoạn tường gạch nung có bờ mái ngói lưu ly che mưa trên đỉnh
  function createWallRun(
    x1: number,
    z1: number,
    x2: number,
    z2: number,
    hasMoonWindows: boolean = false
  ): THREE.Group {
    const runGroup = new THREE.Group();

    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);
    const midX = (x1 + x2) / 2;
    const midZ = (z1 + z2) / 2;

    runGroup.position.set(midX, 0, midZ);
    runGroup.rotation.y = angle;

    // 1. Chân móng đá xanh / đá ong rêu phong (Plinth Foundation)
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.45, length),
      mats.matStoneGrey
    );
    plinth.position.set(0, 0.22, 0);
    plinth.receiveShadow = true;
    runGroup.add(plinth);

    // 2. Thân tường gạch nung Bát Tràng ấm áp
    const wallBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 2.5, length),
      mats.matBrick
    );
    wallBody.position.set(0, 1.7, 0);
    wallBody.castShadow = true;
    wallBody.receiveShadow = true;
    runGroup.add(wallBody);

    // 3. Bờ mái ngói lưu ly men ngọc che mưa trên đỉnh tường (Glazed Tile Wall Coping)
    const roofCrest = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.25, length + 0.4),
      mats.matRoofTile
    );
    roofCrest.position.set(0, 3.02, 0);
    roofCrest.castShadow = true;
    runGroup.add(roofCrest);

    // Gờ ngói đao cong uốn lượn hai mép tường
    const roofTileLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.18, length + 0.4),
      mats.matRoofTile
    );
    roofTileLeft.position.set(-0.45, 2.92, 0);
    roofTileLeft.rotation.z = 0.22;
    runGroup.add(roofTileLeft);

    const roofTileRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.18, length + 0.4),
      mats.matRoofTile
    );
    roofTileRight.position.set(0.45, 2.92, 0);
    roofTileRight.rotation.z = -0.22;
    runGroup.add(roofTileRight);

    // 4. Ô cửa sổ nguyệt môn (Moon Windows) mở tầm nhìn ra núi non xanh ngát
    if (hasMoonWindows && length > 20) {
      const numWindows = Math.floor(length / 18);
      for (let w = 1; w <= numWindows; w++) {
        const offsetZ = (w / (numWindows + 1) - 0.5) * length;
        // Khung tròn nguyệt môn
        const moonFrame = new THREE.Mesh(
          new THREE.TorusGeometry(0.68, 0.12, 6, 16),
          mats.matWoodWarm
        );
        moonFrame.position.set(0, 1.85, offsetZ);
        moonFrame.rotation.y = Math.PI / 2;
        runGroup.add(moonFrame);

        // Chấn song hoa thị trang trí bên trong ô cửa
        const lattice = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 1.15, 0.06),
          mats.matDarkTimber
        );
        lattice.position.set(0, 1.85, offsetZ);
        runGroup.add(lattice);

        const latticeH = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.06, 1.15),
          mats.matDarkTimber
        );
        latticeH.position.set(0, 1.85, offsetZ);
        runGroup.add(latticeH);
      }
    }

    // 5. Đèn lồng đỏ gắn tường thành (cách mỗi 16m)
    if (length > 12) {
      const numLanterns = Math.max(1, Math.floor(length / 16));
      for (let l = 1; l <= numLanterns; l++) {
        const lanZ = (l / (numLanterns + 1) - 0.5) * length;
        const wallLantern = createStylizedSilkLantern(mats.matLanternRed);
        wallLantern.scale.set(0.75, 0.75, 0.75);
        wallLantern.position.set(0.52, 2.45, lanZ);
        runGroup.add(wallLantern);
      }
    }

    return runGroup;
  }

  // 1. TƯỜNG NAM (South Wall) - Nối liền hai bên Cổng Tam Quan (Z = 66)
  // Cánh Tây: X từ -52 đến -8
  perimeterGroup.add(createWallRun(-52, 66, -8, 66, true));
  // Cánh Đông: X từ 8 đến 52
  perimeterGroup.add(createWallRun(8, 66, 52, 66, true));

  // 2. TƯỜNG TÂY (West Wall: X = -52, Z từ 66 đến -58) - Bao bọc Suối Ngọc & Tháp Chuông
  perimeterGroup.add(createWallRun(-52, 66, -52, -58, true));

  // 3. TƯỜNG BẮC (North Wall: Z = -58, X từ -52 đến 52) - Bao bọc sau Hậu Viện Sơn Tự
  perimeterGroup.add(createWallRun(-52, -58, 52, -58, true));

  // 4. TƯỜNG ĐÔNG (East Wall: X = 52, Z từ -58 đến 66) - Bao bọc sau Bảo Tháp & Tàng Kinh Các
  perimeterGroup.add(createWallRun(52, -58, 52, 66, true));

  // 5. 4 TRỤ ĐÁ GÓC THÀNH (Corner Bastions / Watch Pillars)
  const cornerCoords = [
    { x: -52, z: 66 },
    { x: 52, z: 66 },
    { x: -52, z: -58 },
    { x: 52, z: -58 },
  ];

  for (const c of cornerCoords) {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(c.x, 0, c.z);

    // Trụ đá khối góc thành
    const cornerPillar = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 3.4, 1.6),
      mats.matStoneGrey
    );
    cornerPillar.position.set(0, 1.7, 0);
    cornerPillar.castShadow = true;
    towerGroup.add(cornerPillar);

    // Mái chóp nhọn ngói men ngọc che đỉnh trụ góc
    const cornerCap = new THREE.Mesh(
      new THREE.ConeGeometry(1.4, 1.0, 4),
      mats.matRoofTile
    );
    cornerCap.position.set(0, 3.9, 0);
    cornerCap.rotateY(Math.PI / 4);
    cornerCap.castShadow = true;
    towerGroup.add(cornerCap);

    // Búp sen đá đỉnh nóc
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), mats.matGold);
    finial.position.set(0, 4.5, 0);
    towerGroup.add(finial);

    perimeterGroup.add(towerGroup);
  }

  return perimeterGroup;
}

