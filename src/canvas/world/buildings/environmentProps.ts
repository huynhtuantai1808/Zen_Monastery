import * as THREE from 'three';

// Puffy Stylized Foliage Tree (Ghibli / Zelda Style)
export function createStylizedPuffyTree(): THREE.Group {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.55, 3.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
  );
  trunk.position.set(0, 1.6, 0);
  trunk.castShadow = true;
  tree.add(trunk);

  // Overlapping puffy foliage spheres
  const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.75 });
  const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.7 });
  const foliageMat3 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });

  const c1 = new THREE.Mesh(new THREE.SphereGeometry(2.1, 10, 10), foliageMat1);
  c1.position.set(0, 3.8, 0);
  tree.add(c1);

  const c2 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 8, 8), foliageMat2);
  c2.position.set(0.9, 4.4, 0.4);
  tree.add(c2);

  const c3 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), foliageMat3);
  c3.position.set(-0.8, 4.2, -0.5);
  tree.add(c3);

  const cTop = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 8), foliageMat2);
  cTop.position.set(0, 5.2, 0);
  tree.add(cTop);

  return tree;
}

// Stylized Curved Tile Roof with Upturned Dragon Eaves
export function createStylizedCurvedRoof(width: number, depth: number, matTile: THREE.Material): THREE.Group {
  const roofGroup = new THREE.Group();
  const roof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.7, depth * 0.4, 4), matTile);
  roof.rotateY(Math.PI / 4);
  roof.scale.set(1.0, 0.4, depth / width);
  roof.castShadow = true;
  roofGroup.add(roof);

  // 4 Upturned Corner Eaves
  const r = width * 0.46;
  for (const a of [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4]) {
    const finial = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.18, 6, 12, Math.PI * 0.75), matTile);
    finial.position.set(Math.cos(a) * r, -depth * 0.08, Math.sin(a) * r * (depth / width));
    finial.rotation.z = Math.PI / 4;
    roofGroup.add(finial);
  }
  return roofGroup;
}

// Authentic Long Gallery / Corridor Roof with Horizontal Ridge, Sweeping Concave Eaves & Dragon Finials
export function createAuthenticLongCorridorRoof(
  width: number,
  length: number,
  height: number,
  matJadeTile: THREE.Material,
  matDarkTimber: THREE.Material,
  matGold: THREE.Material
): THREE.Group {
  const roofGroup = new THREE.Group();

  const halfW = width / 2;
  const halfL = length / 2;
  const numZSegments = 24;
  const numXSegments = 16;

  // 1. Procedural Double-Curved Concave Roof Surface
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iz = 0; iz <= numZSegments; iz++) {
    const fracZ = iz / numZSegments;
    const z = -halfL + fracZ * length;

    for (let ix = 0; ix <= numXSegments; ix++) {
      const fracX = ix / numXSegments;
      const x = -halfW + fracX * width;

      // Normalized distance from center ridge (0 at center, 1 at eaves)
      const distFromRidge = Math.abs(x) / halfW;

      // Authentic Vietnamese temple concave curve: y = height * (1 - dist^1.35)
      let y = height * Math.pow(Math.max(0, 1.0 - distFromRidge), 1.35);

      // Graceful upward flare at the 4 corner eaves
      const cornerZ = Math.max(0, (Math.abs(z) - (halfL - 3.5)) / 3.5);
      const cornerX = Math.max(0, (Math.abs(x) - (halfW - 2.0)) / 2.0);
      if (cornerZ > 0 && cornerX > 0) {
        y += Math.pow(cornerZ * cornerX, 1.6) * 0.55;
      }

      positions.push(x, y, z);
      uvs.push(fracX * 4, fracZ * 18);
    }
  }

  for (let iz = 0; iz < numZSegments; iz++) {
    for (let ix = 0; ix < numXSegments; ix++) {
      const a = iz * (numXSegments + 1) + ix;
      const b = iz * (numXSegments + 1) + (ix + 1);
      const c = (iz + 1) * (numXSegments + 1) + ix;
      const d = (iz + 1) * (numXSegments + 1) + (ix + 1);

      // Normals pointing upwards / outwards
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const roofGeo = new THREE.BufferGeometry();
  roofGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  roofGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  roofGeo.setIndex(indices);
  roofGeo.computeVertexNormals();

  const roofMesh = new THREE.Mesh(roofGeo, matJadeTile);
  roofMesh.castShadow = true;
  roofMesh.receiveShadow = true;
  roofGroup.add(roofMesh);

  // Underside rafter ceiling panel (Trần rui mè gỗ lim nhìn từ dưới lên)
  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.88, 0.08, length * 0.98),
    matDarkTimber
  );
  ceiling.position.set(0, -0.04, 0);
  roofGroup.add(ceiling);

  // 2. Horizontal Ridge Beam with Jade Glazed Capping & Gold Inlay
  const ridgeLen = length * 0.98;
  const ridgeCyl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, ridgeLen, 8),
    matJadeTile
  );
  ridgeCyl.rotation.x = Math.PI / 2;
  ridgeCyl.position.set(0, height + 0.12, 0);
  roofGroup.add(ridgeCyl);

  const ridgeGold = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.20, ridgeLen),
    matGold
  );
  ridgeGold.position.set(0, height + 0.28, 0);
  roofGroup.add(ridgeGold);

  // Dragon-Head Finials (Kìm Nóc Ngậm Bờ Nóc) at both ends of the ridge
  for (const rz of [-halfL * 0.96, halfL * 0.96]) {
    const finialGroup = new THREE.Group();
    finialGroup.position.set(0, height + 0.35, rz);

    const headArc = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.18, 8, 16, Math.PI * 0.75),
      matGold
    );
    headArc.rotation.y = rz > 0 ? Math.PI / 2 : -Math.PI / 2;
    finialGroup.add(headArc);

    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 6), matGold);
    horn.position.set(0, 0.55, rz > 0 ? -0.25 : 0.25);
    horn.rotation.x = rz > 0 ? -Math.PI / 5 : Math.PI / 5;
    finialGroup.add(horn);

    roofGroup.add(finialGroup);
  }

  // 3. Eave Border Trim (Diềm Mái Ngói Trích Thủy)
  for (const ex of [-halfW, halfW]) {
    const eaveTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.22, length),
      matDarkTimber
    );
    eaveTrim.position.set(ex, -0.05, 0);
    roofGroup.add(eaveTrim);
  }

  // 4. 4 Upturned Dragon Corner Eaves (Đầu Đao Cong Vút Mạ Vàng)
  for (const cx of [-halfW, halfW]) {
    for (const cz of [-halfL, halfL]) {
      const eaveArc = new THREE.Mesh(
        new THREE.TorusGeometry(1.0, 0.22, 8, 16, Math.PI * 0.75),
        matJadeTile
      );
      eaveArc.position.set(cx, 0.38, cz);
      eaveArc.rotation.z = cx < 0 ? Math.PI / 3.4 : -Math.PI / 3.4;
      eaveArc.rotation.y = cz < 0 ? -Math.PI / 4 : Math.PI / 4;
      roofGroup.add(eaveArc);

      const eaveTip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.75, 6), matGold);
      eaveTip.position.set(
        cx + (cx < 0 ? -0.5 : 0.5),
        1.0,
        cz + (cz < 0 ? -0.5 : 0.5)
      );
      eaveTip.rotation.z = cx < 0 ? -Math.PI / 4 : Math.PI / 4;
      roofGroup.add(eaveTip);
    }
  }

  // 5. Gable End Pediment Trusses (Đầu Hồi Bít Đốc & Vì Kẻ Gỗ Lim)
  for (const gz of [-halfL, halfL]) {
    const pediment = new THREE.Group();
    pediment.position.set(0, 0, gz);

    const tieBeam = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.94, 0.34, 0.4),
      matDarkTimber
    );
    tieBeam.position.set(0, -0.15, 0);
    pediment.add(tieBeam);

    const kingPost = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, height - 0.2, 0.38),
      matDarkTimber
    );
    kingPost.position.set(0, height / 2 - 0.1, 0);
    pediment.add(kingPost);

    for (const side of [-1, 1]) {
      const rafterLen = Math.hypot(halfW * 0.9, height);
      const rafter = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.3, rafterLen),
        matDarkTimber
      );
      rafter.position.set(side * halfW * 0.45, height * 0.45, 0);
      rafter.rotation.y = Math.PI / 2;
      rafter.rotation.x = side * Math.atan2(height, halfW * 0.9);
      pediment.add(rafter);
    }

    roofGroup.add(pediment);
  }

  return roofGroup;
}

