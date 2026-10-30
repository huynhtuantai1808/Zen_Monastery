file_path = r"e:\a\game\src\canvas\Zen3DWorld.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Define Monastery Obstacles & Collision Resolver before Zen3DWorld component
obstacle_definitions = """// ==========================================
// MONASTERY OBSTACLE COLLIDERS & RESOLUTION
// ==========================================
interface CircleObstacle {
  type: 'circle';
  x: number;
  z: number;
  radius: number;
}

interface BoxObstacle {
  type: 'box';
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY?: number;
  maxY?: number;
}

type MonasteryObstacle = CircleObstacle | BoxObstacle;

const MONASTERY_OBSTACLES: MonasteryObstacle[] = [
  // 1. Great Tripod Bronze Censer in Courtyard (Đại Lư Hương)
  { type: 'circle', x: 0, z: 22, radius: 2.3 },

  // 2. Courtyard Bonsai Trees (6 Chậu Cây Kiểng Cổ Thụ)
  { type: 'circle', x: -20, z: 13, radius: 1.6 },
  { type: 'circle', x: -20, z: -5, radius: 1.6 },
  { type: 'circle', x: 20, z: 13, radius: 1.6 },
  { type: 'circle', x: 20, z: -5, radius: 1.6 },
  { type: 'circle', x: -12, z: 15, radius: 1.6 },
  { type: 'circle', x: 12, z: 15, radius: 1.6 },

  // 3. Courtyard Stone Lanterns (4 Đèn Đá Sân Chùa)
  { type: 'circle', x: -8, z: 14, radius: 0.95 },
  { type: 'circle', x: 8, z: 14, radius: 0.95 },
  { type: 'circle', x: -14, z: -2, radius: 0.95 },
  { type: 'circle', x: 14, z: -2, radius: 0.95 },

  // 4. Koi Lotus Pond (Hồ Sen & Thủy Đình) - Leaving open bridge path at x: [-23, -17], z: [33, 39]
  { type: 'box', minX: -39.0, maxX: -13.0, minZ: 39.0, maxZ: 47.0 },
  { type: 'box', minX: -39.0, maxX: -13.0, minZ: 25.0, maxZ: 33.0 },
  { type: 'box', minX: -39.0, maxX: -23.0, minZ: 33.0, maxZ: 39.0 },
  { type: 'box', minX: -17.0, maxX: -13.0, minZ: 33.0, maxZ: 39.0 },
  // Pavilion columns in pond
  { type: 'circle', x: -35.9, z: 26.1, radius: 0.45 },
  { type: 'circle', x: -31.1, z: 26.1, radius: 0.45 },
  { type: 'circle', x: -35.9, z: 30.9, radius: 0.45 },
  { type: 'circle', x: -31.1, z: 30.9, radius: 0.45 },

  // 5. Cổng Tam Quan (Gate Pillars & Flanking Walls)
  { type: 'circle', x: -6.5, z: 66, radius: 0.65 },
  { type: 'circle', x: -2.2, z: 66, radius: 0.65 },
  { type: 'circle', x: 2.2, z: 66, radius: 0.65 },
  { type: 'circle', x: 6.5, z: 66, radius: 0.65 },
  // Flanking stone walls of gate
  { type: 'box', minX: -26.0, maxX: -7.2, minZ: 65.2, maxZ: 66.8 },
  { type: 'box', minX: 7.2, maxX: 26.0, minZ: 65.2, maxZ: 66.8 },

  // 6. Bảo Tháp Men Ngọc (3-Tier Pagoda Tower at x: 38, z: -20)
  // Tower core body on Tier 1
  { type: 'box', minX: 33.2, maxX: 42.8, minZ: -24.8, maxZ: -15.2 },
  // At ground level (Y < 2.0), outer plinth walls except front steps (x: [35.5, 40.5], z: [-12, -9])
  { type: 'box', minX: 29.0, maxX: 47.0, minZ: -29.0, maxZ: -12.0, maxY: 2.2 },
  { type: 'box', minX: 29.0, maxX: 35.5, minZ: -12.0, maxZ: -9.0, maxY: 2.2 },
  { type: 'box', minX: 40.5, maxX: 47.0, minZ: -12.0, maxZ: -9.0, maxY: 2.2 },

  // 7. Lầu Chuông (Bell Tower at x: -26, z: -20)
  { type: 'circle', x: -26, z: -20, radius: 2.1 },
  { type: 'circle', x: -29.0, z: -22.4, radius: 1.4 },
  { type: 'circle', x: -29.6, z: -23.6, radius: 0.55 },
  { type: 'circle', x: -22.4, z: -23.6, radius: 0.55 },
  { type: 'circle', x: -29.6, z: -16.4, radius: 0.55 },
  { type: 'circle', x: -22.4, z: -16.4, radius: 0.55 },

  // 8. Dãy Hành Lang Cột Gỗ (Wooden Corridor at x: 18, z: 12)
  { type: 'circle', x: 15.4, z: -15, radius: 0.4 },
  { type: 'circle', x: 20.6, z: -15, radius: 0.4 },
  { type: 'circle', x: 15.4, z: -9.5, radius: 0.4 },
  { type: 'circle', x: 20.6, z: -9.5, radius: 0.4 },
  { type: 'circle', x: 15.4, z: -4, radius: 0.4 },
  { type: 'circle', x: 20.6, z: -4, radius: 0.4 },
  { type: 'circle', x: 15.4, z: 1.5, radius: 0.4 },
  { type: 'circle', x: 20.6, z: 1.5, radius: 0.4 },
  { type: 'circle', x: 15.4, z: 7, radius: 0.4 },
  { type: 'circle', x: 20.6, z: 7, radius: 0.4 },
  { type: 'circle', x: 15.4, z: 12.5, radius: 0.4 },
  { type: 'circle', x: 20.6, z: 12.5, radius: 0.4 },

  // 9. Đại Hùng Bảo Điện (Main Sanctuary at x: 0, z: -16)
  // At ground level (Y < 2.2), front podium wall except where the 3 staircases are:
  { type: 'box', minX: -24.0, maxX: -10.6, minZ: -1.0, maxZ: 1.0, maxY: 2.2 },
  { type: 'box', minX: -7.0, maxX: -2.6, minZ: -1.0, maxZ: 1.0, maxY: 2.2 },
  { type: 'box', minX: 2.6, maxX: 7.0, minZ: -1.0, maxZ: 1.0, maxY: 2.2 },
  { type: 'box', minX: 10.6, maxX: 24.0, minZ: -1.0, maxZ: 1.0, maxY: 2.2 },
  // Side & rear podium edges for ground level
  { type: 'box', minX: -25.0, maxX: -22.0, minZ: -34.0, maxZ: -1.0, maxY: 2.2 },
  { type: 'box', minX: 22.0, maxX: 25.0, minZ: -34.0, maxZ: -1.0, maxY: 2.2 },
  { type: 'box', minX: -23.0, maxX: 23.0, minZ: -35.0, maxZ: -33.0, maxY: 2.2 },

  // Upper Level (On podium, Y >= 2.0):
  // Sanctuary Back Wall
  { type: 'box', minX: -16.5, maxX: 16.5, minZ: -27.5, maxZ: -26.5, minY: 2.0 },
  // Sanctuary Left Wall
  { type: 'box', minX: -16.5, maxX: -15.5, minZ: -27.0, maxZ: -5.0, minY: 2.0 },
  // Sanctuary Right Wall
  { type: 'box', minX: 15.5, maxX: 16.5, minZ: -27.0, maxZ: -5.0, minY: 2.0 },
  // Sanctuary Front Wall sections (between the 3 door openings)
  { type: 'box', minX: -16.0, maxX: -6.5, minZ: -5.5, maxZ: -4.5, minY: 2.0 },
  { type: 'box', minX: -3.0, maxX: -2.0, minZ: -5.5, maxZ: -4.5, minY: 2.0 },
  { type: 'box', minX: 2.0, maxX: 3.0, minZ: -5.5, maxZ: -4.5, minY: 2.0 },
  { type: 'box', minX: 6.5, maxX: 16.0, minZ: -5.5, maxZ: -4.5, minY: 2.0 },

  // Buddha Altar & Lotus Throne inside Sanctuary (cannot walk through Buddha statue!)
  { type: 'box', minX: -4.6, maxX: 4.6, minZ: -24.2, maxZ: -19.2, minY: 2.0 },

  // 10. Phòng Thiền Nguyệt Môn (Meditation Hall at x: -24, z: 6)
  { type: 'box', minX: -31.5, maxX: -26.2, minZ: -0.6, maxZ: 0.4 },
  { type: 'box', minX: -21.8, maxX: -16.5, minZ: -0.6, maxZ: 0.4 },

  // 11. Phòng Kinh Sách (Library at x: 24, z: 6)
  { type: 'box', minX: 18.0, maxX: 30.0, minZ: -0.5, maxZ: 0.5 },
  { type: 'box', minX: 18.0, maxX: 30.0, minZ: 5.5, maxZ: 6.5 },
  { type: 'box', minX: 18.0, maxX: 30.0, minZ: 11.5, maxZ: 12.5 },

  // 12. Sân Sau (Back Garden)
  { type: 'circle', x: 11, z: -46, radius: 1.8 },
  { type: 'box', minX: -22.0, maxX: -10.0, minZ: -52.0, maxZ: -44.0 },
];

function resolveMonkCollision(
  px: number,
  py: number,
  pz: number
): { x: number; z: number } {
  const bodyR = 0.45;
  let resX = px;
  let resZ = pz;

  // World bounds clamp
  resX = Math.max(-45.0, Math.min(45.0, resX));
  resZ = Math.max(-65.0, Math.min(82.0, resZ));

  // 2 relaxation passes to handle corner collisions smoothly
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < MONASTERY_OBSTACLES.length; i++) {
      const obs = MONASTERY_OBSTACLES[i];

      if (obs.type === 'circle') {
        const dx = resX - obs.x;
        const dz = resZ - obs.z;
        const dist = Math.hypot(dx, dz);
        const minDist = obs.radius + bodyR;

        if (dist < minDist) {
          if (dist > 0.001) {
            const overlap = minDist - dist;
            resX += (dx / dist) * overlap;
            resZ += (dz / dist) * overlap;
          } else {
            resX += minDist;
          }
        }
      } else if (obs.type === 'box') {
        if (obs.minY !== undefined && py < obs.minY) continue;
        if (obs.maxY !== undefined && py > obs.maxY) continue;

        const clampedX = Math.max(obs.minX, Math.min(obs.maxX, resX));
        const clampedZ = Math.max(obs.minZ, Math.min(obs.maxZ, resZ));
        const dx = resX - clampedX;
        const dz = resZ - clampedZ;
        const distSq = dx * dx + dz * dz;

        if (distSq < bodyR * bodyR) {
          const dist = Math.sqrt(distSq);
          if (dist > 0.001) {
            const overlap = bodyR - dist;
            resX += (dx / dist) * overlap;
            resZ += (dz / dist) * overlap;
          } else {
            const distLeft = Math.abs(resX - obs.minX);
            const distRight = Math.abs(resX - obs.maxX);
            const distTop = Math.abs(resZ - obs.minZ);
            const distBottom = Math.abs(resZ - obs.maxZ);
            const minDistEdge = Math.min(distLeft, distRight, distTop, distBottom);

            if (minDistEdge === distLeft) resX = obs.minX - bodyR;
            else if (minDistEdge === distRight) resX = obs.maxX + bodyR;
            else if (minDistEdge === distTop) resZ = obs.minZ - bodyR;
            else resZ = obs.maxZ + bodyR;
          }
        }
      }
    }
  }

  // Final world bounds clamp
  resX = Math.max(-45.0, Math.min(45.0, resX));
  resZ = Math.max(-65.0, Math.min(82.0, resZ));

  return { x: resX, z: resZ };
}
"""

