import { getMapleTreeColliders } from './environment/mapleTreeEnsemble';
import { getLaborNpcColliders } from './npcs/laborNpcs';

// =======================================================================
// MONASTERY COLLIDERS, ELEVATION LOGIC & ZONE DEFINITIONS

// =======================================================================

export interface TempleZoneCamera {
  yaw: number;
  pitch: number;
  dist: number;
  mode?: 'THIRD_PERSON' | 'ISOMETRIC' | 'ON_RAINY_DAYS';
}

export interface TempleZoneInfo {
  id: string;
  name: string;
  subtitle: string;
  dimensions: string;
  icon: string;
  desc: string;
  pos: { x: number; y?: number; z: number };
  actionKey:
  | 'GATE'
  | 'COURTYARD'
  | 'TOWER'
  | 'BELL'
  | 'POND'
  | 'CORRIDOR'
  | 'SANCTUARY'
  | 'MEDITATION'
  | 'LIBRARY'
  | 'BACK_GARDEN'
  | 'GUANYIN_HALL'
  | 'BALCONY'
  | 'STAIRS'
  | 'AERIAL'
  | 'NIGHT';
  camera?: TempleZoneCamera;
  facingAngle?: number;
  tourAction?: 'STAND' | 'INCENSE_BOW' | 'SIT_EDGE' | 'LIE_DOWN';
  tourSound?: 'bell' | 'bowl' | 'chime' | 'woodfish' | 'tea';
  navWaypoints?: Array<{ x: number; z: number }>;
}

export interface CircleObstacle {
  type: 'circle';
  x: number;
  z: number;
  r: number;
  minY?: number;
  maxY?: number;
  name?: string;
}

export interface BoxObstacle {
  type: 'box';
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY?: number;
  maxY?: number;
  name?: string;
}

export type MonasteryObstacle = CircleObstacle | BoxObstacle;

export const MONK_COLLISION_RADIUS = 0.45;