// Sweeping Jade-Green Glazed Tile Roof with Upturned Corners and Ornamental Crests
export function createJadeCurvedRoof(
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
export function createBracketCorbelRing(width: number, y: number, matDarkTimber: THREE.Material): THREE.Group {
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

// Sweeping Multi-Slope Roof with Upturned Corners and Dragon Ridge Crests
export function createSweepingHallRoof(
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

export function createStylizedMoonWall(matWood: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const wallL = new THREE.Mesh(new THREE.BoxGeometry(4.5, 6.0, 0.4), matWood);
  wallL.position.set(-5.2, 0, 0);
  group.add(wallL);

  const wallR = new THREE.Mesh(new THREE.BoxGeometry(4.5, 6.0, 0.4), matWood);
  wallR.position.set(5.2, 0, 0);
  group.add(wallR);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.35, 12, 28), matWood);
  group.add(ring);

  const barH = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 0.08), matWood);
  group.add(barH);
  const barV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.2, 0.08), matWood);
  group.add(barV);

  return group;
}

// Stylized Stone Arch Gate
export function createStylizedStoneArch(matStone: THREE.Material): THREE.Group {
  const gate = new THREE.Group();
  const lPost = new THREE.Mesh(new THREE.BoxGeometry(1.3, 5.8, 1.3), matStone);
  lPost.position.set(-2.6, 2.9, 0);
  gate.add(lPost);

  const rPost = new THREE.Mesh(new THREE.BoxGeometry(1.3, 5.8, 1.3), matStone);
  rPost.position.set(2.6, 2.9, 0);
  gate.add(rPost);

  const arch = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.2, 1.5), matStone);
  arch.position.set(0, 6.2, 0);
  gate.add(arch);

  return gate;
}

// Stylized Stone Lantern
export function createStylizedStoneLantern(matStone: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 0.45, 6), matStone);
  base.position.set(0, 0.22, 0);
  g.add(base);

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 1.3, 6), matStone);
  shaft.position.set(0, 1.05, 0);
  g.add(shaft);

  const fireBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.7, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.95 })
  );
  fireBox.position.set(0, 1.95, 0);
  g.add(fireBox);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.6, 6), matStone);
  cap.position.set(0, 2.55, 0);
  g.add(cap);

  return g;
}

// Stylized Silk Lantern
export function createStylizedSilkLantern(matSilk: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 12), matSilk);
  body.scale.set(1.0, 1.25, 1.0);
  g.add(body);

  const tassel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.18, 0.65, 8),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 })
  );
  tassel.position.set(0, -0.85, 0);
  g.add(tassel);

  return g;
}

