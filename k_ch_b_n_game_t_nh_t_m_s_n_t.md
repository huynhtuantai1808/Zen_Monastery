# KỊCH BẢN & ĐỊNH HƯỚNG PHÁT TRIỂN GAME: TỊNH TÂM SƠN TỰ (ZEN MONASTERY)

**Thể loại:** Mô phỏng đời sống tu tập kết hợp nhập vai nhẹ nhàng (Cozy RPG / Life Simulation)  
**Phong cách đồ họa:** Màu nước ấm áp (Watercolor), Anime 3D / 2.5D Cel-shaded nhẹ nhàng thanh tịnh  
**Âm thanh chủ đạo:** Nhạc thiền định (On Rainy Days relaxing BGM), âm thanh tự nhiên ASMR (Đại hồng chung ngân vang, chuông gió, tiếng mõ gỗ, chuông xoay 432Hz, suối reo, chổi tre quét lá)  
**Lộ trình nền tảng:** Web (MVP) $\rightarrow$ Mobile App (iOS/Android) $\rightarrow$ PC (Steam)

---

## 1. Cốt truyện & Bối cảnh (Story & Setting)

Người chơi vào vai một người trẻ kiệt sức vì áp lực đô thị (Deadline dồn dập, mạng xã hội, cơm áo gạo tiền, so sánh bản thân). Trong một lần tình cờ, nhân vật tìm đến **Chùa Vân Ẩn** nằm trên đỉnh núi sương mù để xin tá túc và xuất gia gieo duyên / tập sự.

Khi mới bước vào chùa, màn hình game có tông màu xám xịt (Grayscale cao), âm thanh ồn ào của phố thị vẫn văng vẳng trong đầu nhân vật. Khi người chơi làm nhiệm vụ tích phước và lên cấp, màu sắc cảnh vật sẽ dần tươi sáng, rực rỡ hơn (Saturation tăng dần, Shader màu nước thanh lọc tâm hồn), tâm cảnh mở rộng và mở khóa thêm các khu vực mới trong chùa (Vườn Trà, Rừng Trúc, Hồ Liên Hoa & Cá Koi, Tàng Kinh Các, Đỉnh Vân Sơn).

---

## 2. Hệ thống Chỉ số & Cấp độ (Stats & Leveling)

Thay vì máu (HP) hay năng lượng (MP) truyền thống, game sử dụng 3 chỉ số cốt lõi:

*   **Công Đức (Phước Báu - EXP):** Nhận được khi hoàn thành nhiệm vụ và công quả. Dùng để tăng **Cấp độ Tâm Cảnh (Level)** và nâng cấp cảnh quan sơn tự.
*   **Tâm Lực (Stamina):** Năng lượng để làm việc trong ngày (tối đa 100). Khi Tâm Lực cạn, nhân vật sẽ di chuyển chậm và dễ bị "Tạp Niệm" (làm hỏng việc). Hồi phục qua việc uống chén trà ấm, nghỉ ngơi hoặc ngồi thiền nghe chuông.
*   **Định Lực (Focus Buff / Tâm Sáng):** Chỉ số đặc biệt nhận được từ các **buổi tối nghe Sư Thầy giảng pháp và vấn đáp ngộ đạo**. Định Lực càng cao, tốc độ hoàn thành nhiệm vụ vào ngày hôm sau càng nhanh và lượng Phước nhận được sẽ nhân lên ($\times 1.5$ hoặc $\times 2$).

| Cấp độ | Danh hiệu Tâm Cảnh | Khu vực / Tính năng mở khóa |
| :--- | :--- | :--- |
| **Cấp 1 - 5** | Người Tập Sự | Sân Chùa, Bếp Hương Tích, Bãi Củi, Giếng Tiên, Quét lá đa, Chẻ củi, Gánh nước, Lau chùi bàn thờ, Cứu tế cơm chay |
| **Cấp 6 - 15** | Cư Sĩ Áo Lam | Hiên Trà An Nhiên, Hồ Sen & Phóng Sinh Cá Koi, Thính Pháp & Vấn Đáp Ngộ Đạo, Chép kinh thư pháp |
| **Cấp 16 - 30** | Bậc Tỉnh Thức | Tàng Kinh Các, Tiếp đón khách hành hương sâu sắc (giải đố tâm lý), Thả hoa đăng cầu an |
| **Cấp 31+** | Tâm Bất Biến | Đỉnh Vân Sơn, Tự tạo Vườn Thiền (Zen Garden) riêng, Cảnh giới viên mãn |

---

## 3. Vòng lặp Gameplay (Chu kỳ Ngày & Đêm)

