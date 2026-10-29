file_path = r"e:\a\game\src\canvas\Zen3DWorld.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update TEMPLE_ZONES for sanctuary
old_zone7 = """  {
    id: 'sanctuary',
    name: '7. Phòng Thờ Chính Điện',
    subtitle: 'Đại Hùng Bảo Điện • Kim Thân Phật Thích Ca dát vàng',
    dimensions: '32 × 26 m',
    icon: '🏛️',
    desc: 'Nội điện trang nghiêm rực rỡ với tượng Phật trên tòa sen tam cấp và hoành phi câu đối.',
    pos: { x: 0, z: -16 },
    actionKey: 'SANCTUARY',
  },"""

new_zone7 = """  {
    id: 'sanctuary',
    name: '7. Đại Hùng Bảo Điện (Tòa Chính)',
    subtitle: 'Chính điện trùng thiềm điệp ốc • Hệ tam cấp & Đại Tượng Phật',
    dimensions: '46 × 36 m',
    icon: '🏛️',
    desc: 'Tòa chính điện quy mô tráng lệ theo bản vẽ phát thảo: nền tam cấp cao ráo với 3 lối cầu thang đá chạm rồng, hai lầu đình tả hữu, hệ mái trùng thiềm điệp ốc ngói men ngọc và Đại Tượng Phật Thích Ca hoàng kim.',
    pos: { x: 0, y: 3.2, z: -12 },
    actionKey: 'SANCTUARY',
  },"""

assert old_zone7 in content, "old_zone7 not found"
content = content.replace(old_zone7, new_zone7)

