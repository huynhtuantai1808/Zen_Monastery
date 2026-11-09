import React from 'react';
import * as THREE from 'three';
import { createBracketCorbelRing, createJadeCurvedRoof } from './environmentProps';

export function createAuthenticJadePagoda(
  matJadeTile: THREE.Material,
  matAmberWood: THREE.Material,
  matDarkTimber: THREE.Material,
  matLotusPlinth: THREE.Material,
  matGold: THREE.Material,
  nightLightsRef: React.MutableRefObject<THREE.PointLight[]>
): THREE.Group {
  const pagoda = new THREE.Group();

  // 1. MULTI-TIER LOTUS PEDESTAL BASE (ĐÀI SEN TAM CẤP)
  // 1.0 Chân móng đá hoa cương chìm âm thổ (Loại bỏ triệt để hiện tượng hở đáy / lơ lửng)
  const subBase = new THREE.Mesh(new THREE.BoxGeometry(19.6, 2.5, 19.6), matLotusPlinth);
  subBase.position.set(0, -0.65, 0);
  subBase.receiveShadow = true;
  pagoda.add(subBase);

  // Step 1: Base plinth
  const base1 = new THREE.Mesh(new THREE.BoxGeometry(18, 1.4, 18), matLotusPlinth);
  base1.position.set(0, 0.7, 0);
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
}