anchor_comp = "export const Zen3DWorld: React.FC<Zen3DWorldProps> = ({"
assert anchor_comp in content, "anchor_comp not found"
content = content.replace(anchor_comp, obstacle_definitions + "\n" + anchor_comp)

# 2. Add stuckCountRef
old_cursor_refs = """  const hasGroundTargetRef.current = false;
  const cursorMarkerGroupRef = useRef<THREE.Group | null>(null);"""

# Let's check how cursorMarkerGroupRef is defined
if "const cursorMarkerGroupRef = useRef<THREE.Group | null>(null);" in content:
    content = content.replace(
        "const cursorMarkerGroupRef = useRef<THREE.Group | null>(null);",
        "const cursorMarkerGroupRef = useRef<THREE.Group | null>(null);\n  const stuckCountRef = useRef<number>(0);"
    )

# 3. Update handlePointerUp to resolve click destination against obstacles
old_pointer_up = """      // Click on ground to move (Point & Click)
      const distMoved = Math.hypot(e.clientX - lastPointerDownPosRef.current.x, e.clientY - lastPointerDownPosRef.current.y);
      if (distMoved < 6 && hasGroundTargetRef.current) {
        const targetX = Math.max(-46, Math.min(46, cursorGroundPosRef.current.x));
        const targetZ = Math.max(-68, Math.min(88, cursorGroundPosRef.current.z));
        targetPosRef.current = { x: targetX, y: 0.25, z: targetZ };
        if (destinationMarkerRef.current) {
          destinationMarkerRef.current.position.set(targetX, 0.35, targetZ);
          destinationMarkerRef.current.visible = true;
        }
      }"""

