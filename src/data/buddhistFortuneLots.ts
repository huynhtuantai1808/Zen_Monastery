export interface BuddhistFortuneLot {
  id: number;
  lotNumber: number;
  title: string;
  rank: 'Thượng Thượng Cát' | 'Đại Cát' | 'Thượng Cát' | 'Trung Cát' | 'Bình An Cát';
  badgeColor: string;
  poem: string[];
  generalMeaning: string;
  aspects: {
    giaDao: string;
    congDanh: string;
    taiLoc: string;
    sucKhoe: string;
    duyenLanh: string;
  };
  monkAdvice: string;
  meritBonus: number;
}

export const BUDDHIST_FORTUNE_LOTS: BuddhistFortuneLot[] = [
  {
    id: 1,
    lotNumber: 1,
    title: 'Liên Hoa Kiến Phật',
    rank: 'Thượng Thượng Cát',
    badgeColor: 'from-amber-400 to-yellow-500 text-stone-950',
    poem: [
      'Đầm sâu bừng nở đóa hoa sen,',
      'Hương ngát mười phương dứt muộn phiền.',
      'Bát-nhã quang minh soi lối đạo,',
      'Vạn sự hanh thông hưởng phúc điền.',
    ],
    generalMeaning:
      'Quẻ xăm số 1 là quẻ đầu bảng đại cát đại lợi. Cội phúc bao năm cần mẫn gieo trồng nay đến thời đơm hoa kết trái. Vạn sự cầu xin đều được Chư Phật từ bi gia hộ.',
    aspects: {
      giaDao: 'Gia đạo êm ấm thái hòa, trên dưới thuận lòng, chuẩn bị đón tin hỷ sự hoặc thành viên mới mang phúc lộc.',
      congDanh: 'Như cá gặp nước, như rồng gặp mây. Dự định kinh doanh hay học vấn thi cử đều đạt kết quả xuất sắc vượt bậc.',
      taiLoc: 'Chánh tài sung túc, tiền của vào nhà do phước đức tạo tác chân chính, không lo thất thoát.',
      sucKhoe: 'Thân tâm an khang, bệnh cũ tiêu trừ, tinh thần sảng khoái và tràn đầy năng lượng tích cực.',
      duyenLanh: 'Gặp bậc hiền trí và quý nhân hết lòng phò trợ, tình duyên đơm hoa viên mãn thiện duyên.',
    },
    monkAdvice:
      'Sư Phụ khai thị: Đắc thời chớ sanh lòng kiêu mạn. Hãy tích cực làm việc thiện, phóng sinh bố thí để cội phước sâu dày, lưu truyền trăm năm.',
    meritBonus: 50,
  },
  {
    id: 2,
    lotNumber: 8,
    title: 'Thuận Buồm Xuôi Gió',
    rank: 'Đại Cát',
    badgeColor: 'from-emerald-400 to-teal-500 text-stone-950',
    poem: [
      'Gió thuận buồm giương vượt sóng trùng,',
      'Trời xanh mây tạnh bước thong dong.',
      'Đường dài gấm hoa bày phía trước,',
      'Một dạ từ bi ắt rạng ngời.',
    ],
    generalMeaning:
      'Thời vận đã mở, những bế tắc và trắc trở của quá khứ đã bị bỏ lại phía sau lưng. Con đường phía trước rộng thênh thang, đi đâu cũng có duyên lành đón đợi.',
    aspects: {
      giaDao: 'Mọi hiểu lầm trong gia quyến được hòa giải êm đẹp, trong ấm ngoài êm, không khí ấm cúng an lành.',
      congDanh: 'Công việc suôn sẻ hanh thông, ký kết hợp đồng thuận lợi, được cấp trên và đối tác tín nhiệm trao gửi trọng trách.',
      taiLoc: 'Tài chính chuyển biến rõ rệt theo chiều hướng tích cực, nguồn thu ổn định và tăng trưởng đều đặn.',
      sucKhoe: 'Khí huyết lưu thông, giấc ngủ sâu ngon, nên duy trì thói quen đi bộ thiền hành buổi sáng.',
      duyenLanh: 'Đi đường gặp quý nhân trợ giúp, bạn bè bốn phương tin cậy tương trợ lẫn nhau.',
    },
    monkAdvice:
      'Sư Phụ khai thị: Khi buồm thuận gió, cần giữ vững tay lái chánh niệm. Đừng vì tham lợi nhỏ mà đánh mất chữ tín và cái tâm trong sạch.',
    meritBonus: 45,
  },
  {
    id: 3,
    lotNumber: 12,
    title: 'Mây Tạnh Trăng Tròn',
    rank: 'Thượng Cát',
    badgeColor: 'from-sky-400 to-blue-500 text-stone-950',
    poem: [
      'Mây mờ tan biến bóng trăng thanh,',
      'U tối lùi xa rạng ánh lành.',
      'Vượt khó gian lao rèn ý chí,',
      'Bao ngày trông đợi thỏa lòng mong.',
    ],
    generalMeaning:
      'Khổ tận cam lai! Những ngày tháng nhọc nhằn, chịu thương chịu khó nay đã thấy được ánh sáng cuối con đường. Trăng rằm tỏa sáng soi chiếu mọi nghi ngờ bế tắc.',
    aspects: {
      giaDao: 'Xua tan u ám, người đi xa có tin bình an trở về, tình thân bền chặt thấu hiểu sâu sắc.',
      congDanh: 'Dự án hay kế hoạch ấp ủ bấy lâu bước vào giai đoạn gặt hái thành quả tốt đẹp, năng lực được công nhận.',
      taiLoc: 'Nợ nần cũ dần được thu hồi, chi tiêu cân đối, kinh tế gia đình vững vàng từng bước.',
      sucKhoe: 'Tinh thần phấn chấn, xua tan căng thẳng lo âu, mắt sáng tâm an.',
      duyenLanh: 'Nhận diện được ai là bạn chân chính, buông bỏ mối quan hệ độc hại để đón nhận thiện duyên trong sáng.',
    },
    monkAdvice:
      'Sư Phụ khai thị: Sau cơn mưa trời lại sáng. Hãy nhớ lại những bài học gian khó để sống bao dung hơn với tha nhân.',
    meritBonus: 40,
  },
  {
    id: 4,
    lotNumber: 18,
    title: 'Phước Huệ Song Tu',
    rank: 'Thượng Thượng Cát',
    badgeColor: 'from-purple-400 to-pink-500 text-stone-950',
    poem: [
      'Phước đức vun bồi vạn sự hưng,',
      'Trí tuệ soi đường dứt băn khoăn.',
      'Thân tâm thanh tịnh ngời hoa giác,',
      'Gia quyến an khang vạn kiếp nhuần.',
    ],
    generalMeaning:
      'Người vừa có phước vừa có huệ ví như con chim có đủ đôi cánh vững vàng. Quẻ này báo điềm đại cát tường về cả đời sống tâm linh lẫn sự nghiệp vật chất.',
    aspects: {
      giaDao: 'Con cháu hiếu thuận ngoan ngoãn, ông bà cha mẹ trường thọ an vui, phước đức lưu lại nhiều đời.',
      congDanh: 'Quyết định sáng suốt không vướng phải sai lầm, được tôn kính như một vị cố vấn đạo đức trong tập thể.',
      taiLoc: 'Tiền bạc sung mãn, biết đem của cải ra cúng dường Tam Bảo và cứu tế tha nhân nên lộc tài không bao giờ cạn.',
      sucKhoe: 'Tâm bình khí hòa, ít bệnh vặt, dung mạo từ bi khả ái.',
      duyenLanh: 'Gặp gỡ đạo hữu tri âm cùng chí hướng tu tập, hỗ trợ nhau tiến tu đạo nghiệp.',
    },
    monkAdvice:
      'Sư Phụ khai thị: Tu phước mà không tu huệ thì giàu có nhưng si mê; tu huệ mà không tu phước thì thông minh mà lận đận. Con hãy giữ trọn vẹn cả hai.',
    meritBonus: 50,
  },
  {
    id: 5,
    lotNumber: 21,
    title: 'Tùy Duyên Tự Tại',
    rank: 'Trung Cát',
    badgeColor: 'from-stone-300 to-amber-200 text-stone-950',
    poem: [
      'Nước chảy hoa trôi thuận lẽ trời,',
      'Buông lòng chấp nhặt dạ thảnh thơi.',
      'An trú trong từng giây phút hiện,',
      'Bình an tự tại giữa dòng đời.',
    ],
    generalMeaning:
      'Không nên cưỡng cầu việc vượt quá tầm tay. Hãy để mọi sự diễn ra tự nhiên theo quy luật nhân duyên. Giữ tâm tĩnh lặng thì sóng gió bên ngoài tự nhiên lắng dịu.',
    aspects: {
      giaDao: 'Bình ổn, không xảy ra biến cố lớn. Cần lắng nghe và bao dung với người thân hơn là tranh cãi đúng sai.',
      congDanh: 'Duy trì công việc hiện tại ổn định, chưa phải thời điểm thích hợp để mạo hiểm nhảy việc hay đầu tư lớn.',
      taiLoc: 'Vừa đủ chi tiêu, không dư dả dồi dào nhưng không bị túng thiếu, tâm lý thoải mái.',
      sucKhoe: 'Cần chú ý nghỉ ngơi điều độ, không nên thức khuya làm việc quá sức.',
      duyenLanh: 'Vạn sự tùy duyên, duyên đến thì đón, duyên đi thì buông, chớ bám chấp bi lụy.',
    },
    monkAdvice:
      'Sư Phụ khai thị: Cầu mà không được là do chưa đủ duyên. Đừng đau buồn oán trách, hãy an yên hoàn thiện bản thân mỗi ngày.',
    meritBonus: 35,
  },
  {
    id: 6,
    lotNumber: 28,
    title: 'Kim Ngọc Mãn Đường',
    rank: 'Đại Cát',
    badgeColor: 'from-amber-400 to-yellow-600 text-stone-950',
    poem: [
      'Đức dày tích tụ tự muôn xưa,',
      'Hôm nay quả ngọt nở dư thừa.',
      'Lộc tài tự đến không mong cầu,',
      'Rạng rỡ tiền đồ sáng tựa hoa.',
    ],
    generalMeaning:
      'Điềm lành tài lộc dồi dào, nhà cửa sung túc hưng vượng. Đây là quả báu trổ sinh từ những việc thiện âm thầm làm trong quá khứ.',
    aspects: {
      giaDao: 'Gia đình thịnh vượng, sắm sửa thêm tài sản đất đai hoặc trang hoàng nhà cửa khang trang lộng lẫy.',
      congDanh: 'Kinh doanh phát đạt, buôn may bán đắt, mở rộng thêm chi nhánh hoặc thăng quan tiến chức vẻ vang.',
      taiLoc: 'Tiền tài dồi dào sung mãn, có nguồn thu phụ hoặc trúng thưởng, đầu tư sinh lời nhanh chóng.',
      sucKhoe: 'Khỏe mạnh kiện khang, tràn đầy sinh lực.',
      duyenLanh: 'Được nhiều người kính trọng và tìm đến hợp tác làm ăn chân chính.',
    },
    monkAdvice:
      'Sư Phụ khai thị: Tiền tài như bọt nước phù du, phước đức mới là kim cương bất hoại. Hãy trích một phần tài lộc để giúp đỡ người nghèo khổ.',
    meritBonus: 45,
  },
  {
    id: 7,
    lotNumber: 36,
    title: 'Bát Nhã Quang Minh',
    rank: 'Thượng Thượng Cát',
    badgeColor: 'from-indigo-400 to-purple-600 text-white',
    poem: [
      'Gươm báu trí tuệ dứt trần ai,',
      'Sáng tỏ đường đi dứt bóng ma.',
      'Chánh niệm soi đường không lạc lối,',
      'Vượt cõi trầm luân bước nhẹ ca.',
    ],
    generalMeaning:
      'Khai mở tuệ giác vô thượng! Quẻ này biểu trưng cho sự thức tỉnh tâm linh sâu sắc, nhìn thấu chân tướng của thực tại và thoát khỏi mọi cạm bẫy mê lầm.',
    aspects: {
      giaDao: 'Thấu hiểu và yêu thương không điều kiện, biến mái nhà thành đạo tràng an lạc ấm áp.',
      congDanh: 'Có cái nhìn chiến lược nhạy bén và tầm nhìn xa trông rộng, đưa ra những định hướng thay đổi cuộc đời.',
      taiLoc: 'Không thiếu thốn, biết sử dụng đồng tiền thông minh để tạo dựng phước báu vô lượng cho cộng đồng.',
      sucKhoe: 'Tâm thanh tịnh khiến tế bào thân thể tự động chữa lành mọi bệnh tật và mệt mỏi.',
      duyenLanh: 'Trở thành điểm tựa tinh thần vững chãi cho nhiều người xung quanh nương tựa tìm về chánh đạo.',
    },
    monkAdvice:
      'Sư Phụ khai thị: Chiếc đèn tuệ giác đã thắp sáng trong tim con. Hãy đem ánh sáng đó xua tan bóng tối sợ hãi cho muôn loài.',
    meritBonus: 50,
  },
  {
    id: 8,
    lotNumber: 42,
    title: 'Xuân Về Hoa Nở',
    rank: 'Đại Cát',
    badgeColor: 'from-rose-400 to-pink-500 text-white',
    poem: [
      'Đông tàn giá buốt cỏ cây tươi,',
      'Xuân đến mang theo rạng tiếng cười.',
      'Mong ước bấy lâu nay hội ngộ,',
      'Hỷ tín ngập tràn muôn nẻo nơi.',
    ],
    generalMeaning:
      'Thời khắc đơm hoa nảy lộc đã tới! Mọi chuyện mong cầu tình cảm, học hành thi cử hay công việc đều đón nhận niềm vui bất ngờ và tin mừng từ phương xa.',
    aspects: {
      giaDao: 'Ngập tràn tiếng cười rộn rã, người thân sum họp sau bao ngày xa cách, không khí hân hoan phấn khởi.',
      congDanh: 'Thi cử đỗ đạt, xin việc thành công, bắt đầu một dự án mới tràn đầy niềm hứng khởi và triển vọng.',
      taiLoc: 'Nhiều cơ hội kiếm tiền mới xuất hiện, thu nhập tăng tiến theo cấp số nhân.',
      sucKhoe: 'Da dẻ hồng hào tươi tắn, diện mạo sáng sủa thu hút vận may.',
      duyenLanh: 'Tình duyên chớm nở đẹp đẽ, người độc thân tìm được bến đỗ bình yên, người có đôi càng thêm gắn kết keo sơn.',
    },
    monkAdvice:
      'Sư Phụ khai thị: Mùa xuân của đất trời rồi sẽ qua, nhưng mùa xuân của lòng từ bi thì bất diệt. Hãy gieo rắc nụ cười tới tất cả mọi người.',
    meritBonus: 40,
  },
  {
    id: 9,
    lotNumber: 50,
    title: 'Đức Năng Thắng Số',
    rank: 'Thượng Cát',
    badgeColor: 'from-amber-500 to-orange-600 text-white',
    poem: [
      'Số phận do tâm biến đổi màu,',
      'Làm lành lánh dữ vượt buồn đau.',
      'Một niệm từ bi trừ muôn nghiệp,',
      'Trời cao thấu tỏ rải ân sâu.',
    ],
    generalMeaning:
      'Tướng do tâm sinh, cảnh do tâm tạo. Dù lá số tử vi có hung tinh đi chăng nữa, chỉ cần con một lòng hướng thiện, trì kinh niệm Phật thì hung hóa cát, họa hóa phúc.',
    aspects: {
      giaDao: 'Hóa giải tai ương ách nạn bất ngờ, giữ gìn được sự êm ấm trọn vẹn nhờ tấm lòng thảo thơm của con cháu.',
      congDanh: 'Vượt qua được sự ganh ghét hãm hại của kẻ tiểu nhân nhờ lối sống quang minh chính đại.',
      taiLoc: 'Tránh được một bàn thua trông thấy hoặc tránh được rủi ro lừa đảo tiền bạc trong gang tấc.',
      sucKhoe: 'Tai qua nạn khỏi, đại nạn không chết ắt có hậu phúc vô lượng về sau.',
      duyenLanh: 'Chuyển hóa nghịch duyên thành thuận duyên, cảm hóa được người từng có ác ý với mình.',
    },
    monkAdvice:
      'Sư Phụ khai thị: Đừng tin vào số mệnh an bài bất di biến. Chính hành động thiện lương hiện tại mới là chiếc bút vẽ nên tương lai của con.',
    meritBonus: 40,
  },
  {
    id: 10,
    lotNumber: 56,
    title: 'Nước Chảy Mây Bay',
    rank: 'Bình An Cát',
    badgeColor: 'from-slate-400 to-zinc-600 text-white',
    poem: [
      'Chuyện đời tan hợp tợ phù vân,',
      'Hơn thua được mất chớ bận lòng.',
      'Trở về gột rửa niềm thanh tịnh,',
      'Một ấm trà thơm nhẹ bước trần.',
    ],
    generalMeaning:
      'Quẻ mang lại sự an tịnh nội tâm tuyệt đối. Đừng để những thị phi, khen chê nơi đầu môi trần thế làm dao động ngọn đèn tâm thanh tịnh của con.',
    aspects: {
      giaDao: 'Yên ắng thanh bình, không có sóng gió xáo trộn đời sống sinh hoạt thường nhật.',
      congDanh: 'Nên án binh bất động, giữ vững thành quả hiện tại thay vì nóng vội bứt phá.',
      taiLoc: 'Thu chi cân bằng, không màng danh lợi xa hoa thì không sợ thiếu thốn.',
      sucKhoe: 'Hệ tiêu hóa và thần kinh cần được chăm sóc, nên ăn chay thực dưỡng và ngồi thiền đều đặn.',
      duyenLanh: 'Tâm tịnh thì người đến người đi đều là bài học quý giá nuôi dưỡng tuệ giác.',
    },
    monkAdvice:
      'Sư Phụ khai thị: Khen ta mà đúng là bạn ta, chê ta mà đúng là thầy ta. Hãy coi lời thị phi như gió thoảng qua tai.',
    meritBonus: 30,
  },
  {
    id: 11,
    lotNumber: 63,
    title: 'Thiện Căn Bền Vững',
    rank: 'Đại Cát',
    badgeColor: 'from-teal-400 to-emerald-600 text-white',
    poem: [
      'Cây lành bén rễ đất bao la,',
      'Bão táp phong ba chẳng chuyển dời.',
      'Tổ tiên phù hộ đời con cháu,',
      'Phúc lộc tràn trề mãi sáng tươi.',
    ],
    generalMeaning:
      'Gốc rễ đạo đức của gia đình dòng họ vô cùng sâu dày. Dù bên ngoài có bao nhiêu biến động kinh tế hay xã hội, cây phúc của con vẫn đứng vững xanh tươi.',
    aspects: {
      giaDao: 'Tổ tiên âm phù dương trợ, gia phong nề nếp gia giáo gương mẫu, con cháu thành đạt.',
      congDanh: 'Sự nghiệp xây dựng trên nền tảng vững chắc, uy tín nghề nghiệp vang xa được kính trọng.',
      taiLoc: 'Tài sản tích lũy ngày một gia tăng, của cải bền bỉ không bị hư hao thất tán.',
      sucKhoe: 'Sức khỏe dẻo dai kiên cường, ít ốm đau bệnh tật.',
      duyenLanh: 'Kết giao toàn với bạn tốt có tâm có tài, cùng nhau làm việc thiện cứu giúp đời.',
    },
    monkAdvice:
      'Sư Phụ khai thị: Cây cối nhờ rễ sâu mà đơm hoa thơm ngọt, con người nhờ giữ tròn đạo hiếu mà hưng thịnh dài lâu.',
    meritBonus: 45,
  },
  {
    id: 12,
    lotNumber: 68,
    title: 'Bồ Đề Tâm Kiên Cố',
    rank: 'Thượng Thượng Cát',
    badgeColor: 'from-amber-400 via-yellow-500 to-amber-600 text-stone-950',
    poem: [
      'Gió dập mưa vùi đá chẳng lay,',
      'Tâm bồ-đề vững tựa non này.',
      'Mười phương chư Phật đồng che chở,',
      'Đến đích quang vinh thỏa dạ hay.',
    ],
    generalMeaning:
      'Ý chí kiên định sắt son! Bất luận gặp bao nhiêu gian lao thử thách, con vẫn giữ vững lời thề nguyền lương thiện. Chư Thiên Hộ Pháp luôn túc trực che chở.',
    aspects: {
      giaDao: 'Tình cảm sắt son chung thủy, cùng nhau đồng cam cộng khổ vượt qua mọi gian nan sóng gió.',
      congDanh: 'Chinh phục được mục tiêu lớn lao mà nhiều người đã bỏ cuộc giữa chừng, ghi dấu mốc son rực rỡ.',
      taiLoc: 'Thu hoạch quả ngọt xứng đáng với công sức nhọc nhằn đã bỏ ra trong nhiều năm trường.',
      sucKhoe: 'Nội lực thâm hậu, tinh thần thép, không bị gục ngã trước khó khăn thử thách.',
      duyenLanh: 'Tìm thấy người bạn đồng hành tri kỷ cùng chung chí hướng bồ-đề vĩ đại.',
    },
    monkAdvice:
      'Sư Phụ khai thị: Lửa thử vàng, gian nan thử sức. Con đã vượt qua được khảo nghiệm của cuộc đời, hãy vững bước tiến tới đích quang vinh.',
    meritBonus: 55,
  },
  {
    id: 13,
    lotNumber: 72,
    title: 'Tri Túc Thường Lạc',
    rank: 'Trung Cát',
    badgeColor: 'from-cyan-400 to-blue-500 text-stone-950',
    poem: [
      'Biết đủ trong tâm vạn nỗi an,',
      'Cơm canh thanh đạm chốn thiền môn.',
      'Lòng không dính mắc trần ai bụi,',
      'Thân nhẹ như mây đỉnh ngút ngàn.',
    ],
    generalMeaning:
      'Biết đủ là sự giàu có tột bậc của bậc thánh nhân. Khi không còn bị lòng tham đố kỵ sai khiến, hạnh phúc đích thực sẽ tự động ùa vào tâm hồn con.',
    aspects: {
      giaDao: 'Hài hòa ấm êm, không tranh chấp tài sản phân chia quyền lợi, sống thương yêu đùm bọc nhau.',
      congDanh: 'Hài lòng với vị trí hiện tại, cống hiến hết mình mà không màng bon chen danh vị hào nhoáng.',
      taiLoc: 'Chi tiêu giản dị, dành tiền tiết kiệm phòng thân và giúp đỡ người thân khi hoạn nạn.',
      sucKhoe: 'Thân thể nhẹ nhõm, không bị bệnh béo phì huyết áp hay chứng mất ngủ vì lo toan.',
      duyenLanh: 'Bạn bè quý mến vì đức tính chân thật, không tư lợi hay toan tính thiệt hơn.',
    },
    monkAdvice:
      'Sư Phụ khai thị: Người giàu nhất trần gian không phải người có nhiều của cải nhất, mà là người ít có nhu cầu bám chấp nhất.',
    meritBonus: 35,
  },
  {
    id: 14,
    lotNumber: 77,
    title: 'Hóa Giải Oan Khiên',
    rank: 'Thượng Cát',
    badgeColor: 'from-fuchsia-400 to-pink-600 text-white',
    poem: [
      'Lấy ân báo oán oán tiêu trừ,',
      'Lòng từ trải rộng sáng thiên thu.',
      'Cởi bỏ dây oan người với nghiệp,',
      'Thanh thản mây bay cõi niết bàn.',
    ],
    generalMeaning:
      'Nút thắt thù hận, mâu thuẫn hay oán kết bấy lâu nay đã tìm được chìa khóa hóa giải nhờ tình thương chân thành và sự tha thứ độ lượng của con.',
    aspects: {
      giaDao: 'Bỏ qua lỗi lầm xưa cũ của người thân, gương vỡ lại lành, gia đình hàn gắn tình cảm thiêng liêng.',
      congDanh: 'Kẻ đối đầu chuyển thành đồng minh hỗ trợ, tranh chấp kiện tụng được dàn xếp êm đẹp đôi bên cùng có lợi.',
      taiLoc: 'Trút bỏ được gánh nặng tài chính hoặc những nghĩa vụ nợ nần dây dưa kéo dài nhiều năm.',
      sucKhoe: 'Giải phóng tâm bệnh, lòng thanh thản nên tim mạch và huyết áp trở lại chỉ số bình thường.',
      duyenLanh: 'Hóa thù thành bạn, tích được công đức vô biên nhờ sự nhẫn nhịn và lòng từ bi hỷ xả.',
    },
    monkAdvice:
      'Sư Phụ khai thị: Ôm hận thù như ôm than hoa nóng trong tay để ném người khác, người bị bỏng đầu tiên chính là con. Tha thứ cho người chính là giải thoát cho mình.',
    meritBonus: 40,
  },
  {
    id: 15,
    lotNumber: 88,
    title: 'Hải Nạp Bách Xuyên',
    rank: 'Đại Cát',
    badgeColor: 'from-amber-500 to-yellow-600 text-stone-950',
    poem: [
      'Biển rộng dung nạp vạn dòng sông,',
      'Bởi lòng khiêm hạ tựa đất trời.',
      'Người khéo nhẫn nhường thành nghiệp lớn,',
      'Muôn dặm giang sơn hưởng thái hòa.',
    ],
    generalMeaning:
      'Tâm lượng rộng lớn bao la như biển cả dung chứa trăm vạn dòng sông. Càng khiêm nhường thì phước đức càng dâng tràn, tiếng thơm lưu truyền xa.',
    aspects: {
      giaDao: 'Gia đình thịnh vượng uy nghiêm, là tấm gương sáng cho cả dòng họ và xóm giềng noi theo.',
      congDanh: 'Trở thành nhà lãnh đạo có tâm có tầm, thu phục lòng người bằng đức độ chứ không bằng quyền uy.',
      taiLoc: 'Đại phú do thiên, tiểu phú do cần. Tài sản lớn lao đến từ những dự án phụng sự nhân sinh.',
      sucKhoe: 'Sức khỏe dồi dào, sắc diện hồng hào uy nghi đĩnh đạc.',
      duyenLanh: 'Được vạn người yêu mến, đi đến đâu cũng có người giúp đỡ tiếp đón như người thân trong nhà.',
    },
    monkAdvice:
      'Sư Phụ khai thị: Bông lúa chín là bông lúa cúi đầu, dòng sông sâu là dòng sông chảy êm đềm. Con hãy luôn giữ tâm khiêm cung.',
    meritBonus: 50,
  },
  {
    id: 16,
    lotNumber: 99,
    title: 'Viên Mãn Công Đức',
    rank: 'Thượng Thượng Cát',
    badgeColor: 'from-yellow-400 via-amber-500 to-red-500 text-stone-950',
    poem: [
      'Chín chín công viên quả mãn rồi,',
      'Ánh vàng rực rỡ cõi trùng khơi.',
      'Nguyện gì cũng đặng tâm như ý,',
      'Trời Phật gia ban phước trọn đời.',
    ],
    generalMeaning:
      'Quẻ xăm đỉnh cao tối thượng! Tất cả những công đức tu tập, nhẫn nhục, trì giới và phụng sự nay viên thành quả báu thù thắng. Cầu danh đắc danh, cầu tài đắc tài, cầu an đắc an.',
    aspects: {
      giaDao: 'Gia đình viên mãn toàn mỹ, con cháu hiếu đỗ, vạn sự bình an phúc lộc dồi dào suốt nhiều thế hệ.',
      congDanh: 'Đạt tới đỉnh cao của sự nghiệp và danh vọng chân chính, được xã hội và đạo pháp tôn vinh.',
      taiLoc: 'Tiền tài của cải sung túc vô lượng, dùng không hết, đời đời sung sướng không lo đói nghèo.',
      sucKhoe: 'Trường thọ an khang, thân tâm thanh tịnh tự tại như bậc tiên hiền giải thoát.',
      duyenLanh: 'Toàn thiện toàn mỹ, được mười phương chư Phật đồng thanh tán thán gia trì chở che.',
    },
    monkAdvice:
      'Sư Phụ khai thị: Phước đức tròn đầy như vầng trăng rằm tháng Mười. Con hãy tiếp tục phát Bồ Đề tâm, rộng mở lòng từ bi cứu độ chúng sinh lầm than.',
    meritBonus: 60,
  },
];