# 2. Add helper functions createSweepingHallRoof and createAuthenticDaiHungBaoDien before createAuthenticJadePagoda
sanctuary_funcs = """// Sweeping Multi-Slope Roof with Upturned Corners and Dragon Ridge Crests
function createSweepingHallRoof(
  width: number,
  depth: number,
  height: number,
  matTile: THREE.Material,
  matGold: THREE.Material
): THREE.Group {
  const g = new THREE.Group();

  // Main 4-slope hip roof
  const roofMesh = new THREE.Mesh(
    new THREE.ConeGeometry(width * 0.72, height, 4),
    matTile
  );
  roofMesh.rotateY(Math.PI / 4);
  roofMesh.scale.set(1.0, 1.0, depth / width);
  roofMesh.position.set(0, height / 2, 0);
  roofMesh.castShadow = true;
  g.add(roofMesh);

  // Eave border trim (mép ngói trích thủy)
  const eaveTrim = new THREE.Mesh(new THREE.BoxGeometry(width * 0.98, 0.18, depth * 0.98), matTile);
  eaveTrim.position.set(0, 0.09, 0);
  g.add(eaveTrim);

  // 4 Upturned Dragon-Tail Corner Eaves (Đao cong ngói ngọc vút lên trời)
  const r = width * 0.52;
  for (const a of [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4]) {
    const finial = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.28, 8, 16, Math.PI * 0.8),
      matTile
    );
    finial.position.set(Math.cos(a) * r, 0.45, Math.sin(a) * r * (depth / width));
    finial.rotation.z = Math.PI / 3.2;
    finial.rotation.y = a - Math.PI / 4;
    g.add(finial);

    // Golden Dragon Crest at Corner
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.75, 6), matGold);
    crest.position.set(Math.cos(a) * (r + 0.45), 1.15, Math.sin(a) * (r + 0.45) * (depth / width));
    crest.rotation.z = -Math.PI / 4;
    g.add(crest);
  }

  // Ridge Capping with Kìm Nóc (Dragon-fish ridge crests) at ends of main ridge
  const ridgeLen = (width - depth) * 0.85;
  if (ridgeLen > 2) {
    const ridgeBar = new THREE.Mesh(new THREE.BoxGeometry(ridgeLen, 0.35, 0.45), matTile);
    ridgeBar.position.set(0, height + 0.15, 0);
    g.add(ridgeBar);

    for (const rx of [-ridgeLen / 2, ridgeLen / 2]) {
      const kimNoc = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.18, 6, 12, Math.PI * 0.75), matGold);
      kimNoc.position.set(rx, height + 0.45, 0);
      kimNoc.rotation.z = rx < 0 ? Math.PI / 4 : -Math.PI / 4;
      g.add(kimNoc);
    }
  }

  return g;
}

// Authentic Main Sanctuary Complex (Đại Hùng Bảo Điện theo bản vẽ phát thảo)
function createAuthenticDaiHungBaoDien(
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
): THREE.Group {
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

  // 4. MAIN SANCTUARY BUILDING BODY (TIỀN ĐƯỜNG & HẬU CUNG)
  const hallBodyGroup = new THREE.Group();
  hallBodyGroup.position.set(0, 3.2, 0);

  const bodyW = 32;
  const bodyD = 22;
  const bodyH = 6.8;

  const wallBack = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, 0.5), matAmberWood);
  wallBack.position.set(0, bodyH / 2, -bodyD / 2);
  hallBodyGroup.add(wallBack);

  const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, bodyH, bodyD), matAmberWood);
  wallLeft.position.set(-bodyW / 2, bodyH / 2, 0);
  hallBodyGroup.add(wallLeft);

  const wallRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, bodyH, bodyD), matAmberWood);
  wallRight.position.set(bodyW / 2, bodyH / 2, 0);
  hallBodyGroup.add(wallRight);

  // Front Colonnade (8 Wooden Columns across front veranda)
  for (let c = -3.5; c <= 3.5; c += 1.0) {
    const colX = c * 4.2;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, bodyH + 0.5, 10), matDarkTimber);
    col.position.set(colX, bodyH / 2, bodyD / 2 + 1.8);
    col.castShadow = true;
    hallBodyGroup.add(col);

    if (Math.abs(c) < 3.0) {
      const doorW = 3.6;
      const doorH = 5.2;

      const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.2, doorH, 0.2), matDarkTimber);
      frameL.position.set(colX - doorW / 2, doorH / 2, bodyD / 2);
      hallBodyGroup.add(frameL);
      const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.2, doorH, 0.2), matDarkTimber);
      frameR.position.set(colX + doorW / 2, doorH / 2, bodyD / 2);
      hallBodyGroup.add(frameR);
      const frameTop = new THREE.Mesh(new THREE.BoxGeometry(doorW, 0.25, 0.2), matDarkTimber);
      frameTop.position.set(colX, doorH, bodyD / 2);
      hallBodyGroup.add(frameTop);

      const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.2, doorH - 0.2, 0.12), matAmberWood);
      doorPanel.position.set(colX, doorH / 2, bodyD / 2);
      hallBodyGroup.add(doorPanel);

      for (const kx of [-0.6, 0.6]) {
        const knocker = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 6, 12), matGold);
        knocker.position.set(colX + kx, doorH * 0.45, bodyD / 2 + 0.1);
        hallBodyGroup.add(knocker);
      }
    }
  }

  // Clerestory Upper Wall (Cổ diêm lấy sáng)
  const clerestory = new THREE.Mesh(new THREE.BoxGeometry(26, 2.4, 18), matAmberWood);
  clerestory.position.set(0, bodyH + 1.2, -1.0);
  hallBodyGroup.add(clerestory);

  // 5. MULTI-TIER INTERLOCKING ROOFS ("TRÙNG THIỀM ĐIỆP ỐC")
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

  // Roof 3: Rear High Sanctuary Crown Tower (Lầu Nóc Hậu Cung theo bản vẽ)
  const crownTower = new THREE.Group();
  crownTower.position.set(0, bodyH + 3.8, -4.5);

  const crownBody = new THREE.Mesh(new THREE.BoxGeometry(16, 2.8, 14), matAmberWood);
  crownBody.position.set(0, 1.4, 0);
  crownTower.add(crownBody);

  const crownRoof = createJadeCurvedRoof(18.5, 16.5, 4.0, matJadeTile, matGold);
  crownRoof.position.set(0, 2.8, 0);
  sanctuaryRoofsRef.current.push(crownRoof);
  crownTower.add(crownRoof);

  const crownSpire = new THREE.Mesh(
    new THREE.ConeGeometry(0.65, 2.8, 8),
    matGold
  );
  crownSpire.position.set(0, 6.8, 0);
  crownTower.add(crownSpire);

  hallBodyGroup.add(crownTower);

  // 6. GRAND INTERIOR (NỘI THẤT ĐẠI HÙNG BẢO ĐIỆN)
  const altarGroup = new THREE.Group();
  altarGroup.position.set(0, 0, -5.5);

  const altarTable = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.4, 3.5), matGold);
  altarTable.position.set(0, 0.7, 0);
  altarGroup.add(altarTable);

  const throne1 = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.2, 0.65, 16), matGold);
  throne1.position.set(0, 1.7, 0);
  altarGroup.add(throne1);

  const throne2 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 0.55, 16), matGold);
  throne2.position.set(0, 2.3, 0);
  altarGroup.add(throne2);

  const buddhaTorso = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.5, 2.5, 12), matGold);
  buddhaTorso.position.set(0, 4.2, 0);
  altarGroup.add(buddhaTorso);

  const buddhaHead = new THREE.Mesh(new THREE.SphereGeometry(1.0, 14, 14), matGold);
  buddhaHead.position.set(0, 5.8, 0);
  altarGroup.add(buddhaHead);

  const ushnisha = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), matGold);
  ushnisha.position.set(0, 6.7, 0);
  altarGroup.add(ushnisha);

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(2.0, 3.2, 24),
    new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
  );
  halo.position.set(0, 5.8, -0.6);
  altarGroup.add(halo);

  const buddhaLight = new THREE.PointLight(0xfef08a, 2.2, 18);
  buddhaLight.position.set(0, 5.8, 2.0);
  nightLightsRef.current.push(buddhaLight);
  altarGroup.add(buddhaLight);

  const altarCenser = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.65, 10), matDarkTimber);
  altarCenser.position.set(0, 1.6, 1.2);
  altarGroup.add(altarCenser);

  hallBodyGroup.add(altarGroup);

  // Meditation cushions
  for (let row = -1; row <= 2; row++) {
    for (let col = -3; col <= 3; col++) {
      if (Math.abs(col) < 1 && row < 1) continue;
      const cushion = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 0.18, 12),
        new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.85 })
      );
      cushion.position.set(col * 2.8, 0.1, 4.0 - row * 2.4);
      hallBodyGroup.add(cushion);
    }
  }

  // 2nd Floor Balcony
  const balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(30, 0.45, 8.5), matDarkTimber);
  balconyFloor.position.set(0, 7.2, 6.5);
  hallBodyGroup.add(balconyFloor);

  const balconyRailing = new THREE.Mesh(new THREE.BoxGeometry(30, 1.0, 0.25), matAmberWood);
  balconyRailing.position.set(0, 8.1, 10.5);
  hallBodyGroup.add(balconyRailing);

  // Hanging Silk Lanterns
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

  return mainHall;
}
"""