Một ngày trong game kéo dài khoảng 15–20 phút ngoài đời thực (hoặc người chơi chủ động chuyển đổi), chia làm các buổi rõ rệt:

### Buổi Sáng: Lao tác tích phước (Active Gameplay)
Người chơi nhận danh sách công việc trong ngày từ Chú Tiểu hoặc Sư Thầy. Mỗi công việc là một mini-game nhẹ nhàng nhưng đòi hỏi sự khéo léo:
*   **Quét lá đa sân chùa:** Điều khiển chổi tre gom lá theo nhịp thở. (Cơ chế Anti-Rush: bấm vội vã $<400\text{ms}$ sẽ sinh tạp niệm, gió thổi tung lá; kiên nhẫn quét từng nhịp sẽ kích hoạt Combo tĩnh tâm và nhận **Phước Ẩn**).
*   **Chẻ củi nấu cơm chay:** Căn lực rìu chính xác, chuyển hóa tâm sân hận thành ngọn lửa ấm áp.
*   **Gánh nước suối lên chùa:** Giữ thăng bằng đòn gánh trên đường dốc sỏi, không làm sánh một giọt nước trong ngần.
*   **Lau chùi bàn thờ Đức Phật:** Tẩy sạch bụi trần trên tòa sen, đánh bóng lư đồng, cắm sen tươi và thắp nến hoa đăng.
*   **Nấu cơm chay Bếp Hương Tích:** Sơ chế rau củ chùa trồng, canh lửa lò củi để cơm chín dẻo thơm không bị khê.

### Buổi Chiều: Tĩnh dưỡng, Đàm đạo & Thiện nguyện (Social & Exploration)
*   **Chép kinh / Viết thư pháp:** Ngồi bên bàn gỗ hoa lê tại Tàng Kinh Các, mài mực thơm và tô theo từng nét chữ kinh văn hoặc câu kệ thiền để rèn định lực.
*   **Hiên Trà Chùa Vân Ẩn (Lắng nghe khách thập phương):** Khách đến chùa mang theo gánh nặng trần ai (Minh Anh bị kiệt sức vì deadline, Chú Hoàng uất ức vì bị phản bội, Hải Đăng hoang mang về tương lai). Người chơi chọn loại trà phù hợp (Trà Sen an thần, Trà Gừng ấm lòng, Trà Cúc thanh tâm) và đối thoại bằng lời từ ái để cởi bỏ gút thắt.
*   **Hồ Sen & Phóng sinh Cá Koi:** Rải mồi cho đàn cá Koi ngũ sắc dưới chân cầu đá, ngắm hoa sen nở và thả cá phóng sinh tích thiện nghiệp.

### Buổi Tối: Tu tâm nghe lời Thầy (Core Mechanic - Tăng tốc)
Khi tiếng Đại hồng chung ngân vang lúc hoàng hôn, chuông mõ Chánh Điện vang lên:
1.  **Giai đoạn Tịnh Tâm (Mini-game Hơi Thở Hoa Sen):** Những "Tạp Niệm" (bong bóng deadline, điện thoại, lo âu) bay lơ lửng. Người chơi nhấn giữ nhịp thở sâu để làm tan biến từng tạp niệm.
2.  **Giai đoạn Nghe Pháp:** Sư Thầy giảng một bài học ngắn từ kinh điển Phật giáo chánh thống (Kinh Pháp Cú, Kim Cương, Bát Nhã, Từ Bi...).
3.  **Giai đoạn Ngộ Đạo (Vấn đáp):** Sư Thầy đặt câu hỏi tình huống:
    *   *Trả lời đúng tâm ý:* Đạt trạng thái **"Đốn Ngộ"**. Nhận lượng lớn Phước Báu và **Buff "Tâm Sáng"** cho ngày hôm sau ($+50\%$ tốc độ, nhân $1.5$ Công Đức, giảm tiêu hao Tâm Lực).
    *   *Thu thập câu kệ:* Câu kệ ngộ đạo được tự động ghi vào **Sổ Tay Tỉnh Thức**.

---

## 4. Các cơ chế đặc sắc (Unique Features)

