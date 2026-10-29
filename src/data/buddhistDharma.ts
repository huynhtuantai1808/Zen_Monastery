import type { BuddhistDharmaSession } from '../types/game';

export const BUDDHIST_DHARMA_SESSIONS: BuddhistDharmaSession[] = [
  {
    id: 1,
    sutraName: 'Kinh Phước Đức',
    sutraChapter: 'Kinh Điển Pāli - Khuddaka Nikāya',
    paliName: 'Mahā-mangala Sutta',
    title: 'Đi Tìm Điềm Lành & Phước Báu Tối Thượng',
    story:
      'Đêm nọ, một vị Chư Thiên hào quang rực rỡ tìm đến đức Phật tại tịnh xá Kỳ Viên và kính hỏi: "Bạch Thế Tôn, chư Thiên và nhân loại đều khao khát hạnh phúc và kiếm tìm điềm lành. Xin Ngài từ bi chỉ dạy điềm lành tối thượng nhất trong đời là gì?".\nĐức Phật dịu dàng khai thị: "Điềm lành không nằm ở bói toán, cúng sao hay cầu may bên ngoài. Điềm lành lớn nhất là không gần gũi kẻ xấu ác, biết thân cận bậc hiền trí, phụng dưỡng mẹ cha, giữ nghề nghiệp lương thiện và tâm không dao động trước phong ba cuộc đời."',
    monkTeaching:
      'Phước báu không phải do thần linh ban tặng mà do chính thân - khẩu - ý của con gieo trồng mỗi ngày. Gần mực thì đen, gần đèn thì sáng. Gần bậc trí tuệ thì trí tuệ con mở mang, tâm con dần tĩnh lặng.',
    question:
      'Theo Kinh Phước Đức, khi con gặp khó khăn, bế tắc trong công việc hay đời sống, điều gì tạo nên "phước báu chân chính" giúp con vượt qua?',
    options: [
      {
        text: 'Cầu cúng van xin thần linh giải hạn và tìm bói toán xem điềm may rủi.',
        isCorrect: false,
        feedback: 'Cầu khẩn bên ngoài chỉ làm tăng thêm nỗi sợ hãi và mê tín, không giải quyết được gốc rễ của phiền não.',
      },
      {
        text: 'Quay về nương tựa việc lành: thân cận bạn tốt, làm việc chân chính, hiếu thảo mẹ cha và giữ tâm định tĩnh.',
        isCorrect: true,
        feedback:
          'ĐỐN NGỘ! Đức Phật dạy: "Sống chánh mạng, hiếu thuận phụ mẫu, tâm không lay động trước bát phong" chính là điềm lành tối thượng nhất.',
        quoteCollected: 'Tâm không dao động trước được - mất, khen - chê, đó là điềm lành lớn nhất.',
      },
      {
        text: 'Cố gắng che giấu khó khăn và tự chịu đựng một mình trong im lặng.',
        isCorrect: false,
        feedback: 'Tự cô lập dễ dẫn đến u uất. Hãy tìm đến bậc thiện tri thức và người có đạo đức để học hỏi phương pháp soi sáng tâm trí.',
      },
    ],
  },
  {
    id: 2,
    sutraName: 'Kinh Bát Đại Nhân Giác',
    sutraChapter: 'Tám Điều Giác Ngộ Của Bậc Đại Nhân',
    paliName: 'Atthapurisa Sutta',
    title: 'Thiểu Dục Tri Túc: Ít Muốn Biết Đủ Để Thân Tâm An Lạc',
    story:
      'Điều giác ngộ thứ hai của bậc đại nhân dạy rằng: "Nhiều ham muốn là cội nguồn của đau khổ (Đa dục vi khổ). Vì tham lam không đáy mà con người mệt nhoài, tranh đoạt và tạo bao nghiệp ác. Người biết ít muốn và biết đủ (Thiểu dục tri túc) thì thân tâm an nhàn, không bị danh lợi sai khiến, tự tại giải thoát như cánh chim bay lượn trên trời cao."\nSư Thầy ngước nhìn ngọn nến lung linh rồi bảo: Chiếc bình dù to đến đâu, nếu đáy bị thủng thì rót bao nhiêu nước cũng không đầy. Lòng tham của con người cũng vậy.',
    monkTeaching:
      'Biết đủ là sự giàu có lớn nhất. Người giàu nhất không phải người có nhiều nhất, mà là người ít có nhu cầu bám chấp nhất.',
    question:
      'Trong thời đại tiêu dùng dồn dập, làm thế nào để thực hành bài học "Thiểu Dục Tri Túc" mà không rơi vào trạng thái trì trệ, tiêu cực?',
    options: [
      {
        text: 'Từ bỏ tất cả, không làm việc nữa và lên núi sống ẩn dật tuyệt đối.',
        isCorrect: false,
        feedback: 'Đó là thái độ trốn chạy thực tại, không phải tinh thần dấn thân tu tập chánh niệm của đạo Phật.',
      },
      {
        text: 'Hết lòng làm việc cống hiến cho xã hội, nhưng biết dừng lại trước lòng tham vô độ, biết đủ với những tiện nghi cần thiết và quý trọng sự bình yên nội tâm.',
        isCorrect: true,
        feedback:
          'ĐỐN NGỘ! Thiểu dục là bớt ham muốn ích kỷ, Tri túc là vui với hiện tại. Đó là cội nguồn nuôi dưỡng tâm hồn thảnh thơi giữa phố thị.',
        quoteCollected: 'Người biết đủ, nằm trên đất cát vẫn an lạc. Kẻ không biết đủ, ở chốn thiên đường vẫn sầu lo.',
      },
      {
        text: 'Tiếp tục mua sắm liên tục để giải tỏa áp lực tạm thời sau giờ làm việc.',
        isCorrect: false,
        feedback: 'Mua sắm chỉ xoa dịu cảm xúc nhất thời, sau đó sự trống rỗng và áp lực tài chính lại nặng nề hơn gấp bội.',
      },
    ],
  },
  {
    id: 3,
    sutraName: 'Kinh Chuyển Pháp Luân',
    sutraChapter: 'Bài Giảng Đầu Tiên Tại Vườn Lộc Uyển',
    paliName: 'Dhammacakkappavattana Sutta',
    title: 'Tứ Diệu Đế & Bát Chánh Đạo: Con Đường Nhận Diện & Trị Liệu Khổ Đau',
    story:
      'Dưới cội cây bồ đề sau khi chứng ngộ, bài pháp đầu tiên đức Phật trao truyền cho năm anh em Kiều Trần Như là Tứ Diệu Đế: Bốn chân lý vi diệu trị liệu tâm bệnh cho thế gian:\n1. Khổ (Dukkha): Nhận diện thực trạng bất như ý trong đời sống.\n2. Tập (Samudaya): Thấu suốt nguyên nhân gốc rễ (tham ái, bám chấp, vô minh).\n3. Diệt (Nirodha): Niềm tin chắc chắn rằng khổ đau hoàn toàn có thể chấm dứt.\n4. Đạo (Magga): Con đường 8 nhánh chân chính (Bát Chánh Đạo) đưa đến sự an tịnh tối hậu.',
    monkTeaching:
      'Đạo Phật không bi quan cũng không lạc quan, mà là cái nhìn như thật (Như thị). Biết đau để chữa lành, biết nguyên nhân để nhổ tận gốc rễ muộn phiền.',
    question:
      'Khi con đối diện với một nỗi thất vọng lớn lao (chia tay, thất bại, mất việc), bước đầu tiên theo tinh thần Tứ Diệu Đế là gì?',
    options: [
      {
        text: 'Dũng cảm nhìn thẳng vào nỗi đau, không chối bỏ, dùng Chánh Niệm quan sát xem tâm mình đang dính mắc hay kỳ vọng vào điều gì.',
        isCorrect: true,
        feedback:
          'ĐỐN NGỘ! Bậc trí giả bắt đầu bằng sự nhận diện chân thật. Khi thấy rõ nguyên nhân bám chấp, khổ đau sẽ tự nhiên tan biến như sương mai gặp nắng sớm.',
        quoteCollected: 'Nhận diện khổ đau mà không sợ hãi, đó là bước khởi đầu của tự do.',
      },
      {
        text: 'Đổ lỗi cho người khác hoặc trách móc số phận bất công với mình.',
        isCorrect: false,
        feedback: 'Đổ lỗi là biểu hiện của tâm sân hận, chỉ khiến ngọn lửa khổ đau cháy bùng thêm dữ dội.',
      },
      {
        text: 'Tìm cách quên đi bằng cách đắm mình vào các trò giải trí kích thích mạnh.',
        isCorrect: false,
        feedback: 'Đè nén hoặc trốn tránh không làm biến mất khổ đau; khi sự kích thích qua đi, nỗi đau lại trồi lên nguyên vẹn.',
      },
    ],
  },
  {
    id: 4,
    sutraName: 'Kinh Quán Niệm Hơi Thở',
    sutraChapter: 'Trung Bộ Kinh (Majjhima Nikāya)',
    paliName: 'Ānāpānasati Sutta',
    title: 'Hơi Thở Chánh Niệm: Chiếc Cầu Nối Thân Và Tâm Về Hiện Tại',
    story:
      'Đức Phật từng dạy các vị Tỳ-kheo: "Này các thầy, có một pháp duy nhất khi được tu tập thuần thục sẽ đem lại quả lớn, đó là Quán niệm hơi thở vào và hơi thở ra.\nThở vào một hơi dài, biết mình thở vào một hơi dài. Thở ra một hơi dài, biết mình thở ra một hơi dài. Thở vào tâm tĩnh lặng, thở ra miệng mỉm cười. An trú trong hiện tại, giờ phút đẹp tuyệt vời."\nSư Thầy dạy: Hơi thở là người bạn trung thành nhất, luôn đi cùng con từ lúc lọt lòng đến hơi tàn. Khi con lo âu, hơi thở dồn dập; chỉ cần điều hòa hơi thở, tâm con lập tức lắng yên.',
    monkTeaching:
      'Quá khứ đã qua, tương lai thì chưa tới. Chỉ có một giây phút duy nhất con có thể thực sự sống, đó chính là giây phút hiện tại qua từng nhịp thở.',
    question:
      'Khi cơn nóng giận hay nỗi sợ hãi bùng lên đột ngột khiến con muốn nói lời tổn thương người khác, pháp thực tập nào là hiệu nghiệm nhất?',
    options: [
      {
        text: 'Nói cho hả cơn giận ngay để không bị dồn nén trong lòng.',
        isCorrect: false,
        feedback: 'Lời nói khi giận dữ như mũi tên tẩm độc đã bắn đi, không thể thu hồi và để lại vết thương sâu sắc cho cả hai.',
      },
      {
        text: 'Lập tức giữ im lặng, dừng mọi hành động, đưa tâm về neo nơi hơi thở vào và ra trong 5-10 nhịp thở sâu để hạ hỏa ngọn lửa sân hận.',
        isCorrect: true,
        feedback:
          'ĐỐN NGỘ! Đức Phật ví người chế ngự được cơn giận như người khéo thắng cỗ xe đang lao dốc. Hơi thở sâu là giọt nước mát dập tắt lửa sân hận.',
        quoteCollected: 'Thở vào tâm tĩnh lặng, thở ra miệng mỉm cười. Nương tựa nơi hơi thở, vượt qua ngàn bão giông.',
      },
      {
        text: 'Tranh cãi đến cùng để chứng minh mình luôn luôn đúng.',
        isCorrect: false,
        feedback: 'Thắng được một cuộc tranh cãi nhưng đánh mất một mối thâm tình, đó là cái giá quá đắt của bản ngã.',
      },
    ],
  },
  {
    id: 5,
    sutraName: 'Kinh Từ Bi Vô Lượng',
    sutraChapter: 'Tiểu Tụng (Khuddakapātha)',
    paliName: 'Mettā Sutta',
    title: 'Tứ Vô Lượng Tâm: Từ, Bi, Hỷ, Xả Mở Rộng Dung Lượng Trái Tim',
    story:
      'Một thuở nọ, một nhóm Tỳ-kheo vào rừng sâu tu thiền bị các loài dạ xoa quấy nhiễu sợ hãi, bèn trở về xin đức Phật chuyển chỗ. Đức Thế Tôn trao cho các thầy một bài kinh như một chiếc áo giáp bảo hộ tâm linh, đó là Kinh Từ Bi (Mettā Sutta).\nNgài dạy: "Như người mẹ hiền suốt đời che chở cho đứa con độc nhất bằng chính sinh mạng mình, hãy trải rộng tình thương vô lượng không ngằn mé đến muôn loài chúng sinh, từ kẻ thân người sơ, từ kẻ thiện đến người ác. Tình thương ấy không có hận thù, không có phân biệt."\nKỳ diệu thay, khi các thầy trở lại rừng rải tâm từ bi, cây rừng tỏa hương thơm, chim muông quấn quýt và muôn loài cùng hòa hợp tu tập.',
    monkTeaching:
      'Lấy oán báo oán, oán ấy chập chùng. Lấy đức báo oán, oán ấy tiêu tan. Tha thứ cho người làm tổn thương mình không phải vì họ xứng đáng, mà vì tâm hồn con xứng đáng được bình an.',
    question:
      'Thực hành "Tâm Xả" (Upekkhā) trong Tứ Vô Lượng Tâm có ý nghĩa chân thật là gì?',
    options: [
      {
        text: 'Dửng dưng vô cảm, mặc kệ ai khổ sở ra sao không thèm quan tâm.',
        isCorrect: false,
        feedback: 'Đó là tâm vô cảm ích kỷ, không phải tâm Xả của bậc hiền trí.',
      },
      {
        text: 'Thương yêu hết lòng nhưng không bám chấp sở hữu; làm việc thiện mà không kiêu ngạo mong đền đáp; giữ tâm bình thản trước thuận cảnh lẫn nghịch duyên.',
        isCorrect: true,
        feedback:
          'ĐỐN NGỘ! Tâm Xả như mặt đất dung chứa tất cả hoa thơm cỏ độc mà không hề than van hay phân biệt. Đó là đỉnh cao của sự tự tại.',
        quoteCollected: 'Dung lượng trái tim càng rộng, muộn phiền thế gian càng nhỏ bé.',
      },
      {
        text: 'Chỉ yêu thương người đem lại lợi ích vật chất cho mình.',
        isCorrect: false,
        feedback: 'Tình thương có điều kiện là tình thương buôn bán trao đổi, sinh ra đau khổ khi kỳ vọng không được thỏa mãn.',
      },
    ],
  },
];