new_pointer_up = """      // Click on ground to move (Point & Click with Obstacle Resolution)
      const distMoved = Math.hypot(e.clientX - lastPointerDownPosRef.current.x, e.clientY - lastPointerDownPosRef.current.y);
      if (distMoved < 6 && hasGroundTargetRef.current) {
        const rawX = cursorGroundPosRef.current.x;
        const rawZ = cursorGroundPosRef.current.z;
        const resolved = resolveMonkCollision(rawX, 0.25, rawZ);
        targetPosRef.current = { x: resolved.x, y: 0.25, z: resolved.z };
        if (destinationMarkerRef.current) {
          destinationMarkerRef.current.position.set(resolved.x, 0.35, resolved.z);
          destinationMarkerRef.current.visible = true;
        }
      }"""

assert old_pointer_up in content, "old_pointer_up not found"
content = content.replace(old_pointer_up, new_pointer_up)

# 4. Update manual walking movement with resolveMonkCollision
old_manual_walk = """          if (len > 0.001) {
            currentP.x += (moveX / len) * walkSpeed;
            currentP.z += (moveZ / len) * walkSpeed;

            currentP.x = Math.max(-46, Math.min(46, currentP.x));
            currentP.z = Math.max(-68, Math.min(86, currentP.z));

            let targetAngle = Math.atan2(moveX, moveZ);
            playerRotationRef.current = targetAngle;
            let diff = targetAngle - monkGroupRef.current.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            monkGroupRef.current.rotation.y += diff * 0.18;
          }"""