// Comprehensive monastery collision geometry (Circles & AABB Boxes)
export const MONASTERY_OBSTACLES: MonasteryObstacle[] = [
  // 0. TƯỜNG BAO KHUÔN VIÊN SƠN TỰ (MONASTERY PERIMETER BOUNDARY WALLS: 104m x 124m)
  // Tường Nam cánh Tây (South Wall West: X từ -52 đến -8, Z: 66)
  { type: 'box', minX: -53.2, maxX: -8.0, minZ: 65.3, maxZ: 66.8, maxY: 4.5, name: 'South Perimeter Wall West' },
  // Tường Nam cánh Đông (South Wall East: X từ 8 đến 52, Z: 66)
  { type: 'box', minX: 8.0, maxX: 53.2, minZ: 65.3, maxZ: 66.8, maxY: 4.5, name: 'South Perimeter Wall East' },
  // Tường Tây (West Wall: X = -52, Z từ 66 đến -58)
  { type: 'box', minX: -53.2, maxX: -51.3, minZ: -59.2, maxZ: 66.8, maxY: 4.5, name: 'West Perimeter Wall' },
  // Tường Bắc (North Wall: Z = -58, X từ -52 đến 52)
  { type: 'box', minX: -53.2, maxX: 53.2, minZ: -59.2, maxZ: -57.3, maxY: 4.5, name: 'North Perimeter Wall' },
  // Tường Đông (East Wall: X = 52, Z từ -58 đến 66)
  { type: 'box', minX: 51.3, maxX: 53.2, minZ: -59.2, maxZ: 66.8, maxY: 4.5, name: 'East Perimeter Wall' },

  // 0.1 HÀNG CÂY PHONG LÁ ĐỎ CỔ THỤ VEN TƯỜNG BAO & HAI BÊN CỔNG (26 cây phong - Zero-Clipping)
  ...getMapleTreeColliders(),

  // 0.2 CÁC NPC LAO TÁC THIỀN MÔN HẬU VIỆN (6 vị trí chú tiểu & phật tử lao tác)
  ...getLaborNpcColliders(),

  // 1. CỔNG TAM QUAN 3 GIAN CỔ TRUYỀN (Zone 1 Gate: 4 stone pillars + 3 open portals)
  // 4 trụ đá hoa cương bát giác Cổng Tam Quan (khoảng mở thông thủy > 3.5m cho mỗi gian)
  { type: 'circle', x: -7.2, z: 66.0, r: 0.72, name: 'Gate Pillar West Outer' },
  { type: 'circle', x: -2.4, z: 66.0, r: 0.72, name: 'Gate Pillar West Inner' },
  { type: 'circle', x: 2.4, z: 66.0, r: 0.72, name: 'Gate Pillar East Inner' },
  { type: 'circle', x: 7.2, z: 66.0, r: 0.72, name: 'Gate Pillar East Outer' },
  // Đôi tượng linh thú / sư tử đá chầu bậc tam cấp lối vào chính
  { type: 'circle', x: -3.8, z: 69.2, r: 0.65, name: 'Guardian Lion Left' },
  { type: 'circle', x: 3.8, z: 69.2, r: 0.65, name: 'Guardian Lion Right' },
  // Đôi đèn đá cổ kính mặt tiền cổng
  { type: 'circle', x: -8.2, z: 67.8, r: 0.6, name: 'Gate Stone Lantern L' },
  { type: 'circle', x: 8.2, z: 67.8, r: 0.6, name: 'Gate Stone Lantern R' },
  { type: 'circle', x: -8.6, z: 66.0, r: 0.35, name: 'Flagpole L' },
  { type: 'circle', x: 8.6, z: 66.0, r: 0.35, name: 'Flagpole R' },

  // 2. Sân Chùa (Zone 2 Courtyard) - Bronze Censer, Bonsai pots & Stone lanterns
  { type: 'circle', x: 0.0, z: 22.0, r: 2.2, name: 'Bronze Censer' },
  { type: 'circle', x: -20.0, z: 33.0, r: 1.45, name: 'Bonsai 1' },
  { type: 'circle', x: -20.0, z: 15.0, r: 1.45, name: 'Bonsai 2' },
  { type: 'circle', x: 20.0, z: 33.0, r: 1.45, name: 'Bonsai 3' },
  { type: 'circle', x: 20.0, z: 15.0, r: 1.45, name: 'Bonsai 4' },
  { type: 'circle', x: -12.0, z: 35.0, r: 1.45, name: 'Bonsai 5' },
  { type: 'circle', x: 12.0, z: 35.0, r: 1.45, name: 'Bonsai 6' },
  { type: 'circle', x: -8.0, z: 48.0, r: 0.8, name: 'Courtyard Lantern L' },
  { type: 'circle', x: 8.0, z: 48.0, r: 0.8, name: 'Courtyard Lantern R' },
  { type: 'circle', x: -4.5, z: 22.0, r: 0.65, name: 'Incense Table L' },
  { type: 'circle', x: 4.5, z: 22.0, r: 0.65, name: 'Incense Table R' },

  // 3. Bảo Tháp Men Ngọc (Zone 3 Jade Pagoda at 38, -20)
  // 3.1. Khối Chân Đế & Cánh Đài Sen Tam Cấp (Khóa cứng mọi phía ở tầng trệt Y < 3.2m, ngăn hoàn toàn trèo lên thềm/xuyên tường)
  // Cánh Tây đài sen (Base West Wing)
  { type: 'box', minX: 28.5, maxX: 35.8, minZ: -29.5, maxZ: -10.8, maxY: 3.2, name: 'Pagoda Base West Wing' },
  // Cánh Đông đài sen (Base East Wing)
  { type: 'box', minX: 40.2, maxX: 47.5, minZ: -29.5, maxZ: -10.8, maxY: 3.2, name: 'Pagoda Base East Wing' },
  // Hậu chẩm phía Bắc đài sen (Base North Back)
  { type: 'box', minX: 35.8, maxX: 40.2, minZ: -29.5, maxZ: -26.0, maxY: 3.2, name: 'Pagoda Base North Back' },
  // Má bậc thang tam cấp hai bên lối lên phía Nam (Stairs Curbs)
  { type: 'box', minX: 35.0, maxX: 35.8, minZ: -10.8, maxZ: -7.5, name: 'Pagoda Step Curb Left' },
  { type: 'box', minX: 40.2, maxX: 41.0, minZ: -10.8, maxZ: -7.5, name: 'Pagoda Step Curb Right' },

  // 3.2. Thân Tháp Tầng 1 & Lan Can Thềm Thượng (Tier 1 Terrace & Body)
  // Thân tháp gỗ Tầng 1 (9.8m x 9.8m: X in [33.1, 42.9], Z in [-24.9, -15.1])
  { type: 'box', minX: 32.8, maxX: 43.2, minZ: -25.2, maxZ: -14.8, name: 'Jade Pagoda Core Walls' },
  // Lan can gỗ phía Tây (West Balustrade)
  { type: 'box', minX: 31.0, maxX: 31.8, minZ: -26.8, maxZ: -13.2, minY: 2.8, name: 'Pagoda Balustrade West' },
  // Lan can gỗ phía Đông (East Balustrade)
  { type: 'box', minX: 44.2, maxX: 45.0, minZ: -26.8, maxZ: -13.2, minY: 2.8, name: 'Pagoda Balustrade East' },
  // Lan can gỗ phía Bắc (North Balustrade)
  { type: 'box', minX: 31.8, maxX: 44.2, minZ: -26.8, maxZ: -26.0, minY: 2.8, name: 'Pagoda Balustrade North' },
  // Lan can gỗ mặt tiền phía Nam hai bên cửa (South Balustrade Wings)
  { type: 'box', minX: 31.0, maxX: 35.8, minZ: -13.8, maxZ: -13.0, minY: 2.8, name: 'Pagoda Balustrade South L' },
  { type: 'box', minX: 40.2, maxX: 45.0, minZ: -13.8, maxZ: -13.0, minY: 2.8, name: 'Pagoda Balustrade South R' },

  { type: 'circle', x: 33.5, z: -12.5, r: 0.75, name: 'Pagoda Front Lantern L' },
  { type: 'circle', x: 42.5, z: -12.5, r: 0.75, name: 'Pagoda Front Lantern R' },
  { type: 'circle', x: 38.0, z: -8.0, r: 0.6, name: 'Pagoda Incense Burner' },

  // 4. Tháp Chuông Cổ Tự (Zone 4 Bell Tower at -26, -20)
  { type: 'box', minX: -30.0, maxX: -22.0, minZ: -24.0, maxZ: -16.0, maxY: 0.85, name: 'Bell Tower Podium Base' },
  // Raised stone platform with open archways (columns at 4 corners)
  { type: 'circle', x: -28.8, z: -22.8, r: 0.65, name: 'Bell Tower Col NW' },
  { type: 'circle', x: -23.2, z: -22.8, r: 0.65, name: 'Bell Tower Col NE' },
  { type: 'circle', x: -28.8, z: -17.2, r: 0.65, name: 'Bell Tower Col SW' },
  { type: 'circle', x: -23.2, z: -17.2, r: 0.65, name: 'Bell Tower Col SE' },
  // Giant Bell & Wooden Striker Rig in center
  { type: 'circle', x: -26.0, z: -20.0, r: 1.35, name: 'Great Bell of Wisdom' },
  { type: 'box', minX: -26.4, maxX: -25.6, minZ: -18.2, maxZ: -16.8, name: 'Bell Striking Beam' },

  // 5. Hồ Sen Linh Chiểu & Chùa Một Cột (Zone 5 at Center X: -26, Z: 36)
  // Toàn bộ nửa Tây hồ sen & thân điện thờ Chùa Một Cột (ngăn tuyệt đối đi xuyên chùa ra sau hồ)
  { type: 'box', minX: -41.0, maxX: -23.6, minZ: 21.5, maxZ: 50.5, name: 'Lotus Pond West & Pagoda Shrine Barrier' },
  // Cột đá Chùa Một Cột uy nghiêm
  { type: 'circle', x: -30.05, z: 36.0, r: 1.5, name: 'One Pillar Pagoda Stone Column' },

  // Lòng hồ sen nước sâu phía Bắc cầu Đông (Z: 21.5 đến 34.4)
  { type: 'box', minX: -23.8, maxX: -11.8, minZ: 21.5, maxZ: 34.4, maxY: 3.0, name: 'Lotus Pond Basin North' },
  // Lòng hồ sen nước sâu phía Nam cầu Đông (Z: 37.6 đến 50.5)
  { type: 'box', minX: -23.8, maxX: -11.8, minZ: 37.6, maxZ: 50.5, maxY: 3.0, name: 'Lotus Pond Basin South' },

  // Lan can đá búp sen dọc 2 bên cầu hoa sen phía Đông (X: -18.5 đến -11.5)
  { type: 'box', minX: -18.5, maxX: -11.5, minZ: 37.4, maxZ: 38.6, name: 'East Bridge Railing North' },
  { type: 'box', minX: -18.5, maxX: -11.5, minZ: 33.4, maxZ: 34.6, name: 'East Bridge Railing South' },
  // Lan can hai bên bậc thang rồng đá bước lên chùa (X: -23.8 đến -18.5)
  { type: 'box', minX: -23.8, maxX: -18.5, minZ: 37.0, maxZ: 38.0, name: 'Stairs Dragon Railing North' },
  { type: 'box', minX: -23.8, maxX: -18.5, minZ: 34.0, maxZ: 35.0, name: 'Stairs Dragon Railing South' },
  // Án thờ & lư hương đá dâng hương tại đầu cầu phía Đông (hướng sân chùa)
  { type: 'circle', x: -11.2, z: 38.8, r: 0.85, name: 'East Lotus Pond Incense Altar Base' },

  // Bờ kè đá chu vi bao bọc hồ sen (Tây, Bắc, Nam đóng kín; Đông mở cổng vào cầu)
  { type: 'box', minX: -41.0, maxX: -38.5, minZ: 21.5, maxZ: 50.5, name: 'Lotus Pond Outer Wall West' },
  { type: 'box', minX: -41.0, maxX: -11.5, minZ: 21.5, maxZ: 23.2, name: 'Lotus Pond Outer Wall North' },
  { type: 'box', minX: -41.0, maxX: -11.5, minZ: 48.8, maxZ: 50.5, name: 'Lotus Pond Outer Wall South' },
  // Bờ kè phía Đông (chừa cổng mở thông thủy ở giữa: Z in [34.4, 37.6])
  { type: 'box', minX: -13.2, maxX: -11.5, minZ: 21.5, maxZ: 34.4, name: 'Lotus Pond Outer Wall East North' },
  { type: 'box', minX: -13.2, maxX: -11.5, minZ: 37.6, maxZ: 50.5, name: 'Lotus Pond Outer Wall East South' },

  // 5.5. Quán Âm Đại Điện & Quảng Trường Hành Hương (Zone 12 at Center X: 33.0, Z: 42.0)
  // Khối đài sen ngũ cấp & Hồ non bộ Quán Thế Âm Bồ Tát (bán kính r = 4.8m tại X = 33.0, Z = 44.5)
  { type: 'circle', x: 33.0, z: 44.5, r: 4.8, name: 'Guanyin Lotus Dais & Rockery Pool' },
  // Bàn hương án cẩm thạch trắng phía trước bệ sen
  { type: 'box', minX: 30.8, maxX: 35.2, minZ: 36.8, maxZ: 38.2, name: 'Guanyin Altar Table' },
  // Đại lư hương đồng tam bảo
  { type: 'circle', x: 33.0, z: 36.3, r: 0.9, name: 'Guanyin Bronze Burner' },
  // Bàn phát nhang trầm bên Tây-Bắc sảnh
  { type: 'box', minX: 25.0, maxX: 27.0, minZ: 33.5, maxZ: 34.5, name: 'Guanyin Incense Desk' },
  // Lan can đá cẩm thạch bao quanh sảnh quảng trường 26m x 26m (Tâm 33, 42 -> X in [20, 46], Z in [29, 55])
  { type: 'box', minX: 20.0, maxX: 46.0, minZ: 54.5, maxZ: 55.3, name: 'Guanyin Plaza Railing North' },
  { type: 'box', minX: 20.0, maxX: 46.0, minZ: 28.7, maxZ: 29.5, name: 'Guanyin Plaza Railing South' },
  { type: 'box', minX: 45.5, maxX: 46.3, minZ: 29.0, maxZ: 55.0, name: 'Guanyin Plaza Railing East' },
  // Lan can phía Tây chừa cổng tam cấp 7m ở giữa Z in [38.5, 45.5]
  { type: 'box', minX: 19.7, maxX: 20.5, minZ: 29.0, maxZ: 38.5, name: 'Guanyin Plaza Railing West North' },
  { type: 'box', minX: 19.7, maxX: 20.5, minZ: 45.5, maxZ: 55.0, name: 'Guanyin Plaza Railing West South' },

  // 6. Dãy Hành Lang Cột Gỗ Lim (Zone 6 Corridor at X: 15 to 21, Z: -3 to 30)
  // East wall boundary behind the open corridor
  { type: 'box', minX: 20.8, maxX: 22.5, minZ: -3.5, maxZ: 30.5, name: 'East Corridor Wall' },
  // Outer row of timber pillars along the courtyard
  { type: 'circle', x: 15.2, z: -2.0, r: 0.45, name: 'Corridor Pillar 1' },
  { type: 'circle', x: 15.2, z: 4.5, r: 0.45, name: 'Corridor Pillar 2' },
  { type: 'circle', x: 15.2, z: 11.0, r: 0.45, name: 'Corridor Pillar 3' },
  { type: 'circle', x: 15.2, z: 17.5, r: 0.45, name: 'Corridor Pillar 4' },
  { type: 'circle', x: 15.2, z: 24.0, r: 0.45, name: 'Corridor Pillar 5' },
  // Inner row of timber pillars
  { type: 'circle', x: 19.8, z: -2.0, r: 0.45, name: 'Corridor In-Pillar 1' },
  { type: 'circle', x: 19.8, z: 4.5, r: 0.45, name: 'Corridor In-Pillar 2' },
  { type: 'circle', x: 19.8, z: 11.0, r: 0.45, name: 'Corridor In-Pillar 3' },
  { type: 'circle', x: 19.8, z: 17.5, r: 0.45, name: 'Corridor In-Pillar 4' },
  { type: 'circle', x: 19.8, z: 24.0, r: 0.45, name: 'Corridor In-Pillar 5' },

  // 7. Đại Hùng Bảo Điện (Zone 7 Main Sanctuary Complex: X in [-22.5, 22.5], Z in [-34.0, 5.5])
  // 7.1. Cụm Bậc Tam Cấp Sân Trước (Bệ đá trước điện: Z từ 0.5 đến 5.5)
  { type: 'box', minX: -22.5, maxX: -8.0, minZ: 0.5, maxZ: 5.5, maxY: 3.3, name: 'Sanctuary Front Terrace Left' },
  { type: 'box', minX: 8.0, maxX: 22.5, minZ: 0.5, maxZ: 5.5, maxY: 3.3, name: 'Sanctuary Front Terrace Right' },
  // Lan can rồng đá hai bên bậc thang chính (Lối lên ở giữa: X in [-7.5, 7.5])
  { type: 'box', minX: -8.2, maxX: -7.5, minZ: 0.5, maxZ: 5.5, name: 'Dragon Railing Left' },
  { type: 'box', minX: 7.5, maxX: 8.2, minZ: 0.5, maxZ: 5.5, name: 'Dragon Railing Right' },

  // 7.2. Tường Bao & Cột Tiền Điện Đại Hùng Bảo Điện
  // Tường hồi phía Tây (trái) - bao phủ kín tới góc hậu chẩm
  { type: 'box', minX: -21.5, maxX: -19.5, minZ: -33.5, maxZ: -0.5, name: 'Sanctuary West Outer Wall' },
  // Tường hồi phía Đông (phải) - bao phủ kín tới góc hậu chẩm
  { type: 'box', minX: 19.5, maxX: 21.5, minZ: -33.5, maxZ: -0.5, name: 'Sanctuary East Outer Wall' },
  // Tường hậu (phía Bắc) - phủ trùm góc hai bên để tránh kẹt/xuyên góc
  { type: 'box', minX: -22.0, maxX: 22.0, minZ: -33.5, maxZ: -31.5, name: 'Sanctuary North Back Wall' },
  // Mặt tiền Chính Điện (Để ngỏ 3 gian cửa: Gian chính X in [-4.5, 4.5], gian tả [-12.5, -7.5], gian hữu [7.5, 12.5])
  { type: 'box', minX: -19.5, maxX: -13.0, minZ: -1.2, maxZ: 0.0, name: 'Sanctuary Front Wall W' },
  { type: 'box', minX: -7.2, maxX: -4.8, minZ: -1.2, maxZ: 0.0, name: 'Sanctuary Front Wall ML' },
  { type: 'box', minX: 4.8, maxX: 7.2, minZ: -1.2, maxZ: 0.0, name: 'Sanctuary Front Wall MR' },
  { type: 'box', minX: 13.0, maxX: 19.5, minZ: -1.2, maxZ: 0.0, name: 'Sanctuary Front Wall E' },

  // 7.3. Hàng Cột Gỗ Lim Tiền Điện (Front Veranda Pillars)
  { type: 'circle', x: -16.0, z: -0.6, r: 0.55, name: 'Veranda Pillar W2' },
  { type: 'circle', x: -10.0, z: -0.6, r: 0.55, name: 'Veranda Pillar W1' },
  { type: 'circle', x: -4.8, z: -0.6, r: 0.55, name: 'Veranda Pillar C_L' },
  { type: 'circle', x: 4.8, z: -0.6, r: 0.55, name: 'Veranda Pillar C_R' },
  { type: 'circle', x: 10.0, z: -0.6, r: 0.55, name: 'Veranda Pillar E1' },
  { type: 'circle', x: 16.0, z: -0.6, r: 0.55, name: 'Veranda Pillar E2' },

  // 7.4. Hàng Cột Cái Nội Điện (Inner Giant Pillars)
  { type: 'circle', x: -8.0, z: -9.5, r: 0.65, name: 'Inner Main Pillar NW' },
  { type: 'circle', x: 8.0, z: -9.5, r: 0.65, name: 'Inner Main Pillar NE' },
  { type: 'circle', x: -8.0, z: -21.5, r: 0.65, name: 'Inner Main Pillar SW' },
  { type: 'circle', x: 8.0, z: -21.5, r: 0.65, name: 'Inner Main Pillar SE' },

  // 7.5. Bệ Tam Thế Phật Dát Vàng & Ban Thờ (Grand Altar)
  { type: 'box', minX: -7.5, maxX: 7.5, minZ: -29.5, maxZ: -23.0, name: 'Three Buddhas Lotus Dais' },
  // Bàn thờ hương án phía trước bệ Phật
  { type: 'box', minX: -5.0, maxX: 5.0, minZ: -22.5, maxZ: -19.5, name: 'Golden Altar Table' },
  // Đại Hồng Chung & Giá Trống Sấm trong Tiền Điện
  { type: 'circle', x: -14.5, z: -6.5, r: 1.1, name: 'Sanctuary Great Bell' },
  { type: 'circle', x: 14.5, z: -6.5, r: 1.1, name: 'Sanctuary Thunder Drum' },

  // 8. Thiền Trà Quán (Zone 8 Tea Pavilion at -24, 6)
  { type: 'box', minX: -30.0, maxX: -18.0, minZ: 0.0, maxZ: 12.0, maxY: 0.49, name: 'Tea Pavilion Base' },
  { type: 'circle', x: -24.0, z: 6.0, r: 1.5, name: 'Tea Stone Table' },
  { type: 'circle', x: -28.0, z: 1.5, r: 0.6, name: 'Tea Pillar NW' },
  { type: 'circle', x: -20.0, z: 1.5, r: 0.6, name: 'Tea Pillar NE' },
  { type: 'circle', x: -28.0, z: 10.5, r: 0.6, name: 'Tea Pillar SW' },
  { type: 'circle', x: -20.0, z: 10.5, r: 0.6, name: 'Tea Pillar SE' },

  // 9. Tàng Kinh Các (Zone 9 Library at 28.5, 13)
  { type: 'box', minX: 23.0, maxX: 35.0, minZ: 5.0, maxZ: 21.0, maxY: 0.58, name: 'Library Base' },
  { type: 'box', minX: 25.7, maxX: 34.3, minZ: 8.0, maxZ: 9.0, name: 'Library Shelf 1' },
  { type: 'box', minX: 25.7, maxX: 34.3, minZ: 12.5, maxZ: 13.5, name: 'Library Shelf 2' },
  { type: 'box', minX: 25.7, maxX: 34.3, minZ: 17.0, maxZ: 18.0, name: 'Library Shelf 3' },

  // 10. Hậu Viện Sơn Tự (Zone 10 Back Garden: X in [-51.5, 51.5], Z in [-58, -34])
  // 10.1. Nhà Bếp Chùa (Hương Tích Trù: X in [-21.0, -5.0], Z in [-54.5, -43.5])
  // Tường Hậu (phía Bắc)
  { type: 'box', minX: -21.0, maxX: -5.0, minZ: -54.8, maxZ: -54.0, name: 'Kitchen North Wall' },
  // Tường Hồi phía Tây (nối sang breezeway: ngỏ cửa lối đi Z in [-50.8, -47.2])
  { type: 'box', minX: -21.0, maxX: -20.2, minZ: -54.5, maxZ: -50.8, name: 'Kitchen West Wall North' },
  { type: 'box', minX: -21.0, maxX: -20.2, minZ: -47.2, maxZ: -43.5, name: 'Kitchen West Wall South' },
  // Tường Hồi phía Đông (giáp kho củi)
  { type: 'box', minX: -5.8, maxX: -5.0, minZ: -54.5, maxZ: -43.5, name: 'Kitchen East Wall' },
  // Tường Mặt Tiền cánh Tây (trái cửa chính rộng 3.6m: X in [-14.8, -11.2])
  { type: 'box', minX: -21.0, maxX: -14.8, minZ: -44.2, maxZ: -43.5, name: 'Kitchen Front Wall West' },
  // Tường Mặt Tiền cánh Đông (phải cửa chính)
  { type: 'box', minX: -11.2, maxX: -5.0, minZ: -44.2, maxZ: -43.5, name: 'Kitchen Front Wall East' },
  // Nội thất bên trong: Bàn sơ chế thức ăn chay
  { type: 'box', minX: -18.5, maxX: -15.5, minZ: -51.5, maxZ: -49.5, name: 'Kitchen Prep Table' },
  // Gian bếp lò & ống khói đất nung
  { type: 'box', minX: -9.5, maxX: -6.5, minZ: -51.8, maxZ: -49.0, name: 'Kitchen Stove Hearth' },

  // 10.1B. Nhà Ăn Thiền Môn (Trai Đường Thiền Môn: X in [-48.0, -26.0], Z in [-55.0, -43.0])
  // Tường Hậu (phía Bắc)
  { type: 'box', minX: -47.8, maxX: -26.2, minZ: -54.8, maxZ: -54.0, name: 'Dining Hall North Wall' },
  // Tường Hồi cánh Tây (giáp tường rào chùa)
  { type: 'box', minX: -47.8, maxX: -47.0, minZ: -54.5, maxZ: -43.5, name: 'Dining Hall West Wall' },
  // Tường Hồi cánh Đông (nối sang breezeway: ngỏ cửa lối đi Z in [-50.8, -47.2])
  { type: 'box', minX: -26.8, maxX: -26.0, minZ: -54.5, maxZ: -50.8, name: 'Dining Hall East Wall North' },
  { type: 'box', minX: -26.8, maxX: -26.0, minZ: -47.2, maxZ: -43.5, name: 'Dining Hall East Wall South' },
  // Tường Mặt Tiền cánh Nam (mở cửa đại sảnh 4.8m: X in [-39.4, -34.6])
  { type: 'box', minX: -47.8, maxX: -39.4, minZ: -43.8, maxZ: -43.2, name: 'Dining Hall Front Wall West' },
  { type: 'box', minX: -34.6, maxX: -26.2, minZ: -43.8, maxZ: -43.2, name: 'Dining Hall Front Wall East' },
  // 3 Dãy bàn ăn Trai Đường (Bắc, Giữa, Nam)
  { type: 'box', minX: -44.5, maxX: -29.5, minZ: -52.6, maxZ: -51.6, name: 'Dining Table Row North' },
  { type: 'box', minX: -44.5, maxX: -29.5, minZ: -49.5, maxZ: -48.5, name: 'Dining Table Row Center' },
  { type: 'box', minX: -44.5, maxX: -29.5, minZ: -46.4, maxZ: -45.4, name: 'Dining Table Row South' },
  // Ban thờ Giám Trai Bồ Tát & Trai Bảng
  { type: 'box', minX: -39.2, maxX: -34.8, minZ: -54.5, maxZ: -53.0, name: 'Giam Trai Bodhisattva Altar' },
  { type: 'circle', x: -33.8, z: -43.6, r: 0.65, name: 'Trai Bang Fish Bell Stand' },

  // 10.1C. Hành Lang Cầu Nối Có Mái Che (Breezeway: X in [-26.0, -21.0], Z in [-51.2, -46.8])
  { type: 'box', minX: -26.0, maxX: -21.0, minZ: -51.4, maxZ: -50.8, name: 'Breezeway North Rail' },
  { type: 'box', minX: -26.0, maxX: -21.0, minZ: -47.2, maxZ: -46.6, name: 'Breezeway South Rail' },

  // 10.2. Nhà Kho Củi (Tiêu Phòng: X in [-4.6, 0.4], Z in [-52.5, -47.5])
  { type: 'box', minX: -4.6, maxX: 0.4, minZ: -52.5, maxZ: -47.5, name: 'Wood Storage Shed' },
  // Bệ thớt gỗ đại thụ chẻ củi
  { type: 'circle', x: -2.0, z: -45.5, r: 0.85, name: 'Chopping Block Dais' },

  // 10.3. Giếng Ngọc Cổ (Tịnh Thủy Tuyền at 12, -46)
  // Thành đá xanh bát giác rêu phong (ngăn tuyệt đối rơi lọt lòng giếng)
  { type: 'circle', x: 12.0, z: -46.0, r: 1.85, name: 'Ancient Jade Well Rim' },
  // Thùng gỗ chứa nước sạch bên thềm giếng
  { type: 'circle', x: 14.4, z: -44.8, r: 0.75, name: 'Water Tub Dais' },

  // 10.4. Hàng Trúc Xanh (Thanh Trúc Uyển: hai dải trúc dày đặc hai bên lối đi lát đá)
  // Hàng Tây: Tách đoạn Bắc & Đoạn Nam mở lối ngang 4.8m sang Bếp và Kho Củi
  { type: 'box', minX: -6.0, maxX: -4.4, minZ: -53.5, maxZ: -49.0, name: 'Bamboo Alley West North' },
  { type: 'box', minX: -6.0, maxX: -4.4, minZ: -44.2, maxZ: -34.5, name: 'Bamboo Alley West South' },
  // Hàng Đông: Tách đoạn Bắc & Đoạn Nam mở lối ngang 4.8m sang Giếng Ngọc Cổ
  { type: 'box', minX: 4.4, maxX: 6.0, minZ: -53.5, maxZ: -49.0, name: 'Bamboo Alley East North' },
  { type: 'box', minX: 4.4, maxX: 6.0, minZ: -44.2, maxZ: -34.5, name: 'Bamboo Alley East South' },
  // Rặng trúc chắn gió phía sau kho và tường bao Bắc
  { type: 'box', minX: -14.0, maxX: -9.5, minZ: -57.5, maxZ: -54.0, name: 'Back Bamboo Fringe West' },
  { type: 'box', minX: 16.0, maxX: 24.0, minZ: -57.5, maxZ: -54.0, name: 'Back Bamboo Fringe East' },
];

