export interface ZenQuestItem {
  id: string;
  title: string;
  desc: string;
  quote: string;
  icon: string;
  targetCount: number;
  rewardMerit: number;
  rewardStamina: number;
  unlockedLevel: number;
  hotspotName: string;
  activityKey: 'CHOP_WOOD' | 'CARRY_WATER' | 'CLEAN_ALTAR' | 'CHARITY' | 'SWEEP' | 'TEA' | 'DHARMA' | 'FEED_KOI' | 'CALLIGRAPHY';
}

export interface ZenMilestoneItem {
  id: string;
  title: string;
  requiredMerit: number;
  rewardTitle: string;
  rewardRobe?: 'lam' | 'nau' | 'xam' | 'bach';
  desc: string;
  icon: string;
}

export const ZEN_QUESTS: ZenQuestItem[] = [
  {
    id: 'chop_wood',
    title: 'Chẻ củi nấu cơm chay',
    desc: 'Xuất lực định tâm, nhát búa hạ xuống dứt khoát rèn giũa tâm sân hận thành lửa ấm nuôi chúng tăng.',
    quote: 'Gánh nước chẻ củi, thảy đều là diệu đạo. Tâm bình thế giới bình.',
    icon: '🪓',
    targetCount: 3,
    rewardMerit: 45,
    rewardStamina: 15,
    unlockedLevel: 1,
    hotspotName: 'Bếp Hương Tích & Bãi Củi',
    activityKey: 'CHOP_WOOD',
  },
  {
    id: 'carry_water',
    title: 'Gánh nước suối lên chùa',
    desc: 'Múc nước suối trong veo về đổ đầy lu nước đại chúng, bước chân vững chãi không làm sánh một giọt.',
    quote: 'Mỗi bước chân chạm đất là một đóa sen nở. Nước trong tâm tịnh.',
    icon: '🪣',
    targetCount: 2,
    rewardMerit: 40,
    rewardStamina: 20,
    unlockedLevel: 1,
    hotspotName: 'Giếng Tiên & Lu Nước Chùa',
    activityKey: 'CARRY_WATER',
  },
  {
    id: 'clean_altar',
    title: 'Lau chùi bàn thờ Đức Phật',
    desc: 'Lau sạch bụi mờ trên toà sen, đánh bóng lư đồng, dâng hoa sen tươi và thắp nến hoa đăng trang nghiêm.',
    quote: 'Thời thời cần phất thức, vật sử nhạ trần ai. Lau sạch bụi trần, hiển lộ chân tâm.',
    icon: '🪷',
    targetCount: 4,
    rewardMerit: 60,
    rewardStamina: 25,
    unlockedLevel: 1,
    hotspotName: 'Chánh Điện Trang Nghiêm',
    activityKey: 'CLEAN_ALTAR',
  },
  {
    id: 'charity_food',
    title: 'Phát cơm chay từ thiện',
    desc: 'Nấu bát cháo ấm và xới phần cơm chay nóng hổi sẻ chia cho khách thập phương và người cơ nhỡ.',
    quote: 'Thương người như thể thương thân. Lòng từ bi rộng mở xua tan lạnh giá nhân gian.',
    icon: '🍲',
    targetCount: 3,
    rewardMerit: 55,
    rewardStamina: 30,
    unlockedLevel: 2,
    hotspotName: 'Hiên Cơm Thiện Nguyện',
    activityKey: 'CHARITY',
  },
  {
    id: 'sweep_courtyard',
    title: 'Quét lá đa sân chùa',
    desc: 'Cầm chổi tre quét sạch lá đa rụng đầy sân gạch cổ, rèn luyện tâm kiên nhẫn không vội vã.',
    quote: 'Một nhát chổi quét sân, một nhát chổi quét bụi trần trong tâm.',
    icon: '🧹',
    targetCount: 6,
    rewardMerit: 35,
    rewardStamina: 10,
    unlockedLevel: 1,
    hotspotName: 'Sân Chùa & Cây Đa',
    activityKey: 'SWEEP',
  },
  {
    id: 'guest_tea',
    title: 'Dâng trà lắng nghe tâm sự',
    desc: 'Pha ấm trà ấm tiếp đón khách thập phương mang gánh nặng âu lo, dùng lời từ ái xoa dịu muộn phiền.',
    quote: 'Chén trà trong tay, chánh niệm tràn đầy. Thân và tâm an trú trong phút giây hiện tại.',
    icon: '🍵',
    targetCount: 1,
    rewardMerit: 50,
    rewardStamina: 35,
    unlockedLevel: 2,
    hotspotName: 'Hiên Trà An Nhiên',
    activityKey: 'TEA',
  },
  {
    id: 'dharma_meditate',
    title: 'Tọa thiền & Vấn đáp ngộ đạo',
    desc: 'Thở sâu xua tan tạp niệm, lắng nghe lời Phật dạy trong kinh văn chánh thống và khai mở tuệ giác.',
    quote: 'Nghe chuông phiền não tan mây khói, ý lặng thân an miệng mỉm cười.',
    icon: '🧘',
    targetCount: 1,
    rewardMerit: 50,
    rewardStamina: 20,
    unlockedLevel: 3,
    hotspotName: 'Giảng Đường Chánh Điện',
    activityKey: 'DHARMA',
  },
  {
    id: 'feed_koi',
    title: 'Phóng sinh & Rải mồi cá Koi',
    desc: 'Đứng bên cầu sen rải mồi cho đàn cá Koi tung tăng bơi lội, nuôi dưỡng hạt giống từ bi muôn loài.',
    quote: 'Nuôi dưỡng lòng từ đến với muôn loài, tâm vô lượng phước báu vô biên.',
    icon: '🐟',
    targetCount: 1,
    rewardMerit: 30,
    rewardStamina: 10,
    unlockedLevel: 2,
    hotspotName: 'Cầu Sen & Hồ Cá Koi',
    activityKey: 'FEED_KOI',
  },
  {
    id: 'calligraphy_sutra',
    title: 'Chép kinh & Viết thư pháp',
    desc: 'Ngồi bên án thư Tàng Kinh Các mài mực thơm, nắn nót từng nét cọ kinh văn rèn luyện sự định tâm.',
    quote: 'Tâm an nét bút sắc, nét chữ nết người. Mỗi nét mực là một sự trở về.',
    icon: '🖌️',
    targetCount: 1,
    rewardMerit: 55,
    rewardStamina: 20,
    unlockedLevel: 2,
    hotspotName: 'Tàng Kinh Các Cổ Kính',
    activityKey: 'CALLIGRAPHY',
  },
];