*   **Cơ chế "Không Vội Vã" (Anti-Rush System):** Bấm nhanh, thao tác giật cục sẽ làm lá bay tán loạn hoặc đổ nước. Tĩnh lặng, nhịp nhàng mới là con đường nhanh nhất.
*   **Sổ Tay Tỉnh Thức:** Kho tàng lưu giữ danh ngôn, kệ kinh ngộ đạo thu thập từ các buổi thính pháp.
*   **Âm thanh ASMR & Chống đè tiếng thông minh:** Tiếng chuông chùa Đại Hồng Chung khi ngân vang sẽ tự động ghìm nhỏ nhạc nền (ducking) cho đến khi dứt tiếng thì nhạc nền tự động trở về âm lượng êm dịu ban đầu. Nhạc nền thiền *On Rainy Days* tự động lặp lại liên tục (auto-reload).
*   **Thời tiết & Sự kiện theo mùa:**
    *   *Ngày mưa thiền:* Bật mưa rơi lất phất, chuyển sang ngồi hiên thưởng trà, nghe mưa rơi tí tách trên mái ngói để hồi phục Tâm Lực.
    *   *Lễ Vu Lan / Phật Đản:* Thả đèn hoa đăng lung linh mặt nước cầu nguyện bình an.

---

## 5. BẢNG TIẾN ĐỘ THỰC HIỆN DỰ ÁN (PROJECT STATUS MATRIX)

| STT | Tính năng / Phân hệ | Mô tả chi tiết | Trạng thái |
| :---: | :--- | :--- | :---: |
| 1 | **Thế giới 3D Sơn Tự (Three.js)** | Toàn cảnh Chùa Vân Ẩn 3D: Cổng Tam Quan, Sân gạch, Lư đồng, Lầu chuông, Bảo tháp, Suối ngọc, Chánh điện. Camera 3rd person, va chạm vật lý mượt mà. | ✅ **Hoàn thành** |
| 2 | **Thế giới Mở 2D & Góc nhìn Tĩnh** | Chế độ 2D cuộn cảnh (ZenOpenWorld) và Cảnh thiền thủy mặc tĩnh (Focus Mode) chuyển đổi linh hoạt bằng 1 chạm. | ✅ **Hoàn thành** |
| 3 | **Đồ họa Anime & Tùy biến Nhân vật** | Nhân vật phong cách Anime hiện đại, tùy biến Pháp danh, Giới tính, Pháp phục (Áo Lam, Nâu Sồng, Xám, Bạch Y), Kiểu tóc, Chuỗi hạt. | ✅ **Hoàn thành** |
| 4 | **Tối ưu hóa GPU / Shadow / RAM** | Giới hạn PixelRatio (1.0 - 1.25), PCFShadowMap (1024), dọn dẹp bộ nhớ unmount `scene.traverse` và `scene.clear()` chống rò rỉ RAM. | ✅ **Hoàn thành** |
| 5 | **Menu Cài đặt Đồ họa (Thấp / Cao)** | Cho phép người chơi linh hoạt chọn đồ họa Tiết kiệm pin (Low - 1.0x, tắt đổ bóng) hoặc Cân bằng (High - 1.25x, bóng 1024). | ✅ **Hoàn thành** |
| 6 | **Quản lý State tập trung (Zustand)** | `gameStore.ts` lưu trữ toàn bộ chỉ số, cấp độ, trang phục, nhiệm vụ, quotes và tự động sync LocalStorage. Tách nhỏ các component UI sạch sẽ. | ✅ **Hoàn thành** |
| 7 | **Hệ thống Âm thanh Chánh Tông** | Đại Hồng Chung ngân vang, Mõ gỗ, Chuông xoay 432Hz, Ducking nhạc nền On Rainy Days, tự động lặp lại không ngắt quãng. | ✅ **Hoàn thành** |
| 8 | **Minigame Quét Lá Đa (Anti-Rush)** | Quét lá trên sân gạch, thanh nhịp tâm, cảnh báo vội vã, combo tĩnh tâm nhận phước ẩn. | ✅ **Hoàn thành** |
| 9 | **Bộ Minigame Công Quả Ban Ngày** | Chẻ củi nấu cơm, Gánh nước suối lên chùa, Lau chùi bàn thờ Đức Phật, Cứu tế cơm chay từ thiện. | ✅ **Hoàn thành** |
| 10 | **Hiên Trà Đàm Đạo Cùng Khách** | Tiếp 3 vị khách thập phương (Minh Anh, Chú Hoàng, Hải Đăng) với 3 loại trà (Sen, Gừng, Cúc) giải tỏa nút thắt tâm lý. | ✅ **Hoàn thành** |
| 11 | **Khóa Lễ Tối & Vấn Đáp Ngộ Đạo** | Tọa thiền giữ hơi thở hoa sen xua tan 4 tạp niệm + Bài giảng kinh điển + Câu hỏi ngộ đạo nhận Buff Tâm Sáng x1.5. | ✅ **Hoàn thành** |
| 12 | **Bảng Công Quả & Mốc Thành Tựu** | 8 nhiệm vụ tu tập hàng ngày và 4 mốc thiện hạnh mở khóa danh hiệu và pháp phục mới. | ✅ **Hoàn thành** |
| 13 | **Sổ Tay Tỉnh Thức** | Lưu trữ các câu kệ ngộ đạo thu thập qua các buổi thính pháp. | ✅ **Hoàn thành** |
| 14 | **Chép Kinh & Viết Thư Pháp (Sutra Copying)** | Mini-game vẽ tô nét chữ kinh văn / chữ thư pháp chánh niệm tại Tàng Kinh Các với âm thanh mài mực và cọ vẽ ASMR. | ⏳ **Bước tiếp theo (Ưu tiên 1)** |
| 15 | **Hồ Sen & Phóng Sinh Đàn Cá Koi** | Tương tác 3D/2D trực tiếp tại bờ hồ sen: Rải mồi cho đàn cá Koi bơi lội, thả hoa đăng cầu an rực sáng mặt hồ buổi tối. | ⏳ **Bước tiếp theo (Ưu tiên 2)** |
| 16 | **Nấu Cơm Chay Bếp Hương Tích** | Mini-game canh lửa củi và sơ chế rau củ sạch chùa trồng. | ⏳ **Bước tiếp theo (Ưu tiên 3)** |
| 17 | **Đoạn Dẫn Nhập Cốt Truyện (Prologue Intro)** | Hoạt cảnh mở đầu dẫn dắt người chơi mới từ áp lực đô thị bước qua Cổng Tam Quan sương khói của Chùa Vân Ẩn. | ⏳ **Bước tiếp theo (Ưu tiên 4)** |
| 18 | **Cơ chế Tương tác Ngày Mưa (Rain ASMR)** | Khi trời mưa: tạm dừng quét lá, kích hoạt hoạt cảnh ngồi hiên thưởng trà ngắm mưa rơi hồi phục thần tốc Tâm Lực. | ⏳ **Bước tiếp theo (Ưu tiên 5)** |

