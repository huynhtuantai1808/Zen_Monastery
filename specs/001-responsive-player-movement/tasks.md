# Tasks: Cải Thiện Chuyển Động Nhân Vật Chính (Responsive Player Movement)

**Input**: Design documents from `/specs/001-responsive-player-movement/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Every task includes an exact file path and clear implementation action

---

## Phase 1: Setup (Shared Constants & Contract Definitions)

**Purpose**: Định nghĩa các hằng số cấu hình động học và mở rộng hợp đồng lệnh điều khiển.

- [X] T001 [P] Define `MovementConfig` constants (`BASE_SPEED = 5.8`, `SPRINT_SPEED = 8.8`, `ACCEL_RATE = 26.0`, `BRAKE_RATE = 32.0`, `TURN_RATE = 28.0`, `STRIDE_STEP_DIST = 0.75`, `CLICK_ARRIVE_DIST = 0.18`) in src/canvas/Zen3DWorld.tsx
- [X] T002 [P] Define `setSprintMode(active: boolean)` method in `ZenWebGlCommands` interface in src/canvas/bridge/zenWorldBridge.ts

---

## Phase 2: Foundational (State Buffers & Command Wiring)

**Purpose**: Thiết lập bộ đệm trạng thái động học Zero-Allocation và đấu nối lệnh giữa Bridge và WebGL Canvas.

- [X] T003 Initialize velocity vector buffers (`currentVelocityRef`, `isSprintingRef`, `strideAccumulatorRef`) for Zero-Allocation 60 FPS loop in src/canvas/Zen3DWorld.tsx
- [X] T004 Register `setSprintMode` bridge command implementation in `zenWorldBridge.commands` in src/canvas/Zen3DWorld.tsx

**Checkpoint**: Nền tảng cấu hình, trạng thái vận tốc và lệnh điều khiển đã sẵn sàng - có thể triển khai các User Story.

---

## Phase 3: User Story 1 - Tăng Tốc Độ Di Chuyển Cơ Bản & Chạy Nhanh Sprint (Priority: P1) 🎯 MVP

**Goal**: Nâng tốc độ di chuyển cơ bản lên 5.8 m/s (+61%) và hỗ trợ chế độ Chạy Nhanh 8.8 m/s khi giữ phím Shift.

**Independent Test**: Nhấn phím di chuyển một đoạn đường thẳng từ Cổng Tam Quan vào Chánh Điện; thời gian di chuyển giảm rõ rệt (> 40%), giữ phím Shift giúp bứt tốc vượt nhanh qua sân chùa.

### Implementation for User Story 1

- [X] T005 [US1] Implement keyboard event listeners for `ShiftLeft`/`ShiftRight` keydown/keyup to toggle sprint state in src/canvas/Zen3DWorld.tsx
- [X] T006 [US1] Implement camera-relative target velocity calculation with base and sprint speeds (`5.8 m/s` vs `8.8 m/s`) in src/canvas/Zen3DWorld.tsx
- [X] T007 [US1] Implement distance-based stride accumulator (`STRIDE_STEP_DIST = 0.75m`) for footstep particles and sound synchronization in src/canvas/Zen3DWorld.tsx
- [X] T008 [US1] Scale limb swing animation frequency (`walkCycle`) proportionally to actual ground velocity in src/canvas/Zen3DWorld.tsx

**Checkpoint**: User Story 1 hoàn thành - nhân vật di chuyển nhanh nhẹn, sải bước thanh thoát và bứt tốc với Shift mà không bị trượt chân.

---

## Phase 4: User Story 2 - Đổi Hướng Tức Thì & Triệt Tiêu Độ Trễ Xoay Người (Priority: P1)

**Goal**: Triệt tiêu độ trễ khi chuyển hướng, tăng tốc độ bám góc (`TURN_RATE = 28.0`), hỗ trợ xoay ngược chiều tức thì (< 110ms) và khóa tự động xoay chuột khi đứng yên.

**Independent Test**: Đổi hướng zíc-zắc liên tục hoặc quay ngược 180 độ; nhân vật xoay người tức thì bám sát hướng điều khiển, không bị văng đà cũ hay quay vòng cung chậm chạp.

### Implementation for User Story 2

- [X] T009 [US2] Implement high-responsiveness directional angle interpolation (`TURN_RATE = 28.0`) in src/canvas/Zen3DWorld.tsx
- [X] T010 [US2] Implement quick-turn angular boost (`QUICK_TURN = 36.0`) when directional difference exceeds 140 degrees in src/canvas/Zen3DWorld.tsx
- [X] T011 [US2] Disable automatic cursor-tracking rotation during `IDLE` state when no movement keys are pressed in src/canvas/Zen3DWorld.tsx

**Checkpoint**: User Story 2 hoàn thành - nhân vật phản hồi chuyển hướng tức thì và dứt khoát trên cả phím và chuột.

---

## Phase 5: User Story 3 - Gia Tốc Khởi Động Nhạy & Phanh Dừng Dứt Khoát (Priority: P2)

**Goal**: Đạt 90% vận tốc tối đa trong < 100ms khi nhấn phím, và hãm phanh dừng hẳn trong < 100ms và phạm vi < 0.12m khi nhả phím.

**Independent Test**: Tiến lại gần bồ đoàn hoặc bậc thềm đá và thả phím; nhân vật dừng đứng chuẩn xác ngay mép mà không bị trôi lố qua mục tiêu.

### Implementation for User Story 3

- [X] T012 [US3] Implement exponential velocity acceleration (`ACCEL_RATE = 26.0`) when input is active in src/canvas/Zen3DWorld.tsx
- [X] T013 [US3] Implement rapid braking friction decay (`BRAKE_RATE = 32.0`) and zero-snap threshold (`< 0.05 m/s`) upon input release in src/canvas/Zen3DWorld.tsx
- [X] T014 [US3] Integrate velocity-driven position update with `playerPosRef` and monk group position in src/canvas/Zen3DWorld.tsx

**Checkpoint**: User Story 3 hoàn thành - khởi động bốc, phanh dừng dứt khoát, dễ dàng căn vị trí tinh tế.

---

## Phase 6: User Story 4 - Đồng Bộ Đa Phương Thức Nhập Liệu & Va Chạm Trượt (Priority: P3)

**Goal**: Hỗ trợ nút Sprint trên mobile D-Pad, hoàn thiện Click-to-move arrival deceleration, và thuật toán trượt va chạm tiếp tuyến (Tangential Wall Slide).

**Independent Test**: Chạm phím D-pad ảo và nút 🏃 trên màn hình cảm ứng, thử nhấp chuột click-to-move trên sân, và chạy đâm chéo 45 độ vào tường/cột đá.

### Implementation for User Story 4

- [X] T015 [P] [US4] Add Sprint Toggle button (🏃) alongside virtual D-Pad in src/canvas/Zen3DOverlays.tsx
- [X] T016 [US4] Update click-to-move path interpolation with arrival deceleration and crisp stop at `CLICK_ARRIVE_DIST = 0.18m` in src/canvas/Zen3DWorld.tsx
- [X] T017 [US4] Implement tangential wall sliding velocity projection following `resolveMonkCollision` in src/canvas/Zen3DWorld.tsx

**Checkpoint**: Tất cả 4 User Stories hoàn tất và hoạt động đồng bộ trên mọi nền tảng thiết bị.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Kiểm thử hiệu năng, kiểm tra kiểu dữ liệu và xác thực toàn diện các kịch bản thực tế.

- [X] T018 [P] Verify Zero-Allocation compliance in 60 FPS animation loop with performance check in src/canvas/Zen3DWorld.tsx
- [X] T019 Run TypeScript typecheck `npx tsc -b` and production build `npm run build`
- [X] T020 Validate all 5 interactive scenarios from quickstart.md across desktop and mobile form factors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Không có phụ thuộc - có thể bắt đầu ngay.
- **Foundational (Phase 2)**: Phụ thuộc vào Phase 1 - Khóa tất cả các User Story.
- **User Stories (Phase 3+)**: Phụ thuộc vào Phase 2 hoàn thành:
  - User Story 1 (P1 - Tốc độ & Sprint): Triển khai đầu tiên (MVP).
  - User Story 2 (P1 - Xoay hướng tức thì): Có thể triển khai tiếp nối hoặc song song với US1.
  - User Story 3 (P2 - Gia tốc & Phanh): Triển khai tích hợp trên nền vector vận tốc của US1/US2.
  - User Story 4 (P3 - Giao diện mobile & Va chạm trượt): Triển khai hoàn thiện trải nghiệm.
- **Polish (Phase 7)**: Phụ thuộc vào việc hoàn tất các User Story mong muốn.

### Parallel Opportunities

- `T001` và `T002` trong Phase 1 có thể chạy song song (khác tập tin: `Zen3DWorld.tsx` và `zenWorldBridge.ts`).
- `T015` trong Phase 6 (`Zen3DOverlays.tsx`) có thể triển khai song song với `T016`/`T017` trong `Zen3DWorld.tsx`.
- `T018` và `T019` trong Phase 7 có thể thực hiện song song.

---

## Implementation Strategy: MVP First

1. **Bước 1**: Hoàn thành Phase 1 (Setup) và Phase 2 (Foundational).
2. **Bước 2**: Hoàn thành Phase 3 (User Story 1) - **Đạt mốc MVP!** Tốc độ di chuyển tăng 61%, có chế độ Sprint bứt tốc.
3. **Bước 3**: Hoàn thành Phase 4 (User Story 2) - Triệt tiêu hoàn toàn độ trễ khi đổi hướng.
4. **Bước 4**: Hoàn thành Phase 5 (User Story 3) - Phanh dừng dứt khoát, khởi động tức thì.
5. **Bước 5**: Hoàn thành Phase 6 (User Story 4) - Thêm nút Sprint cho mobile và trượt va chạm mượt mà.
6. **Bước 6**: Chạy Phase 7 (Polish & Verification) - Đảm bảo Zero-Allocation 60 FPS và build sạch 0 lỗi.