new_manual_walk = """          if (len > 0.001) {
            const nextX = currentP.x + (moveX / len) * walkSpeed;
            const nextZ = currentP.z + (moveZ / len) * walkSpeed;

            // Resolve obstacle collisions and slide smoothly
            const resolved = resolveMonkCollision(nextX, currentP.y, nextZ);
            currentP.x = resolved.x;
            currentP.z = resolved.z;

            let targetAngle = Math.atan2(moveX, moveZ);
            playerRotationRef.current = targetAngle;
            let diff = targetAngle - monkGroupRef.current.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            monkGroupRef.current.rotation.y += diff * 0.18;
          }"""

assert old_manual_walk in content, "old_manual_walk not found"
content = content.replace(old_manual_walk, new_manual_walk)

# 5. Update targetPos movement with resolveMonkCollision and stuck prevention
old_target_walk = """          if (dist > 0.4) {
            isCurrentlyWalking = true;
            isWalkingRef.current = true;
            if (!isWalkingStateRef.current) {
              isWalkingStateRef.current = true;
              setIsWalking(true);
            }
            walkPhaseRef.current += 0.16;

            currentP.x += (dx / dist) * Math.min(walkSpeed, dist);
            currentP.z += (dz / dist) * Math.min(walkSpeed, dist);

            if (targetP.y !== undefined) {
              currentP.y += ((targetP.y || 0.25) - currentP.y) * 0.1;
            }

            const targetAngle = Math.atan2(dx, dz);
            playerRotationRef.current = targetAngle;
            let diff = targetAngle - monkGroupRef.current.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            monkGroupRef.current.rotation.y += diff * 0.18;

            if (stepCount % 14 === 0) {
              spawnLotusFootstep(scene, currentP.x, currentP.z, lotusFootstepsRef);
            }
          }"""

new_target_walk = """          if (dist > 0.4) {
            isCurrentlyWalking = true;
            isWalkingRef.current = true;
            if (!isWalkingStateRef.current) {
              isWalkingStateRef.current = true;
              setIsWalking(true);
            }
            walkPhaseRef.current += 0.16;

            const stepDist = Math.min(walkSpeed, dist);
            const nextX = currentP.x + (dx / dist) * stepDist;
            const nextZ = currentP.z + (dz / dist) * stepDist;

            // Resolve obstacle collisions
            const resolved = resolveMonkCollision(nextX, currentP.y, nextZ);
            const actualMove = Math.hypot(resolved.x - currentP.x, resolved.z - currentP.z);
            currentP.x = resolved.x;
            currentP.z = resolved.z;

            // If monk is blocked by obstacle and cannot make forward progress, stop smoothly
            if (actualMove < 0.02) {
              stuckCountRef.current = (stuckCountRef.current || 0) + 1;
              if (stuckCountRef.current > 12) {
                targetPosRef.current = null;
                stuckCountRef.current = 0;
                isWalkingRef.current = false;
                if (destinationMarkerRef.current) destinationMarkerRef.current.visible = false;
              }
            } else {
              stuckCountRef.current = 0;
            }

            if (targetP.y !== undefined) {
              currentP.y += ((targetP.y || 0.25) - currentP.y) * 0.1;
            }

            const targetAngle = Math.atan2(dx, dz);
            playerRotationRef.current = targetAngle;
            let diff = targetAngle - monkGroupRef.current.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            monkGroupRef.current.rotation.y += diff * 0.18;

            if (stepCount % 14 === 0) {
              spawnLotusFootstep(scene, currentP.x, currentP.z, lotusFootstepsRef);
            }
          }"""

assert old_target_walk in content, "old_target_walk not found"
content = content.replace(old_target_walk, new_target_walk)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS: Integrated obstacle collision system!")