anchor = "// Authentic 3-Tier Jade Buddhist Pagoda Tower"
assert anchor in content, "anchor not found"
content = content.replace(anchor, sanctuary_funcs + "\n" + anchor)

# 3. Replace old sanctuary construction in scene setup
old_sanctuary_block = """    // [ZONE 7: PHÒNG THỜ CHÍNH ĐIỆN & ZONE 11: LẦU GÁC]
    const sanctuaryGroup = new THREE.Group();
    sanctuaryGroup.position.set(0, 0, -16);

    const sanctFloor = new THREE.Mesh(new THREE.BoxGeometry(30, 0.6, 24), matTileBrick);
    sanctFloor.position.set(0, 0.3, 0);
    sanctFloor.receiveShadow = true;
    sanctuaryGroup.add(sanctFloor);

    // Pillars
    for (const cx of [-12, -6.5, 0, 6.5, 12]) {
      for (const cz of [-9, -3, 3, 9]) {
        if (Math.abs(cx) < 2 && Math.abs(cz) < 4) continue;
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 11.5, 10), matWoodLim);
        col.position.set(cx, 6.0, cz);
        col.castShadow = true;
        sanctuaryGroup.add(col);
      }
    }

    // Golden Buddha Altar
    const altarGroup = new THREE.Group();
    altarGroup.position.set(0, 0.6, -7.0);

    const altarBase = new THREE.Mesh(new THREE.BoxGeometry(7.0, 1.5, 3.8), matGold);
    altarBase.position.set(0, 0.75, 0);
    altarGroup.add(altarBase);

    const throne1 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 0.55, 12), matGold);
    throne1.position.set(0, 1.8, 0);
    altarGroup.add(throne1);

    const buddhaTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.3, 2.0, 10), matGold);
    buddhaTorso.position.set(0, 3.6, 0);
    altarGroup.add(buddhaTorso);

    const buddhaHead = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 12), matGold);
    buddhaHead.position.set(0, 4.9, 0);
    altarGroup.add(buddhaHead);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 2.3, 20),
      new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
    );
    halo.position.set(0, 4.8, -0.5);
    altarGroup.add(halo);

    const buddhaLight = new THREE.PointLight(0xfef08a, 1.8, 14);
    buddhaLight.position.set(0, 4.8, 1.5);
    altarGroup.add(buddhaLight);
    sanctuaryGroup.add(altarGroup);

    // 2nd Floor Balcony (Lầu Gác)
    const balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(30, 0.5, 8.5), matWoodLim);
    balconyFloor.position.set(0, 6.8, 7.8);
    sanctuaryGroup.add(balconyFloor);

    const railing = new THREE.Mesh(new THREE.BoxGeometry(30, 1.0, 0.3), matWoodWarm);
    railing.position.set(0, 7.6, 11.8);
    sanctuaryGroup.add(railing);

    for (let rx = -12; rx <= 12; rx += 4.8) {
      const lantern = createStylizedSilkLantern(matLanternRed);
      lantern.position.set(rx, 6.5, 11.8);
      sanctuaryGroup.add(lantern);

      const pLight = new THREE.PointLight(0xf87171, 0.75, 8);
      pLight.position.set(rx, 6.0, 11.8);
      nightLightsRef.current.push(pLight);
      sanctuaryGroup.add(pLight);
    }

    const sanctRoofLower = createStylizedCurvedRoof(34, 28, matRoofTile);
    sanctRoofLower.position.set(0, 8.8, 0);
    sanctuaryRoofsRef.current.push(sanctRoofLower);
    sanctuaryGroup.add(sanctRoofLower);

    const sanctRoofUpper = createStylizedCurvedRoof(24, 20, matRoofTile);
    sanctRoofUpper.position.set(0, 13.2, 0);
    sanctuaryRoofsRef.current.push(sanctRoofUpper);
    sanctuaryGroup.add(sanctRoofUpper);
    scene.add(sanctuaryGroup);"""

