import React from 'react';
import * as THREE from 'three';
import { createStylizedCurvedRoof, createStylizedStoneLantern } from './environmentProps';

export interface BackCourtyardReturnData {
  group: THREE.Group;
  bambooCulms: THREE.Group[];
  kitchenSmoke: THREE.Points;
  woodStationAnchor: THREE.Vector3;
  wellStationAnchor: THREE.Vector3;
}

export interface BackCourtyardEnsembleMaterials {
  matStoneGrey: THREE.Material;
  matRoofTile: THREE.Material;
  matWoodLim: THREE.Material;
  matTileBrick: THREE.Material;
  matLotusPlinth?: THREE.Material;
  matGold?: THREE.Material;
  matBronze?: THREE.Material;
}

/**
 * Tôn tạo và khởi tạo toàn bộ cụm kiến trúc Hậu Viện Sơn Tự (Khu vực sau Chánh Điện)
 * Gồm:
 * 1. Nhà Bếp Chùa (Hương Tích Trù) - Bếp lò đỏ lửa, ống khói lam chiều, chum vại sành
 * 2. Nhà Kho Củi (Tiêu Phòng) - Chồng củi gỗ ngăn nắp, bệ gỗ thớt chẻ củi và rìu ghim
 * 3. Giếng Ngọc Cổ (Tịnh Thủy Tuyền) - Thành đá bát giác, cột xà ròng rọc múc nước, nước ngọc bích
 * 4. Hàng Trúc Hàng Tre (Thanh Trúc Uyển) - Hai hàng trúc thẳng tắp che mát lối đi dạo lát đá
 * 5. Đại sân gạch nung Bát Tràng & lối đá tự nhiên kết nối thông suốt hai bên hồi Chánh Điện
 *
 * Tọa độ trung tâm: X = 0, Z = -50
 */
