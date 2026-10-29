# KỊCH BẢN & ĐỊNH HƯỚNG PHÁT TRIỂN GAME: TỊNH TÂM SƠN TỰ (ZEN MONASTERY)

**Thể loại:** Mô phỏng đời sống tu tập kết hợp nhập vai nhẹ nhàng (Cozy RPG / Life Simulation)  
**Phong cách đồ họa:** Màu nước ấm áp (Watercolor), 2D/2.5D nhẹ nhàng  
**Âm thanh chủ đạo:** Nhạc thiền định, âm thanh tự nhiên ASMR (chuông gió, tiếng mõ, tiếng suối chảy, chổi tre quét lá)  
**Lộ trình nền tảng:** Web (MVP) $\rightarrow$ Mobile App (iOS/Android) $\rightarrow$ PC (Steam)

---

## 1. Cốt truyện & Bối cảnh (Story & Setting)

Người chơi vào vai một người trẻ kiệt sức vì áp lực đô thị (Deadline, mạng xã hội, cơm áo gạo tiền). Trong một lần tình cờ, nhân vật tìm đến **Chùa Vân Ẩn** nằm trên đỉnh núi sương mù để xin tá túc.

Khi mới bước vào chùa, màn hình game có tông màu xám xịt, âm thanh ồn ào của phố thị vẫn văng vẳng trong đầu nhân vật. Khi người chơi làm nhiệm vụ tích phước và lên cấp, màu sắc cảnh vật sẽ dần tươi sáng, rực rỡ hơn, tâm cảnh mở rộng và mở khóa thêm các khu vực mới trong chùa (Vườn Trà, Rừng Trúc, Hồ Liên Hoa, Tàng Kinh Các).

---

## 2. Hệ thống Chỉ số & Cấp độ (Stats & Leveling)

Thay vì máu (HP) hay năng lượng (MP) truyền thống, game sử dụng 3 chỉ số cốt lõi:

*   **Công Đức (Phước Báu - EXP):** Nhận được khi hoàn thành nhiệm vụ. Dùng để tăng **Cấp độ Tâm Cảnh (Level)** và nâng cấp cảnh quan chùa.
*   **Tâm Lực (Stamina):** Năng lượng để làm việc trong ngày. Khi Tâm Lực cạn, nhân vật sẽ di chuyển chậm và dễ bị "Tạp Niệm" (làm hỏng việc). Hồi phục qua việc uống trà, nghỉ ngơi hoặc ngồi thiền.
*   **Định Lực (Focus Buff):** Chỉ số đặc biệt nhận được từ các **buổi tối nghe Sư Thầy giảng pháp**. Định Lực càng cao, tốc độ hoàn thành nhiệm vụ vào ngày hôm sau càng nhanh và lượng Phước nhận được sẽ nhân lên ($\times 1.5$ hoặc $\times 2$).

| Cấp độ | Danh hiệu Tâm Cảnh | Khu vực / Tính năng mở khóa |
| :--- | :--- | :--- |
| **Cấp 1 - 5** | Người Tập Sự | Sân Chùa, Nhà Bếp, Nhiệm vụ dọn dẹp cơ bản |
| **Cấp 6 - 15** | Cư Sĩ Áo Lam | Vườn Thảo Dược, Hồ Phóng Sinh, Chép kinh, Pha trà |
| **Cấp 16 - 30** | Bậc Tỉnh Thức | Tàng Kinh Các, Tiếp đón khách hành hương (giải đố tâm lý) |
| **Cấp 31+** | Tâm Bất Biến | Đỉnh Vân Sơn, Tự tạo vườn thiền (Zen Garden) riêng |

---

## 3. Vòng lặp Gameplay (Chu kỳ Ngày & Đêm)

Một ngày trong game kéo dài khoảng 15–20 phút ngoài đời thực, chia làm các buổi rõ rệt:

### Buổi Sáng: Lao tác tích phước (Active Gameplay)
Người chơi nhận danh sách công việc trong ngày từ Chú Tiểu hoặc Sư Thầy. Mỗi công việc là một mini-game nhẹ nhàng nhưng đòi hỏi sự khéo léo:
*   **Quét lá đa:** Điều khiển chổi theo nhịp gió để gom lá mà không làm bay tung tóe. (Thử thách sự kiên nhẫn: đôi khi vừa quét xong gió lại thổi lá rụng xuống, nếu người chơi không bấm nút "Tức giận" mà kiên nhẫn quét lại sẽ được thưởng **Phước Ẩn**).
*   **Gánh nước & Bổ củi:** Mini-game căn thanh lực chuẩn xác để giữ thăng bằng.
*   **Nấu cơm chay:** Sơ chế nguyên liệu từ vườn chùa, canh lửa để cơm không bị khê.

