// ============================================================================
// CỔNG TAM QUAN 3 GIAN CỔ KÍNH & TƯỜNG BAO SƠN TỰ (TEMPLE GATE & PERIMETER WALLS)
// Tái thiết Cổng Tam Quan 3 gian truyền thống uy nghiêm & Hệ thống tường thành
// khép kín bao bọc 4 phương sơn tự (104m x 124m)
// ============================================================================

import * as THREE from 'three';
import { createStylizedCurvedRoof, createStylizedStoneLantern, createStylizedSilkLantern } from './environmentProps';

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
 * TÁI THIẾT CỔNG TAM QUAN 3 GIAN CỔ TRUYỀN (ZONE 1: CỔNG CHÙA TAM QUAN)
 * Tọa độ trung tâm: (0, 0, 66)
 */
export function createRedesignedTempleGate(mats: PerimeterWallMaterials): THREE.Group {
  const gateGroup = new THREE.Group();
  gateGroup.position.set(0, 0, 66);

  // 1. BỆ ĐÁ TAM CẤP & LỐI VÀO HOA CƯƠNG RÊU PHONG
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

  // 2. 4 TRỤ ĐÁ HOA CƯƠNG BÁT GIÁC CỔ KÍNH
  // 2 trụ cái gian giữa (X = -2.4, 2.4) cao 9.2m & 2 trụ con gian tả/hữu (X = -7.2, 7.2) cao 7.5m
  const pillarConfigs = [
    { x: -7.2, h: 7.6, r: 0.52, isMain: false },
    { x: -2.4, h: 9.2, r: 0.62, isMain: true },
    { x: 2.4, h: 9.2, r: 0.62, isMain: true },
    { x: 7.2, h: 7.6, r: 0.52, isMain: false },
  ];

  for (const p of pillarConfigs) {
    // Chân tảng đá chạm đài sen
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(p.r * 1.55, p.r * 1.8, 0.75, 8),
      mats.matStoneGrey
    );
    plinth.position.set(p.x, 0.38, 0);
    plinth.castShadow = true;
    gateGroup.add(plinth);

    // Thân cột đá bát giác
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(p.r * 0.92, p.r, p.h, 8),
      mats.matStoneGrey
    );
    col.position.set(p.x, p.h / 2 + 0.5, 0);
    col.castShadow = true;
    gateGroup.add(col);

    // Đấu củng / gối đỡ mái trên đỉnh cột
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(p.r * 2.4, 0.45, p.r * 2.4),
      mats.matWoodWarm
    );
    cap.position.set(p.x, p.h + 0.65, 0);
    gateGroup.add(cap);
  }

  // 3. XÀ NGANG GỖ LIM & VÒM CỬA 3 GIAN
  // Xà cái gian giữa
  const lintelMain = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.75, 0.8), mats.matWoodWarm);
  lintelMain.position.set(0, 6.2, 0);
  lintelMain.castShadow = true;
  gateGroup.add(lintelMain);

  // Xà phụ hai bên
  const lintelLeft = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.6, 0.7), mats.matWoodWarm);
  lintelLeft.position.set(-4.8, 5.2, 0);
  lintelLeft.castShadow = true;
  gateGroup.add(lintelLeft);

  const lintelRight = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.6, 0.7), mats.matWoodWarm);
  lintelRight.position.set(4.8, 5.2, 0);
  lintelRight.castShadow = true;
  gateGroup.add(lintelRight);

  // Khung vòm gỗ cong cổ truyền (Decorative wooden portal arches)
  const archMain = new THREE.Mesh(
    new THREE.TorusGeometry(2.1, 0.16, 6, 16, Math.PI),
    mats.matWoodWarm
  );
  archMain.rotation.z = Math.PI;
  archMain.position.set(0, 5.7, 0);
  gateGroup.add(archMain);

  for (const ax of [-4.8, 4.8]) {
    const archSide = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.14, 6, 16, Math.PI),
      mats.matWoodWarm
    );
    archSide.rotation.z = Math.PI;
    archSide.position.set(ax, 4.8, 0);
    gateGroup.add(archSide);
  }

  // 4. BIỂN HOÀNH PHI ĐẠI TỰ "SƠN TỰ VẠN PHÚC" & ĐÔI CÂU ĐỐI
  // Biển hoành phi sơn son thếp vàng mặt tiền
  const signBoard = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.35, 0.28), mats.matGold);
  signBoard.position.set(0, 6.6, 0.45);
  signBoard.castShadow = true;
  gateGroup.add(signBoard);

  const signBorder = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.55, 0.22), mats.matDarkTimber);
  signBorder.position.set(0, 6.6, 0.42);
  gateGroup.add(signBorder);

  // Đôi câu đối chữ vàng gắn trên hai cột cái gian giữa
  const coupletL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.8, 0.1), mats.matDarkTimber);
  coupletL.position.set(-2.4, 3.8, 0.65);
  gateGroup.add(coupletL);

  const coupletR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.8, 0.1), mats.matDarkTimber);
  coupletR.position.set(2.4, 3.8, 0.65);
  gateGroup.add(coupletR);

  // 5. HỆ MÁI ĐAO CONG 2 TẦNG CHỒNG DIÊM LỢP NGÓI MEN NGỌC
  // Mái thượng (Tầng 2 nhô cao gian giữa)
  const gateRoof2 = createStylizedCurvedRoof(12.5, 6.2, mats.matRoofTile);
  gateRoof2.position.set(0, 10.2, 0);
  gateGroup.add(gateRoof2);

  // Búp sen hoàng kim đắp đỉnh nóc mái thượng
  const lotusFinial = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), mats.matGold);
  lotusFinial.scale.set(0.8, 1.6, 0.8);
  lotusFinial.position.set(0, 11.8, 0);
  gateGroup.add(lotusFinial);

  // Mái hạ (Tầng 1 vươn rộng trải dài khắp 3 gian cổng)
  const gateRoof1 = createStylizedCurvedRoof(21.0, 7.8, mats.matRoofTile);
  gateRoof1.position.set(0, 7.8, 0);
  gateGroup.add(gateRoof1);

  // Mái phụ đao cong che hai gian tả hữu
  const sideRoofL = createStylizedCurvedRoof(7.2, 5.0, mats.matRoofTile);
  sideRoofL.position.set(-5.6, 6.2, 0);
  gateGroup.add(sideRoofL);

  const sideRoofR = createStylizedCurvedRoof(7.2, 5.0, mats.matRoofTile);
  sideRoofR.position.set(5.6, 6.2, 0);
  gateGroup.add(sideRoofR);

  // 6. ĐÔI LINH THÚ / NGHÊ ĐÁ CHẦU & ĐÈN ĐÁ SÂN CỔNG
  for (const side of [-1, 1]) {
    const lionGroup = new THREE.Group();
    lionGroup.position.set(side * 3.8, 0.35, 69.2);

    // Bệ đá linh thú
    const lionBase = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 1.4), mats.matStoneGrey);
    lionBase.position.set(0, 0.35, 0);
    lionGroup.add(lionBase);

    // Thân linh thú uy nghiêm
    const lionBody = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.9, 1.1), mats.matStoneGrey);
    lionBody.position.set(0, 1.05, -0.1);
    lionGroup.add(lionBody);

    // Đầu linh thú hướng ra ngoài đón khách
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

  // 7. CỜ NGŨ SẮC PHẬT GIÁO & ĐÈN LỒNG ĐỎ CỔNG CHÙA
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

  // Đèn lồng đỏ treo dưới mái các gian cổng
  for (const lx of [-4.8, -2.4, 0, 2.4, 4.8]) {
    const lantern = createStylizedSilkLantern(mats.matLanternRed);
    lantern.position.set(lx, lx === 0 ? 5.8 : 4.9, 0.8);
    gateGroup.add(lantern);
  }

  return gateGroup;
}

/**
 * XÂY DỰNG HỆ THỐNG TƯỜNG BAO KHÉP KÍN 4 PHƯƠNG KHUÔN VIÊN SƠN TỰ (104m x 124m)
 * Tường Nam (South), Tường Tây (West), Tường Bắc (North), Tường Đông (East)
 */
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