export function createBackCourtyardEnsemble(
  materials: BackCourtyardEnsembleMaterials,
  nightLightsRef: React.MutableRefObject<THREE.PointLight[]>
): BackCourtyardReturnData {
  const backGardenGroup = new THREE.Group();
  backGardenGroup.position.set(0, 0, -50);

  const { matStoneGrey, matRoofTile, matWoodLim, matTileBrick } = materials;
  const matLotusPlinth = materials.matLotusPlinth || matStoneGrey;
  const matBronze = materials.matBronze || matStoneGrey;

  const bambooCulms: THREE.Group[] = [];

  // =========================================================================
  // 1. ĐẠI SÂN GẠCH NUNG BÁT TRÀNG & LỐI ĐI LÁT ĐÁ XANH TỰ NHIÊN HẬU VIỆN
  // Bao phủ diện tích 56m x 24m (X in [-28, 28], Z_local in [-7, 17] -> world Z in [-57, -33])
  // =========================================================================
  const courtyardFloor = new THREE.Mesh(
    new THREE.BoxGeometry(56.0, 0.35, 24.0),
    matTileBrick
  );
  courtyardFloor.position.set(0, 0.175, 5.0);
  courtyardFloor.receiveShadow = true;
  backGardenGroup.add(courtyardFloor);

  // Trục đường chính lát phiến đá xanh (Flagstone Walkway) dẫn thẳng từ Chánh Điện (Z_local = 17) vào sân sau (Z_local = 0)
  const mainStonePath = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.38, 18.0),
    matStoneGrey
  );
  mainStonePath.position.set(0, 0.19, 8.0);
  mainStonePath.receiveShadow = true;
  backGardenGroup.add(mainStonePath);

  // Lối đá rẽ sang cánh Tây dẫn vào Bếp Chùa & Kho Củi (X: 0 đến -16, Z_local: 3.0)
  const westStoneBranch = new THREE.Mesh(
    new THREE.BoxGeometry(16.0, 0.38, 3.2),
    matStoneGrey
  );
  westStoneBranch.position.set(-8.0, 0.19, 3.0);
  westStoneBranch.receiveShadow = true;
  backGardenGroup.add(westStoneBranch);

  // Lối đá rẽ sang cánh Đông dẫn vào Giếng Ngọc Cổ (X: 0 đến 12, Z_local: 3.5)
  const eastStoneBranch = new THREE.Mesh(
    new THREE.BoxGeometry(12.0, 0.38, 3.0),
    matStoneGrey
  );
  eastStoneBranch.position.set(6.0, 0.19, 3.5);
  eastStoneBranch.receiveShadow = true;
  backGardenGroup.add(eastStoneBranch);

  // =========================================================================
  // 2. NHÀ BẾP CHÙA (HƯƠNG TÍCH TRÙ) - CÁNH TÂY BẮC (X_local: -16.5, Z_local: 1.0)
  // Kích thước 12.0m x 8.5m, móng đá tôn cao 0.58m, cửa mở rộng 2.4m, nội thất ấm cúng
  // =========================================================================
  const kitchenGroup = new THREE.Group();
  kitchenGroup.position.set(-16.5, 0, 1.0);

  // Móng đá xanh chịu lực
  const kitchenBase = new THREE.Mesh(
    new THREE.BoxGeometry(12.0, 0.40, 8.5),
    matStoneGrey
  );
  kitchenBase.position.set(0, 0.20, 0);
  kitchenBase.receiveShadow = true;
  kitchenGroup.add(kitchenBase);

  // Sàn gạch Bát Tràng nội thất bên trong nhà bếp
  const kitchenInteriorFloor = new THREE.Mesh(
    new THREE.BoxGeometry(10.8, 0.04, 7.2),
    matTileBrick
  );
  kitchenInteriorFloor.position.set(0, 0.40, 0);
  kitchenInteriorFloor.receiveShadow = true;
  kitchenGroup.add(kitchenInteriorFloor);

  // Bậc tam cấp đá đón bước vào cửa nhà bếp phía trước
  for (let st = 0; st < 2; st++) {
    const kStep = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.18, 0.8),
      matStoneGrey
    );
    kStep.position.set(0, 0.09 + st * 0.18, 4.3 + st * 0.5);
    kStep.receiveShadow = true;
    kitchenGroup.add(kStep);
  }

  // Khối tường gạch Bát Tràng cổ kính bao quanh có chừa cửa vào
  const matKitchenBrick = new THREE.MeshStandardMaterial({
    color: 0x9a3412, // Đỏ gạch nung ấm áp
    roughness: 0.85,
    metalness: 0.05,
  });

  // Tường Hậu (phía Bắc)
  const kitchenWallBack = new THREE.Mesh(
    new THREE.BoxGeometry(11.2, 3.6, 0.38),
    matKitchenBrick
  );
  kitchenWallBack.position.set(0, 2.2, -3.61);
  kitchenWallBack.castShadow = true;
  kitchenWallBack.receiveShadow = true;
  kitchenGroup.add(kitchenWallBack);

  // Tường Hồi (phía Tây)
  const kitchenWallWest = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 3.6, 7.22),
    matKitchenBrick
  );
  kitchenWallWest.position.set(-5.41, 2.2, 0);
  kitchenWallWest.castShadow = true;
  kitchenWallWest.receiveShadow = true;
  kitchenGroup.add(kitchenWallWest);

  // Tường Hồi (phía Đông)
  const kitchenWallEast = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 3.6, 7.22),
    matKitchenBrick
  );
  kitchenWallEast.position.set(5.41, 2.2, 0);
  kitchenWallEast.castShadow = true;
  kitchenWallEast.receiveShadow = true;
  kitchenGroup.add(kitchenWallEast);

  // Tường Mặt Tiền (phía Nam) có chừa cửa đi rộng 2.4m, cao 2.8m
  // Vách mặt tiền phía Tây (trái cửa)
  const kitchenWallFrontWest = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 3.6, 0.38),
    matKitchenBrick
  );
  kitchenWallFrontWest.position.set(-3.4, 2.2, 3.61);
  kitchenWallFrontWest.castShadow = true;
  kitchenWallFrontWest.receiveShadow = true;
  kitchenGroup.add(kitchenWallFrontWest);

  // Vách mặt tiền phía Đông (phải cửa)
  const kitchenWallFrontEast = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 3.6, 0.38),
    matKitchenBrick
  );
  kitchenWallFrontEast.position.set(3.4, 2.2, 3.61);
  kitchenWallFrontEast.castShadow = true;
  kitchenWallFrontEast.receiveShadow = true;
  kitchenGroup.add(kitchenWallFrontEast);

  // Lanh-tô trán cửa phía trên (Door Lintel)
  const kitchenDoorLintel = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.8, 0.38),
    matKitchenBrick
  );
  kitchenDoorLintel.position.set(0, 3.6, 3.61);
  kitchenDoorLintel.castShadow = true;
  kitchenGroup.add(kitchenDoorLintel);

  // Khung khuôn cửa gỗ lim (Door jambs & header beam)
  for (const djx of [-1.2, 1.2]) {
    const jamb = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 2.8, 0.42),
      matWoodLim
    );
    jamb.position.set(djx, 1.8, 3.61);
    jamb.castShadow = true;
    kitchenGroup.add(jamb);
  }
  const doorHeader = new THREE.Mesh(
    new THREE.BoxGeometry(2.52, 0.14, 0.44),
    matWoodLim
  );
  doorHeader.position.set(0, 3.2, 3.61);
  kitchenGroup.add(doorHeader);

  // Hai cánh cửa gỗ lim mở xếp đón khách vào trong gian bếp
  const doorL = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 2.65, 0.08),
    matWoodLim
  );
  doorL.position.set(-1.05, 1.75, 3.2);
  doorL.rotation.y = 1.25; // mở gập vào trong
  doorL.castShadow = true;
  kitchenGroup.add(doorL);

  const doorR = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 2.65, 0.08),
    matWoodLim
  );
  doorR.position.set(1.05, 1.75, 3.2);
  doorR.rotation.y = -1.25; // mở gập vào trong
  doorR.castShadow = true;
  kitchenGroup.add(doorR);

  // Cột hiên gỗ lim mặt tiền nhà bếp
  for (const cx of [-4.8, -1.8, 1.8, 4.8]) {
    const kPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.26, 3.6, 10),
      matWoodLim
    );
    kPillar.position.set(cx, 2.2, 4.0);
    kPillar.castShadow = true;
    kitchenGroup.add(kPillar);

    const kPlinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.38, 0.22, 10),
      matStoneGrey
    );
    kPlinth.position.set(cx, 0.51, 4.0);
    kitchenGroup.add(kPlinth);
  }

  // Mái ngói đao cong cổ truyền che phủ nhà bếp
  const kitchenRoof = createStylizedCurvedRoof(13.6, 10.0, matRoofTile);
  kitchenRoof.position.set(0, 4.3, 0);
  kitchenGroup.add(kitchenRoof);

  // --- NỘI THẤT BÊN TRONG NHÀ BẾP (KITCHEN INTERIOR) ---
  // Bàn gỗ sơ chế thức ăn chay thanh tịnh (Vegetable Prep Table)
  const prepTable = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.85, 1.2),
    matWoodLim
  );
  prepTable.position.set(-3.2, 0.825, -1.5);
  prepTable.castShadow = true;
  kitchenGroup.add(prepTable);

  // Thớt gỗ và rổ tre sơ chế đậu phụ, nấm hương
  const kitchenBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.08, 0.45),
    matWoodLim
  );
  kitchenBoard.position.set(-3.4, 1.29, -1.5);
  kitchenGroup.add(kitchenBoard);

  const vegBasket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.28, 0.22, 10),
    new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.85 })
  );
  vegBasket.position.set(-2.4, 1.36, -1.5);
  kitchenGroup.add(vegBasket);

  // Chạn bát đĩa & giá gia vị mộc mạc bên vách Tây
  const cupboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 2.2, 2.6),
    matWoodLim
  );
  cupboard.position.set(-4.9, 1.5, 0.8);
  cupboard.castShadow = true;
  kitchenGroup.add(cupboard);

  // Các bát gốm tráng men mộc trên giá
  for (let b = 0; b < 3; b++) {
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.12, 0.12, 8),
      matLotusPlinth
    );
    bowl.position.set(-4.5, 1.6 + b * 0.45, 0.4 + b * 0.4);
    kitchenGroup.add(bowl);
  }

  // Ghế băng dài gỗ mộc cho sư huynh đệ ngồi lặt rau
  const monkBench = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.45, 0.4),
    matWoodLim
  );
  monkBench.position.set(-3.2, 0.625, 0.2);
  monkBench.castShadow = true;
  kitchenGroup.add(monkBench);

  // Gian bếp lò củi đỏ lửa (Hearth) ở góc Đông bên trong gian bếp
  const hearthBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.85, 2.0),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 })
  );
  hearthBase.position.set(3.8, 0.825, -1.2);
  kitchenGroup.add(hearthBase);

  // Chảo gang đen đặt trên bếp
  const wok = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 12, 8, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.8 })
  );
  wok.position.set(3.8, 1.25, -1.2);
  wok.rotation.x = Math.PI;
  kitchenGroup.add(wok);

  // Ánh lửa than hồng bập bùng trong lò
  const fireGlow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.45, 0.25, 8),
    new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xef4444,
      emissiveIntensity: 0.85,
    })
  );
  fireGlow.position.set(3.8, 0.95, -0.2);
  kitchenGroup.add(fireGlow);

  const kitchenFireLight = new THREE.PointLight(0xf97316, 0.8, 7.0);
  kitchenFireLight.position.set(3.8, 1.2, -0.2);
  nightLightsRef.current.push(kitchenFireLight);
  kitchenGroup.add(kitchenFireLight);

  // Đèn lồng ấm áp thắp sáng bên trong gian bếp
  const kitchenInteriorLight = new THREE.PointLight(0xfef08a, 0.65, 8.5);
  kitchenInteriorLight.position.set(0, 2.8, 0);
  nightLightsRef.current.push(kitchenInteriorLight);
  kitchenGroup.add(kitchenInteriorLight);

  // Ống khói bếp lò bằng đất nung vươn cao qua mái
  const chimney = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.38, 4.8, 10),
    new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.85 })
  );
  chimney.position.set(3.8, 4.6, -1.2);
  chimney.castShadow = true;
  kitchenGroup.add(chimney);

  // Vành nắp che mưa ống khói
  const chimneyCap = new THREE.Mesh(
    new THREE.ConeGeometry(0.58, 0.35, 8),
    new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 0.8 })
  );
  chimneyCap.position.set(3.8, 7.15, -1.2);
  kitchenGroup.add(chimneyCap);

  // Dãy chum gốm sành Bát Tràng muối dưa cà cạnh thềm bếp
  const jarCoords = [
    [-4.8, 0.75, 4.4, 0.38, 0.72],
    [-4.1, 0.70, 4.6, 0.32, 0.62],
    [-5.2, 0.68, 3.6, 0.30, 0.58],
  ];
  const matClayJar = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.7 });
  jarCoords.forEach(([jx, jy, jz, jr, jh]) => {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(jr * 0.7, jr, jh, 10), matClayJar);
    jar.position.set(jx, jy, jz);
    jar.castShadow = true;
    kitchenGroup.add(jar);
    const jarLid = new THREE.Mesh(new THREE.CylinderGeometry(jr * 0.75, jr * 0.72, 0.08, 10), matClayJar);
    jarLid.position.set(jx, jy + jh / 2 + 0.04, jz);
    kitchenGroup.add(jarLid);
  });

  backGardenGroup.add(kitchenGroup);

  // =========================================================================
  // 3. NHÀ KHO CỦI (TIÊU PHÒNG) & BÃI CHẺ CỦI THIỀN MÔN (X_local: -6.5, Z_local: 0.0)
  // Khung cột gỗ nan thưa, chồng củi gỗ xếp ngăn nắp, bệ gỗ chẻ củi và rìu ghim
  // World bounds: X in [-9.2, -3.8], Z in [-52.8, -47.2]
  // =========================================================================
  const woodShedGroup = new THREE.Group();
  woodShedGroup.position.set(-6.5, 0, 0.0);

  // Bệ móng kho củi tôn cao 0.50m
  const woodShedBase = new THREE.Mesh(
    new THREE.BoxGeometry(5.4, 0.30, 5.6),
    matStoneGrey
  );
  woodShedBase.position.set(0, 0.15, 0);
  woodShedBase.receiveShadow = true;
  woodShedGroup.add(woodShedBase);

  // Sàn gỗ mộc kho củi
  const woodShedFloor = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, 0.12, 5.2),
    matWoodLim
  );
  woodShedFloor.position.set(0, 0.36, 0);
  woodShedFloor.receiveShadow = true;
  woodShedGroup.add(woodShedFloor);

  // Khung các cột gỗ lim đỡ mái kho củi
  const shedColCoords = [
    [-2.4, -2.4], [0.0, -2.4], [2.4, -2.4],
    [-2.4, 2.4], [2.4, 2.4],
  ];
  shedColCoords.forEach(([cx, cz]) => {
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.20, 0.22, 3.4, 8),
      matWoodLim
    );
    col.position.set(cx, 2.0, cz);
    col.castShadow = true;
    woodShedGroup.add(col);
  });

  // Vách nan gỗ thông thoáng ở 2 mặt (Bắc sau, Tây trái)
  const matLathWood = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.85 });
  // Vách Bắc (sau)
  for (let lz = 0.8; lz <= 3.2; lz += 0.45) {
    const lathBack = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.18, 0.08), matLathWood);
    lathBack.position.set(0, lz, -2.4);
    woodShedGroup.add(lathBack);
  }
  // Vách Tây (trái)
  for (let lz = 0.8; lz <= 3.2; lz += 0.45) {
    const lathWest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 4.8), matLathWood);
    lathWest.position.set(-2.4, lz, 0);
    woodShedGroup.add(lathWest);
  }

  // Mái che dốc lợp ngói
  const woodShedRoof = createStylizedCurvedRoof(6.6, 6.8, matRoofTile);
  woodShedRoof.position.set(0, 3.8, 0);
  woodShedGroup.add(woodShedRoof);

  // CÁC CHỒNG CỦI XẾP TẦNG NGĂN NẮP (STACKED LOGS)
  const matLogWood = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.9 });
  const matLogCut = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.75 });

  // Chồng củi lớn gian phía sau
  for (let layer = 0; layer < 4; layer++) {
    for (let lx = -1.8; lx <= 1.8; lx += 0.65) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.8, 8), matLogWood);
      log.rotateZ(Math.PI / 2);
      log.position.set(lx, 0.6 + layer * 0.34, -1.6);
      log.castShadow = true;
      woodShedGroup.add(log);
    }
  }

  // Chồng củi bổ khúc gian bên hông
  for (let layer = 0; layer < 3; layer++) {
    for (let lz = -0.6; lz <= 1.2; lz += 0.6) {
      const logSide = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.8, 8), matLogWood);
      logSide.rotateX(Math.PI / 2);
      logSide.position.set(-1.8, 0.58 + layer * 0.32, lz);
      woodShedGroup.add(logSide);
    }
  }

  // BÃI CHẺ CỦI THIỀN MÔN (CHOPPING STATION PROP)
  // Bệ thớt gỗ đại thụ chẻ củi (định vị tại local X = 2.5, Z = 5.0 -> world X = -4.0, Z = -45.0)
  const choppingBlock = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.72, 0.75, 12),
    matLogWood
  );
  choppingBlock.position.set(2.5, 0.55, 5.0);
  choppingBlock.castShadow = true;
  woodShedGroup.add(choppingBlock);

  // Mặt thớt gỗ vân tròn tự nhiên
  const choppingFace = new THREE.Mesh(
    new THREE.CylinderGeometry(0.63, 0.63, 0.05, 12),
    matLogCut
  );
  choppingFace.position.set(2.5, 0.93, 5.0);
  woodShedGroup.add(choppingFace);

  // Khúc củi dựng đứng trên thớt chuẩn bị chẻ
  const targetLog = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.19, 0.65, 8),
    matLogWood
  );
  targetLog.position.set(2.5, 1.28, 5.0);
  woodShedGroup.add(targetLog);

  // Rìu sắt cán gỗ ghim sâu trên đầu khúc củi
  const axeHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.85, 6),
    matWoodLim
  );
  axeHandle.rotation.z = Math.PI / 4;
  axeHandle.position.set(2.75, 1.75, 5.0);
  woodShedGroup.add(axeHandle);

  const axeBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.14, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x4b5563, metalness: 0.85, roughness: 0.3 })
  );
  axeBlade.position.set(2.52, 1.58, 5.0);
  woodShedGroup.add(axeBlade);

  // Vài mảnh củi chẻ văng quanh chân thớt
  for (let sp = 0; sp < 4; sp++) {
    const ang = (sp / 4) * Math.PI * 2;
    const splitWood = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.45), matLogCut);
    splitWood.position.set(2.5 + Math.cos(ang) * 1.1, 0.24, 5.0 + Math.sin(ang) * 0.9);
    splitWood.rotation.y = ang + 0.3;
    woodShedGroup.add(splitWood);
  }

  // Đèn lồng treo góc kho củi thắp sáng ban đêm
  const shedLantern = createStylizedStoneLantern(matStoneGrey);
  shedLantern.position.set(2.4, 0.4, 2.5);
  woodShedGroup.add(shedLantern);

  const shedLight = new THREE.PointLight(0xf59e0b, 0.6, 6.0);
  shedLight.position.set(2.4, 1.8, 2.5);
  nightLightsRef.current.push(shedLight);
  woodShedGroup.add(shedLight);
  woodShedGroup.add(shedLight);

  backGardenGroup.add(woodShedGroup);

  // =========================================================================
  // 4. GIẾNG NGỌC CỔ (TỊNH THỦY TUYỀN) - CÁNH ĐÔNG BẮC (X_local: 12.0, Z_local: 4.0)
  // World: X = 12.0, Z = -46.0. Thành đá xanh bát giác chạm sen, ròng rọc múc nước, nước ngọc bích
  // =========================================================================
  const wellGroup = new THREE.Group();
  wellGroup.position.set(12.0, 0, 4.0);

  // Bệ đá bát giác tôn cao 0.46m
  const wellPlatform = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 3.5, 0.26, 8),
    matStoneGrey
  );
  wellPlatform.position.set(0, 0.13, 0);
  wellPlatform.receiveShadow = true;
  wellGroup.add(wellPlatform);

  // Bậc đá bước lên thềm giếng
  const wellStep = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.14, 0.9),
    matStoneGrey
  );
  wellStep.position.set(0, 0.07, 3.6);
  wellGroup.add(wellStep);

  // Thành giếng đá xanh cổ rêu phong hình bát giác (bán kính ngoài 1.65m, cao 1.1m)
  const wellRim = new THREE.Mesh(
    new THREE.CylinderGeometry(1.65, 1.75, 1.1, 8),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 })
  );
  wellRim.position.set(0, 0.81, 0);
  wellRim.castShadow = true;
  wellRim.receiveShadow = true;
  wellGroup.add(wellRim);

  // Lòng giếng đá sâu hun hút
  const wellInner = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.25, 1.2, 16, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95, side: THREE.BackSide })
  );
  wellInner.position.set(0, 0.81, 0);
  wellGroup.add(wellInner);

  // Gờ đá chạm cánh sen bao quanh miệng giếng
  const wellTrim = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.14, 8, 8),
    matLotusPlinth
  );
  wellTrim.rotateX(Math.PI / 2);
  wellTrim.position.set(0, 1.36, 0);
  wellGroup.add(wellTrim);

  // Mặt nước Giếng Ngọc xanh biếc ngọc bích trong veo (Jade Emerald)
  const matWellWater = new THREE.MeshStandardMaterial({
    color: 0x0d9488,
    emissive: 0x042f2e,
    emissiveIntensity: 0.35,
    roughness: 0.05,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
  });
  const wellWater = new THREE.Mesh(new THREE.CircleGeometry(1.24, 16), matWellWater);
  wellWater.rotateX(-Math.PI / 2);
  wellWater.position.set(0, 0.35, 0);
  wellGroup.add(wellWater);

  // Vòng sóng nước lăn tăn phản chiếu bầu trời
  const wellRipple = new THREE.Mesh(
    new THREE.RingGeometry(0.4, 0.55, 16),
    new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
  );
  wellRipple.rotateX(-Math.PI / 2);
  wellRipple.position.set(0, 0.352, 0);
  wellGroup.add(wellRipple);

  // 2 Cột trụ gỗ lim đỡ xà ròng rọc giếng
  for (const wx of [-1.55, 1.55]) {
    const wPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.18, 2.5, 8),
      matWoodLim
    );
    wPost.position.set(wx, 1.5, 0);
    wPost.castShadow = true;
    wellGroup.add(wPost);

    const wPlinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.28, 0.22, 8),
      matStoneGrey
    );
    wPlinth.position.set(wx, 0.37, 0);
    wellGroup.add(wPlinth);
  }

  // Xà ngang gỗ lim vắt ngang đỉnh 2 cột
  const wBeam = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.22, 0.24),
    matWoodLim
  );
  wBeam.position.set(0, 2.75, 0);
  wBeam.castShadow = true;
  wellGroup.add(wBeam);

  // Ròng rọc gỗ quay dây múc nước ở giữa xà
  const pulleyWheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.14, 12),
    matWoodLim
  );
  pulleyWheel.rotateZ(Math.PI / 2);
  pulleyWheel.position.set(0, 2.55, 0);
  wellGroup.add(pulleyWheel);

  // Dây thừng nâu quấn qua ròng rọc buông xuống
  const rope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 1.4, 6),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 })
  );
  rope.position.set(0, 1.85, 0);
  wellGroup.add(rope);

  // Gàu đồng múc nước treo lơ lửng miệng giếng
  const bucket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.20, 0.38, 10),
    matBronze
  );
  bucket.position.set(0, 1.15, 0);
  bucket.castShadow = true;
  wellGroup.add(bucket);

  // Thùng gỗ chứa nước sạch bên cạnh thềm giếng
  const tub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.55, 0.65, 12),
    matWoodLim
  );
  tub.position.set(2.4, 0.58, 1.2);
  tub.castShadow = true;
  wellGroup.add(tub);

  // Đèn lồng đá hoa sen thắp sáng cạnh giếng ngọc
  const wellLantern = createStylizedStoneLantern(matStoneGrey);
  wellLantern.position.set(-2.4, 0.26, 2.4);
  wellGroup.add(wellLantern);

  const wellLight = new THREE.PointLight(0xfacc15, 0.6, 6.0);
  wellLight.position.set(-2.4, 1.6, 2.4);
  nightLightsRef.current.push(wellLight);
  wellGroup.add(wellLight);

  backGardenGroup.add(wellGroup);

  // =========================================================================
  // 5. HÀNG TRÚC HÀNG TRE (THANH TRÚC UYỂN) - HAI RẶNG TRÚC THẲNG TẮP
  // Chạy dọc theo hai bên lối đi chính:
  // Hàng Tây: X_local = -5.2, Z_local in [-4, 16] (world X = -5.2, Z in [-54, -34])
  // Hàng Đông: X_local = +5.2, Z_local in [-4, 16] (world X = +5.2, Z in [-54, -34])
  // =========================================================================
  const matCulmGreen = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.6 });
  const matCulmYellow = new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.65 });
  const matLeafLush = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.75 });
  const matLeafBright = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.7 });

  const createBambooClump = (bx: number, bz: number, clumpSeed: number) => {
    const clumpGroup = new THREE.Group();
    clumpGroup.position.set(bx, 0, bz);

    // Mỗi khóm gồm 3-4 thân trúc mảnh khảnh vươn cao
    const subStems = [
      { ox: 0, oz: 0, h: 8.5 + (clumpSeed % 3) * 0.6, r: 0.14 },
      { ox: 0.35, oz: -0.25, h: 7.8 + (clumpSeed % 2) * 0.8, r: 0.12 },
      { ox: -0.3, oz: 0.3, h: 9.0 + (clumpSeed % 4) * 0.5, r: 0.15 },
    ];

    subStems.forEach((st, idx) => {
      const stemMat = (idx + clumpSeed) % 2 === 0 ? matCulmGreen : matCulmYellow;
      const culm = new THREE.Mesh(
        new THREE.CylinderGeometry(st.r * 0.85, st.r, st.h, 6),
        stemMat
      );
      culm.position.set(st.ox, st.h / 2, st.oz);
      culm.castShadow = true;
      clumpGroup.add(culm);

      // Các đốt trúc vàng điểm xuyết
      for (let ringY = 1.6; ringY < st.h - 1.5; ringY += 1.4) {
        const ring = new THREE.Mesh(
          new THREE.CylinderGeometry(st.r * 1.1, st.r * 1.1, 0.08, 6),
          matCulmYellow
        );
        ring.position.set(st.ox, ringY, st.oz);
        clumpGroup.add(ring);
      }

      // Tán lá trúc hình cầu xếp dẹt thành 2 tầng
      const leafMat = idx % 2 === 0 ? matLeafLush : matLeafBright;
      const leafTop = new THREE.Mesh(new THREE.SphereGeometry(1.6, 6, 6), leafMat);
      leafTop.scale.set(1.4, 0.6, 1.4);
      leafTop.position.set(st.ox, st.h - 0.2, st.oz);
      clumpGroup.add(leafTop);

      const leafMid = new THREE.Mesh(new THREE.SphereGeometry(1.3, 6, 6), leafMat);
      leafMid.scale.set(1.3, 0.5, 1.3);
      leafMid.position.set(st.ox + 0.2, st.h - 1.8, st.oz - 0.1);
      clumpGroup.add(leafMid);
    });

    backGardenGroup.add(clumpGroup);
    bambooCulms.push(clumpGroup);
  };

  // Trồng rặng trúc hai bên trục đường chính, mở lối thông thoáng ở giữa dẫn sang Bếp và Giếng
  let seed = 0;
  // Hàng Tây (X_local = -5.2): Chừa lối ngang Z_local in [1.0, 5.2] (5m) dẫn vào Bếp Chùa & Kho Củi
  for (let zPos = -3.0; zPos <= 15.0; zPos += 2.4) {
    if (zPos >= 1.0 && zPos <= 5.2) continue; // Mở cổng thông thoáng dẫn sang cánh Tây
    createBambooClump(-5.2, zPos, seed++);
  }
  // Hàng Đông (X_local = +5.2): Chừa lối ngang Z_local in [1.0, 5.2] (5m) dẫn vào Giếng Ngọc Cổ
  for (let zPos = -3.0; zPos <= 15.0; zPos += 2.4) {
    if (zPos >= 1.0 && zPos <= 5.2) continue; // Mở cổng thông thoáng dẫn sang cánh Đông
    createBambooClump(5.2, zPos, seed++);
  }

  // Rặng trúc bao bọc thêm phía sau nhà kho và tường bao Bắc
  const backFringe = [-12, -8, -1, 3, 18, 22];
  backFringe.forEach((fx) => {
    createBambooClump(fx, -5.5, seed++);
  });

  // LỐI ĐI BƯỚC DẠO GIỮA CÁC HÀNG TRE TRÚC (STEPPING STONE TRAILS THROUGH BAMBOO GROVES)
  // Tuyến đá cuội tự nhiên dạo bước luồn lách giữa rặng trúc bên Tây (X = -7.2)
  for (let zWalk = -3.0; zWalk <= 15.0; zWalk += 2.2) {
    if (zWalk >= 1.2 && zWalk <= 5.0) continue; // Chừa giao lộ đường ngang
    const stepStone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.56, 0.64, 0.08, 9),
      matStoneGrey
    );
    stepStone.position.set(-7.2 + Math.sin(zWalk * 0.8) * 0.35, 0.22, zWalk);
    stepStone.receiveShadow = true;
    backGardenGroup.add(stepStone);
  }

  // Tuyến đá cuội tự nhiên dạo bước luồn lách giữa rặng trúc bên Đông (X = +7.2)
  for (let zWalk = -3.0; zWalk <= 15.0; zWalk += 2.2) {
    if (zWalk >= 1.2 && zWalk <= 5.0) continue; // Chừa giao lộ đường ngang
    const stepStone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.56, 0.64, 0.08, 9),
      matStoneGrey
    );
    stepStone.position.set(7.2 + Math.sin(zWalk * 0.8) * 0.35, 0.22, zWalk);
    stepStone.receiveShadow = true;
    backGardenGroup.add(stepStone);
  }

  // Lối dạo phụ bằng đá bước dạo ngang qua trục trung tâm ở phía Nam (Z_local = 11.0, World Z = -39.0)
  for (let sx = -7.2; sx <= 7.2; sx += 1.8) {
    if (Math.abs(sx) < 2.2) continue; // Tránh đè lên trục đường chính
    const crossStep = new THREE.Mesh(
      new THREE.CylinderGeometry(0.54, 0.62, 0.08, 8),
      matStoneGrey
    );
    crossStep.position.set(sx, 0.22, 11.0);
    crossStep.receiveShadow = true;
    backGardenGroup.add(crossStep);
  }

  // Đèn đá sân vườn hoa sen thắp sáng lối đi dạo và các ngã rẽ vào Bếp & Giếng
  const lanternConfigs = [
    // Lối đi chính trục Nam
    { x: -3.6, z: 12.0 },
    { x: 3.6, z: 12.0 },
    // Trụ cổng ngã rẽ sang Bếp Chùa & Giếng Cổ
    { x: -3.8, z: 5.4 },
    { x: -3.8, z: 0.8 },
    { x: 3.8, z: 5.4 },
    { x: 3.8, z: 0.8 },
    // Sâu phía Bắc
    { x: -3.6, z: -2.0 },
    { x: 3.6, z: -2.0 },
  ];
  lanternConfigs.forEach((cfg) => {
    const lantern = createStylizedStoneLantern(matStoneGrey);
    lantern.position.set(cfg.x, 0.19, cfg.z);
    backGardenGroup.add(lantern);

    const light = new THREE.PointLight(0xf59e0b, 0.55, 5.5);
    light.position.set(cfg.x, 1.5, cfg.z);
    nightLightsRef.current.push(light);
    backGardenGroup.add(light);
  });

  // =========================================================================
  // 6. HIỆU ỨNG KHÓI LAM CHIỀU TỎA RA TỪ ỐNG KHÓI BẾP LÒ (THREE.Points)
  // =========================================================================
  const smokeCount = 45;
  const smokeGeo = new THREE.BufferGeometry();
  const smokePos = new Float32Array(smokeCount * 3);
  for (let s = 0; s < smokeCount; s++) {
    smokePos[s * 3] = -12.7 + (Math.random() - 0.5) * 0.8;
    smokePos[s * 3 + 1] = 7.2 + Math.random() * 6.5;
    smokePos[s * 3 + 2] = -0.2 + (Math.random() - 0.5) * 0.8;
  }
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
  const kitchenSmoke = new THREE.Points(
    smokeGeo,
    new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 1.6,
      transparent: true,
      opacity: 0.38,
    })
  );
  backGardenGroup.add(kitchenSmoke);

  return {
    group: backGardenGroup,
    bambooCulms,
    kitchenSmoke,
    woodStationAnchor: new THREE.Vector3(-4.0, 0.50, -45.0),
    wellStationAnchor: new THREE.Vector3(12.0, 0.46, -43.5),
  };
}

