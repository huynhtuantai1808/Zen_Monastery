import React from 'react';
import * as THREE from 'three';
import {
  createSweepingHallRoof,
  createJadeCurvedRoof,
  createStylizedSilkLantern
} from './environmentProps';
import {
  createCoupletTexture,
  createDaiHungBaoDienPlaqueTexture,
  createSideCalligraphyPlaqueTexture,
  createIncenseSignTexture,
  createAbbotFaceTexture,
  getSharedTexture
} from '../textures';

export function createAuthenticDaiHungBaoDien(
  matJadeTile: THREE.Material,
  matAmberWood: THREE.Material,
  matDarkTimber: THREE.Material,
  matLotusPlinth: THREE.Material,
  matStone: THREE.Material,
  matFloorBrick: THREE.Material,
  matGold: THREE.Material,
  matLanternRed: THREE.Material,
  sanctuaryRoofsRef: React.MutableRefObject<THREE.Group[]>,
  nightLightsRef: React.MutableRefObject<THREE.PointLight[]>
): {
  group: THREE.Group;
  abbotNpc: {
    group: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    armR: THREE.Group;
    armL: THREE.Group;
    halo: THREE.Mesh;
    beads: THREE.Group;
  };
  incenseSmoke: THREE.Mesh[];
} {
  const mainHall = new THREE.Group();
  mainHall.position.set(0, 0, -16);

  // 1. MASSIVE STONE PODIUM (BỆ TAM CẤP CAO RÁO)
  // Lower Podium Base
  const podiumBase = new THREE.Mesh(new THREE.BoxGeometry(46, 1.6, 34), matLotusPlinth);
  podiumBase.position.set(0, 0.8, 0);
  podiumBase.receiveShadow = true;
  mainHall.add(podiumBase);

  // Upper Terrace Platform (at Y = 3.2m)
  const podiumTop = new THREE.Mesh(new THREE.BoxGeometry(43, 1.6, 31), matFloorBrick);
  podiumTop.position.set(0, 2.4, 0);
  podiumTop.receiveShadow = true;
  mainHall.add(podiumTop);

  // Perimeter Stone Balustrade on Terrace (Lan can đá quanh sân thượng)
  const balustradeGroup = new THREE.Group();
  const frontBalustradeSegments = [
    { x: -14.5, w: 7.5 },
    { x: -4.5, w: 3.5 },
    { x: 4.5, w: 3.5 },
    { x: 14.5, w: 7.5 },
  ];
  frontBalustradeSegments.forEach((seg) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(seg.w, 0.9, 0.28), matStone);
    rail.position.set(seg.x, 3.65, 15.2);
    balustradeGroup.add(rail);

    for (let px = -seg.w / 2; px <= seg.w / 2; px += 2.0) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.1, 0.32), matStone);
      post.position.set(seg.x + px, 3.75, 15.2);
      balustradeGroup.add(post);

      const bud = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 6), matGold);
      bud.position.set(seg.x + px, 4.4, 15.2);
      balustradeGroup.add(bud);
    }
  });

  for (const sx of [-21.4, 21.4]) {
    const sideRail = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.9, 28), matStone);
    sideRail.position.set(sx, 3.65, 0);
    balustradeGroup.add(sideRail);
  }
  mainHall.add(balustradeGroup);

  // 2. THREE PARALLEL GRAND STAIRCASES (TAM CẤP TIỀN ĐIỆN)
  const stairFlightConfigs = [
    { x: 0, width: 4.8, isCenter: true },
    { x: -8.8, width: 3.2, isCenter: false },
    { x: 8.8, width: 3.2, isCenter: false },
  ];

  stairFlightConfigs.forEach((st) => {
    const flightGroup = new THREE.Group();
    flightGroup.position.set(st.x, 0, 15.5);

    const numSteps = 10;
    const stepDepth = 0.65;
    const stepHeight = 0.32;

    for (let s = 0; s < numSteps; s++) {
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(st.width, stepHeight, stepDepth + 0.05),
        matStone
      );
      stepMesh.position.set(0, (s + 0.5) * stepHeight, (numSteps - 1 - s) * stepDepth);
      stepMesh.receiveShadow = true;
      flightGroup.add(stepMesh);
    }

    // Flanking Carved Stone Dragon / Cloud Balustrade Ramps
    for (const rx of [-st.width / 2 - 0.2, st.width / 2 + 0.2]) {
      const rampLength = Math.hypot(numSteps * stepDepth, numSteps * stepHeight);
      const ramp = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.65, rampLength), matStone);
      ramp.position.set(rx, (numSteps * stepHeight) / 2 + 0.35, (numSteps * stepDepth) / 2);
      ramp.rotation.x = Math.atan2(numSteps * stepHeight, numSteps * stepDepth);
      flightGroup.add(ramp);

      const dragonHead = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.7, 0.65), matStone);
      dragonHead.position.set(rx, 0.45, numSteps * stepDepth + 0.2);
      flightGroup.add(dragonHead);
    }

    mainHall.add(flightGroup);
  });

  // 3. TWO FLANKING SIDE PAVILIONS (ĐÌNH TẢ & ĐÌNH HỮU THEO BẢN VẼ)
  const pavilionConfigs = [
    { x: -19.5, z: 12.5 },
    { x: 19.5, z: 12.5 },
  ];

  pavilionConfigs.forEach((pav) => {
    const pavGroup = new THREE.Group();
    pavGroup.position.set(pav.x, 3.2, pav.z);

    const colDist = 2.4;
    for (const cx of [-colDist, colDist]) {
      for (const cz of [-colDist, colDist]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 5.0, 8), matDarkTimber);
        col.position.set(cx, 2.5, cz);
        col.castShadow = true;
        pavGroup.add(col);
      }
    }

    const pavRoof = createJadeCurvedRoof(7.2, 7.2, 2.8, matJadeTile, matGold);
    pavRoof.position.set(0, 5.0, 0);
    sanctuaryRoofsRef.current.push(pavRoof);
    pavGroup.add(pavRoof);

    // Stone Steps leading down to side courtyard
    for (let st = 0; st < 8; st++) {
      const sMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 0.6), matStone);
      const sideDir = pav.x < 0 ? -1 : 1;
      sMesh.position.set(sideDir * (colDist + 1.2 + st * 0.55), -(st + 0.5) * 0.38, 0);
      pavGroup.add(sMesh);
    }

    mainHall.add(pavGroup);
  });

  // 4. MAIN SANCTUARY BUILDING BODY (TIỀN ĐƯỜNG & HẬU CUNG - NÂNG CAO TRẦN NHÀ THÔNG THOÁNG 10.5M)
  const hallBodyGroup = new THREE.Group();
  hallBodyGroup.position.set(0, 3.2, 0);

  const bodyW = 32;
  const bodyD = 22;
  const bodyH = 10.5; // Nâng trần cao từ 6.8m lên 10.5m để không che khuất đầu và vầng hào quang tượng Phật

  const wallBack = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, 0.5), matAmberWood);
  wallBack.position.set(0, bodyH / 2, -bodyD / 2);
  hallBodyGroup.add(wallBack);

  const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, bodyH, bodyD), matAmberWood);
  wallLeft.position.set(-bodyW / 2, bodyH / 2, 0);
  hallBodyGroup.add(wallLeft);

  const wallRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, bodyH, bodyD), matAmberWood);
  wallRight.position.set(bodyW / 2, bodyH / 2, 0);
  hallBodyGroup.add(wallRight);

  // 4.1. HỆ CỘT HIÊN TIỀN ĐIỆN VÀ MẶT TIỀN CỬA BỨC BÀN TRUYỀN THỐNG VIỆT NAM
  const verandaColCoords = [-12.6, -7.5, -2.6, 2.6, 7.5, 12.6];
  verandaColCoords.forEach((vx) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, bodyH + 0.5, 12), matDarkTimber);
    col.position.set(vx, (bodyH + 0.5) / 2, bodyD / 2 + 1.8);
    col.castShadow = true;
    hallBodyGroup.add(col);

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.75, 0.35, 12), matLotusPlinth);
    plinth.position.set(vx, 0.175, bodyD / 2 + 1.8);
    hallBodyGroup.add(plinth);
  });

  // Xà hiên đỡ mái tiền điện
  const verandaBeam = new THREE.Mesh(new THREE.BoxGeometry(bodyW + 2, 0.45, 0.50), matDarkTimber);
  verandaBeam.position.set(0, bodyH + 0.1, bodyD / 2 + 1.8);
  hallBodyGroup.add(verandaBeam);

  // 4.2. KHUNG VÁCH MẶT TIỀN & XÀ NÁCH (Front Facade Frame at Z = bodyD / 2)
  const frontZ = bodyD / 2;

  // Xà hạ / Ngưỡng cửa gỗ lim hai bên
  const sillLeft = new THREE.Mesh(new THREE.BoxGeometry((bodyW - 5.2) / 2, 0.16, 0.32), matDarkTimber);
  sillLeft.position.set(-(bodyW + 5.2) / 4, 0.08, frontZ);
  hallBodyGroup.add(sillLeft);

  const sillRight = new THREE.Mesh(new THREE.BoxGeometry((bodyW - 5.2) / 2, 0.16, 0.32), matDarkTimber);
  sillRight.position.set((bodyW + 5.2) / 4, 0.08, frontZ);
  hallBodyGroup.add(sillRight);

  // Gờ chỉ đồng phẳng mịn ngưỡng cửa gian giữa đón khách
  const sillCenter = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.02, 0.32), matGold);
  sillCenter.position.set(0, 0.01, frontZ);
  hallBodyGroup.add(sillCenter);

  // Xà đai trên cao (Lintel beam trên các bộ cửa)
  const frontLintel = new THREE.Mesh(new THREE.BoxGeometry(bodyW, 0.42, 0.45), matDarkTimber);
  frontLintel.position.set(0, 5.0, frontZ);
  hallBodyGroup.add(frontLintel);

  // Cổ diêm thượng song con tiện gỗ lấy sáng cao ráo (Clerestory Transom Lattice from Y = 5.2 to bodyH)
  for (let tx = -14.0; tx <= 14.0; tx += 0.45) {
    const transomBar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, bodyH - 5.3, 6), matAmberWood);
    transomBar.position.set(tx, (5.2 + bodyH) / 2, frontZ);
    hallBodyGroup.add(transomBar);
  }

  // Cột cái mặt tiền chia thành 5 gian truyền thống
  const frontPillarsX = [-13.0, -7.6, -2.6, 2.6, 7.6, 13.0];
  frontPillarsX.forEach((px) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.58, bodyH, 14), matDarkTimber);
    pillar.position.set(px, bodyH / 2, frontZ);
    pillar.castShadow = true;
    hallBodyGroup.add(pillar);

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.76, 0.32, 14), matLotusPlinth);
    plinth.position.set(px, 0.16, frontZ);
    hallBodyGroup.add(plinth);
  });

  // Tường gỗ hai đầu hồi ngoài cùng
  for (const side of [-1, 1]) {
    const endWall = new THREE.Mesh(new THREE.BoxGeometry(3.0, bodyH, 0.28), matAmberWood);
    endWall.position.set(side * 14.5, bodyH / 2, frontZ);
    hallBodyGroup.add(endWall);
  }

  // Hàm tạo cánh Cửa Bức Bàn Thượng Song Hạ Bản truyền thống
  const createBucBanDoorLeaf = (width: number, height: number) => {
    const leaf = new THREE.Group();
    const frameThickness = 0.08;
    const frameBorder = 0.10;

    for (const sx of [-width / 2 + frameBorder / 2, width / 2 - frameBorder / 2]) {
      const stile = new THREE.Mesh(new THREE.BoxGeometry(frameBorder, height, frameThickness), matDarkTimber);
      stile.position.set(sx, height / 2, 0);
      leaf.add(stile);
    }
    const railTop = new THREE.Mesh(new THREE.BoxGeometry(width, frameBorder, frameThickness), matDarkTimber);
    railTop.position.set(0, height - frameBorder / 2, 0);
    leaf.add(railTop);

    const railMid = new THREE.Mesh(new THREE.BoxGeometry(width, frameBorder * 1.2, frameThickness), matDarkTimber);
    railMid.position.set(0, height * 0.42, 0);
    leaf.add(railMid);

    const railBot = new THREE.Mesh(new THREE.BoxGeometry(width, frameBorder * 1.4, frameThickness), matDarkTimber);
    railBot.position.set(0, frameBorder * 0.7, 0);
    leaf.add(railBot);

    // THƯỢNG SONG: Chấn song con tiện gỗ tròn thông thoáng đón ánh nắng sân chùa
    const upperH = height * 0.54;
    const upperY = height * 0.70;
    const numBars = Math.floor(width / 0.12);
    for (let b = 1; b < numBars; b++) {
      const bx = -width / 2 + (b / numBars) * width;
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, upperH - 0.05, 8), matAmberWood);
      bar.position.set(bx, upperY, 0);
      leaf.add(bar);
    }

    // HẠ BẢN: Pa-nô gỗ lim chạm nổi hoa sen
    const lowerH = height * 0.38;
    const lowerY = height * 0.22;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(width - frameBorder * 2, lowerH, frameThickness * 0.8), matAmberWood);
    panel.position.set(0, lowerY, 0);
    leaf.add(panel);

    const lotusBoss = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), matGold);
    lotusBoss.position.set(0, lowerY, frameThickness * 0.5);
    leaf.add(lotusBoss);

    const ringKnocker = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.016, 6, 12), matGold);
    ringKnocker.position.set(width * 0.26, height * 0.44, frameThickness * 0.55);
    leaf.add(ringKnocker);

    return leaf;
  };

  // 1. CỬA GIAN CHÍNH GIỮA (Lối vào mở toang đón khách thập phương)
  const doorLeafW = 0.58;
  const doorLeafH = 4.75;

  const leftFoldGroup = new THREE.Group();
  leftFoldGroup.position.set(-2.55, 0.18, frontZ);
  leftFoldGroup.rotation.y = -Math.PI / 2 + 0.15;
  const leafL1 = createBucBanDoorLeaf(doorLeafW, doorLeafH);
  leafL1.position.set(doorLeafW / 2, 0, 0);
  leftFoldGroup.add(leafL1);
  const leafL2 = createBucBanDoorLeaf(doorLeafW, doorLeafH);
  leafL2.position.set(doorLeafW * 1.5, 0, 0.08);
  leafL2.rotation.y = 0.1;
  leftFoldGroup.add(leafL2);
  hallBodyGroup.add(leftFoldGroup);

  const rightFoldGroup = new THREE.Group();
  rightFoldGroup.position.set(2.55, 0.18, frontZ);
  rightFoldGroup.rotation.y = Math.PI / 2 - 0.15;
  const leafR1 = createBucBanDoorLeaf(doorLeafW, doorLeafH);
  leafR1.position.set(-doorLeafW / 2, 0, 0);
  rightFoldGroup.add(leafR1);
  const leafR2 = createBucBanDoorLeaf(doorLeafW, doorLeafH);
  leafR2.position.set(-doorLeafW * 1.5, 0, 0.08);
  leafR2.rotation.y = -0.1;
  rightFoldGroup.add(leafR2);
  hallBodyGroup.add(rightFoldGroup);

  // 2. CỬA GIAN TẢ VÀ GIAN HỮU
  for (const side of [-1, 1]) {
    const bayCenterX = side * 5.1;
    const sideDoorW = 0.62;

    const dLeafOut = createBucBanDoorLeaf(sideDoorW, doorLeafH);
    dLeafOut.position.set(bayCenterX - side * sideDoorW * 1.45, 0.18, frontZ);
    dLeafOut.rotation.y = side * 0.12;
    hallBodyGroup.add(dLeafOut);

    const openGroup = new THREE.Group();
    openGroup.position.set(bayCenterX - side * sideDoorW * 0.5, 0.18, frontZ);
    openGroup.rotation.y = side * 1.05;
    const dLeafOpen = createBucBanDoorLeaf(sideDoorW, doorLeafH);
    dLeafOpen.position.set((side * sideDoorW) / 2, 0, 0);
    openGroup.add(dLeafOpen);
    hallBodyGroup.add(openGroup);

    const openGroup2 = new THREE.Group();
    openGroup2.position.set(bayCenterX + side * sideDoorW * 0.5, 0.18, frontZ);
    openGroup2.rotation.y = -side * 0.95;
    const dLeafOpen2 = createBucBanDoorLeaf(sideDoorW, doorLeafH);
    dLeafOpen2.position.set((-side * sideDoorW) / 2, 0, 0);
    openGroup2.add(dLeafOpen2);
    hallBodyGroup.add(openGroup2);

    const dLeafIn = createBucBanDoorLeaf(sideDoorW, doorLeafH);
    dLeafIn.position.set(bayCenterX + side * sideDoorW * 1.45, 0.18, frontZ);
    dLeafIn.rotation.y = -side * 0.12;
    hallBodyGroup.add(dLeafIn);
  }

  // 3. GIAN CHÁI TẢ & HỮU
  for (const side of [-1, 1]) {
    const bayOuterX = side * 10.3;
    const winWidth = 4.8;

    const wPanel = new THREE.Mesh(new THREE.BoxGeometry(winWidth, 1.8, 0.16), matAmberWood);
    wPanel.position.set(bayOuterX, 0.9 + 0.18, frontZ);
    hallBodyGroup.add(wPanel);

    for (let wx = bayOuterX - winWidth / 2 + 0.2; wx <= bayOuterX + winWidth / 2 - 0.2; wx += 0.22) {
      const wBar = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 2.6, 8), matAmberWood);
      wBar.position.set(wx, 3.4, frontZ);
      hallBodyGroup.add(wBar);
    }
  }

  // Clerestory Upper Wall (Cổ diêm lấy sáng trên cao)
  const clerestory = new THREE.Mesh(new THREE.BoxGeometry(26, 3.2, 18), matAmberWood);
  clerestory.position.set(0, bodyH + 1.6, -1.0);
  hallBodyGroup.add(clerestory);

  // 5. MULTI-TIER INTERLOCKING ROOFS ("TRÙNG THIỀM ĐIỆP ỐC" NÂNG CAO)
  // Roof 1: Lower Front & Side Sweeping Flared Roof
  const roof1Group = createSweepingHallRoof(38, 28, 4.2, matJadeTile, matGold);
  roof1Group.position.set(0, bodyH + 0.2, 1.0);
  sanctuaryRoofsRef.current.push(roof1Group);
  hallBodyGroup.add(roof1Group);

  // Roof 2: Upper Clerestory Stepped Roof
  const roof2Group = createSweepingHallRoof(28, 20, 3.8, matJadeTile, matGold);
  roof2Group.position.set(0, bodyH + 3.4, -1.0);
  sanctuaryRoofsRef.current.push(roof2Group);
  hallBodyGroup.add(roof2Group);

  // Roof 3: Rear High Sanctuary Crown Tower (Lầu Nóc Hậu Cung)
  const crownTower = new THREE.Group();
  crownTower.position.set(0, bodyH + 4.0, -4.5);

  const crownBody = new THREE.Mesh(new THREE.BoxGeometry(16, 3.2, 14), matAmberWood);
  crownBody.position.set(0, 1.6, 0);
  crownTower.add(crownBody);

  const crownRoof = createJadeCurvedRoof(18.5, 16.5, 4.0, matJadeTile, matGold);
  crownRoof.position.set(0, 3.2, 0);
  sanctuaryRoofsRef.current.push(crownRoof);
  crownTower.add(crownRoof);

  const crownSpire = new THREE.Mesh(new THREE.ConeGeometry(0.65, 3.0, 8), matGold);
  crownSpire.position.set(0, 7.5, 0);
  crownTower.add(crownSpire);

  hallBodyGroup.add(crownTower);

  // 6. GRAND INTERIOR (NỘI THẤT ĐẠI HÙNG BẢO ĐIỆN THEO HÌNH ẢNH MẪU PHÁT THẢO)
  const matRedCarpet = new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.85 });
  const matCarpetBorder = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.45, metalness: 0.6 });
  const matIncenseTable = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
  const matCushionRed = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 });
  const matBronzeCauldron = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.35, metalness: 0.75 });

  // 6.1. THẢM NHUNG ĐỎ HOA VĂN HOÀNG GIA TRẢI DỌC LINH ĐẠO CHÍNH ĐIỆN
  const carpetBorder = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.02, 17.6), matCarpetBorder);
  carpetBorder.position.set(0, 0.01, 1.0);
  hallBodyGroup.add(carpetBorder);

  const mainCarpet = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.025, 17.2), matRedCarpet);
  mainCarpet.position.set(0, 0.02, 1.0);
  hallBodyGroup.add(mainCarpet);

  const censerRug = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.03, 3.2), matCarpetBorder);
  censerRug.position.set(0, 0.025, 0.5);
  hallBodyGroup.add(censerRug);

  // 6.2. CỘT CÁI GỖ LIM & CÂU ĐỐI LÒNG MÁNG THẾP VÀNG CHỮ HÁN
  const colCoordsSanctuary = [
    [-3.5, -1.2], [3.5, -1.2],
    [-3.5, 5.2], [3.5, 5.2],
  ];
  colCoordsSanctuary.forEach(([cx, cz], idx) => {
    // 4 Cột cái gỗ lim tròn bóng bẩy vươn cao 10.5m
    const pillarLim = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.62, bodyH, 16), matDarkTimber);
    pillarLim.position.set(cx, bodyH / 2, cz);
    pillarLim.castShadow = true;
    hallBodyGroup.add(pillarLim);

    // Chân tảng đá hoa sen
    const pPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.80, 0.35, 16), matLotusPlinth);
    pPlinth.position.set(cx, 0.175, cz);
    hallBodyGroup.add(pPlinth);

    // Ốp đôi câu đối thếp vàng chữ Hán trên 2 Cột Cái trước bàn thờ
    if (cz < 0) {
      const isLeftCol = idx === 0;
      const coupletText = isLeftCol ? '佛日增輝法輪常轉' : '法雲普潤慧炬長明';
      const matCouplet = new THREE.MeshStandardMaterial({
        map: getSharedTexture('couplet_' + coupletText, () => createCoupletTexture(coupletText)),
        roughness: 0.35,
        metalness: 0.25,
      });

      const cWidth = 0.58;
      const cHeight = 6.2;

      // Bản gỗ lót viền son phía sau
      const panelBack = new THREE.Mesh(new THREE.BoxGeometry(cWidth + 0.08, cHeight + 0.1, 0.05), matDarkTimber);
      panelBack.position.set(cx + (isLeftCol ? 0.36 : -0.36), 4.5, cz + 0.32);
      panelBack.rotation.y = isLeftCol ? -0.32 : 0.32;
      hallBodyGroup.add(panelBack);

      // Mặt câu đối chữ Hán dát vàng hướng về phía người viếng
      const coupletPlane = new THREE.Mesh(new THREE.PlaneGeometry(cWidth, cHeight), matCouplet);
      coupletPlane.position.set(cx + (isLeftCol ? 0.36 : -0.36), 4.5, cz + 0.35);
      coupletPlane.rotation.y = isLeftCol ? -0.32 : 0.32;
      hallBodyGroup.add(coupletPlane);
    }
  });

  // 6.3. BỘ HOÀNH PHI SƠN SON THẾP VÀNG "ĐẠI HÙNG BẢO ĐIỆN" NÂNG CAO TRÊN XÀ THƯỢNG (Y = 8.8M)
  const mainPlaqueGroup = new THREE.Group();
  mainPlaqueGroup.position.set(0, 8.8, -3.8);

  // Khung hoành phi gỗ son viền rồng mạ vàng
  const plaqueFrame = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.55, 0.14), matLanternRed);
  mainPlaqueGroup.add(plaqueFrame);

  const plaqueGoldRim = new THREE.Mesh(new THREE.BoxGeometry(6.0, 1.65, 0.10), matGold);
  plaqueGoldRim.position.set(0, 0, -0.02);
  mainPlaqueGroup.add(plaqueGoldRim);

  const matMainPlaque = new THREE.MeshStandardMaterial({
    map: getSharedTexture('plaque_daihungbaodien', createDaiHungBaoDienPlaqueTexture),
    roughness: 0.3,
    metalness: 0.35,
  });
  const plaqueInner = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.45), matMainPlaque);
  plaqueInner.position.set(0, 0, 0.08);
  mainPlaqueGroup.add(plaqueInner);

  hallBodyGroup.add(mainPlaqueGroup);

  // 2 Hoành phi phụ hai bên tường và cửa chính điện nâng cao (Y = 7.8m):
  // Gian trái: "佛 明 南 樓" (Phật Minh Nam Lâu)
  const matSideLeft = new THREE.MeshStandardMaterial({
    map: getSharedTexture('plaque_phatminhnamlau', () => createSideCalligraphyPlaqueTexture('佛明南樓')),
    roughness: 0.3,
    metalness: 0.35,
  });
  const sideLeftFrame = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.15, 0.10), matLanternRed);
  sideLeftFrame.position.set(-7.5, 7.8, -2.5);
  hallBodyGroup.add(sideLeftFrame);
  const sideLeftMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.05), matSideLeft);
  sideLeftMesh.position.set(-7.5, 7.8, -2.44);
  hallBodyGroup.add(sideLeftMesh);

  // Gian phải: "法 輪 常 轉" (Pháp Luân Thường Chuyển)
  const matSideRight = new THREE.MeshStandardMaterial({
    map: getSharedTexture('plaque_phapluanthuongchuyen', () => createSideCalligraphyPlaqueTexture('法輪常轉')),
    roughness: 0.3,
    metalness: 0.35,
  });
  const sideRightFrame = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.15, 0.10), matLanternRed);
  sideRightFrame.position.set(7.5, 7.8, -2.5);
  hallBodyGroup.add(sideRightFrame);
  const sideRightMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.05), matSideRight);
  sideRightMesh.position.set(7.5, 7.8, -2.44);
  hallBodyGroup.add(sideRightMesh);

  // Hoành phi phụ trên rèm cung cấm gian thờ trong: "大 敦 福 堂" nâng cao lên Y = 9.0m
  const matCanopy = new THREE.MeshStandardMaterial({
    map: getSharedTexture('plaque_daidunphucthang', () => createSideCalligraphyPlaqueTexture('大敦福堂')),
    roughness: 0.3,
    metalness: 0.35,
  });
  const canopyPlaque = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 1.1), matCanopy);
  canopyPlaque.position.set(0, 9.0, -5.92);
  hallBodyGroup.add(canopyPlaque);

  // 6.4. BỆ THỜ TƯỢNG PHẬT TỔ NHƯ LAI (THÍCH CA MÂU NI) & 2 HỘ VỆ HAI BÊN (ĐIÊU KHẮC CHUẨN XÁC THEO BLENDER 3D)
  const altarGroup = new THREE.Group();
  altarGroup.position.set(0, 0, -6.5);

  // BỤC BỆ THỜ TAM CẤP BẰNG GỖ LIM KHẢM VÀNG (ELEVATED ALTAR PODIUM ĐỠ 3 PHO TƯỢNG UY NGHI)
  const daisStep1 = new THREE.Mesh(new THREE.BoxGeometry(14.5, 0.28, 5.8), matDarkTimber);
  daisStep1.position.set(0, 0.14, 0);
  altarGroup.add(daisStep1);

  const daisTrim1 = new THREE.Mesh(new THREE.BoxGeometry(14.7, 0.06, 6.0), matGold);
  daisTrim1.position.set(0, 0.28, 0);
  altarGroup.add(daisTrim1);

  const daisStep2 = new THREE.Mesh(new THREE.BoxGeometry(13.0, 0.28, 5.0), matDarkTimber);
  daisStep2.position.set(0, 0.42, 0);
  altarGroup.add(daisStep2);

  const daisTrim2 = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.06, 5.2), matGold);
  daisTrim2.position.set(0, 0.56, 0);
  altarGroup.add(daisTrim2);

  const daisStep3 = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.28, 4.4), matDarkTimber);
  daisStep3.position.set(0, 0.70, 0);
  altarGroup.add(daisStep3);

  const daisTrim3 = new THREE.Mesh(new THREE.BoxGeometry(11.7, 0.06, 4.6), matGold);
  daisTrim3.position.set(0, 0.84, 0);
  altarGroup.add(daisTrim3);

  // =========================================================================
  // TÔN TƯỢNG PHẬT THÍCH CA MÂU NI (PHẬT TỔ NHƯ LAI DÁT VÀNG & ĐÀI SEN TAM CẤP)
  // Tạo hình tôn tượng uy nghiêm, thanh tịnh với chất liệu đồng cổ ánh vàng, hào quang tỏa sáng
  // =========================================================================
  function createAntiqueBronzeTextures(): {
    albedo: THREE.CanvasTexture;
    bump: THREE.CanvasTexture;
    roughness: THREE.CanvasTexture;
  } {
    const W = 512;
    const H = 512;

    // 1. ALBEDO TEXTURE: Màu đồng hun cổ ánh vàng ấm áp, vệt thếp vàng và vân kim loại mịn màng
    const canvasA = document.createElement('canvas');
    canvasA.width = W;
    canvasA.height = H;
    const ctxA = canvasA.getContext('2d')!;

    // Gradient màu đồng vàng ấm cổ kính chuẩn tượng chùa cổ
    const bgA = ctxA.createLinearGradient(0, 0, W, H);
    bgA.addColorStop(0, '#e5b866');
    bgA.addColorStop(0.35, '#d4a250');
    bgA.addColorStop(0.65, '#bd8b3c');
    bgA.addColorStop(1, '#9e6e28');
    ctxA.fillStyle = bgA;
    ctxA.fillRect(0, 0, W, H);

    // Vân xước chổi kim loại đúc đồng mịn màng theo thớ ngang
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const len = 8 + Math.random() * 24;
      const alpha = 0.03 + Math.random() * 0.05;
      ctxA.strokeStyle = Math.random() > 0.5 ? `rgba(255, 230, 160, ${alpha})` : `rgba(80, 50, 15, ${alpha})`;
      ctxA.lineWidth = 1 + Math.random() * 1.5;
      ctxA.beginPath();
      ctxA.moveTo(x, y);
      ctxA.lineTo(x + len, y);
      ctxA.stroke();
    }

    // 2. BUMP TEXTURE: Độ nhám vi mô của kim loại đúc mịn màng
    const canvasB = document.createElement('canvas');
    canvasB.width = W;
    canvasB.height = H;
    const ctxB = canvasB.getContext('2d')!;
    ctxB.fillStyle = '#808080';
    ctxB.fillRect(0, 0, W, H);

    const imgDataB = ctxB.getImageData(0, 0, W, H);
    const dataB = imgDataB.data;
    for (let i = 0; i < dataB.length; i += 4) {
      const grain = (Math.random() - 0.5) * 16;
      const val = Math.min(255, Math.max(0, 128 + grain));
      dataB[i] = val;
      dataB[i + 1] = val;
      dataB[i + 2] = val;
    }
    ctxB.putImageData(imgDataB, 0, 0);

    // 3. ROUGHNESS TEXTURE: Độ nhám mờ satin tự nhiên
    const canvasR = document.createElement('canvas');
    canvasR.width = W;
    canvasR.height = H;
    const ctxR = canvasR.getContext('2d')!;
    ctxR.fillStyle = '#787878';
    ctxR.fillRect(0, 0, W, H);

    const albedo = new THREE.CanvasTexture(canvasA);
    albedo.wrapS = THREE.RepeatWrapping;
    albedo.wrapT = THREE.RepeatWrapping;
    albedo.repeat.set(2, 2);
    albedo.anisotropy = 4;

    const bump = new THREE.CanvasTexture(canvasB);
    bump.wrapS = THREE.RepeatWrapping;
    bump.wrapT = THREE.RepeatWrapping;
    bump.repeat.set(4, 4);

    const roughness = new THREE.CanvasTexture(canvasR);
    roughness.wrapS = THREE.RepeatWrapping;
    roughness.wrapT = THREE.RepeatWrapping;
    roughness.repeat.set(2, 2);

    return { albedo, bump, roughness };
  }

  const bronzePBR = createAntiqueBronzeTextures();

  // Chất liệu đồng thếp vàng cổ cao cấp (Chuẩn 100% bản vẽ Blender 3D: màu vàng đồng ấm, độ nhám satin mềm mại)
  const matBuddhaGilt = new THREE.MeshStandardMaterial({
    map: bronzePBR.albedo,
    bumpMap: bronzePBR.bump,
    bumpScale: 0.015,
    roughnessMap: bronzePBR.roughness,
    color: 0xd4a552, // Đồng thếp vàng ấm áp, tươi sáng và uy nghiêm
    roughness: 0.44, // Độ nhám satin mịn, phản xạ ánh sáng êm dịu, không gắt
    metalness: 0.54, // Cân bằng kim loại chuẩn PBR: giữ sắc màu vàng đồng rực rỡ
  });

  const matBuddhaSoftGold = new THREE.MeshStandardMaterial({
    map: bronzePBR.albedo,
    bumpMap: bronzePBR.bump,
    bumpScale: 0.012,
    roughnessMap: bronzePBR.roughness,
    color: 0xcfa050, // Vàng đồng êm dịu cho da thịt và nếp áo cà sa
    roughness: 0.46,
    metalness: 0.50,
  });

  const matLotusGilt = new THREE.MeshStandardMaterial({
    map: bronzePBR.albedo,
    bumpMap: bronzePBR.bump,
    bumpScale: 0.018,
    roughnessMap: bronzePBR.roughness,
    color: 0xdeb362, // Vàng ánh kim tươi sáng cho cánh sen và vành hào quang
    roughness: 0.40,
    metalness: 0.58,
  });

  const matJewelRed = new THREE.MeshStandardMaterial({
    color: 0xd9383a,
    roughness: 0.22,
    metalness: 0.85,
  });

  const matJewelCyan = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    roughness: 0.22,
    metalness: 0.85,
  });
  void matJewelRed;
  void matJewelCyan;

  // =========================================================================
  // BỘ HÌNH HỌC ĐIÊU KHẮC PHẬT GIÁO CAO CẤP (CHUẨN 100% ẢNH MẪU BLENDER 3D)
  // =========================================================================

  // 1. Cánh hoa sen 3D điêu khắc với gân sống nổi rõ ràng (Almond petal with spine ridge)
  const createSculptedPetalGeo = (width: number, height: number, depth: number) => {
    const geo = new THREE.SphereGeometry(width, 16, 14);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      if (v.y > 0) {
        const t = v.y / width;
        const taper = 1 - Math.pow(t, 1.4) * 0.76;
        v.x *= taper;
        v.z *= taper * 0.52;
        v.z += Math.pow(t, 2.4) * 0.08 * (depth / 0.15);
      } else {
        v.z *= 0.42;
      }
      // Gân sống chính giữa cánh sen nổi cao thanh thoát
      const centerDist = Math.abs(v.x);
      if (centerDist < width * 0.85 && v.z > -0.02) {
        const rib = Math.max(0, 1 - centerDist / (width * 0.85));
        v.z += rib * rib * (0.05 * (depth / 0.15));
      }
      v.y *= (height / width);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  };

  // 2. KHUÔN MẶT PHẬT ĐIÊU KHẮC HỮU CƠ TỪ BI (SERENE HUMAN BUDDHA HEAD & FACE)
  // Tỉ lệ oval vàng chuẩn mực: Mắt khép hờ 3/4 nhìn xuống tĩnh tại, mũi thẳng, môi mỉm cười từ bi, cằm tròn, cổ 3 ngấn
  const createSculptedSereneHeadGeo = () => {
    const uSegments = 64;
    const vSegments = 56;
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    for (let iv = 0; iv <= vSegments; iv++) {
      const v = iv / vSegments; // 0 = đáy cổ, 1 = đỉnh vòm sọ
      const y = -0.38 + v * 0.88;

      let rx = 0.22;
      let rz = 0.24;
      let zCenter = 0.0;

      if (v < 0.20) {
        // Cổ & 3 ngấn cổ nhẹ nhàng (Tam đạo cổ)
        const t = v / 0.20;
        rx = 0.16 + (1 - t) * 0.02;
        rz = 0.16 + (1 - t) * 0.02;
        const wave = Math.sin(t * Math.PI * 3);
        if (wave > 0) {
          rx += wave * 0.005;
          rz += wave * 0.005;
        }
      } else if (v < 0.45) {
        // Cằm, quai hàm và khóe miệng
        const t = (v - 0.20) / 0.25;
        rx = 0.16 + t * 0.08;
        rz = 0.16 + t * 0.09;
        zCenter = t * 0.03;
      } else if (v < 0.72) {
        // Gò má, mũi, mắt thiền, cung mày (vùng mặt chính)
        const t = (v - 0.45) / 0.27;
        rx = 0.24 + Math.sin(t * Math.PI) * 0.02;
        rz = 0.25 + Math.sin(t * Math.PI) * 0.02;
        zCenter = 0.03 - t * 0.015;
      } else if (v < 0.90) {
        // Trán cao thanh thoát và thái dương
        const t = (v - 0.72) / 0.18;
        rx = 0.25 - t * 0.04;
        rz = 0.26 - t * 0.04;
        zCenter = 0.015 - t * 0.02;
      } else {
        // Đỉnh vòm sọ
        const t = (v - 0.90) / 0.10;
        const factor = Math.sqrt(Math.max(0, 1 - t * t));
        rx = 0.21 * factor;
        rz = 0.22 * factor;
        zCenter = -0.01;
      }

      for (let iu = 0; iu <= uSegments; iu++) {
        const u = iu / uSegments;
        const angle = u * Math.PI * 2;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        const frontDist = Math.abs(angle - Math.PI / 2);
        const isFront = frontDist < Math.PI * 0.48;

        let deltaR = 0;
        let deltaZ = 0;
        let deltaY = 0;

        if (isFront) {
          // 1. Cằm tròn phúc hậu
          if (v >= 0.20 && v <= 0.32) {
            const chinV = (v - 0.20) / 0.12;
            const chinX = Math.abs(angle - Math.PI / 2);
            if (chinX < 0.35) {
              const f = Math.sin(chinV * Math.PI) * (1 - chinX / 0.35);
              deltaZ += f * 0.028;
            }
          }

          // 2. Môi từ bi mỉm cười thanh tịnh (Cupid's bow)
          if (v >= 0.30 && v <= 0.42) {
            const mouthV = (v - 0.30) / 0.12;
            const mouthX = Math.abs(angle - Math.PI / 2);
            if (mouthX < 0.30) {
              const horiz = Math.cos(mouthX * (Math.PI / 0.60));
              const lipProfile = Math.sin(mouthV * Math.PI);
              deltaZ += lipProfile * horiz * 0.020;
              // Khóe cười nhếch nhẹ hai bên
              if (mouthX > 0.18 && mouthX < 0.28) {
                deltaY += Math.sin(((mouthX - 0.18) / 0.10) * Math.PI) * 0.006;
              }
            }
          }

          // 3. Nhân trung (Philtrum)
          if (v >= 0.38 && v <= 0.46) {
            const philX = Math.abs(angle - Math.PI / 2);
            if (philX < 0.05) {
              deltaZ -= (1 - philX / 0.05) * 0.007;
            }
          }

          // 4. Sống mũi thẳng cao thanh thoát & Cánh mũi
          if (v >= 0.42 && v <= 0.62) {
            const noseV = (v - 0.42) / 0.20;
            const noseX = Math.abs(angle - Math.PI / 2);
            // Sống mũi thẳng
            if (noseX < 0.10) {
              const ridge = (1 - noseX / 0.10) * Math.sin(noseV * Math.PI * 0.95);
              deltaZ += ridge * 0.040;
            }
            // Chóp mũi tròn đầy
            if (noseV >= 0.18 && noseV <= 0.40 && noseX < 0.12) {
              const tip = Math.sin(((noseV - 0.18) / 0.22) * Math.PI) * (1 - noseX / 0.12);
              deltaZ += tip * 0.022;
            }
          }

          // 5. Mắt thiền định khép hờ 3/4 nhìn xuống từ bi (Mí mắt cong nhẹ thanh tịnh, không lồi mắt)
          if (v >= 0.52 && v <= 0.62) {
            const eyeXLeft = Math.abs(angle - (Math.PI / 2 + 0.25));
            const eyeXRight = Math.abs(angle - (Math.PI / 2 - 0.25));
            const eyeDist = Math.min(eyeXLeft, eyeXRight);
            if (eyeDist < 0.18) {
              const f = 1 - eyeDist / 0.18;
              const eyeV = (v - 0.52) / 0.10;
              // Hốc mắt chìm nhẹ
              deltaZ -= Math.sin(eyeV * Math.PI) * f * 0.014;
              // Mí mắt khép hờ tĩnh tại
              if (eyeV > 0.45) {
                deltaZ += Math.sin(((eyeV - 0.45) / 0.55) * Math.PI) * f * 0.016;
              }
            }
          }

          // 6. Cung mày thanh thoát uốn cong
          if (v >= 0.60 && v <= 0.70) {
            const browXLeft = Math.abs(angle - (Math.PI / 2 + 0.24));
            const browXRight = Math.abs(angle - (Math.PI / 2 - 0.24));
            const browDist = Math.min(browXLeft, browXRight);
            if (browDist < 0.22) {
              deltaZ += Math.sin(((v - 0.60) / 0.10) * Math.PI) * (1 - browDist / 0.22) * 0.015;
            }
          }

          // 7. Bạch Hào (Urna) giữa hai chân mày
          if (v >= 0.61 && v <= 0.67) {
            const urnaX = Math.abs(angle - Math.PI / 2);
            if (urnaX < 0.05) {
              deltaZ += Math.sin(((v - 0.61) / 0.06) * Math.PI) * (1 - urnaX / 0.05) * 0.012;
            }
          }
        }

        const vx = (rx + deltaR) * cosA;
        const vy = y + deltaY;
        const vz = (rz + deltaR) * sinA + deltaZ + zCenter;

        vertices.push(vx, vy, vz);
        uvs.push(u, v);
      }
    }

    for (let iv = 0; iv < vSegments; iv++) {
      for (let iu = 0; iu < uSegments; iu++) {
        const a = iv * (uSegments + 1) + iu;
        const b = (iv + 1) * (uSegments + 1) + iu;
        const c = (iv + 1) * (uSegments + 1) + (iu + 1);
        const d = iv * (uSegments + 1) + (iu + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  // 3. ĐÔI TAI DÀI TRÍ TUỆ CHẠM VAI (ELONGATED BUDDHIST EARLOBOES)
  const createSculptedEarsGeo = (isLeft: boolean) => {
    const sign = isLeft ? 1 : -1;
    const pts = [
      new THREE.Vector3(sign * 0.21, 0.12, 0.01),
      new THREE.Vector3(sign * 0.24, 0.10, -0.01),
      new THREE.Vector3(sign * 0.24, -0.04, -0.01),
      new THREE.Vector3(sign * 0.22, -0.16, 0.01),
      new THREE.Vector3(sign * 0.20, -0.22, 0.02),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 18, 0.024, 8, false);
  };

  // 4. THÂN TƯỢNG VÀ ÁO CÀ SA SANGHATI ĐIÊU KHẮC HỮU CƠ (SLENDER SCULPTED TORSO & KASAYA)
  const createSlenderBuddhaTorsoGeo = () => {
    const uSegments = 64;
    const vSegments = 56;
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    for (let iv = 0; iv <= vSegments; iv++) {
      const v = iv / vSegments;
      const y = -0.32 + v * 1.25;

      let rx = 0;
      let rz = 0;
      let zCenter = 0;

      if (v < 0.32) {
        // Vùng eo thon gọn thanh thoát kết nối tòa sen (rx = 0.50m)
        const t = v / 0.32;
        rx = 0.50 + t * 0.08;
        rz = 0.33 + t * 0.06;
        zCenter = 0.02 * (1 - t);
      } else if (v < 0.76) {
        // Vùng lồng ngực vươn cao nở rộng (nở dần đến 0.74m)
        const t = (v - 0.32) / 0.44;
        rx = 0.58 + t * 0.16;
        rz = 0.39 + Math.sin(t * Math.PI) * 0.07;
        zCenter = 0.04 * Math.sin(t * Math.PI);
      } else {
        // Bờ vai và xương quai xanh (vuốt thon vào chân cổ)
        const t = (v - 0.76) / 0.24;
        rx = 0.74 - t * 0.42;
        rz = 0.45 - t * 0.16;
        zCenter = 0.02;
      }

      for (let iu = 0; iu <= uSegments; iu++) {
        const u = iu / uSegments;
        const angle = u * Math.PI * 2;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        const frontDist = Math.abs(angle - Math.PI / 2);
        const isFront = frontDist < Math.PI * 0.46;
        const frontFactor = Math.max(0, Math.cos(frontDist * (Math.PI / (Math.PI * 0.92))));

        let deltaR = 0;
        let deltaZ = 0;
        let deltaY = 0;

        const isRightSide = angle > Math.PI / 2 && angle < Math.PI * 1.5;

        if (isFront) {
          // Rốn chìm tự nhiên ở giữa bụng thon
          if (v >= 0.16 && v <= 0.26) {
            const navelV = (v - 0.16) / 0.10;
            const navelDist = Math.abs(angle - Math.PI / 2);
            if (navelDist < 0.08) {
              const navelF = Math.sin(navelV * Math.PI) * (1 - navelDist / 0.08);
              deltaZ -= navelF * 0.035;
            }
          }

          // Cơ ngực phải để trần săn chắc uy nghiêm
          if (isRightSide && v >= 0.45 && v <= 0.82) {
            const pecV = (v - 0.45) / 0.37;
            const pecAngleDist = Math.abs(angle - (Math.PI / 2 + 0.36));
            const pecF = Math.sin(pecV * Math.PI) * Math.max(0, 1 - pecAngleDist / 0.40);
            deltaZ += pecF * 0.075;
            deltaR += pecF * 0.032;
          }

          // Áo cà sa Sanghāti vắt chéo qua vai trái & nếp gấp lượn sóng liên tục
          const diagCoord = (v * 1.25) - (angle - Math.PI / 2) * 0.70;
          const isRobeRegion = diagCoord < 1.15;

          if (isRobeRegion) {
            deltaR += 0.032;
            const hemDist = Math.abs(diagCoord - 1.15);
            if (hemDist < 0.14) {
              const hemF = Math.cos((hemDist / 0.14) * (Math.PI / 2));
              deltaZ += hemF * 0.055;
              deltaR += hemF * 0.022;
            }
            // 5 nếp gấp áo cà sa uốn lượn đổ xiên từ sườn trái qua bụng
            const foldWave = Math.sin(diagCoord * 8.0);
            if (foldWave > 0) {
              const foldIntensity = Math.pow(foldWave, 1.5) * 0.042;
              deltaZ += foldIntensity * frontFactor;
              deltaR += foldIntensity * 0.55;
            }
          }
        }

        const vx = (rx + deltaR) * cosA;
        const vy = y + deltaY;
        const vz = (rz + deltaR) * sinA + deltaZ + zCenter;

        vertices.push(vx, vy, vz);
        uvs.push(u, v);
      }
    }

    for (let iv = 0; iv < vSegments; iv++) {
      for (let iu = 0; iu < uSegments; iu++) {
        const a = iv * (uSegments + 1) + iu;
        const b = (iv + 1) * (uSegments + 1) + iu;
        const c = (iv + 1) * (uSegments + 1) + (iu + 1);
        const d = iv * (uSegments + 1) + (iu + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  // 5. TAY UỐN LƯỢN HỮU CƠ (ORGANIC SCULPTED ARMS)
  const createCurvedArmGeo = (pts: THREE.Vector3[], radiusProfile: (t: number) => { rx: number; rz: number }) => {
    const curve = new THREE.CatmullRomCurve3(pts);
    const segments = 28;
    const radialSegs = 18;
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    const frames = curve.computeFrenetFrames(segments, false);

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const pt = curve.getPointAt(t);
      const N = frames.normals[i];
      const B = frames.binormals[i];
      const { rx, rz } = radiusProfile(t);

      for (let j = 0; j <= radialSegs; j++) {
        const u = j / radialSegs;
        const theta = u * Math.PI * 2;
        const sin = Math.sin(theta);
        const cos = Math.cos(theta);

        const vx = pt.x + rx * cos * N.x + rz * sin * B.x;
        const vy = pt.y + rx * cos * N.y + rz * sin * B.y;
        const vz = pt.z + rx * cos * N.z + rz * sin * B.z;

        vertices.push(vx, vy, vz);
        uvs.push(u, t);
      }
    }

    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < radialSegs; j++) {
        const a = i * (radialSegs + 1) + j;
        const b = (i + 1) * (radialSegs + 1) + j;
        const c = (i + 1) * (radialSegs + 1) + (j + 1);
        const d = i * (radialSegs + 1) + (j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  // ĐIÊU KHẮC NGÓN TAY BÚP MĂNG KHỚP ĐỐT & ĐẦU NGÓN BO TRÒN THANH THOÁT
  const createBupMangFingerGeo = (
    curve: THREE.CatmullRomCurve3,
    baseRadius: number = 0.022,
    tipRadius: number = 0.011,
    segments: number = 16,
    radialSegs: number = 14
  ): THREE.BufferGeometry => {
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    const frames = curve.computeFrenetFrames(segments, false);

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const pt = curve.getPointAt(t);
      const N = frames.normals[i];
      const B = frames.binormals[i];

      // Gờ khớp ngón tay (Knuckle swellings at PIP and DIP joints)
      const swell1 = Math.exp(-Math.pow((t - 0.35) / 0.12, 2)) * 0.0035;
      const swell2 = Math.exp(-Math.pow((t - 0.70) / 0.10, 2)) * 0.0025;
      
      let r = baseRadius * (1.0 - t * 0.52) + swell1 + swell2;
      if (t > 0.90) {
        const capF = (1.0 - t) / 0.10;
        r = tipRadius * Math.sqrt(Math.max(0, capF));
      }

      for (let j = 0; j <= radialSegs; j++) {
        const u = j / radialSegs;
        const theta = u * Math.PI * 2;
        const rLateral = r * 1.05;
        const rAnterior = r * 0.92;

        const vx = pt.x + rLateral * Math.cos(theta) * N.x + rAnterior * Math.sin(theta) * B.x;
        const vy = pt.y + rLateral * Math.cos(theta) * N.y + rAnterior * Math.sin(theta) * B.y;
        const vz = pt.z + rLateral * Math.cos(theta) * N.z + rAnterior * Math.sin(theta) * B.z;

        vertices.push(vx, vy, vz);
        uvs.push(u, t);
      }
    }

    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < radialSegs; j++) {
        const a = i * (radialSegs + 1) + j;
        const b = (i + 1) * (radialSegs + 1) + j;
        const c = (i + 1) * (radialSegs + 1) + (j + 1);
        const d = i * (radialSegs + 1) + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    // Đỉnh chóp ngón tay khép kín mềm mại
    const tipCenter = curve.getPointAt(1.0);
    const tipIdx = vertices.length / 3;
    vertices.push(tipCenter.x, tipCenter.y, tipCenter.z);
    uvs.push(0.5, 1.0);

    const lastRow = segments * (radialSegs + 1);
    for (let j = 0; j < radialSegs; j++) {
      indices.push(lastRow + j, tipIdx, lastRow + j + 1);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  // ĐIÊU KHẮC LÒNG BÀN TAY HỮU CƠ CÓ GÒ KIM TINH & THÁI ÂM (SCULPTED PALM)
  const createSculptedPalmGeo = (isLeftHand: boolean = false): THREE.BufferGeometry => {
    const geo = new THREE.BoxGeometry(0.18, 0.22, 0.08, 12, 12, 6);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    const sign = isLeftHand ? -1 : 1;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      // Taper at wrist base
      if (v.y < -0.05) {
        const tf = (-v.y - 0.05) / 0.06;
        v.x *= (1 - tf * 0.18);
        v.z *= (1 - tf * 0.15);
      }
      // Hõm lòng bàn tay
      if (v.z > 0 && Math.abs(v.x) < 0.06 && Math.abs(v.y) < 0.08) {
        v.z -= 0.022;
      }
      // Gò Kim Tinh (Mô ngón cái)
      if (v.x * sign > 0.02 && v.y < 0.02 && v.z > 0) {
        v.z += 0.020;
        v.x += 0.012 * sign;
      }
      // Gò Thái Âm (Mép ngón út)
      if (v.x * sign < -0.02 && v.y < 0.00 && v.z > 0) {
        v.z += 0.012;
      }
      // Mu bàn tay vồng nhẹ tự nhiên
      if (v.z < 0) {
        v.z -= 0.008 * (1 - Math.abs(v.x) / 0.09);
      }
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  };

  // ĐIÊU KHẮC BÀN TAY NGỬA TRONG LÒNG ĐÙI (DHYANA MUDRA UPWARD PALM)
  const createSculptedUpwardPalmGeo = (): THREE.BufferGeometry => {
    const geo = new THREE.BoxGeometry(0.20, 0.07, 0.18, 12, 6, 12);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      // Thon nhỏ về phía cổ tay
      if (v.x < -0.04) {
        const tf = (-v.x - 0.04) / 0.06;
        v.z *= (1 - tf * 0.18);
        v.y *= (1 - tf * 0.15);
      }
      // Lõm lòng bàn tay ngửa lên trên đón phúc lành
      if (v.y > 0 && Math.abs(v.x) < 0.06 && Math.abs(v.z) < 0.06) {
        v.y -= 0.020;
      }
      // Mô cơ ngón cái
      if (v.z > 0.02 && v.x < 0.02 && v.y > 0) {
        v.y += 0.016;
        v.z += 0.010;
      }
      // Gờ khớp nối các ngón
      if (v.x > 0.06) {
        v.y += 0.006;
      }
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  };

  // ĐIÊU KHẮC VẠT ÁO CÀ SA THÁC NƯỚC RỦ XUỐNG TÒA SEN (WATERFALL APRON MESH 100% BLENDER)
  const createWaterfallApronGeo = (): THREE.BufferGeometry => {
    const uSegs = 36;
    const vSegs = 28;
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];

    for (let iv = 0; iv <= vSegs; iv++) {
      const v = iv / vSegs; // 0 (từ lòng đùi Y=1.95) -> 1 (gấu áo phủ đài sen Y=1.51)
      const y = 1.95 - v * 0.44;
      const zBase = 0.46 + v * 0.22; // đổ thoai thoải ra phía trước
      const width = 0.26 + v * 0.54; // xòe rộng hình cánh quạt

      for (let iu = 0; iu <= uSegs; iu++) {
        const u = iu / uSegs;
        const x = (u - 0.5) * width;

        // 5 múi nếp gấp chính xếp tầng hình sóng uốn lượn
        const pleatAngle = (u - 0.5) * Math.PI * 5;
        const ripple = Math.cos(pleatAngle) * (0.022 + v * 0.042);

        // Nếp gập chữ V chính giữa ngực đùi đổ xuống
        const centerFactor = Math.exp(-Math.pow((u - 0.5) * 8, 2));
        const centerPleat = centerFactor * 0.035 * (1 - v * 0.35);

        const z = zBase + ripple + centerPleat;
        vertices.push(x, y, z);
        uvs.push(u, v);
      }
    }

    for (let iv = 0; iv < vSegs; iv++) {
      for (let iu = 0; iu < uSegs; iu++) {
        const a = iv * (uSegs + 1) + iu;
        const b = (iv + 1) * (uSegs + 1) + iu;
        const c = (iv + 1) * (uSegs + 1) + (iu + 1);
        const d = iv * (uSegs + 1) + (iu + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  // =========================================================================
  // 1. TƯỢNG ĐỨC PHẬT TỔ NHƯ LAI (THÍCH CA MÂU NI) - CHUẨN 100% BLENDER 3D
  // =========================================================================
  const createPhatToNhuLaiStatue = (xPos: number, zPos: number, scaleFactor: number = 1.35) => {
    const bGroup = new THREE.Group();
    bGroup.position.set(xPos, 0, zPos);
    bGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // -------------------------------------------------------------
    // 1. TÒA SEN ĐA TẦNG (LOTUS THRONE - BỆ CHÂN ĐẾ MÚI KHÍA CHUẨN BLENDER)
    // -------------------------------------------------------------
    const baseProfile = [
      new THREE.Vector2(0, -2.40),
      new THREE.Vector2(1.95, -2.40),
      new THREE.Vector2(2.02, -2.26),
      new THREE.Vector2(1.98, -2.18),
      new THREE.Vector2(1.88, -2.08),
      new THREE.Vector2(1.84, -1.98),
      new THREE.Vector2(1.68, -1.88),
      new THREE.Vector2(1.42, -1.74),
      new THREE.Vector2(1.55, -1.56),
      new THREE.Vector2(1.78, -1.36),
      new THREE.Vector2(1.84, -1.08),
      new THREE.Vector2(1.70, -0.96),
      new THREE.Vector2(1.56, -0.92),
      new THREE.Vector2(0, -0.92),
    ];
    const latheGeo = new THREE.LatheGeometry(baseProfile, 48);
    const plinthBase = new THREE.Mesh(latheGeo, matBuddhaGilt);
    plinthBase.position.y = 2.40; // Nâng bệ lên mặt sàn (Y = 0)
    bGroup.add(plinthBase);

    // 36 Múi khía sen dọc chân bệ (Fluted plinth columns)
    for (let fb = 0; fb < 36; fb++) {
      const fbAng = (fb / 36) * Math.PI * 2;
      const flute = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.050, 0.22, 7), matLotusGilt);
      flute.position.set(Math.cos(fbAng) * 1.96, 0.10, Math.sin(fbAng) * 1.96);
      bGroup.add(flute);
    }

    // 28 Chuỗi ngọc tròn đúc đồng quanh eo bệ sen
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), matLotusGilt);
      bead.position.set(Math.cos(a) * 1.72, 0.66, Math.sin(a) * 1.72);
      bGroup.add(bead);
    }

    // Cánh sen úp tầng dưới (18 cánh sen chúc xuống quanh viền bệ)
    const petalGeo = createSculptedPetalGeo(0.32, 0.44, 0.12);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const petalH = new THREE.Group();
      petalH.position.set(Math.cos(a) * 1.70, 0.44, Math.sin(a) * 1.70);
      petalH.rotation.y = -a + Math.PI / 2;
      petalH.rotation.x = Math.PI - 0.45;
      const m = new THREE.Mesh(petalGeo, matLotusGilt);
      m.scale.set(0.92, 1.10, 0.80);
      petalH.add(m);
      bGroup.add(petalH);
    }

    // Cánh sen ngửa tầng chính (18 cánh vươn cao ôm lấy bồ đoàn)
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const petalH = new THREE.Group();
      petalH.position.set(Math.cos(a) * 1.60, 1.32, Math.sin(a) * 1.60);
      petalH.rotation.y = -a + Math.PI / 2;
      petalH.rotation.x = 0.38;
      const m = new THREE.Mesh(petalGeo, matLotusGilt);
      m.scale.set(1.05, 1.42, 0.92);
      petalH.add(m);
      bGroup.add(petalH);
    }

    // Cánh sen ngửa so le tầng trong (18 cánh ôm sát chân tượng)
    for (let i = 0; i < 18; i++) {
      const a = ((i + 0.5) / 18) * Math.PI * 2;
      const petalH = new THREE.Group();
      petalH.position.set(Math.cos(a) * 1.48, 1.46, Math.sin(a) * 1.48);
      petalH.rotation.y = -a + Math.PI / 2;
      petalH.rotation.x = 0.24;
      const m = new THREE.Mesh(petalGeo, matLotusGilt);
      m.scale.set(0.92, 1.28, 0.82);
      petalH.add(m);
      bGroup.add(petalH);
    }

    // Mặt đài sen phẳng (Lotus seedpod platform)
    const podTop = new THREE.Mesh(new THREE.CylinderGeometry(1.44, 1.38, 0.24, 40), matBuddhaGilt);
    podTop.position.set(0, 1.54, 0);
    bGroup.add(podTop);

    // Gờ viền nổi đỉnh đài sen
    const podRim = new THREE.Mesh(new THREE.TorusGeometry(1.40, 0.038, 10, 40), matLotusGilt);
    podRim.rotation.x = Math.PI / 2;
    podRim.position.set(0, 1.66, 0);
    bGroup.add(podRim);

    // -------------------------------------------------------------
    // 2. DÁNG TỌA THIỀN KIẾT GIÀ (PADMASANA) & VẠT ÁO THÁC NƯỚC RỦ XUỐNG ĐÀI SEN
    // -------------------------------------------------------------
    // Bệ chân kiết già vững chãi
    const legsBase = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.28, 0.44, 32), matBuddhaSoftGold);
    legsBase.position.set(0, 1.82, 0.05);
    legsBase.scale.set(1.16, 1, 0.88);
    bGroup.add(legsBase);

    // Hai đầu gối trái và phải uốn cong tròn đầy
    for (const side of [-1, 1]) {
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), matBuddhaSoftGold);
      knee.position.set(side * 0.86, 1.82, 0.22);
      knee.rotation.z = side * -0.22;
      knee.scale.set(1.32, 0.76, 1.08);
      bGroup.add(knee);
    }

    // Bàn chân phải ngửa lên trời (Vajrasana) đặt trên đùi trái
    const footR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.32), matBuddhaSoftGold);
    footR.position.set(-0.42, 2.02, 0.32);
    footR.rotation.set(-0.2, 0.3, 0.1);
    bGroup.add(footR);

    // Nếp gấp áo cà sa trên hai đùi (8 đường uốn cong TubeGeometry)
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const xOff = (t - 0.5) * 1.55;
      const foldPts = [
        new THREE.Vector3(xOff, 1.92 - t * 0.04, 0.18),
        new THREE.Vector3(xOff * 0.88, 1.86 - t * 0.06, 0.28),
        new THREE.Vector3(xOff * 0.78, 1.79 - t * 0.05, 0.36),
        new THREE.Vector3(xOff * 0.68, 1.74 - t * 0.04, 0.42),
      ];
      const foldCurve = new THREE.CatmullRomCurve3(foldPts);
      const foldMesh = new THREE.Mesh(new THREE.TubeGeometry(foldCurve, 12, 0.024, 8, false), matBuddhaSoftGold);
      bGroup.add(foldMesh);
    }

    // Vạt áo cà sa thác nước xếp nếp (WATERFALL APRON MESH 100% BLENDER)
    const waterfallApronMesh = new THREE.Mesh(createWaterfallApronGeo(), matBuddhaSoftGold);
    bGroup.add(waterfallApronMesh);

    // -------------------------------------------------------------
    // 3. THÂN TƯỢNG ĐIÊU KHẮC HỮU CƠ (SLENDER SCULPTED TORSO)
    // -------------------------------------------------------------
    const torsoMesh = new THREE.Mesh(createSlenderBuddhaTorsoGeo(), matBuddhaSoftGold);
    torsoMesh.position.set(0, 2.38, 0);
    torsoMesh.castShadow = true;
    bGroup.add(torsoMesh);

    // Bờ vai trái khoác y cà sa & Vai phải để trần da thịt
    const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 16), matBuddhaSoftGold);
    shoulderL.position.set(-0.66, 3.05, 0.0);
    bGroup.add(shoulderL);

    const shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.26, 18, 16), matBuddhaSoftGold);
    shoulderR.position.set(0.66, 3.05, 0.0);
    bGroup.add(shoulderR);

    // Huy hiệu chữ Vạn (卍) đúc nổi tinh tế giữa ngực
    const swastikaGroup = new THREE.Group();
    swastikaGroup.position.set(0, 2.88, 0.54);
    const emblemBase = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.020, 6), matLotusGilt);
    emblemBase.rotation.x = Math.PI / 2;
    emblemBase.position.z = -0.012;
    swastikaGroup.add(emblemBase);

    const barGeoH = new THREE.Mesh(new THREE.BoxGeometry(0.148, 0.030, 0.026), matLotusGilt);
    const barGeoV = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.148, 0.026), matLotusGilt);
    barGeoH.position.z = 0.006;
    barGeoV.position.z = 0.006;
    swastikaGroup.add(barGeoH);
    swastikaGroup.add(barGeoV);

    const armGeoH = new THREE.BoxGeometry(0.058, 0.030, 0.026);
    const armGeoV = new THREE.BoxGeometry(0.030, 0.058, 0.026);
    const a1 = new THREE.Mesh(armGeoH, matLotusGilt); a1.position.set(-0.030, 0.059, 0.006); swastikaGroup.add(a1);
    const a2 = new THREE.Mesh(armGeoH, matLotusGilt); a2.position.set(0.030, -0.059, 0.006); swastikaGroup.add(a2);
    const a3 = new THREE.Mesh(armGeoV, matLotusGilt); a3.position.set(0.059, 0.030, 0.006); swastikaGroup.add(a3);
    const a4 = new THREE.Mesh(armGeoV, matLotusGilt); a4.position.set(-0.059, -0.030, 0.006); swastikaGroup.add(a4);

    const emblemRim = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.016, 8, 24), matLotusGilt);
    emblemRim.position.z = -0.002;
    swastikaGroup.add(emblemRim);
    bGroup.add(swastikaGroup);

    // -------------------------------------------------------------
    // 4. CÁNH TAY & THỦ ẤN ĐIÊU KHẮC TINH XẢO RÕ NÉT (100% BLENDER 3D)
    // -------------------------------------------------------------
    // TAY PHẢI: KHOÁC Y NỬA TAY, KHUỶU ÁO THỤNG, ẤN THUYẾT PHÁP (VITARKA MUDRA)
    // Khối cơ bắp vai phải (Deltoid shoulder cap)
    const shoulderDeltoidR = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16), matBuddhaSoftGold);
    shoulderDeltoidR.position.set(0.66, 3.05, 0.04);
    shoulderDeltoidR.scale.set(1.10, 0.98, 0.96);
    bGroup.add(shoulderDeltoidR);

    // Đường cong cánh tay phải: hạ thấp ngang ngực phải, góc nghiêng 45 độ chuẩn mẫu Blender
    const rightArmPts = [
      new THREE.Vector3(0.66, 3.05, 0.04), // Vai phải
      new THREE.Vector3(0.76, 2.78, 0.08), // Bắp tay bicep
      new THREE.Vector3(0.70, 2.47, 0.16), // Khuỷu tay
      new THREE.Vector3(0.54, 2.55, 0.36), // Cẳng tay hướng lên ngực
      new THREE.Vector3(0.38, 2.63, 0.52), // Khớp cổ tay ngang ngực phải
    ];
    const rightArmMesh = new THREE.Mesh(createCurvedArmGeo(rightArmPts, (t) => {
      if (t < 0.25) return { rx: 0.20, rz: 0.19 };
      if (t < 0.50) return { rx: 0.17, rz: 0.17 };
      if (t < 0.75) return { rx: 0.15, rz: 0.14 };
      return { rx: 0.12, rz: 0.095 };
    }), matBuddhaSoftGold);
    bGroup.add(rightArmMesh);

    // Ống tay áo cà sa rủ nhẹ dưới khuỷu tay phải
    const rSleeveCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.28, 0.26, 20, 2, true), matBuddhaSoftGold);
    rSleeveCuff.position.set(0.70, 2.35, 0.18);
    rSleeveCuff.rotation.set(0.1, 0.1, 0.15);
    bGroup.add(rSleeveCuff);

    const rSleeveRim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.022, 8, 20), matBuddhaSoftGold);
    rSleeveRim.position.set(0.70, 2.22, 0.18);
    rSleeveRim.rotation.set(Math.PI / 2 + 0.1, 0.1, 0.15);
    bGroup.add(rSleeveRim);

    // Mỏm khuỷu tay rõ rệt (Olecranon elbow prominence)
    const olecranonR = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), matBuddhaSoftGold);
    olecranonR.position.set(0.71, 2.46, 0.15);
    olecranonR.scale.set(1.05, 0.85, 1.25);
    bGroup.add(olecranonR);

    // Vành khớp cổ tay (Carpal crease & styloid ring)
    const wristRingR = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.015, 8, 24), matBuddhaSoftGold);
    wristRingR.position.set(0.38, 2.63, 0.52);
    wristRingR.rotation.set(0.2, 0.4, 0.15);
    bGroup.add(wristRingR);

    // BÀN TAY PHẢI ĐIÊU KHẮC HỮU CƠ KẾT ẤN PHÁP LUÂN (VITARKA MUDRA)
    // Tọa độ chuẩn khớp ngực phải (X=0.38, Y=2.68, Z=0.56) – đầu ngón dưới xương quai xanh
    const rightHandGroup = new THREE.Group();
    rightHandGroup.position.set(0.38, 2.68, 0.56);
    rightHandGroup.rotation.set(0.08, -0.22, 0.14);

    // Lòng bàn tay hữu cơ có mô cái, mô út và lòng bàn tay lõm
    const palmR = new THREE.Mesh(createSculptedPalmGeo(false), matBuddhaSoftGold);
    palmR.scale.set(0.82, 0.82, 0.82);
    rightHandGroup.add(palmR);

    // VÒNG TRÒN ẤN PHÁP LUÂN: Ngón cái & Ngón trỏ uốn lượn chạm đầu ngón tạo khuyên tròn
    const indexCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.038, 0.09, 0.01),
      new THREE.Vector3(-0.030, 0.14, 0.032),
      new THREE.Vector3(-0.012, 0.115, 0.065),
      new THREE.Vector3(0.012, 0.080, 0.068),
    ]);
    rightHandGroup.add(new THREE.Mesh(createBupMangFingerGeo(indexCurve, 0.018, 0.010), matBuddhaSoftGold));

    const thumbCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.055, 0.012, 0.018),
      new THREE.Vector3(0.072, 0.045, 0.038),
      new THREE.Vector3(0.046, 0.070, 0.062),
      new THREE.Vector3(0.012, 0.080, 0.068),
    ]);
    rightHandGroup.add(new THREE.Mesh(createBupMangFingerGeo(thumbCurve, 0.021, 0.011), matBuddhaSoftGold));

    // 3 NGÓN TAY BÚP MĂNG VƯƠN THẲNG LÊN TRỜI (Ngón giữa, ngón áp út, ngón út)
    // Ngón giữa vươn cao tới ngực trên (dưới cổ), đầu ngón uốn cong nhẹ thanh tao
    const middleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.012, 0.09, 0.005),
      new THREE.Vector3(-0.012, 0.16, 0.014),
      new THREE.Vector3(-0.015, 0.22, 0.006),
      new THREE.Vector3(-0.016, 0.28, -0.014),
    ]);
    rightHandGroup.add(new THREE.Mesh(createBupMangFingerGeo(middleCurve, 0.019, 0.010), matBuddhaSoftGold));

    // Ngón áp út
    const ringCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.020, 0.085, 0.005),
      new THREE.Vector3(0.022, 0.15, 0.012),
      new THREE.Vector3(0.024, 0.20, 0.003),
      new THREE.Vector3(0.026, 0.25, -0.012),
    ]);
    rightHandGroup.add(new THREE.Mesh(createBupMangFingerGeo(ringCurve, 0.017, 0.009), matBuddhaSoftGold));

    // Ngón út xòe nhẹ tự nhiên
    const pinkyCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.052, 0.078, 0.00),
      new THREE.Vector3(0.060, 0.13, 0.008),
      new THREE.Vector3(0.068, 0.17, 0.000),
      new THREE.Vector3(0.074, 0.21, -0.011),
    ]);
    rightHandGroup.add(new THREE.Mesh(createBupMangFingerGeo(pinkyCurve, 0.015, 0.008), matBuddhaSoftGold));
    bGroup.add(rightHandGroup);

    // TAY TRÁI: Y CÀ SA THỤNG PHỦ VAI, CẲNG TAY XUẤT TỤ, ẤN THIỀN ĐỊNH (DHYANA MUDRA)
    // Ống tay áo cà sa thụng phủ bắp tay trái
    const leftSleevePts = [
      new THREE.Vector3(-0.66, 3.05, 0.04), // Vai trái phủ y
      new THREE.Vector3(-0.76, 2.78, 0.08), // Bắp tay trái
      new THREE.Vector3(-0.72, 2.47, 0.16), // Khuỷu tay áo thụng
    ];
    const leftSleeveMesh = new THREE.Mesh(createCurvedArmGeo(leftSleevePts, (t) => ({
      rx: 0.24 - t * 0.02,
      rz: 0.23 - t * 0.02,
    })), matBuddhaSoftGold);
    bGroup.add(leftSleeveMesh);

    // Miệng ống tay áo thụng buông rủ xuống dưới khuỷu tay
    const bellCuffGeo = new THREE.CylinderGeometry(0.24, 0.34, 0.36, 22, 2, true);
    const bellCuff = new THREE.Mesh(bellCuffGeo, matBuddhaSoftGold);
    bellCuff.position.set(-0.72, 2.31, 0.18);
    bellCuff.rotation.set(0.15, 0.1, -0.15);
    bGroup.add(bellCuff);

    const cuffRim = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.025, 8, 22), matBuddhaSoftGold);
    cuffRim.position.set(-0.72, 2.13, 0.18);
    cuffRim.rotation.set(Math.PI / 2 + 0.15, 0.1, -0.15);
    bGroup.add(cuffRim);

    // Nếp gấp y cà sa uyển chuyển xếp tầng quanh bắp tay
    for (let sf = 0; sf < 4; sf++) {
      const sRing = new THREE.Mesh(new THREE.TorusGeometry(0.25 + sf * 0.015, 0.025, 8, 24), matBuddhaSoftGold);
      sRing.position.set(-0.74, 2.89 - sf * 0.11, 0.08);
      sRing.rotation.set(0.3, 0.1, -0.2);
      bGroup.add(sRing);
    }

    // Cẳng tay trái trần xuất tụ từ miệng ống tay áo thụng ôm ngang lòng đùi
    const leftForearmPts = [
      new THREE.Vector3(-0.68, 2.45, 0.20), // Xuất phát từ bên trong ống tay áo thụng
      new THREE.Vector3(-0.48, 2.31, 0.38), // Cẳng tay thon thả hướng về lòng đùi
      new THREE.Vector3(-0.25, 2.21, 0.48), // Gần cổ tay
      new THREE.Vector3(-0.06, 2.17, 0.52), // Cổ tay tĩnh tại
    ];
    const leftForearmMesh = new THREE.Mesh(createCurvedArmGeo(leftForearmPts, (t) => ({
      rx: 0.16 - t * 0.04,
      rz: 0.15 - t * 0.05,
    })), matBuddhaSoftGold);
    bGroup.add(leftForearmMesh);

    // BÀN TAY TRÁI NGỬA TĨNH TẠI TRONG LÒNG ĐÙI KẾT ẤN THIỀN ĐỊNH (DHYANA MUDRA)
    // Tọa độ chuẩn khớp rốn / trên đùi (X=0.00, Y=2.17, Z=0.54)
    const leftHandGroup = new THREE.Group();
    leftHandGroup.position.set(0.00, 2.17, 0.54);
    leftHandGroup.rotation.set(-0.14, 0.12, 0.02);

    // Lòng bàn tay ngửa lên trời đón nhận năng lượng từ bi
    const leftPalmMesh = new THREE.Mesh(createSculptedUpwardPalmGeo(), matBuddhaSoftGold);
    leftPalmMesh.scale.set(0.88, 0.88, 0.88);
    leftHandGroup.add(leftPalmMesh);

    // 4 ngón tay búp măng duỗi nhẹ nhàng sang phải (+X)
    const leftFingers = [
      { z: 0.045, len: 0.17, r: 0.018, tip: 0.009 },
      { z: 0.014, len: 0.19, r: 0.019, tip: 0.010 },
      { z: -0.018, len: 0.17, r: 0.018, tip: 0.009 },
      { z: -0.048, len: 0.14, r: 0.016, tip: 0.008 }
    ];
    leftFingers.forEach((f) => {
      const fPts = [
        new THREE.Vector3(0.07, 0.012, f.z),
        new THREE.Vector3(0.07 + f.len * 0.40, 0.016, f.z),
        new THREE.Vector3(0.07 + f.len * 0.75, 0.014, f.z),
        new THREE.Vector3(0.07 + f.len, 0.007, f.z * 1.02),
      ];
      leftHandGroup.add(new THREE.Mesh(createBupMangFingerGeo(new THREE.CatmullRomCurve3(fPts), f.r, f.tip), matBuddhaSoftGold));
    });

    // Ngón cái tay trái khẽ tựa theo mép ngón trỏ thanh thoát
    const leftThumbCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.045, 0.012, 0.052),
      new THREE.Vector3(-0.010, 0.035, 0.048),
      new THREE.Vector3(0.035, 0.038, 0.036),
      new THREE.Vector3(0.070, 0.028, 0.026),
    ]);
    leftHandGroup.add(new THREE.Mesh(createBupMangFingerGeo(leftThumbCurve, 0.019, 0.010), matBuddhaSoftGold));
    bGroup.add(leftHandGroup);

    // -------------------------------------------------------------
    // 5. ĐẦU TƯỢNG PHẬT ĐIÊU KHẮC NGUYÊN KHỐI TỪ BI & TÓC XOẮN ỐC
    // -------------------------------------------------------------
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 3.85, 0);

    // Khuôn mặt Phật từ bi
    const headMesh = new THREE.Mesh(createSculptedSereneHeadGeo(), matBuddhaSoftGold);
    headGroup.add(headMesh);

    // Đôi tai dài trí tuệ chạm vai
    const earL = new THREE.Mesh(createSculptedEarsGeo(true), matBuddhaSoftGold);
    headGroup.add(earL);
    const earR = new THREE.Mesh(createSculptedEarsGeo(false), matBuddhaSoftGold);
    headGroup.add(earR);

    // Nhục kế Ushnisha trên đỉnh đầu
    const ushnisha = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 18), matBuddhaSoftGold);
    ushnisha.position.set(0, 0.48, -0.02);
    ushnisha.scale.set(1.05, 0.88, 1.05);
    headGroup.add(ushnisha);

    // Búp sen ngọc đỉnh nhục kế
    const jewelFinial = new THREE.Mesh(new THREE.ConeGeometry(0.050, 0.15, 14), matLotusGilt);
    jewelFinial.position.set(0, 0.65, -0.02);
    headGroup.add(jewelFinial);

    // Tóc xoắn ốc (Snail-shell hair curls) ôm sát hộp sọ tự nhiên (KHÔNG PHẢI VƯƠNG MIỆN)
    const curlGeo = new THREE.SphereGeometry(0.038, 7, 7);
    const curlRows = [
      { y: 0.16, r: 0.25, count: 18, startAngle: -0.35, endAngle: Math.PI + 0.35 },
      { y: 0.26, r: 0.24, count: 18, startAngle: -0.45, endAngle: Math.PI + 0.45 },
      { y: 0.36, r: 0.22, count: 16, startAngle: 0, endAngle: Math.PI * 2 },
      { y: 0.46, r: 0.18, count: 14, startAngle: 0, endAngle: Math.PI * 2 },
      { y: 0.54, r: 0.13, count: 10, startAngle: 0, endAngle: Math.PI * 2 },
      { y: 0.61, r: 0.08, count: 7, startAngle: 0, endAngle: Math.PI * 2 },
    ];
    curlRows.forEach((row) => {
      for (let c = 0; c < row.count; c++) {
        const a = row.startAngle + (c / row.count) * (row.endAngle - row.startAngle);
        const curl = new THREE.Mesh(curlGeo, matBuddhaGilt);
        curl.position.set(Math.cos(a) * row.r * 0.96, row.y, Math.sin(a) * row.r - 0.02);
        headGroup.add(curl);
      }
    });

    bGroup.add(headGroup);

    // -------------------------------------------------------------
    // 6. SONG VIÊN QUANG BỐI ĐỒNG THẾP VÀNG CỔ (AUREOLA - CHUẨN BLENDER 3D)
    // -------------------------------------------------------------
    // VÒNG TRÊN (Viên quang đầu): Bán kính 1.25m sau đầu
    const upperHaloGroup = new THREE.Group();
    upperHaloGroup.position.set(0, 4.05, -0.42);

    const upperHaloDisc = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.06, 56), matBuddhaGilt);
    upperHaloDisc.rotation.x = Math.PI / 2;
    upperHaloGroup.add(upperHaloDisc);

    // Các vòng gờ đúc đồng tâm
    [1.25, 1.05, 0.85, 0.55].forEach((r, idx) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, idx === 0 ? 0.055 : 0.026, 12, 48), matLotusGilt);
      ring.position.z = 0.032;
      upperHaloGroup.add(ring);
    });

    // 24 Tia hào quang nổi nhẹ
    for (let s = 0; s < 24; s++) {
      const a = (s / 24) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.58, 0.014), matLotusGilt);
      spoke.position.set(Math.cos(a) * 0.72, Math.sin(a) * 0.72, 0.032);
      spoke.rotation.z = a - Math.PI / 2;
      upperHaloGroup.add(spoke);
    }
    bGroup.add(upperHaloGroup);

    // VÒNG DƯỚI (Thân quang bao quanh thân): Bán kính 1.85m sau thân
    const lowerHaloGroup = new THREE.Group();
    lowerHaloGroup.position.set(0, 2.85, -0.48);

    const lowerHaloDisc = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.85, 0.065, 56), matBuddhaGilt);
    lowerHaloDisc.rotation.x = Math.PI / 2;
    lowerHaloGroup.add(lowerHaloDisc);

    [1.85, 1.58, 1.28, 0.98].forEach((r, idx) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, idx === 0 ? 0.068 : 0.032, 12, 56), matLotusGilt);
      ring.position.z = 0.035;
      lowerHaloGroup.add(ring);
    });

    // 24 Họa tiết mây sóng cuộn đúc nổi ven viền ngoài
    for (let sc = 0; sc < 24; sc++) {
      const a = (sc / 24) * Math.PI * 2;
      const scroll = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.024, 8, 16, Math.PI * 1.3), matLotusGilt);
      scroll.position.set(Math.cos(a) * 1.68, Math.sin(a) * 1.68, 0.036);
      scroll.rotation.z = a;
      lowerHaloGroup.add(scroll);
    }
    bGroup.add(lowerHaloGroup);

    return bGroup;
  };

  // BỐ TRÍ TƯỢNG PHẬT TỔ NHƯ LAI TẠI TRUNG TÂM BÀN THỜ (HIỂN THỊ NGAY LẬP TỨC 100% ỔN ĐỊNH)
  const buddhaCenter = createPhatToNhuLaiStatue(0, -0.5, 1.35);
  buddhaCenter.position.set(0, 0.84, -0.5);
  altarGroup.add(buddhaCenter);

  // === ÁNH SÁNG TRỰC TIẾP CHIẾU LÊN BAN THỜ & TƯỢNG PHẬT (SHRINE SPOTLIGHTS) ===
  // SpotLight từ phía trên chính giữa tượng Phật Tổ Như Lai
  const shrineSpot = new THREE.SpotLight(0xfff8e1, 4.5, 22, Math.PI / 5, 0.38, 1.2);
  shrineSpot.position.set(0, 14, 3.5);
  shrineSpot.target.position.set(0, 5.0, -7.5);
  nightLightsRef.current.push(shrineSpot as unknown as THREE.PointLight);
  mainHall.add(shrineSpot);
  mainHall.add(shrineSpot.target);

  // SpotLight phụ chiếu nghiêng từ bên trái
  const shrineSpotL = new THREE.SpotLight(0xfef3c7, 2.8, 18, Math.PI / 6, 0.42, 1.4);
  shrineSpotL.position.set(-5, 11, 2);
  shrineSpotL.target.position.set(-1.0, 4.5, -7.5);
  nightLightsRef.current.push(shrineSpotL as unknown as THREE.PointLight);
  mainHall.add(shrineSpotL);
  mainHall.add(shrineSpotL.target);

  // SpotLight phụ chiếu nghiêng từ bên phải
  const shrineSpotR = new THREE.SpotLight(0xfef3c7, 2.8, 18, Math.PI / 6, 0.42, 1.4);
  shrineSpotR.position.set(5, 11, 2);
  shrineSpotR.target.position.set(1.0, 4.5, -7.5);
  nightLightsRef.current.push(shrineSpotR as unknown as THREE.PointLight);
  mainHall.add(shrineSpotR);
  mainHall.add(shrineSpotR.target);

  // Ánh hào quang vàng ấm tỏa từ sau tượng trung tâm
  const buddhaGlowBack = new THREE.PointLight(0xfbbf24, 3.5, 10);
  buddhaGlowBack.position.set(0, 5.5, -8.0);
  nightLightsRef.current.push(buddhaGlowBack);
  mainHall.add(buddhaGlowBack);

  // Vách gỗ chạm trổ & Rèm lụa gấm vàng rủ hai bên cung cấm (Cao 8.5m thông suốt trần)
  for (const rx of [-7.2, 7.2]) {
    const drape = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 8.5, 12, 1, true, 0, Math.PI), matGold);
    drape.position.set(rx, 4.8, -0.5);
    altarGroup.add(drape);
  }

  hallBodyGroup.add(altarGroup);
  // 6.5. BÀN THỜ ÁN GIAN CHẠM RỒNG THẾP VÀNG & ĐỒ THỜ TỰ
  const altarTableGroup = new THREE.Group();
  altarTableGroup.position.set(0, 0, -4.2);

  const altarTable = new THREE.Mesh(new THREE.BoxGeometry(9.6, 1.35, 1.8), matAmberWood);
  altarTable.position.set(0, 0.675, 0);
  altarTableGroup.add(altarTable);

  const altarTrim = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.12, 1.9), matGold);
  altarTrim.position.set(0, 1.35, 0);
  altarTableGroup.add(altarTrim);

  // Chân nến đồng uy nghiêm & đèn dầu lưu ly
  for (const cx of [-3.8, 3.8]) {
    const cand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, 0.9, 8), matGold);
    cand.position.set(cx, 1.8, 0);
    altarTableGroup.add(cand);

    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    flame.position.set(cx, 2.3, 0);
    altarTableGroup.add(flame);

    const cLight = new THREE.PointLight(0xf59e0b, 0.8, 6);
    cLight.position.set(cx, 2.3, 0.2);
    nightLightsRef.current.push(cLight);
    altarTableGroup.add(cLight);
  }

  // Đôi lộc bình gỗ chạm hoa sen hai bên bàn thờ
  for (const vx of [-4.5, 4.5]) {
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.16, 1.1, 12), matDarkTimber);
    vase.position.set(vx, 1.9, -0.2);
    altarTableGroup.add(vase);
  }

  // Chuông gia trì bằng đồng & Mõ gỗ hình cá hóa rồng
  const bellAltar = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.65), matGold);
  bellAltar.position.set(-2.2, 1.55, 0.35);
  altarTableGroup.add(bellAltar);

  const moAltar = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 10), matDarkTimber);
  moAltar.position.set(2.2, 1.55, 0.35);
  altarTableGroup.add(moAltar);

  hallBodyGroup.add(altarTableGroup);

  // 6.6. ĐẠI ĐỈNH HƯƠNG ĐỒNG 3 CHÂN (BRONZE CAULDRON CENSER) TỌA LẠC CHÍNH ĐIỆN & KHÓI TRẦM
  const incenseSmoke: THREE.Mesh[] = [];
  const censerGroup = new THREE.Group();
  censerGroup.position.set(0, 0, 0.5);

  // Bệ đá granite vuông
  const censerStoneBase = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 1.8), matLotusPlinth);
  censerStoneBase.position.set(0, 0.11, 0);
  censerGroup.add(censerStoneBase);

  // 3 Chân đỉnh đồng chạm đầu rồng
  for (let l = 0; l < 3; l++) {
    const ang = (l / 3) * Math.PI * 2;
    const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.65, 8), matBronzeCauldron);
    legMesh.position.set(Math.cos(ang) * 0.55, 0.45, Math.sin(ang) * 0.55);
    censerGroup.add(legMesh);
  }

  // Thân bầu đỉnh đồng chạm rồng nổi
  const censerBody = new THREE.Mesh(new THREE.SphereGeometry(0.78, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.72), matBronzeCauldron);
  censerBody.position.set(0, 1.1, 0);
  censerGroup.add(censerBody);

  // Vành miệng đỉnh đồng & nắp chạm lộng kỳ lân
  const censerRim = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.08, 6, 20), matGold);
  censerRim.rotation.x = Math.PI / 2;
  censerRim.position.set(0, 1.35, 0);
  censerGroup.add(censerRim);

  // 2 Quai rồng uốn lượn hai bên đỉnh đồng
  for (const hx of [-0.85, 0.85]) {
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 6, 14), matBronzeCauldron);
    handle.position.set(hx, 1.25, 0);
    censerGroup.add(handle);
  }

  // Bát nhang cắm đầy chân nhang đỏ và nhang trầm đang cháy
  const incenseBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 0.28, 14), matDarkTimber);
  incenseBowl.position.set(0, 1.35, 0);
  censerGroup.add(incenseBowl);

  const matIncenseAsh = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.95 });
  const ashSurface = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.04, 14), matIncenseAsh);
  ashSurface.position.set(0, 1.48, 0);
  censerGroup.add(ashSurface);

  // Que nhang trầm đỏ cắm trên bát nhang
  for (let st = 0; st < 9; st++) {
    const sAng = (st / 9) * Math.PI * 2;
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.38, 4), matLanternRed);
    stick.position.set(Math.cos(sAng) * 0.22, 1.62, Math.sin(sAng) * 0.22);
    censerGroup.add(stick);

    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.014, 4, 4), new THREE.MeshBasicMaterial({ color: 0xf97316 }));
    ember.position.set(Math.cos(sAng) * 0.22, 1.81, Math.sin(sAng) * 0.22);
    censerGroup.add(ember);
  }

  // Hạt khói trầm hương bốc lên nghi ngút mờ ảo
  const matSmokeParticle = new THREE.MeshBasicMaterial({
    color: 0xe2e8f0,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  for (let sk = 0; sk < 14; sk++) {
    const smokeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), matSmokeParticle);
    smokeMesh.position.set(
      (Math.random() - 0.5) * 0.28,
      1.6 + (sk / 14) * 3.6,
      (Math.random() - 0.5) * 0.28
    );
    smokeMesh.scale.set(1 + sk * 0.2, 1 + sk * 0.2, 1 + sk * 0.2);
    censerGroup.add(smokeMesh);
    incenseSmoke.push(smokeMesh);
  }

  hallBodyGroup.add(censerGroup);

  // 6.7. HAI BÀN THẤP "KHU VỰC THẮP NHANG" ĐỐI XỨNG HAI BÊN
  for (const bx of [-4.4, 4.4]) {
    const tableGroup = new THREE.Group();
    tableGroup.position.set(bx, 0, 0.5);

    // Bàn thấp gỗ hương kiểu truyền thống
    const tTop = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 0.95), matIncenseTable);
    tTop.position.set(0, 0.65, 0);
    tableGroup.add(tTop);

    for (const lx of [-1.2, 1.2]) {
      for (const lz of [-0.35, 0.35]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.65, 8), matIncenseTable);
        leg.position.set(lx, 0.325, lz);
        tableGroup.add(leg);
      }
    }

    // Biển gỗ đứng "敬香區 / KHU VỰC THẮP NHANG" có thư pháp chữ Hán và phụ đề
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.34, 0.04), matLanternRed);
    signBoard.position.set(0, 0.85, 0);
    tableGroup.add(signBoard);

    const matIncenseSign = new THREE.MeshStandardMaterial({
      map: getSharedTexture('incense_sign', createIncenseSignTexture),
      roughness: 0.35,
    });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.30), matIncenseSign);
    signMesh.position.set(0, 0.85, 0.025);
    tableGroup.add(signMesh);

    // Ống cắm thẻ hương trầm bằng tre
    const incenseCanister = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 10), matDarkTimber);
    incenseCanister.position.set(0.85, 0.85, 0);
    tableGroup.add(incenseCanister);

    // Khay gỗ cúng dường
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.42), matAmberWood);
    tray.position.set(-0.75, 0.70, 0);
    tableGroup.add(tray);

    hallBodyGroup.add(tableGroup);
  }

  // 6.8. 12 BỒ ĐOÀN THIỀN TỌA XẾP NGĂN NẮP HAI BÊN ĐỂ NHÂN VẬT TỌA THIỀN NGHE KINH
  const cushionCols = [-4.6, -2.5, 2.5, 4.6];
  const cushionRows = [2.6, 4.6, 6.6];

  cushionCols.forEach((colX) => {
    cushionRows.forEach((rowZ) => {
      const cGroup = new THREE.Group();
      cGroup.position.set(colX, 0, rowZ);

      // Đệm bồ đoàn nỉ nhung đỏ viền vàng hoàng gia
      const cushionMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.52, 0.16, 16), matCushionRed);
      cushionMesh.position.set(0, 0.08, 0);
      cGroup.add(cushionMesh);

      // Viền chỉ vàng hoàng gia quanh bồ đoàn
      const cRim = new THREE.Mesh(new THREE.TorusGeometry(0.51, 0.02, 6, 20), matGold);
      cRim.rotation.x = Math.PI / 2;
      cRim.position.set(0, 0.08, 0);
      cGroup.add(cRim);

      // Đóa sen vàng thêu trên mặt bồ đoàn
      const cLotus = new THREE.Mesh(new THREE.CircleGeometry(0.18, 8), matGold);
      cLotus.rotation.x = -Math.PI / 2;
      cLotus.position.set(0, 0.165, 0);
      cGroup.add(cLotus);

      hallBodyGroup.add(cGroup);
    });
  });

  // 6.9. NPC HÒA THƯỢNG TRỤ TRÌ THUYẾT PHÁP (ÁO CÀ SA ĐỎ, RÂU BẠC DÀI, CHÂN MÀY DÀI)
  const abbotGroup = new THREE.Group();
  abbotGroup.position.set(2.4, 0.12, -2.8);
  abbotGroup.rotation.y = -0.15; // Xoay mặt ra bên ngoài Chánh Điện (hướng về tiền đường & cửa chính tiếp đón Phật tử)

  // TÒA THUYẾT PHÁP HÒA THƯỢNG TRỤ TRÌ (MỞ RỘNG TO HƠN 40% THEO YÊU CẦU)
  // 1. Thảm gấm hoa sen đỏ hoàng gia bát giác ở đáy tòa
  const carpetBase = new THREE.Mesh(new THREE.CylinderGeometry(1.50, 1.55, 0.04, 8), matCushionRed);
  carpetBase.position.set(0, 0.02, 0);
  carpetBase.receiveShadow = true;
  abbotGroup.add(carpetBase);

  const carpetTrim = new THREE.Mesh(new THREE.CylinderGeometry(1.52, 1.57, 0.02, 8), matGold);
  carpetTrim.position.set(0, 0.04, 0);
  abbotGroup.add(carpetTrim);

  // 2. Bệ gỗ lim tòa sen thuyết pháp (Rộng hơn 40%: R=1.20m -> 1.35m, Cao 0.28m)
  const abbotPlinth = new THREE.Mesh(new THREE.CylinderGeometry(1.20, 1.35, 0.28, 16), matDarkTimber);
  abbotPlinth.position.set(0, 0.18, 0);
  abbotPlinth.receiveShadow = true;
  abbotGroup.add(abbotPlinth);

  // Gờ nẹp chỉ đồng mạ vàng viền quanh bệ gỗ lim
  const plinthTrim = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.37, 0.04, 16), matGold);
  plinthTrim.position.set(0, 0.31, 0);
  abbotGroup.add(plinthTrim);

  // 3. 16 Cánh sen mạ vàng 3D nở rộ bao quanh bệ thuyết pháp (tăng 40%)
  for (let ap = 0; ap < 16; ap++) {
    const aAng = (ap / 16) * Math.PI * 2;
    const aPetal = new THREE.Mesh(new THREE.ConeGeometry(0.20, 0.40, 6), matGold);
    aPetal.rotation.x = Math.PI / 2 + 0.24;
    aPetal.rotation.z = aAng;
    aPetal.position.set(Math.cos(aAng) * 1.25, 0.26, Math.sin(aAng) * 1.25);
    abbotGroup.add(aPetal);
  }

  // 4. Bồ đoàn thượng tọa nỉ nhung đỏ viền vàng hoàng gia (To hơn 40%: R=1.02m -> 1.08m, Dày 0.20m)
  const abbotCushion = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.08, 0.20, 20), matCushionRed);
  abbotCushion.position.set(0, 0.42, 0);
  abbotCushion.receiveShadow = true;
  abbotGroup.add(abbotCushion);

  // Viền chỉ vàng hoàng gia quanh bồ đoàn
  const cRim = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.028, 6, 24), matGold);
  cRim.rotation.x = Math.PI / 2;
  cRim.position.set(0, 0.42, 0);
  abbotGroup.add(cRim);

  // Đóa sen vàng thêu tinh xảo trên mặt bồ đoàn thượng tọa
  const cLotus = new THREE.Mesh(new THREE.CircleGeometry(0.36, 12), matGold);
  cLotus.rotation.x = -Math.PI / 2;
  cLotus.position.set(0, 0.525, 0);
  abbotGroup.add(cLotus);

  // 5. Kỷ gỗ lim để kinh sách và chuông gia trì bên cạnh chỗ thiền
  const sutraDesk = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.36, 0.28), matDarkTimber);
  sutraDesk.position.set(0.96, 0.38, 0.45);
  sutraDesk.rotation.y = -0.35;
  abbotGroup.add(sutraDesk);

  const sutraBook = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.16), matGold);
  sutraBook.position.set(0.96, 0.58, 0.45);
  sutraBook.rotation.y = -0.35;
  abbotGroup.add(sutraBook);

  const prayerBell = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.08, 8), matGold);
  prayerBell.position.set(0.96, 0.63, 0.35);
  abbotGroup.add(prayerBell);

  // 6. Đôi chân tọa thiền kiết già an nhiên của Hòa Thượng (Mở rộng cân xứng vững vàng trên bồ đoàn lớn)
  const matInnerRobe = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.75 }); // Áo tràng vàng nghệ
  const matKasayaRed = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.75 }); // Áo cà sa đỏ son phước điền
  const matKasayaTrim = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.65 }); // Chỉ vàng viền ô cà sa

  const crossedLegs = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.80, 0.28, 14), matInnerRobe);
  crossedLegs.position.set(0, 0.58, 0.08);
  abbotGroup.add(crossedLegs);

  // Thân trên Hòa Thượng Trụ Trì (Torso)
  const abbotTorsoGroup = new THREE.Group();
  abbotTorsoGroup.position.set(0, 0.68, 0);

  // Thân áo tràng bên trong
  const aBody = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.62, 0.38), matInnerRobe);
  aBody.position.set(0, 0.31, 0);
  aBody.castShadow = true;
  abbotTorsoGroup.add(aBody);

  // ÁO CÀ SA ĐỎ PHƯỚC ĐIỀN KHOÁC NGOÀI CHOÀNG QUA VAI TRÁI
  const kasayaCape = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.66, 0.40), matKasayaRed);
  kasayaCape.position.set(-0.02, 0.31, 0.01);
  abbotTorsoGroup.add(kasayaCape);

  // Các dải viền chỉ vàng chia ô ruộng phước điền trên áo cà sa đỏ
  for (let r = 0; r < 3; r++) {
    const hStripe = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.025, 0.39), matKasayaTrim);
    hStripe.position.set(-0.02, 0.16 + r * 0.16, 0.01);
    abbotTorsoGroup.add(hStripe);
  }
  for (let c = -1; c <= 1; c++) {
    const vStripe = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.63, 0.39), matKasayaTrim);
    vStripe.position.set(-0.02 + c * 0.16, 0.29, 0.01);
    abbotTorsoGroup.add(vStripe);
  }

  // Khuy móc ngọc bích cài áo cà sa trên vai trái
  const jadeHook = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.018, 6, 12), new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.3 }));
  jadeHook.position.set(-0.16, 0.54, 0.18);
  abbotTorsoGroup.add(jadeHook);

  // Hai cánh tay Hòa Thượng Trụ Trì
  const armR = new THREE.Group();
  armR.position.set(0.30, 0.46, 0);

  const rSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.38, 10), matInnerRobe);
  rSleeve.rotation.z = -Math.PI / 3;
  rSleeve.position.set(0.14, -0.08, 0.12);
  armR.add(rSleeve);

  const matSkin = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.5 });
  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), matSkin);
  rHand.position.set(0.28, -0.15, 0.24);
  armR.add(rHand);

  // Chuỗi tràng hạt bồ đề 108 hạt cầm trên tay phải
  const beadsGroup = new THREE.Group();
  beadsGroup.position.set(0.28, -0.22, 0.26);
  for (let i = 0; i < 16; i++) {
    const bAngle = (i / 16) * Math.PI * 2;
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.024, 6, 6), matDarkTimber);
    bead.position.set(Math.cos(bAngle) * 0.14, Math.sin(bAngle) * 0.18, (i % 2) * 0.01);
    beadsGroup.add(bead);
  }
  armR.add(beadsGroup);
  abbotTorsoGroup.add(armR);

  // Tay trái thủ ấn Vô Úy an lành / đặt trên đùi
  const armL = new THREE.Group();
  armL.position.set(-0.30, 0.46, 0);

  const lSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.38, 10), matKasayaRed);
  lSleeve.rotation.z = Math.PI / 3;
  lSleeve.position.set(-0.14, -0.08, 0.12);
  armL.add(lSleeve);

  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), matSkin);
  lHand.position.set(-0.24, -0.12, 0.22);
  armL.add(lHand);
  abbotTorsoGroup.add(armL);

  // Đầu Hòa Thượng Trụ Trì (Head)
  const abbotHeadGroup = new THREE.Group();
  abbotHeadGroup.position.set(0, 0.62, 0);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 20), new THREE.MeshStandardMaterial({
    map: getSharedTexture('abbot_face', createAbbotFaceTexture),
    roughness: 0.55,
  }));
  headMesh.rotation.y = -Math.PI / 2;
  headMesh.castShadow = true;
  abbotHeadGroup.add(headMesh);

  // RÂU DÀI BẠC TRẮNG 3D PHÚC HẬU RỦ TỪ CẰM XUỐNG NGỰC
  const matWhiteHair = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });

  const beardMain = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 12), matWhiteHair);
  beardMain.rotation.x = Math.PI - 0.22; // Hướng xuống ngực uốn nhẹ ra phía trước
  beardMain.position.set(0, -0.16, 0.25);
  abbotHeadGroup.add(beardMain);

  for (const bx of [-0.07, 0.07]) {
    const beardFlank = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.28, 8), matWhiteHair);
    beardFlank.rotation.x = Math.PI - 0.18;
    beardFlank.rotation.z = bx > 0 ? -0.12 : 0.12;
    beardFlank.position.set(bx, -0.12, 0.24);
    abbotHeadGroup.add(beardFlank);
  }

  // ĐÔI CHÂN MÀY DÀI BẠC TRẮNG 3D VƯƠN CONG QUA KHÓE MẮT
  for (const mx of [-0.14, 0.14]) {
    const eyebrow = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.008, 0.22, 8), matWhiteHair);
    eyebrow.rotation.z = mx > 0 ? -Math.PI / 3.5 : Math.PI / 3.5;
    eyebrow.rotation.x = 0.25;
    eyebrow.position.set(mx * 1.35, 0.04, 0.28);
    abbotHeadGroup.add(eyebrow);
  }

  // VẦNG HÀO QUANG TRÍ TUỆ (WISDOM MANDALA HALO) SAU ĐẦU SƯ PHỤ
  const abbotHalo = new THREE.Mesh(
    new THREE.RingGeometry(0.38, 0.65, 32),
    new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.88 })
  );
  abbotHalo.position.set(0, 0.08, -0.32);
  abbotHeadGroup.add(abbotHalo);

  const abbotHaloLight = new THREE.PointLight(0xfef08a, 1.2, 8);
  abbotHaloLight.position.set(0, 0.1, 0.5);
  nightLightsRef.current.push(abbotHaloLight);
  abbotHeadGroup.add(abbotHaloLight);

  abbotTorsoGroup.add(abbotHeadGroup);
  abbotGroup.add(abbotTorsoGroup);
  hallBodyGroup.add(abbotGroup);

  // 2nd Floor Balcony (Gác chuông lầu thượng bên trong)
  const balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(30, 0.45, 8.5), matDarkTimber);
  balconyFloor.position.set(0, 7.2, 6.5);
  hallBodyGroup.add(balconyFloor);

  const balconyRailing = new THREE.Mesh(new THREE.BoxGeometry(30, 1.0, 0.25), matAmberWood);
  balconyRailing.position.set(0, 8.1, 10.5);
  hallBodyGroup.add(balconyRailing);

  // Đèn lồng đỏ lụa treo hiên Chánh Điện
  for (let lx = -10; lx <= 10; lx += 5) {
    const lantern = createStylizedSilkLantern(matLanternRed);
    lantern.position.set(lx, 6.2, 5.5);
    hallBodyGroup.add(lantern);

    const lLight = new THREE.PointLight(0xf87171, 0.65, 8);
    lLight.position.set(lx, 5.6, 5.5);
    nightLightsRef.current.push(lLight);
    hallBodyGroup.add(lLight);
  }

  mainHall.add(hallBodyGroup);

  return {
    group: mainHall,
    abbotNpc: {
      group: abbotGroup,
      torso: abbotTorsoGroup,
      head: abbotHeadGroup,
      armR,
      armL,
      halo: abbotHalo,
      beads: beadsGroup,
    },
    incenseSmoke,
  };
}