---

## 6. KẾ HOẠCH BƯỚC TIẾP THEO CHI TIẾT (NEXT SPRINT ROADMAP)

### Bước 1: Triển khai Tính năng "Chép Kinh & Viết Thư Pháp" (Sutra Copying & Calligraphy)
*   **Vị trí:** Tàng Kinh Các (Zone 8 trong 3D & Điểm dừng chân trong 2D).
*   **Ý nghĩa:** Cốt lõi của hoạt động Buổi Chiều (dành cho Cư Sĩ từ Cấp 6 trở lên hoặc mở sớm cho người chơi trải nghiệm).
*   **Gameplay tương tác:**
    1.  Chọn bài kinh / câu kệ muốn chép (Ví dụ: Chữ Tâm, Chữ An, Kệ Kinh Pháp Cú, Chú Đại Bi ngắn).
    2.  Người chơi dùng ngón tay / chuột để đồ (trace) theo từng nét bút lông mực tàu trên nền giấy xuyến chỉ loang màu nước.
    3.  Thanh độ tập trung: vẽ chậm rãi đúng nét bút sẽ tạo ra đường mực đậm đà sắc sảo, âm thanh ASMR sột soạt cọ vẽ trên giấy điệp.
    4.  Hoàn thành bức thư pháp: Có thể đóng dấu triện đỏ của Cư Sĩ, nhận Công Đức lớn và lưu bức thư pháp hoàn chỉnh vào Sổ Tay Tỉnh Thức.

### Bước 2: Triển khai Tính năng "Hồ Sen & Phóng Sinh Cá Koi" (Lotus Pond & Koi Feeding)
*   **Vị trí:** Cầu Sen & Suối Ngọc (Zone 5 & Zone 9).
*   **Gameplay tương tác:**
    1.  Chạm vào mặt nước để rải từng hạt thức ăn, đàn cá Koi đa sắc (đỏ, vàng, trắng) uốn lượn bơi lại gần đớp mồi kèm âm thanh bong bóng nước sủi tăm.
    2.  Vào buổi tối: Cho phép người chơi thắp nến hoa đăng thả trôi bồng bềnh theo dòng suối, phát ra ánh sáng lung linh xoa dịu tâm trí.

### Bước 3: Hoàn thiện Hoạt cảnh Mở đầu (Prologue Story Intro)
*   Hiển thị màn hình giới thiệu nhẹ nhàng khi người chơi mới bấm vào game:
    *   3 câu thoại ngắn gợi mở về sự mệt mỏi nơi phố thị tấp nập.
    *   Tiếng ồn ào đô thị mờ dần, thay bằng tiếng đại hồng chung trầm ấm ngân nga từ đỉnh núi Vân Sơn.
    *   Nhân vật bước qua Cổng Tam Quan, mở ra màn sương khói đón chào ngày tu tập đầu tiên.