new_sanctuary_block = """    // [ZONE 7: ĐẠI HÙNG BẢO ĐIỆN - TÒA CHÍNH KIẾN TRÚC MỚI THEO BẢN VẼ]
    const sanctuaryGroup = createAuthenticDaiHungBaoDien(
      matJadeRoofTile,
      matAmberWood,
      matDarkTimber,
      matLotusPlinth,
      matStoneGrey,
      matTileBrick,
      matGold,
      matLanternRed,
      sanctuaryRoofsRef,
      nightLightsRef
    );
    scene.add(sanctuaryGroup);"""

assert old_sanctuary_block in content, "old_sanctuary_block not found"
content = content.replace(old_sanctuary_block, new_sanctuary_block)

# 4. Update dynamic ground elevation and indoor detection for the new Grand Podium
old_indoor_check = """        // Indoor Building Detection
        const inSanctuary = currentP.z <= -6 && currentP.z >= -30 && Math.abs(currentP.x) <= 15 && currentP.y < 5.0;
        const inBalcony = currentP.y >= 5.0;"""

new_indoor_check = """        // Dynamic Ground Elevation for Grand Podium & 3 Parallel Staircases
        let targetFloorY = 0.25;
        if (currentP.z <= 1.0 && currentP.z >= -34 && Math.abs(currentP.x) <= 22) {
          if (currentP.z <= -5.5) {
            targetFloorY = 3.2; // On upper podium & inside sanctuary
          } else {
            // Climbing the 3 grand staircases (Z from 1.0 down to -5.5)
            const stairProgress = (1.0 - currentP.z) / 6.5;
            targetFloorY = 0.25 + stairProgress * 2.95;
          }
        }

        // Indoor Building Detection
        const inSanctuary = currentP.z <= -4 && currentP.z >= -32 && Math.abs(currentP.x) <= 17 && currentP.y < 6.0;
        const inBalcony = currentP.y >= 6.0 && currentP.z <= -6 && currentP.z >= -30;
        if (inBalcony) {
          targetFloorY = 7.5;
        }

        currentP.y += (targetFloorY - currentP.y) * 0.16;"""

assert old_indoor_check in content, "old_indoor_check not found"
content = content.replace(old_indoor_check, new_indoor_check)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS: Integrated authentic Main Sanctuary (Đại Hùng Bảo Điện) into Zen3DWorld.tsx!")