### Buổi Chiều: Tĩnh dưỡng & Thiện nguyện (Social & Exploration)
*   **Chép kinh / Thư pháp:** Vẽ theo nét chữ trên màn hình để rèn sự tập trung.
*   **Lắng nghe khách thập phương:** Khách đến chùa mang theo những nỗi buồn (thất tình, phá sản, mất phương hướng). Người chơi lắng nghe, pha cho họ một ấm trà phù hợp (Trà Sen an thần, Trà Gừng ấm lòng) và chọn câu trả lời thấu cảm để giúp họ cởi bỏ nút thắt. Giải quyết xong sẽ nhận được lượng lớn **Công Đức**.

### Buổi Tối: Tu tâm nghe lời Thầy (Core Mechanic - Tăng tốc)
Khi tiếng chuông chiều ngân lên, tất cả tập trung tại Chánh Điện. Đây là tính năng trọng tâm giúp bứt phá tiến độ game:
1.  **Giai đoạn Tịnh Tâm (Mini-game Hơi Thở):** Trước khi nghe giảng, những "Tạp Niệm" (bong bóng suy nghĩ về tiền bạc, điện thoại, áp lực) sẽ bay ngang màn hình. Người chơi phải giữ nhịp thở (nhấn giữ và thả theo nhịp vòng tròn) để làm tan biến các bong bóng này.
2.  **Giai đoạn Nghe Pháp:** Sư Thầy sẽ kể một câu chuyện thiền hoặc giảng một bài học ngắn (khoảng 1–2 phút, có lồng tiếng trầm ấm).
3.  **Giai đoạn Ngộ Đạo (Vấn đáp):** Cuối buổi, Sư Thầy đặt một câu hỏi tình huống dựa trên bài giảng.
    *   *Trả lời đúng tâm ý:* Đạt trạng thái **"Đốn Ngộ"**. Nhận ngay một lượng lớn Phước Báu và **Buff "Tâm Sáng"** cho ngày hôm sau (+50% tốc độ làm nhiệm vụ, +30% Công Đức nhận được, giảm tiêu hao Tâm Lực).
    *   *Trả lời chưa chuẩn:* Vẫn nhận được Phước Báu cơ bản và lời khuyên nhẹ nhàng từ Thầy.

---

## 4. Các cơ chế đặc sắc (Unique Features)

*   **Cơ chế "Không Vội Vã" (Anti-Rush System):** Khác với các game nông trại thông thường (bấm thật nhanh để thu hoạch), trong game này nếu người chơi spam nút bấm quá nhanh hoặc chạy hùng hục trong sân chùa, nhân vật sẽ bị trượt ngã hoặc làm đổ đồ, bị trừ điểm Định Lực. Điềm tĩnh thao tác đúng nhịp mới là cách làm nhiệm vụ nhanh nhất.
*   **Sổ Tay Tỉnh Thức:** Lưu lại những câu nói hay, những bài giảng của Sư Thầy mỗi tối dưới dạng các bức tranh thủy mặc. Người chơi có thể sưu tầm đủ bộ để đổi lấy các vật phẩm trang trí chùa (đèn lồng, tượng đá, cây bonsai).
*   **Thời tiết & Sự kiện theo mùa:**
    *   *Ngày mưa:* Không thể quét sân, chuyển sang nhiệm vụ hứng nước mưa pha trà, ngồi nghe tiếng mưa rơi để hồi Tâm Lực.
    *   *Lễ Vu Lan / Phật Đản:* Sự kiện lớn trong game, người chơi phụ giúp trang trí chùa, thả đèn hoa đăng trên sông và nhận lượng Phước Báu gấp bội.

---

## 5. Mô hình Doanh thu & Giữ chân người chơi (Monetization & Retention)

*   **Âm thanh ASMR:** Đầu tư mạnh vào tiếng chổi tre quét lá khô, tiếng nước sôi pha trà, tiếng chuông chùa ngân vang và giọng đọc truyền cảm của Sư Thầy.
*   **Mô hình doanh thu (Thân thiện, không Pay-to-Win):** Bán các gói trang phục Cư sĩ, các loại hạt giống hoa quý hiếm để trồng trong chùa, bộ ấm trà cổ, hoặc mở rộng các chương cốt truyện mới (DLC). Tuyệt đối không bán "Công Đức" bằng tiền thật để giữ đúng tinh thần thanh tịnh của game.

---

## 6. Định hướng Công nghệ & Lộ trình Phát triển (Tech Stack & Roadmap)

Để đáp ứng lộ trình phát triển từ **Web $\rightarrow$ Mobile App $\rightarrow$ PC (Steam)** mà không phải viết lại mã nguồn (giữ lại tới 95% code cốt lõi), dự án sử dụng ngôn ngữ **TypeScript** với kiến trúc kết hợp **React / Next.js + Phaser 3**.

### 6.1. Lộ trình nâng cấp theo giai đoạn

