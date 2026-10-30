import React, { useState } from 'react';
import { MessageCircleHeart, RefreshCw, ChevronRight, CheckCircle2, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { ZenCharacterSprite } from './ZenCharacterSprite';
import { soundEngine } from '../services/audioEngine';

export const TEA_TYPES = [
  { id: 'lotus', name: 'Trà Sen An Thần', icon: '🪷', benefit: 'Xoa dịu lo âu, mất ngủ vì áp lực', color: 'from-pink-500/20 to-amber-500/20 border-pink-400/50' },
  { id: 'ginger', name: 'Trà Gừng Ấm Lòng', icon: '🫚', benefit: 'Sưởi ấm tâm hồn cô đơn, thất vọng', color: 'from-amber-500/20 to-orange-500/20 border-amber-400/50' },
  { id: 'chrysanthemum', name: 'Trà Cúc Thanh Tâm', icon: '🌼', benefit: 'Hạ hỏa cơn nóng giận, đố kỵ', color: 'from-yellow-400/20 to-emerald-500/20 border-yellow-400/50' },
];

export const GUEST_STORIES = [
  {
    id: 1,
    name: 'Minh Anh (Nhân viên văn phòng, 26 tuổi)',
    avatar: '👩‍💼',
    burden: 'Kiệt sức vì Deadline & Mạng xã hội',
    mood: 'Lo âu, mất ngủ',
    bestTea: 'lotus',
    quote: '"Con cảm thấy nếu mình ngừng chạy dù chỉ một ngày, cả thế giới sẽ bỏ rơi con phía sau. Điện thoại lúc nào cũng báo tin nhắn làm tim con đập thình thịch..."',
    choices: [
      {
        text: 'Khuyên cô ấy xóa hết ứng dụng và nghỉ việc ngay lập tức.',
        isMindful: false,
        reply: 'Minh Anh thở dài: "Cơm áo gạo tiền vẫn còn đó, con chưa thể buông bỏ đột ngột như vậy..."',
        merit: 15,
      },
      {
        text: 'Mời chén trà ấm: "Mây trôi không vội mà vẫn qua đồi. Hãy cho phép mình thở trọn vẹn trong 5 phút này trước đã."',
        isMindful: true,
        reply: 'Minh Anh rưng rưng nước mắt, đôi vai đang gồng cứng dần thả lỏng theo hương trà sen thanh khiết.',
        merit: 45,
      },
      {
        text: 'Kể về thành tích tu tập của bạn để cô ấy noi theo.',
        isMindful: false,
        reply: 'Cô ấy mỉm cười xã giao nhưng ánh mắt vẫn hướng về chiếc điện thoại.',
        merit: 10,
      },
    ],
  },
  {
    id: 2,
    name: 'Chú Hoàng (Doanh nhân, 42 tuổi)',
    avatar: '🧔',
    burden: 'Tức giận vì bị đối tác phản bội',
    mood: 'Nóng giận, uất ức',
    bestTea: 'chrysanthemum',
    quote: '"Tôi đã dốc hết lòng tin cho họ, vậy mà họ nỡ lấy hết công sức của tôi. Trong lòng tôi lúc này như có lửa đốt!"',
    choices: [
      {
        text: 'Dâng trà thanh nhiệt: "Giữ cơn giận trong lòng giống như cầm than hồng ném vào người khác, tay mình sẽ bỏng trước tiên."',
        isMindful: true,
        reply: 'Chú Hoàng lặng người nhìn khói trà bay lên, tiếng thở hổn hển dần dịu lại thành một nụ cười nhẹ nhõm.',
        merit: 50,
      },
      {
        text: 'Đồng tình và khuyên chú tìm luật sư trả đũa thật nặng.',
        isMindful: false,
        reply: 'Cơn giận của chú càng bùng lên, không khí hiên trà trở nên nặng nề.',
        merit: 10,
      },
    ],
  },
  {
    id: 3,
    name: 'Hải Đăng (Sinh viên mới ra trường, 22 tuổi)',
    avatar: '🧑‍🎨',
    burden: 'Hoang mang mất phương hướng tương lai',
    mood: 'Lạnh lẽo, tự ti',
    bestTea: 'ginger',
    quote: '"Bạn bè đồng trang lứa ai cũng có việc làm tốt, còn con gửi hàng chục hồ sơ đều bị từ chối. Con thấy mình thật vô dụng..."',
    choices: [
      {
        text: 'Trao chén trà gừng ấm: "Tre mất 4 năm chỉ cao thêm 3cm để bén rễ sâu, rồi năm thứ 5 mới vươn cao mỗi ngày. Đừng sợ khoảng lặng."',
        isMindful: true,
        reply: 'Đôi mắt Hải Đăng sáng lên tia hy vọng ấm áp. Cậu cúi đầu cảm ơn bạn rối rít.',
        merit: 45,
      },
      {
        text: 'Bảo cậu ấy phải cố gắng gấp đôi, đừng than vãn nữa.',
        isMindful: false,
        reply: 'Cậu ấy cúi gằm mặt, lặng lẽ uống cạn chén trà rồi rời đi.',
        merit: 15,
      },
    ],
  },
];

interface TeaHouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isModal?: boolean;
  onAddMerit: (amount: number, x: number, y: number, label?: string) => void;
  spendStamina: (amount: number) => boolean;
  onOpenCharModal: () => void;
}

