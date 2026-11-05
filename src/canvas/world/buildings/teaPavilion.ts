import React from 'react';
import * as THREE from 'three';
import { createJadeCurvedRoof, createStylizedMoonWall } from './environmentProps';
import { TEA_SERVER_WAYPOINTS } from '../npcs/patrolNpcs';
import { createSideCalligraphyPlaqueTexture, createTueTinhFaceTexture, getSharedTexture } from '../textures';

export function createAuthenticTeaPavilion(
  matStoneGrey: THREE.Material,
  matLotusPlinth: THREE.Material,
  matWoodLim: THREE.Material,
  matDarkTimber: THREE.Material,
  matWoodWarm: THREE.Material,
  matAmberWood: THREE.Material,
  matJadeRoofTile: THREE.Material,
  matGold: THREE.Material,
  matBronze: THREE.Material,
  nightLightsRef: React.MutableRefObject<THREE.PointLight[]>
): {
  group: THREE.Group;
  roofs: THREE.Group[];
  teaMaster: {
    group: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    armR: THREE.Group;
    armL: THREE.Group;
    kettle: THREE.Group;
    teapot: THREE.Group;
    gaiwan: THREE.Group;
    ladle: THREE.Mesh;
    steamParticles: THREE.Mesh[];
  };
  teaServer: {
    group: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    armR: THREE.Group;
    armL: THREE.Group;
    legL: THREE.Group;
    legR: THREE.Group;
    tray: THREE.Group;
  };
} {
  const teaPavilion = new THREE.Group();
  const roofs: THREE.Group[] = [];

  // 1. NỀN MÓNG & SÀN GỖ LIM NGUYÊN KHỐI (15.4m x 13.6m)
  const baseStone = new THREE.Mesh(new THREE.BoxGeometry(15.4, 0.35, 13.6), matStoneGrey);
  baseStone.position.set(0, 0.175, 0);
  baseStone.receiveShadow = true;
  teaPavilion.add(baseStone);

  const floorPlank = new THREE.Mesh(new THREE.BoxGeometry(15.0, 0.16, 13.2), matWoodLim);
  floorPlank.position.set(0, 0.43, 0);
  floorPlank.receiveShadow = true;
  teaPavilion.add(floorPlank);

  // Viền chỉ vàng đế sàn
  const floorTrim = new THREE.Mesh(new THREE.BoxGeometry(15.1, 0.04, 13.3), matGold);
  floorTrim.position.set(0, 0.52, 0);
  teaPavilion.add(floorTrim);

  // Các mảng chiếu cói tatami trải sàn khu trà đạo
  const matTatami = new THREE.MeshStandardMaterial({ color: 0xcdad7a, roughness: 0.85 });
  const tatamiMaster = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.02, 5.2), matTatami);
  tatamiMaster.position.set(-2.6, 0.52, -1.5);
  tatamiMaster.receiveShadow = true;
  teaPavilion.add(tatamiMaster);

  const tatamiGuest1 = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.02, 4.2), matTatami);
  tatamiGuest1.position.set(3.2, 0.52, 0.6);
  tatamiGuest1.receiveShadow = true;
  teaPavilion.add(tatamiGuest1);

  const tatamiGuest2 = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.02, 3.8), matTatami);
  tatamiGuest2.position.set(-2.2, 0.52, 3.8);
  tatamiGuest2.receiveShadow = true;
  teaPavilion.add(tatamiGuest2);

  // Bậc tam cấp gỗ lim phía trước hiên trà (nối với sân gạch)
  for (let st = 0; st < 3; st++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.14, 0.45), matWoodLim);
    step.position.set(0, 0.35 - st * 0.12, 6.6 + st * 0.42);
    step.receiveShadow = true;
    teaPavilion.add(step);
  }

  // 2. HỆ 6 CỘT CÁI GỖ LIM & CHÂN TẢNG ĐÁ HOA SEN ĐỠ MÁI HIÊN
  const columnCoords = [
    [-6.6, -5.6], [0, -5.6], [6.6, -5.6],
    [-6.6, 5.6], [6.6, 5.6],
  ];
  columnCoords.forEach(([cx, cz]) => {
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.52, 0.32, 12), matLotusPlinth);
    plinth.position.set(cx, 0.66, cz);
    plinth.receiveShadow = true;
    teaPavilion.add(plinth);

    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 5.6, 16), matWoodLim);
    col.position.set(cx, 3.6, cz);
    col.castShadow = true;
    teaPavilion.add(col);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.22, 0.85), matDarkTimber);
    cap.position.set(cx, 6.4, cz);
    teaPavilion.add(cap);
  });

  // Hệ vì kèo, xà gồ gỗ lim liên kết
  const beamLeft = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 11.4), matDarkTimber);
  beamLeft.position.set(-6.6, 6.35, 0);
  teaPavilion.add(beamLeft);

  const beamRight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 11.4), matDarkTimber);
  beamRight.position.set(6.6, 6.35, 0);
  teaPavilion.add(beamRight);

  const beamFront = new THREE.Mesh(new THREE.BoxGeometry(13.4, 0.35, 0.35), matDarkTimber);
  beamFront.position.set(0, 6.35, 5.6);
  teaPavilion.add(beamFront);

  const beamBack = new THREE.Mesh(new THREE.BoxGeometry(13.4, 0.35, 0.35), matDarkTimber);
  beamBack.position.set(0, 6.35, -5.6);
  teaPavilion.add(beamBack);

  // 3. LAN CAN GỖ CON TIỆN THẾP VÀNG TRANG NHÃ
  // Lan can cạnh trái
  const railL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85, 11.2), matWoodWarm);
  railL.position.set(-6.8, 0.95, 0);
  teaPavilion.add(railL);

  // Lan can cạnh phải
  const railR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85, 11.2), matWoodWarm);
  railR.position.set(6.8, 0.95, 0);
  teaPavilion.add(railR);

  // Lan can mặt trước (hai bên bậc tam cấp)
  const railFL = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.85, 0.18), matWoodWarm);
  railFL.position.set(-4.8, 0.95, 6.4);
  teaPavilion.add(railFL);

  const railFR = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.85, 0.18), matWoodWarm);
  railFR.position.set(4.8, 0.95, 6.4);
  teaPavilion.add(railFR);

  // Búp sen mạ vàng trên các đầu trụ lan can
  [[-6.8, 6.4], [-3.4, 6.4], [3.4, 6.4], [6.8, 6.4], [-6.8, -5.6], [6.8, -5.6]].forEach(([bx, bz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.05, 0.24), matDarkTimber);
    post.position.set(bx, 1.05, bz);
    teaPavilion.add(post);

    const bud = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 6), matGold);
    bud.position.set(bx, 1.68, bz);
    teaPavilion.add(bud);
  });

  // 4. VÁCH NGUYỆT MÔN PHÍA SAU (MOON WINDOW WALL)
  const moonWall = createStylizedMoonWall(matWoodWarm);
  moonWall.position.set(0, 3.2, -6.2);
  teaPavilion.add(moonWall);

  // 5. MÁI CĂNG HIÊN MEN NGỌC UỐN CONG DUYÊN DÁNG (JADE CURVED ROOF)
  const teaRoof = createJadeCurvedRoof(17.6, 15.6, 3.4, matJadeRoofTile, matGold);
  teaRoof.position.set(0, 6.6, 0);
  roofs.push(teaRoof);
  teaPavilion.add(teaRoof);

  // 4 Chuông gió phong linh bằng đồng treo 4 góc mái hiên
  const chimeOffsets = [
    [-8.2, 5.0, 7.2], [8.2, 5.0, 7.2],
    [-8.2, 5.0, -7.2], [8.2, 5.0, -7.2],
  ];
  chimeOffsets.forEach(([cx, cy, cz]) => {
    const chimeString = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.65, 4), matGold);
    chimeString.position.set(cx, cy + 0.35, cz);
    teaPavilion.add(chimeString);

    const chimeBell = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.16, 8), matBronze);
    chimeBell.position.set(cx, cy, cz);
    teaPavilion.add(chimeBell);

    const tassel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 0.02), matGold);
    tassel.position.set(cx, cy - 0.24, cz);
    teaPavilion.add(tassel);
  });

  // 6. HOÀNH PHI BIỂN HIỆU "THIỀN TRÀ QUÁN"
  const plaqueFrame = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.25, 0.12), matDarkTimber);
  plaqueFrame.position.set(0, 6.0, 5.75);
  teaPavilion.add(plaqueFrame);

  const plaqueGoldBorder = new THREE.Mesh(new THREE.BoxGeometry(5.3, 1.35, 0.06), matGold);
  plaqueGoldBorder.position.set(0, 6.0, 5.72);
  teaPavilion.add(plaqueGoldBorder);

  const plaqueMat = new THREE.MeshStandardMaterial({
    map: getSharedTexture('plaque_thientraquan', () => createSideCalligraphyPlaqueTexture('THIỀN TRÀ QUÁN')),
    roughness: 0.3,
    metalness: 0.35,
  });
  const plaqueMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 1.1), plaqueMat);
  plaqueMesh.position.set(0, 6.0, 5.82);
  teaPavilion.add(plaqueMesh);

  // 7. ĐÈN LỒNG LỤA ĐỎ & ÁNH SÁNG ẤM CÚNG BAN ĐÊM
  const lanternPositions = [
    [-4.5, 5.1, 3.8], [4.5, 5.1, 3.8],
    [-4.5, 5.1, -2.6], [4.5, 5.1, -2.6],
  ];
  const matLanternSilk = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xb91c1c,
    emissiveIntensity: 0.7,
    roughness: 0.4,
  });
  lanternPositions.forEach(([lx, ly, lz]) => {
    const lBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.52, 12), matLanternSilk);
    lBody.position.set(lx, ly, lz);
    teaPavilion.add(lBody);

    const lCapT = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.24, 0.06, 12), matGold);
    lCapT.position.set(lx, ly + 0.28, lz);
    teaPavilion.add(lCapT);
    const lCapB = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.06, 12), matGold);
    lCapB.position.set(lx, ly - 0.28, lz);
    teaPavilion.add(lCapB);

    const pLight = new THREE.PointLight(0xf59e0b, 0.65, 6.5);
    pLight.position.set(lx, ly, lz);
    nightLightsRef.current.push(pLight);
    teaPavilion.add(pLight);
  });

  // 8. BÀN TRÀ ĐẠO LŨA NGUYÊN KHỐI CỦA NPC PHA TRÀ (MASTER TEA COUNTER)
  const masterTableGroup = new THREE.Group();
  masterTableGroup.position.set(-2.6, 0.52, -1.2);

  const teaTable = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.52, 1.6), matDarkTimber);
  teaTable.position.set(0, 0.26, 0);
  teaTable.castShadow = true;
  masterTableGroup.add(teaTable);

  const tableTrim = new THREE.Mesh(new THREE.BoxGeometry(3.64, 0.04, 1.64), matGold);
  tableTrim.position.set(0, 0.52, 0);
  masterTableGroup.add(tableTrim);

  // Bếp lò đất nung đun nước sôi
  const furnace = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.20, 0.26, 12), matStoneGrey);
  furnace.position.set(-1.15, 0.65, -0.25);
  masterTableGroup.add(furnace);

  const coals = new THREE.Mesh(new THREE.CircleGeometry(0.18, 10), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
  coals.rotateX(-Math.PI / 2);
  coals.position.set(-1.15, 0.785, -0.25);
  masterTableGroup.add(coals);

  // Cụm ấm đồng cổ đun nước sôi có vòi (Kettle Group)
  const kettleGroup = new THREE.Group();
  kettleGroup.position.set(-1.15, 0.94, -0.25);

  const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.28, 12), matBronze);
  kettleGroup.add(kettle);

  const kettleHandle = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 6, 12, Math.PI), matDarkTimber);
  kettleHandle.position.set(0, 0.16, 0);
  kettleGroup.add(kettleHandle);
  masterTableGroup.add(kettleGroup);

  // Khay trà thuyền trúc hoa sen
  const teaTray = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.95), matWoodLim);
  teaTray.position.set(0.3, 0.54, 0.05);
  masterTableGroup.add(teaTray);

  // Cụm ấm trà Tử Sa (Yixing Teapot Group màu nâu đỏ)
  const teapotGroup = new THREE.Group();
  teapotGroup.position.set(0.1, 0.68, -0.05);

  const matClay = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.6 });
  const teapot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), matClay);
  teapotGroup.add(teapot);

  const teapotSpout = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 6), matClay);
  teapotSpout.rotation.z = -Math.PI / 3;
  teapotSpout.position.set(0.10, 0.02, 0);
  teapotGroup.add(teapotSpout);

  const teapotLid = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.04, 10), matGold);
  teapotLid.position.set(0, 0.13, 0);
  teapotGroup.add(teapotLid);
  masterTableGroup.add(teapotGroup);

  // Cụm chén tống men ngọc (Gaiwan Group) & 4 chén quân bạch ngọc
  const matCeladon = new THREE.MeshStandardMaterial({ color: 0x6ee7b7, roughness: 0.35, metalness: 0.15 });
  const gaiwanGroup = new THREE.Group();
  gaiwanGroup.position.set(0.55, 0.62, -0.05);

  const gaiwan = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.12, 10), matCeladon);
  gaiwanGroup.add(gaiwan);
  masterTableGroup.add(gaiwanGroup);

  for (let idx = 0; idx < 4; idx++) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.03, 0.06, 8), matCeladon);
    cup.position.set(0.15 + (idx % 2) * 0.22, 0.59, 0.25 + Math.floor(idx / 2) * 0.15);
    masterTableGroup.add(cup);
  }

  // Hơi nước trà bốc khói nghi ngút (Steam Particles)
  const steamParticles: THREE.Mesh[] = [];
  const matSteam = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  for (let s = 0; s < 6; s++) {
    const steam = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), matSteam);
    steam.position.set(-1.15 + (s % 2) * 1.25, 1.15 + s * 0.22, -0.2 + (s % 3) * 0.08);
    masterTableGroup.add(steam);
    steamParticles.push(steam);
  }

  teaPavilion.add(masterTableGroup);

  // 9. BÀN TRÀ KHÁCH 1 & BỒ ĐOÀN NGỒI THƯỞNG TRÀ (GUEST TABLE 1)
  const guestGroup1 = new THREE.Group();
  guestGroup1.position.set(3.2, 0.52, 0.6);

  const gTable1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.44, 1.5), matAmberWood);
  gTable1.position.set(0, 0.22, 0);
  gTable1.castShadow = true;
  guestGroup1.add(gTable1);

  // Ấm trà & chén trên bàn khách 1
  const gPot1 = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 8), matCeladon);
  gPot1.position.set(0, 0.53, 0);
  guestGroup1.add(gPot1);

  for (const [cx, cz] of [[-0.4, 0.2], [0.4, 0.2], [-0.4, -0.2], [0.4, -0.2]]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.05, 8), matCeladon);
    cup.position.set(cx, 0.47, cz);
    guestGroup1.add(cup);
  }

  // Bình hoa sen tươi
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.10, 0.26, 8), matDarkTimber);
  vase.position.set(0.75, 0.57, -0.4);
  guestGroup1.add(vase);
  const lotusBud = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 6), new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 }));
  lotusBud.position.set(0.75, 0.77, -0.4);
  guestGroup1.add(lotusBud);

  // Bồ đoàn gấm đỏ viền vàng cho khách ngồi
  const matCushionRed = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.75 });
  const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 0.12, 16), matCushionRed);
  c1.position.set(-1.55, 0.06, 0);
  guestGroup1.add(c1);
  const c1Rim = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.02, 6, 16), matGold);
  c1Rim.rotateX(Math.PI / 2);
  c1Rim.position.set(-1.55, 0.06, 0);
  guestGroup1.add(c1Rim);

  const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 0.12, 16), matCushionRed);
  c2.position.set(1.55, 0.06, 0);
  guestGroup1.add(c2);
  const c2Rim = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.02, 6, 16), matGold);
  c2Rim.rotateX(Math.PI / 2);
  c2Rim.position.set(1.55, 0.06, 0);
  guestGroup1.add(c2Rim);

  teaPavilion.add(guestGroup1);

  // 10. BÀN TRÀ KHÁCH 2 & BỒ ĐOÀN (GUEST TABLE 2)
  const guestGroup2 = new THREE.Group();
  guestGroup2.position.set(-2.2, 0.52, 3.8);

  const gTable2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.44, 1.4), matWoodWarm);
  gTable2.position.set(0, 0.22, 0);
  gTable2.castShadow = true;
  guestGroup2.add(gTable2);

  const gPot2 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), matBronze);
  gPot2.position.set(0, 0.52, 0);
  guestGroup2.add(gPot2);

  const c3 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.50, 0.12, 16), matCushionRed);
  c3.position.set(0, 0.06, 1.15);
  guestGroup2.add(c3);

  teaPavilion.add(guestGroup2);

  // 11. CÂY TÙNG BONSAI CỔ THỤ
  const bonsaiGroup = new THREE.Group();
  bonsaiGroup.position.set(5.5, 0.52, -4.5);

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.50, 0.42, 8), matStoneGrey);
  pot.position.set(0, 0.21, 0);
  bonsaiGroup.add(pot);

  const bTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.2, 8), matDarkTimber);
  bTrunk.rotation.z = 0.25;
  bTrunk.position.set(0.1, 0.85, 0);
  bonsaiGroup.add(bTrunk);

  const matPine = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
  for (let p = 0; p < 4; p++) {
    const pad = new THREE.Mesh(new THREE.ConeGeometry(0.38 - p * 0.05, 0.25, 8), matPine);
    pad.position.set(0.25 + (p % 2) * 0.18, 1.35 + p * 0.22, (p > 1 ? 0.15 : -0.15));
    bonsaiGroup.add(pad);
  }
  teaPavilion.add(bonsaiGroup);

  // 12. NPC 1: CHÚ TIỂU PHA TRÀ (TUỆ TRÀ - NGỒI KIẾT GIÀ PHA TRÀ)
  const masterNpcGroup = new THREE.Group();
  masterNpcGroup.position.set(-2.6, 0.52, -2.4);

  // Bồ đoàn riêng của Chú Tiểu Pha Trà
  const mCushion = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.15, 16), matCushionRed);
  mCushion.position.set(0, 0.075, 0);
  masterNpcGroup.add(mCushion);
  const mRim = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.025, 6, 16), matGold);
  mRim.rotateX(Math.PI / 2);
  mRim.position.set(0, 0.075, 0);
  masterNpcGroup.add(mRim);

  const matMonkRobe = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.75 });
  const matNoviceCollar = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
  const matSkin = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.55 });

  // Đôi chân ngồi kiết già
  const mLegs = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.25, 14), matMonkRobe);
  mLegs.position.set(0, 0.24, 0.08);
  masterNpcGroup.add(mLegs);

  // Thân trên (Torso)
  const mTorso = new THREE.Group();
  mTorso.position.set(0, 0.36, 0);

  const mBody = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 0.60, 12), matMonkRobe);
  mBody.position.set(0, 0.28, 0);
  mBody.castShadow = true;
  mTorso.add(mBody);

  const mCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.30, 0.15, 12), matNoviceCollar);
  mCollar.position.set(0, 0.52, 0);
  mTorso.add(mCollar);

  // Tay trái đặt nhẹ thư thái
  const mArmL = new THREE.Group();
  mArmL.position.set(-0.30, 0.48, 0.02);
  const mSleeveL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.38, 8), matMonkRobe);
  mSleeveL.position.set(0, -0.16, 0.10);
  mSleeveL.rotation.x = 0.55;
  mSleeveL.rotation.z = -0.35;
  mArmL.add(mSleeveL);
  const mHandL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), matSkin);
  mHandL.position.set(0.02, -0.32, 0.22);
  mArmL.add(mHandL);
  mTorso.add(mArmL);

  // Tay phải cử động nâng ấm / muỗng pha trà
  const mArmR = new THREE.Group();
  mArmR.position.set(0.30, 0.48, 0.02);
  const mSleeveR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.38, 8), matMonkRobe);
  mSleeveR.position.set(0, -0.16, 0.10);
  mSleeveR.rotation.x = -0.65;
  mSleeveR.rotation.z = 0.25;
  mArmR.add(mSleeveR);
  const mHandR = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), matSkin);
  mHandR.position.set(-0.02, -0.32, 0.24);
  mArmR.add(mHandR);
  const ladle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 6), matWoodWarm);
  ladle.position.set(-0.02, -0.32, 0.38);
  ladle.rotation.x = Math.PI / 3;
  mArmR.add(ladle);
  mTorso.add(mArmR);

  // Đầu Chú Tiểu Chibi với 3 nốt giới hương
  const mHead = new THREE.Group();
  mHead.position.set(0, 0.62, 0);

  const faceTexMaster = getSharedTexture('tuetinh_face', createTueTinhFaceTexture);
  const mFaceMat = new THREE.MeshStandardMaterial({ map: faceTexMaster, roughness: 0.5 });
  const mHeadMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 20), mFaceMat);
  mHeadMesh.rotation.y = -Math.PI / 2;
  mHeadMesh.castShadow = true;
  mHead.add(mHeadMesh);

  for (const ex of [-0.28, 0.28]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), matSkin);
    ear.scale.set(0.5, 1.0, 0.7);
    ear.position.set(ex, 0, -0.02);
    mHead.add(ear);
  }
  mTorso.add(mHead);
  masterNpcGroup.add(mTorso);
  teaPavilion.add(masterNpcGroup);

  // 13. NPC 2: CHÚ TIỂU PHỤC VỤ TRÀ (TIỂU TRÀ - ĐI LẠI BƯNG KHAY TRÀ PHỤC VỤ & CHÀO KHÁCH)
  const serverNpcGroup = new THREE.Group();
  serverNpcGroup.position.set(TEA_SERVER_WAYPOINTS[0].x, 0.52, TEA_SERVER_WAYPOINTS[0].z);
  serverNpcGroup.rotation.y = TEA_SERVER_WAYPOINTS[0].facingAngle || 0;

  // Đôi chân Chibi Chú Tiểu có khớp hông xoay bipedal để bước đi tự nhiên
  const sLegL = new THREE.Group();
  sLegL.position.set(-0.12, 0.54, 0);
  const sLegLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 0.54, 8), matMonkRobe);
  sLegLMesh.position.set(0, -0.27, 0);
  sLegLMesh.castShadow = true;
  sLegL.add(sLegLMesh);
  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.20), matNoviceCollar);
  shoeL.position.set(0, -0.52, 0.04);
  sLegL.add(shoeL);
  serverNpcGroup.add(sLegL);

  const sLegR = new THREE.Group();
  sLegR.position.set(0.12, 0.54, 0);
  const sLegRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 0.54, 8), matMonkRobe);
  sLegRMesh.position.set(0, -0.27, 0);
  sLegRMesh.castShadow = true;
  sLegR.add(sLegRMesh);
  const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.20), matNoviceCollar);
  shoeR.position.set(0, -0.52, 0.04);
  sLegR.add(shoeR);
  serverNpcGroup.add(sLegR);

  const sTorso = new THREE.Group();
  sTorso.position.set(0, 0.56, 0);

  const sBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.30, 0.58, 12), matMonkRobe);
  sBody.position.set(0, 0.28, 0);
  sBody.castShadow = true;
  sTorso.add(sBody);

  const sCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.14, 12), matNoviceCollar);
  sCollar.position.set(0, 0.50, 0);
  sTorso.add(sCollar);

  // Cụm khay trà dâng khách (Tray)
  const trayGroup = new THREE.Group();
  trayGroup.position.set(0, 0.38, 0.38);

  const sTray = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.04, 0.44), matWoodLim);
  sTray.castShadow = true;
  trayGroup.add(sTray);

  const sTrayTrim = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.02, 0.46), matGold);
  sTrayTrim.position.set(0, 0.03, 0);
  trayGroup.add(sTrayTrim);

  for (const cx of [-0.16, 0.16]) {
    const sCup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.08, 10), matCeladon);
    sCup.position.set(cx, 0.06, 0);
    trayGroup.add(sCup);

    const sSteam = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), matSteam);
    sSteam.position.set(cx, 0.14, 0);
    trayGroup.add(sSteam);
  }
  sTorso.add(trayGroup);

  const sArmR = new THREE.Group();
  sArmR.position.set(0.28, 0.46, 0.02);
  const sSleeveR = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.10, 0.36, 8), matMonkRobe);
  sSleeveR.position.set(-0.06, -0.12, 0.16);
  sSleeveR.rotation.x = -0.85;
  sSleeveR.rotation.y = -0.35;
  sArmR.add(sSleeveR);
  sTorso.add(sArmR);

  const sArmL = new THREE.Group();
  sArmL.position.set(-0.28, 0.46, 0.02);
  const sSleeveL = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.10, 0.36, 8), matMonkRobe);
  sSleeveL.position.set(0.06, -0.12, 0.16);
  sSleeveL.rotation.x = -0.85;
  sSleeveL.rotation.y = 0.35;
  sArmL.add(sSleeveL);
  sTorso.add(sArmL);

  const sHead = new THREE.Group();
  sHead.position.set(0, 0.58, 0);

  const faceTexServer = getSharedTexture('tuetinh_face', createTueTinhFaceTexture);
  const sFaceMat = new THREE.MeshStandardMaterial({ map: faceTexServer, roughness: 0.5 });
  const sHeadMesh = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 20), sFaceMat);
  sHeadMesh.rotation.y = -Math.PI / 2;
  sHeadMesh.castShadow = true;
  sHead.add(sHeadMesh);

  for (const ex of [-0.27, 0.27]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), matSkin);
    ear.scale.set(0.5, 1.0, 0.7);
    ear.position.set(ex, 0, -0.02);
    sHead.add(ear);
  }
  sTorso.add(sHead);
  serverNpcGroup.add(sTorso);
  teaPavilion.add(serverNpcGroup);

  return {
    group: teaPavilion,
    roofs,
    teaMaster: {
      group: masterNpcGroup,
      torso: mTorso,
      head: mHead,
      armR: mArmR,
      armL: mArmL,
      kettle: kettleGroup,
      teapot: teapotGroup,
      gaiwan: gaiwanGroup,
      ladle,
      steamParticles,
    },
    teaServer: {
      group: serverNpcGroup,
      torso: sTorso,
      head: sHead,
      armR: sArmR,
      armL: sArmL,
      legL: sLegL,
      legR: sLegR,
      tray: trayGroup,
    },
  };
}