const _collisionResult: { x: number; z: number } = { x: 0, z: 0 };

/**
 * Resolves character position against monastery obstacle geometry.
 * Returns the adjusted (x, z) coordinates with smooth surface sliding.
 * Uses persistent `out` object for Zero-Allocation in 60fps Game Loop.
 */
export function resolveMonkCollision(
  px: number,
  py: number,
  pz: number,
  bodyRadius: number = MONK_COLLISION_RADIUS,
  out: { x: number; z: number } = _collisionResult
): { x: number; z: number } {
  let curX = px;
  let curZ = pz;

  // 3 relaxation iterations for corner / adjacent obstacles (Zero-Tunneling)
  for (let iteration = 0; iteration < 3; iteration++) {
    for (let i = 0; i < MONASTERY_OBSTACLES.length; i++) {
      const obs = MONASTERY_OBSTACLES[i];
      if (obs.minY !== undefined && py < obs.minY) continue;
      if (obs.maxY !== undefined && py > obs.maxY) continue;

      if (obs.type === 'circle') {
        const dx = curX - obs.x;
        const dz = curZ - obs.z;
        const dist = Math.hypot(dx, dz);
        const minDist = obs.r + bodyRadius;
        if (dist < minDist) {
          if (dist > 0.0001) {
            const push = minDist - dist;
            curX += (dx / dist) * push;
            curZ += (dz / dist) * push;
          } else {
            curZ += minDist;
          }
        }
      } else if (obs.type === 'box') {
        const minX = obs.minX;
        const maxX = obs.maxX;
        const minZ = obs.minZ;
        const maxZ = obs.maxZ;

        const expMinX = minX - bodyRadius;
        const expMaxX = maxX + bodyRadius;
        const expMinZ = minZ - bodyRadius;
        const expMaxZ = maxZ + bodyRadius;

        if (curX > expMinX && curX < expMaxX && curZ > expMinZ && curZ < expMaxZ) {
          if (curX >= minX && curX <= maxX && curZ >= minZ && curZ <= maxZ) {
            const dLeft = curX - expMinX;
            const dRight = expMaxX - curX;
            const dBack = curZ - expMinZ;
            const dFront = expMaxZ - curZ;
            const minD = Math.min(dLeft, dRight, dBack, dFront);
            if (minD === dLeft) curX = expMinX;
            else if (minD === dRight) curX = expMaxX;
            else if (minD === dBack) curZ = expMinZ;
            else curZ = expMaxZ;
          } else {
            const closestX = Math.max(minX, Math.min(maxX, curX));
            const closestZ = Math.max(minZ, Math.min(maxZ, curZ));
            const cdx = curX - closestX;
            const cdz = curZ - closestZ;
            const cornerDist = Math.hypot(cdx, cdz);
            if (cornerDist < bodyRadius) {
              if (cornerDist > 0.0001) {
                const push = bodyRadius - cornerDist;
                curX += (cdx / cornerDist) * push;
                curZ += (cdz / cornerDist) * push;
              } else {
                curX += bodyRadius;
              }
            }
          }
        }
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STRICT PATH CONFINEMENT: KHU VỰC HỒ SEN & CHÙA MỘT CỘT (X in [-41.0, -12.0], Z in [21.5, 50.5])
  // Khóa cứng nhân vật chỉ được phép di chuyển trên hành lang lối đi cho phép (cầu đá, sàn đệm, bậc thang rồng)
  // Tuyệt đối không cho phép đi xuyên qua điện thờ Chùa Một Cột, không lọt xuống lòng hồ sen
  // ───────────────────────────────────────────────────────────────────────────
  if (curX <= -12.0 && curX >= -41.0 && curZ >= 21.5 && curZ <= 50.5) {
    // 1. Phía Tây: Chặn đứng tuyệt đối tại bệ đứng chiêm bái Chùa Một Cột (không đi xuyên chùa ra sau)
    curX = Math.max(-23.6, curX);

    // 2. Kiểm tra nếu nhân vật nằm trong hành lang lối vào cầu đá và Chùa Một Cột
    if (curZ >= 34.0 && curZ <= 38.0) {
      if (curX >= -18.5) {
        // Trên thân cầu đá hoa sen phía Đông (X: -18.5 đến -12.0): Khóa chặt trong lòng mặt cầu
        curZ = Math.max(34.6, Math.min(37.4, curZ));
      } else if (curX >= -20.0) {
        // Trên sàn tiếp cận ngắm cảnh trước chân chùa (X: -20.0 đến -18.5): Rộng 3.0m
        curZ = Math.max(34.5, Math.min(37.5, curZ));
      } else {
        // Đang bước trên cầu thang rồng đá (X: -23.6 đến -20.0): Khóa trong lòng cầu thang
        curZ = Math.max(35.0, Math.min(37.0, curZ));
      }
    } else {
      // Ngoài hành lang cầu đá: Đẩy lùi về thềm sân chùa
      curX = -12.0;
    }
  }

  // Clamped Monastery Terrain Bounds
  curX = Math.max(-49.5, Math.min(49.5, curX));
  curZ = Math.max(-56.5, Math.min(64.5, curZ));

  out.x = curX;
  out.z = curZ;
  return out;
}

/**
 * Accurately determines the true floor elevation (Y) at coordinate (x, z)
 * across all multi-tier podiums, grand staircases, indoor halls, pavilions, and bridges.
 */
export function getTerrainFloorElevation(x: number, z: number, currentY: number = 0.42): number {
  // 0. Dãy Hành Lang Cột Gỗ Lim (Zone 6 Corridor: X in [14.6, 21.4], Z in [-3.5, 30.0])
  if (x >= 14.6 && x <= 21.4 && z >= -3.5 && z <= 30.0) {
    return 0.58;
  }

  // 1. Đại Hùng Bảo Điện (Zone 7 Main Sanctuary Complex)
  // Sanctuary complex centered at (0, -16), podium spans X in [-22.5, 22.5], Z in [-34.0, 5.5]
  if (x >= -23.5 && x <= 23.5 && z >= -34.0 && z <= 6.5) {
    // 1.1. Lên tam cấp tiền điện & bậc thang sảnh chính (Z từ 6.0 giảm dần đến -0.5)
    if (z >= -0.5 && z <= 6.0) {
      const t = Math.max(0.0, Math.min(1.0, (6.0 - z) / 6.5));
      return 0.42 + t * (3.30 - 0.42);
    }

    // 1.2. Thềm thượng & Toàn bộ Nội điện Đại Hùng Bảo Điện (Mặt sàn phẳng cố định Y = 3.30m)
    if (z <= -0.5) {
      // 2nd Floor Balcony (Lầu Gác Tầng Cao)
      if (currentY >= 5.5 && z >= -30.0 && z <= -6.0 && Math.abs(x) <= 15.0) {
        return 7.50;
      }
      return 3.30;
    }
  }

  // 2. Bảo Tháp Men Ngọc (Zone 3 Pagoda Tower at 38, -20)
  // Lối bậc thang tam cấp chính diện phía Nam (Z từ -7.5 xuống -13.5, X in [35.5, 40.5])
  if (x >= 35.5 && x <= 40.5 && z >= -13.5 && z <= -7.5) {
    const t = Math.max(0.0, Math.min(1.0, (-7.5 - z) / 6.0));
    return 0.42 + t * (3.00 - 0.42);
  }
  // Sàn thềm thượng Tầng 1 (Y = 3.00m) - chỉ kích hoạt khi nhân vật đã lên thềm (currentY >= 1.8)
  if (x >= 31.5 && x <= 44.5 && z >= -26.5 && z <= -13.5 && currentY >= 1.8) {
    return 3.00;
  }

  // 3. Tháp Chuông Cổ Tự (Zone 4 Bell Tower at -26, -20)
  if (x >= -31.5 && x <= -20.5 && z >= -25.5 && z <= -14.5) {
    // Front stone steps leading to bell tower platform (Z from -14.5 down to -17.0, X centered around -26)
    if (Math.abs(x - (-26)) <= 2.2 && z >= -17.0 && z <= -14.5) {
      const t = Math.max(0.0, Math.min(1.0, (-14.5 - z) / 2.5));
      return 0.42 + t * (0.89 - 0.42);
    }
    return 0.89;
  }

  // 4. Hồ Sen Linh Chiểu & Cầu Đá Chùa Một Cột (Zone 5 at Center X: -26, Z: 36)
  // 4.1. LỐI CẦU ĐÁ PHÍA ĐÔNG & BẬC THANG RỒNG CHÙA MỘT CỘT (Trục Z = 36.0, X từ -10.6 vào -23.6)
  if (Math.abs(z - 36.0) <= 2.2 && x >= -23.8 && x <= -10.6) {
    // A. Bậc tam cấp bước lên cầu từ sân chùa (X từ -10.6 giảm dần vào -12.8)
    if (x >= -12.8) {
      const t = Math.max(0.0, Math.min(1.0, (-10.6 - x) / 2.2));
      return 0.42 + t * (0.93 - 0.42);
    }
    // B. Bản mặt cầu đá phía Đông và sàn tiếp cận ngắm cảnh (X từ -12.8 đến -18.5)
    if (x >= -18.5) {
      return 0.93;
    }
    // C. Bậc thang rồng đá bước lên Chùa Một Cột (X từ -18.5 vào -23.6)
    // Leo từ cao trình mặt cầu 0.93m lên hiên chiêm bái 3.20m
    const tStairs = Math.max(0.0, Math.min(1.0, (-18.5 - x) / (23.6 - 18.5)));
    return 0.93 + tStairs * (3.20 - 0.93);
  }

  // 4.2. Bệ thờ lư hương đá dâng hương tại đầu cầu phía Đông (hướng sân chùa)
  if (Math.hypot(x - (-11.2), z - 38.8) <= 1.2) {
    return 0.65;
  }

  // 4.3. Hiên Nước & Bến Nước Suối Ngọc Phía Tây (Tatami & Teak Pier Deck)
  if (x >= -38.5 && x <= -26.0 && z >= 24.0 && z <= 48.0) {
    // Bậc tam cấp mép nước phía Đông bến (X từ -28.0 vào -26.0, Z từ 33.0 đến 39.0)
    if (x >= -28.0 && x <= -26.0 && z >= 33.0 && z <= 39.0) {
      const stepT = Math.max(0.0, Math.min(1.0, (-26.0 - x) / 2.0));
      return 0.58 + stepT * (0.89 - 0.58);
    }
    return 0.89;
  }

  // 5. Phòng Thiền Nguyệt Môn (Zone 8 Meditation Hall at -24, 6)
  if (x >= -31.5 && x <= -16.5 && z >= -0.5 && z <= 12.5) {
    return 0.49;
  }

  // 6. Tàng Kinh Các (Zone 9 Library at 28.5, 13)
  if (x >= 21.4 && x <= 35.8 && z >= 3.5 && z <= 22.5) {
    return 0.58;
  }

  // 6.8. Quán Âm Đại Điện & Quảng Trường Hành Hương Chiêm Bái (Zone 12 at Center X: 33.0, Z: 42.0)
  // Sảnh quảng trường đá cẩm thạch trắng (X in [20.0, 46.0], Z in [29.0, 55.0])
  if (x >= 18.2 && x <= 46.0 && z >= 29.0 && z <= 55.0) {
    // Bậc tam cấp đón bước ở phía Tây (X từ 18.2 vào 20.0, Z in [38.5, 45.5])
    if (x < 20.0 && Math.abs(z - 42.0) <= 3.5) {
      const stepT = Math.max(0.0, Math.min(1.0, (x - 18.2) / 1.8));
      return 0.42 + stepT * (0.58 - 0.42);
    }
    // Sàn đại sảnh quảng trường
    if (x >= 20.0) {
      return 0.58;
    }
  }

  // 6.5. Hậu Viện Sơn Tự (Zone 10 Back Courtyard at Z <= -34.0)
  if (z <= -34.0) {
    // Thềm móng đá & Sàn Nhà Ăn Thiền Môn (Trai Đường: X: -48.0 đến -26.0, Z: -55.0 đến -43.0)
    if (x >= -48.0 && x <= -26.0 && z >= -55.0 && z <= -43.0) {
      return 0.58;
    }
    // Hành lang cầu nối có mái che (Breezeway: X: -26.0 đến -21.0, Z: -51.6 đến -46.4)
    if (x >= -26.0 && x <= -21.0 && z >= -51.6 && z <= -46.4) {
      return 0.58;
    }
    // Thềm móng đá & Sàn Nhà Bếp Chùa (Hương Tích Trù: X: -21.0 đến -5.0, Z: -55.0 đến -43.0)
    if (x >= -21.0 && x <= -5.0 && z >= -55.0 && z <= -43.0) {
      return 0.58;
    }
    // Sàn gỗ Nhà Kho Củi (X: -4.8 đến 0.6, Z: -53.0 đến -47.0)
    if (x >= -4.8 && x <= 0.6 && z >= -53.0 && z <= -47.0) {
      return 0.50;
    }
    // Thềm đá Giếng Ngọc Cổ (Tâm 12, -46)
    if (Math.hypot(x - 12.0, z - (-46.0)) <= 2.8) {
      return 0.46;
    }
    // Trục đường chính lát phiến đá xanh dẫn từ Chánh Điện
    if (Math.abs(x) <= 2.2 && z >= -52.0 && z <= -34.0) {
      return 0.38;
    }
    // Lối đá xanh trục ngang Hậu Viện dẫn sang Nhà Ăn, Bếp và Giếng Cổ
    if (z >= -48.5 && z <= -45.5 && x >= -48.0 && x <= 48.0) {
      return 0.38;
    }
    // Đại sân gạch nung Bát Tràng hậu viện (chuẩn xác độ cao mặt gạch Y = 0.35m)
    return 0.35;
  }

  // 7. Sân gạch nung Bát Tràng & Vườn Chùa (Default ground)
  return 0.42;
}

// ══════════════════════════════════════════════════════════════════════════════
// 14 STYLIZED ZONES IN THE ISOMETRIC FANTASY ZEN MONASTERY
// Sắp xếp tuần tự theo lộ trình hành hương chánh niệm không va chạm vật cản
// ══════════════════════════════════════════════════════════════════════════════
export const TEMPLE_ZONES: TempleZoneInfo[] = [
  {
    id: 'gate',
    name: '1. Cổng Tam Quan',
    subtitle: 'Lối vào chùa • Cổng đá cổ kính & cờ Phật giáo',
    dimensions: '22 × 12 m',
    icon: '⛩️',
    desc: 'Cổng đá cách điệu với mái ngói đao cong, cờ ngũ sắc và đèn đá sân vườn.',
    pos: { x: 0, y: 0.42, z: 66 },
    actionKey: 'GATE',
    camera: { yaw: 0, pitch: -0.06, dist: 7.0, mode: 'THIRD_PERSON' },
    facingAngle: Math.PI,
    tourAction: 'STAND',
    tourSound: 'chime',
    navWaypoints: [{ x: 0, z: 66 }],
  },
  {
    id: 'courtyard',
    name: '2. Sân Chùa Đại Cảnh',
    subtitle: 'Sân gạch nung ấm áp & Lư hương đồng tam bảo',
    dimensions: '52 × 38 m',
    icon: '🧹',
    desc: 'Khuôn viên sân gạch Bát Tràng ấm áp với lư hương đồng, chậu cây cảnh bonsai và đèn đá.',
    pos: { x: 0, y: 0.42, z: 32 },
    actionKey: 'COURTYARD',
    camera: { yaw: 0, pitch: -0.15, dist: 9.0, mode: 'THIRD_PERSON' },
    facingAngle: Math.PI,
    tourAction: 'STAND',
    tourSound: 'woodfish',
    navWaypoints: [{ x: 0, z: 46 }, { x: 0, z: 32 }],
  },
  {
    id: 'pond',
    name: '3. Hiên Nước & Suối Ngọc',
    subtitle: 'Hiên gỗ tatami ven suối ngọc • Nằm thảnh thơi, ngắm cá Koi & mưa hè',
    dimensions: '28 × 22 m',
    icon: '🍉',
    desc: 'Hiên gỗ kiểu Nhật lợp chiếu tatami xanh ngọc ven dòng suối trong vắt soi bóng đàn cá Koi, đĩa dưa hấu thanh mát, quạt gió mùa hè và vòm lá xanh komorebi rợp bóng.',
    pos: { x: -19.5, y: 0.93, z: 36.0 },
    actionKey: 'POND',
    camera: { yaw: -Math.PI / 2, pitch: -0.12, dist: 7.5, mode: 'THIRD_PERSON' },
    facingAngle: -Math.PI / 2,
    tourAction: 'STAND',
    tourSound: 'chime',
    navWaypoints: [{ x: 0, z: 36 }, { x: -11.5, z: 36 }, { x: -19.5, z: 36 }],
  },
  {
    id: 'meditation',
    name: '4. Thiền Trà Quán',
    subtitle: 'Thưởng Trà Chánh Niệm • Chú Tiểu Pha Trà & Phục Vụ Trà',
    dimensions: '16 × 14 m',
    icon: '🍵',
    desc: 'Không gian thanh tao dưới căng hiên bên trái: thưởng thức trà sen hảo hạng, đàm đạo Trà Thiền Nhất Vị cùng Chú Tiểu Pha Trà và Thị Giả Phục Vụ Trà.',
    pos: { x: -20.0, y: 0.49, z: 8.0 },
    actionKey: 'MEDITATION',
    camera: { yaw: -1.35, pitch: -0.05, dist: 6.5, mode: 'THIRD_PERSON' },
    facingAngle: -Math.PI / 2,
    tourAction: 'STAND',
    tourSound: 'tea',
    navWaypoints: [{ x: -16, z: 26 }, { x: -20, z: 8 }],
  },
  {
    id: 'bell',
    name: '5. Tháp Chuông Cổ Tự',
    subtitle: 'Đại Hồng Chung, Chày Kình & Chú Tiểu Tuệ Tĩnh',
    dimensions: '14 × 14 m',
    icon: '🔔',
    desc: 'Tháp chuông 2 tầng 8 mái chồng diêm theo bản vẽ kiến trúc: bệ đá tam cấp chạm mây, 4 cột cái gỗ lim, cổ bồng chấn song con tiện, Đại Hồng Chung quai rồng Bồ Lao và Chú Tiểu Tuệ Tĩnh thỉnh chuông.',
    pos: { x: -22.0, y: 0.42, z: -13.0 },
    actionKey: 'BELL',
    camera: { yaw: -0.9, pitch: -0.25, dist: 8.0, mode: 'THIRD_PERSON' },
    facingAngle: -Math.PI * 0.75,
    tourAction: 'STAND',
    tourSound: 'bell',
    navWaypoints: [{ x: -21, z: -2 }, { x: -22, z: -13 }],
  },
  {
    id: 'sanctuary',
    name: '6. Đại Hùng Bảo Điện',
    subtitle: 'Tam Thế Phật Mạ Vàng • Sư Phụ Trụ Trì Áo Cà Sa Đỏ Thuyết Pháp',
    dimensions: '46 × 36 m',
    icon: '🏛️',
    desc: 'Chính điện uy nghiêm theo hình mẫu: bộ tượng Tam Thế Phật dát vàng ngự đài sen, hoành phi câu đối thếp vàng, đại đỉnh hương đồng tỏa khói trầm, hàng bồ đoàn thiền tọa và Hòa Thượng Trụ Trì khoác áo cà sa đỏ râu mày dài thuyết pháp.',
    pos: { x: 0, y: 0.42, z: 3.5 },
    actionKey: 'SANCTUARY',
    camera: { yaw: 0, pitch: -0.28, dist: 9.0, mode: 'THIRD_PERSON' },
    facingAngle: Math.PI,
    tourAction: 'INCENSE_BOW',
    tourSound: 'bowl',
    navWaypoints: [{ x: -12, z: -2 }, { x: -6, z: 3.5 }, { x: 0, z: 3.5 }],
  },
  {
    id: 'stairs',
    name: '7. Đường Bậc Đá Sơn Tự',
    subtitle: 'Cầu thang bậc đá rồng rêu phong & cờ Phật giáo',
    dimensions: '14 × 8 m',
    icon: '🪜',
    desc: 'Bậc thang đá hoa cương rêu phong dài dốc dẫn lên lầu cao và Bảo Tháp sừng sững.',
    pos: { x: 24.0, y: 0.42, z: -3.0 },
    actionKey: 'STAIRS',
    camera: { yaw: 0.75, pitch: -0.22, dist: 7.5, mode: 'THIRD_PERSON' },
    facingAngle: Math.PI * 0.75,
    tourAction: 'STAND',
    tourSound: 'woodfish',
    navWaypoints: [{ x: 12, z: 3.5 }, { x: 24, z: -3 }],
  },
  {
    id: 'tower',
    name: '8. Bảo Tháp Men Ngọc',
    subtitle: 'Bảo tháp ngói lưu ly xanh ngọc • Cửa vòm & Đỉnh búp sen vàng',
    dimensions: '18 × 18 m',
    icon: '🏯',
    desc: 'Bảo tháp kiến trúc truyền thống theo bản vẽ: 3 tầng mái cong ngói men ngọc, thân gỗ ấm, cửa vòm nguyệt môn, đài sen tam cấp và đỉnh búp sen hoàng kim.',
    pos: { x: 38.0, y: 0.42, z: -5.5 },
    actionKey: 'TOWER',
    camera: { yaw: 0.9, pitch: -0.35, dist: 12.0, mode: 'THIRD_PERSON' },
    facingAngle: Math.PI,
    tourAction: 'STAND',
    tourSound: 'bowl',
    navWaypoints: [{ x: 26, z: -6 }, { x: 38, z: -5.5 }],
  },
  {
    id: 'library',
    name: '9. Tàng Kinh Các',
    subtitle: 'Tàng Kinh Các • Kệ sách cổ & bàn trà thư pháp',
    dimensions: '14 × 18 m',
    icon: '📜',
    desc: 'Tàng Kinh Các lưu giữ kinh điển, giá sách chạm trần, nghiên mực và ấm trà gốm mộc mạc.',
    pos: { x: 21.5, y: 0.42, z: 13.0 },
    actionKey: 'LIBRARY',
    camera: { yaw: 1.35, pitch: -0.05, dist: 6.5, mode: 'THIRD_PERSON' },
    facingAngle: Math.PI / 2,
    tourAction: 'STAND',
    tourSound: 'chime',
    navWaypoints: [{ x: 24, z: 4 }, { x: 21.5, z: 13 }],
  },
  {
    id: 'corridor',
    name: '10. Dãy Hành Lang Cột Gỗ',
    subtitle: 'Dãy hành lang dài cao thoáng • Đèn lồng đỏ & Mái ngói men ngọc',
    dimensions: '34 × 7 m',
    icon: '🏮',
    desc: 'Dãy hành lang cột gỗ lim cao thoáng với hệ vì kèo chạm trổ, mái ngói lưu ly men ngọc uốn lượn và hàng đèn lồng đỏ ấm áp.',
    pos: { x: 17.5, y: 0.58, z: 14.0 },
    actionKey: 'CORRIDOR',
    camera: { yaw: 0, pitch: -0.08, dist: 6.5, mode: 'THIRD_PERSON' },
    facingAngle: Math.PI,
    tourAction: 'STAND',
    tourSound: 'woodfish',
    navWaypoints: [{ x: 17.5, z: 14 }],
  },
  {
    id: 'back_garden',
    name: '11. Hậu Viện Sơn Tự',
    subtitle: 'Hậu viện thanh tịnh • Hương Tích Trù, Kho củi, Giếng ngọc & Rừng trúc',
    dimensions: '56 × 24 m',
    icon: '🎋',
    desc: 'Không gian sinh hoạt thiền môn mộc mạc: Nhà Bếp Chùa thơm ngát khói lam chiều, Nhà Kho Củi cất chứa củi khô ngăn nắp, Giếng Ngọc Cổ ngút ngàn rêu phong và Hàng Trúc Xanh rợp bóng đường dạo lát đá.',
    pos: { x: 0.0, y: 0.42, z: -44.0 },
    actionKey: 'BACK_GARDEN',
    camera: { yaw: 0.1, pitch: -0.18, dist: 8.5, mode: 'THIRD_PERSON' },
    facingAngle: Math.PI,
    tourAction: 'STAND',
    tourSound: 'woodfish',
    navWaypoints: [{ x: 18, z: 0 }, { x: 23, z: -25 }, { x: 16, z: -38 }, { x: 0, z: -44 }],
  },
  {
    id: 'guanyin_hall',
    name: '12. Quán Âm Đại Điện',
    subtitle: 'Tôn tượng Quán Thế Âm Bạch Ngọc • Nước cam lộ thanh tịnh',
    dimensions: '26 × 26 m',
    icon: '🪷',
    desc: 'Đại sảnh hành hương lát đá cẩm thạch trắng với tôn tượng Quán Thế Âm Bồ Tát bằng bạch ngọc cao lớn uy nghi, tay cầm cành dương liễu và bình cam lộ tuôn dòng nước mát lành.',
    pos: { x: 33.0, y: 0.58, z: 35.0 },
    actionKey: 'GUANYIN_HALL',
    camera: { yaw: 0, pitch: -0.08, dist: 9.5, mode: 'THIRD_PERSON' },
    facingAngle: 0,
    tourAction: 'INCENSE_BOW',
    tourSound: 'bowl',
    navWaypoints: [{ x: 18, z: 42 }, { x: 26, z: 42 }, { x: 33, z: 35 }],
  },
  {
    id: 'balcony',
    name: '13. Lầu Gác Vọng Cảnh',
    subtitle: 'Lầu cao lan can chạm chữ Vạn • Ngắm cảnh non nước',
    dimensions: '28 × 8 m',
    icon: '🪟',
    desc: 'Lầu cao lộng gió nhìn ra toàn cảnh sân chùa, tháp chuông và mây núi bảng lảng.',
    pos: { x: 0, y: 0.42, z: 16.0 },
    actionKey: 'BALCONY',
    camera: { yaw: 0, pitch: 0.45, dist: 16.0, mode: 'THIRD_PERSON' },
    facingAngle: Math.PI,
    tourAction: 'STAND',
    tourSound: 'chime',
    navWaypoints: [{ x: -16, z: -42 }, { x: -23, z: -25 }, { x: -18, z: -5 }, { x: -10, z: 10 }, { x: 0, z: 16 }],
  },
  {
    id: 'aerial',
    name: '14. View Từ Trên Cao',
    subtitle: 'Góc nhìn Isometric toàn cảnh diorama tuyệt đẹp',
    dimensions: 'Toàn cảnh',
    icon: '🌄',
    desc: 'Góc nhìn từ trên cao bao quát trọn vẹn toàn bộ khuôn viên sơn tự mái ngói đỏ giữa mây ngàn.',
    pos: { x: 0, y: 0.42, z: 28.0 },
    actionKey: 'AERIAL',
    camera: { yaw: Math.PI * 0.78, pitch: 0.92, dist: 30.0, mode: 'ISOMETRIC' },
    facingAngle: Math.PI,
    tourAction: 'STAND',
    tourSound: 'bowl',
    navWaypoints: [{ x: 0, z: 28 }],
  },
  {
    id: 'night',
    name: '15. Ban Đêm Huyền Ảo',
    subtitle: 'Đêm trăng huyền ảo • Muôn ngọn đèn lồng bừng sáng',
    dimensions: 'Toàn cảnh',
    icon: '🌕',
    desc: 'Khung cảnh sơn tự về đêm tĩnh mịch với ánh trăng rằm và muôn ngọn đèn hoa đăng lung linh.',
    pos: { x: 0, y: 0.42, z: 22.0 },
    actionKey: 'NIGHT',
    camera: { yaw: 0, pitch: -0.18, dist: 8.5, mode: 'THIRD_PERSON' },
    facingAngle: Math.PI,
    tourAction: 'INCENSE_BOW',
    tourSound: 'chime',
    navWaypoints: [{ x: 0, z: 22 }],
  },
];

// ==========================================
// BỒ ĐOÀN THIỀN TỌA TẠI ĐẠI HÙNG BẢO ĐIỆN (SANCTUARY CUSHIONS)
// 12 bồ đoàn nhung đỏ xếp ngăn nắp hai bên lối đi thảm đỏ
// ==========================================
export const SANCTUARY_CUSHIONS: Array<{ x: number; y: number; z: number }> = [
  // Hàng chính giữa sát lối đi thảm đỏ & chân cột (cushionRows: 4.6 -> Z = -11.4; cushionCols: 2.5, -2.5)
  { x: 2.5, y: 3.38, z: -11.4 },  // Bồ đoàn mẫu trong hình ảnh (bên phải thảm đỏ, cạnh chân cột)
  { x: -2.5, y: 3.38, z: -11.4 }, // Bồ đoàn đối xứng bên trái thảm đỏ
  { x: 2.5, y: 3.38, z: -13.4 },  // Hàng trên gần bục Phật Tổ
  { x: -2.5, y: 3.38, z: -13.4 },
  { x: 2.5, y: 3.38, z: -9.4 },   // Hàng dưới gần cửa ra vào
  { x: -2.5, y: 3.38, z: -9.4 },
  { x: 4.6, y: 3.38, z: -11.4 },  // Dãy ngoài bên phải
  { x: -4.6, y: 3.38, z: -11.4 }, // Dãy ngoài bên trái
  { x: 4.6, y: 3.38, z: -13.4 },
  { x: -4.6, y: 3.38, z: -13.4 },
  { x: 4.6, y: 3.38, z: -9.4 },
  { x: -4.6, y: 3.38, z: -9.4 },
];

export function getTargetMeditationCushion(playerX: number, playerZ: number): { x: number; y: number; z: number } {
  let closest = SANCTUARY_CUSHIONS[0];
  let minD = Infinity;
  for (const c of SANCTUARY_CUSHIONS) {
    const d = Math.hypot(c.x - playerX, c.z - playerZ);
    if (d < minD) {
      minD = d;
      closest = c;
    }
  }
  return closest;
}