export const TeaHouseModal: React.FC<TeaHouseModalProps> = ({
  isOpen,
  onClose,
  isModal = true,
  onAddMerit,
  spendStamina,
  onOpenCharModal,
}) => {
  const { stats } = useGameStore();
  const character = stats.character;

  const [guestIndex, setGuestIndex] = useState<number>(0);
  const [selectedTea, setSelectedTea] = useState<string>('lotus');
  const [guestFeedback, setGuestFeedback] = useState<{ reply: string; isMindful: boolean; isRightTea: boolean } | null>(null);

  if (!isOpen) return null;

  const currentGuest = GUEST_STORIES[guestIndex % GUEST_STORIES.length];

  const handleCounselGuest = (choice: { text: string; isMindful: boolean; reply: string; merit: number }) => {
    if (!spendStamina(15)) {
      soundEngine.playWarning();
      return;
    }

    const isRightTea = selectedTea === currentGuest.bestTea;
    if (choice.isMindful && isRightTea) {
      soundEngine.playSingingBowl();
      onAddMerit(choice.merit + 25, 50, 40, '🌸 Tri Kỷ Thấu Cảm ');
    } else if (choice.isMindful) {
      soundEngine.playBell(528, 2.5);
      onAddMerit(choice.merit, 50, 40, '🍵 Lòng Thành Pha Trà ');
    } else {
      soundEngine.playWarning();
      onAddMerit(choice.merit, 50, 40);
    }

    setGuestFeedback({
      reply: choice.reply,
      isMindful: choice.isMindful,
      isRightTea,
    });
  };

  return (
    <div className={`relative z-10 w-full h-full flex items-center justify-center ${isModal ? 'p-1' : 'pt-20 pb-6 px-4'}`}>
      <div className="max-w-3xl w-full bg-stone-950/90 backdrop-blur-xl border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2 text-amber-200 font-serif font-bold text-base sm:text-lg">
            <MessageCircleHeart className="w-5 h-5 text-amber-400" />
            <span>Hiên Trà Chùa Vân Ẩn: Lắng Nghe Khách Thập Phương</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setGuestFeedback(null);
                setGuestIndex((prev) => (prev + 1) % GUEST_STORIES.length);
              }}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-amber-200 flex items-center gap-1.5 border border-stone-700 cursor-pointer font-serif"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Đón khách tiếp
            </button>
            {isModal && (
              <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Cảnh đàm đạo 2D: Cư sĩ đối ẩm cùng khách thập phương */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-900/80 border border-amber-900/40 shadow-inner">
          {/* Chủ tọa: Nhân vật cư sĩ */}
          <div className="flex items-center gap-2.5">
            <div className="w-20 h-20 flex items-center justify-center shrink-0">
              <ZenCharacterSprite
                character={character}
                pose="sitting-tea"
                showNameTag={false}
                scale={0.7}
                onClick={onOpenCharModal}
              />
            </div>
            <div>
              <div className="text-xs font-serif font-bold text-amber-200">{character.name}</div>
              <div className="text-[10px] text-stone-400 font-serif">Chủ tọa dâng trà</div>
            </div>
          </div>

          {/* Bàn Trà Nghi Ngút Khói */}
          <div className="text-center px-3 py-1 rounded-xl bg-amber-950/50 border border-amber-500/20">
            <div className="text-2xl animate-pulse">🍵</div>
            <div className="text-[10px] text-amber-300 font-serif">
              {TEA_TYPES.find((t) => t.id === selectedTea)?.name}
            </div>
          </div>

          {/* Khách Thập Phương */}
          <div className="flex items-center gap-2.5 text-right">
            <div>
              <div className="text-xs font-serif font-bold text-stone-200">
                {currentGuest.name.split('(')[0]}
              </div>
              <div className="text-[10px] text-rose-300 font-serif">Khách hữu duyên</div>
            </div>
            <div className="text-3xl p-1.5 rounded-2xl bg-stone-800/80 border border-stone-700 shrink-0">
              {currentGuest.avatar}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* 1. Chọn Trà (5 cols) */}
          <div className="md:col-span-5 space-y-2">
            <div className="text-xs font-serif font-bold text-amber-300 uppercase tracking-wider">
              1. Chọn Trà Dâng Khách:
            </div>
            {TEA_TYPES.map((tea) => (
              <button
                key={tea.id}
                onClick={() => {
                  setSelectedTea(tea.id);
                  soundEngine.playBell(480, 1.2);
                }}
                className={`w-full text-left p-2.5 rounded-xl border transition flex items-start gap-2.5 cursor-pointer ${
                  selectedTea === tea.id
                    ? `bg-gradient-to-r ${tea.color} text-amber-100 shadow-md`
                    : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span className="text-xl">{tea.icon}</span>
                <div>
                  <div className="text-xs font-bold text-stone-100 font-serif">{tea.name}</div>
                  <div className="text-[11px] text-stone-300 font-serif">{tea.benefit}</div>
                </div>
              </button>
            ))}
          </div>

          {/* 2. Lắng nghe & Khuyên nhủ (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl bg-stone-900 p-2 rounded-2xl border border-stone-800">
                  {currentGuest.avatar}
                </span>
                <div>
                  <div className="font-bold text-sm text-amber-100 font-serif">
                    {currentGuest.name}
                  </div>
                  <div className="text-xs text-rose-300 font-serif">
                    Nút thắt: {currentGuest.burden}
                  </div>
                </div>
              </div>

              <blockquote className="text-xs sm:text-sm italic text-stone-200 bg-stone-900/90 p-3 rounded-xl border-l-4 border-amber-400 font-serif">
                {currentGuest.quote}
              </blockquote>
            </div>

            {!guestFeedback ? (
              <div className="space-y-2">
                <div className="text-xs font-serif font-bold text-amber-300">
                  2. Chọn lời chia sẻ cùng khách:
                </div>
                {currentGuest.choices.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCounselGuest(c)}
                    className="w-full text-left p-2.5 rounded-xl bg-stone-900 hover:bg-amber-950/50 border border-stone-700 hover:border-amber-400/50 text-xs text-stone-200 transition flex items-center justify-between gap-2 cursor-pointer font-serif"
                  >
                    <span>{c.text}</span>
                    <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs space-y-2">
                <div className="font-semibold text-emerald-300 flex items-center gap-1.5 font-serif">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {guestFeedback.isMindful ? 'Khách đã cởi bỏ được gút thắt trong lòng!' : 'Khách lắng nghe nhưng lòng còn trĩu nặng.'}
                  </span>
                </div>
                <p className="text-stone-200 font-serif">{guestFeedback.reply}</p>
                <button
                  onClick={() => {
                    setGuestFeedback(null);
                    setGuestIndex((prev) => (prev + 1) % GUEST_STORIES.length);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs font-serif cursor-pointer"
                >
                  Tiếp tục đón vị khách tiếp theo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