| Giai đoạn | Nền tảng mục tiêu | Giải pháp Đóng gói & Triển khai | Tỷ lệ tái sử dụng Code |
| :--- | :--- | :--- | :--- |
| **Giai đoạn 1** | **Web Browser (MVP)** | Deploy qua **Next.js** (hoặc Vite). Tải trang tức thì, tiếp cận người chơi nhanh qua link web, hỗ trợ sẵn PWA. | **100% Base Code** |
| **Giai đoạn 2** | **Mobile (iOS / Android)** | Dùng **Capacitor** bọc Web App thành Native App. Tích hợp plugin rung (Haptics), thông báo đẩy (nhắc giờ tịnh tâm) và In-App Purchase. | **~95%** (Chỉ thêm cấu hình Native) |
| **Giai đoạn 3** | **PC (Steam)** | Đóng gói bằng **Tauri** (siêu nhẹ, dùng Rust backend) hoặc **Electron** + thư viện `steamworks.js` để kết nối Steam Achievements & Cloud Save. | **~95%** (Thêm tích hợp Steam API) |

### 6.2. Kiến trúc kỹ thuật "2 Lớp" (Two-Layer Architecture)

```
+-------------------------------------------------------------------+
|                   LỚP 2: UI OVERLAY (React + TailwindCSS)         |
|  - Hộp thoại Sư Thầy giảng pháp, Vấn đáp Ngộ Đạo                  |
|  - Sổ Tay Tỉnh Thức, Thanh chỉ số (Công Đức, Tâm Lực, Định Lực)   |
+-------------------------------------------------------------------+
                                 ^
                                 | (Đồng bộ State thời gian thực)
                                 v
+-------------------------------------------------------------------+
|               CẦU NỐI DỮ LIỆU (Zustand State Store)               |
+-------------------------------------------------------------------+
                                 ^
                                 | (Gọi hàm cập nhật / Đọc chỉ số)
                                 v
+-------------------------------------------------------------------+
|                   LỚP 1: GAME CANVAS (Phaser 3)                   |
|  - Render cảnh chùa 2D, Nhân vật di chuyển, Thời tiết (Mưa/Lá rơi)|
|  - WebGL Shader chuyển màu cảnh vật từ xám sang rực rỡ theo Level |
|  - Xử lý tương tác các Mini-game (Quét lá, Giữ nhịp thở, Pha trà) |
+-------------------------------------------------------------------+
```

*   **Lớp Game Canvas (Phaser 3):** Đảm nhận hệ thống vật lý nhẹ, quản lý hạt (Particle Emitter cho lá rơi, hoa đăng), WebGL Shader và tự động co giãn khung hình (`Phaser.Scale`) từ màn hình dọc điện thoại sang màn hình ngang 16:9 trên PC.
*   **Lớp Giao diện UI (React / Next.js + TailwindCSS + Framer Motion):** Giúp hiển thị văn bản sắc nét ở mọi độ phân giải (từ Retina đến 4K), xử lý hiệu ứng lật trang Sổ Tay Tỉnh Thức và hội thoại mượt mà, tốc độ phát triển nhanh gấp nhiều lần so với làm UI thuần trong Canvas.
*   **Quản lý trạng thái (Zustand):** Đóng vai trò kho lưu trữ trung tâm giữa Phaser và React. Khi hoàn thành mini-game dưới Phaser, điểm Công Đức và Định Lực được cập nhật vào Zustand và hiển thị tức thì lên giao diện React.

### 6.3. Các nguyên tắc thiết kế (Design Patterns) chuẩn bị sẵn từ Giai đoạn 1

1.  **Hệ thống điều khiển đồng nhất (Unified Input Handler):**
    *   Sử dụng `Pointer Events` của Phaser (`pointerdown`, `pointermove`) để tự động tương thích cả thao tác **Click chuột (Web/PC)** lẫn **Chạm cảm ứng (Mobile)**.
    *   Hỗ trợ song song cơ chế chạm để di chuyển (Tap-to-move) và điều khiển bằng phím `WASD` / Joystick ảo.
2.  **Trừu tượng hóa Lưu trữ (Storage Adapter Pattern):**
    *   Thiết kế một `SaveSystem Interface` chung ngay từ đầu:
        *   **Bản Web:** Lưu vào `IndexedDB` / `localStorage` hoặc đồng bộ qua Cloud API.
        *   **Bản Mobile:** Chuyển đổi sang `Capacitor Preferences` / `SQLite`.
        *   **Bản PC Steam:** Ghi file cục bộ qua `Tauri FS` để tương thích với hệ thống **Steam Auto-Cloud**.
3.  **Quản lý Âm thanh đa nền tảng (Howler.js):**
    *   Sử dụng thư viện **Howler.js** để quản lý Audio Sprite và xử lý triệt để chính sách chặn tự động phát âm thanh (Autoplay Policy) trên trình duyệt Web và Safari iOS, đồng thời hỗ trợ trộn âm thanh ASMR đa kênh mượt mà.