export const ZEN_MILESTONES: ZenMilestoneItem[] = [
  {
    id: 'm1',
    title: 'Sơ Tâm Hướng Đạo',
    requiredMerit: 100,
    rewardTitle: 'Người Tập Sự Kiên Định',
    rewardRobe: 'lam',
    desc: 'Bước những bước chân đầu tiên trên con đường chánh niệm, tích lũy 100 Công Đức.',
    icon: '🌱',
  },
  {
    id: 'm2',
    title: 'Cần Mẫn Công Quả',
    requiredMerit: 300,
    rewardTitle: 'Cư Sĩ Chăm Chỉ',
    rewardRobe: 'nau',
    desc: 'Chẻ củi, gánh nước, lau dọn bàn thờ trang nghiêm không mỏi mệt, tích lũy 300 Công Đức.',
    icon: '🪵',
  },
  {
    id: 'm3',
    title: 'Từ Bi Hỷ Xả',
    requiredMerit: 600,
    rewardTitle: 'Bồ Đề Tâm Cư Sĩ',
    rewardRobe: 'xam',
    desc: 'Rộng lòng cứu tế người cơ nhỡ và phóng sinh muôn loài, tích lũy 600 Công Đức.',
    icon: '🪷',
  },
  {
    id: 'm4',
    title: 'Bậc Tỉnh Thức',
    requiredMerit: 1000,
    rewardTitle: 'Tâm Bất Biến',
    rewardRobe: 'bach',
    desc: 'Tâm an định như núi Tu Di giữa dòng đời vạn biến, tích lũy 1.000 Công Đức.',
    icon: '✨',
  },
];
