import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { soundEngine } from '../services/audioEngine';
import { X, Sparkles, HeartHandshake, CheckCircle2 } from 'lucide-react';

export interface TeaAdviceChoice {
  text: string;
  isCorrect: boolean;
  reply: string;
}

export interface TeaGuestStory {
  id: string;
  name: string;
  role: string;
  problem: string;
  teaPreference: string;
  dialogue: string[];
  solvedText: string;
  recommendedAdvice: number;
  adviceChoices: TeaAdviceChoice[];
}

const GUEST_STORIES: TeaGuestStory[] = [
  {
    id: 'guest-1',
    name: 'Anh Minh',
    role: 'Kỹ sư công nghệ kiệt sức (Burnout)',
    problem:
      'Thưa Cư sĩ, con làm việc 14 tiếng mỗi ngày, deadline dồn dập, điện thoại reo không ngừng. Đêm về con không sao chợp mắt được vì tim đập dồn dập và đầu óc đặc quánh lo âu. Con cảm thấy mình đang chết dần chết mòn giữa phố thị...',
    teaPreference: 'sen',
    dialogue: [
      'Con sợ nếu con dừng lại một ngày, con sẽ bị xã hội đào thải.',
      'Con không biết mình đang sống hay chỉ đang tồn tại để trả hóa đơn.',
    ],
    solvedText:
      'Chén trà sen thơm dịu và lời động viên của Cư sĩ như làm dịu mát tâm hồn khô hạn bấy lâu. Con hiểu rằng sức khỏe và sự bình an trong tâm mới là vốn liếng quý giá nhất.',
    recommendedAdvice: 1,
    adviceChoices: [
      {
        text: 'Cố gắng cày thêm một năm nữa kiếm đủ tiền rồi nghỉ ngơi một thể.',
        isCorrect: false,
        reply: 'Nỗi lo về tiền bạc sẽ không bao giờ có điểm dừng nếu ta không biết thế nào là đủ.',
      },
      {
        text: 'Chiếc dây cung kéo căng quá sẽ đứt. Hãy cho phép bản thân nghỉ ngơi, buông điện thoại xuống sau giờ làm và hít thở thật sâu.',
        isCorrect: true,
        reply: 'Đúng vậy! Biết dừng lại đúng lúc chính là trí tuệ cao nhất của đời người.',
      },
      {
        text: 'Nên đổi sang công việc khác có mức lương cao hơn.',
        isCorrect: false,
        reply: 'Đổi việc mà không đổi tâm thế thì áp lực vẫn sẽ đeo bám.',
      },
    ],
  },
  {
    id: 'guest-2',
    name: 'Chị Lan',
    role: 'Người vừa trải qua đổ vỡ tình cảm',
    problem:
      'Bạch thầy, người con yêu thương và gắn bó 5 năm trời đã rời bỏ con đi theo người khác. Mấy tháng nay con giam mình trong phòng khóc cạn nước mắt, oán hận người ta bội bạc và hận cả chính mình...',
    teaPreference: 'gung',
    dialogue: [
      'Tại sao con đã hy sinh tất cả mà vẫn nhận lại sự phản bội cay đắng?',
      'Con thấy trái tim mình như bị đóng băng, lạnh buốt và trống rỗng.',
    ],
    solvedText:
      'Hơi ấm của chén trà gừng và lời dạy của Cư sĩ đã sưởi ấm tâm hồn con. Con nhận ra tha thứ cho người khác cũng chính là tự cởi trói cho chính mình.',
    recommendedAdvice: 0,
    adviceChoices: [
      {
        text: 'Duyên đến thì đón nhận, duyên hết thì mỉm cười buông tay. Oán hận chỉ như việc tự uống thuốc độc mà mong người khác chết.',
        isCorrect: true,
        reply: 'Tuyệt vời! Buông bỏ chấp niệm quá khứ chính là sự tử tế lớn nhất dành cho bản thân.',
      },
      {
        text: 'Nên tìm cách trả thù để người ta hiểu được cảm giác đau đớn của mình.',
        isCorrect: false,
        reply: 'Lấy oán báo oán, oán ấy chập chùng không dứt.',
      },
      {
        text: 'Vội vàng tìm một người mới để lấp chỗ trống.',
        isCorrect: false,
        reply: 'Tâm chưa bình yên mà vội vàng bước vào mối quan hệ mới chỉ tạo thêm đau khổ.',
      },
    ],
  },
];

export const GuestTeaModal: React.FC = () => {
  const { setModal, addCongDuc, spendTamLuc, unlockJournalEntry, stats } = useGameStore();

  const [currentGuest] = useState<TeaGuestStory>(GUEST_STORIES[stats.dayCount % GUEST_STORIES.length]);
  const [stage, setStage] = useState<'listening' | 'brewing' | 'advising' | 'finished'>('listening');
  const [selectedTea, setSelectedTea] = useState<'sen' | 'gung' | 'cuc' | null>(null);
  const [selectedAdvice, setSelectedAdvice] = useState<number | null>(null);

  const handleBrewTea = (teaType: 'sen' | 'gung' | 'cuc') => {
    setSelectedTea(teaType);
    soundEngine.playTeaPour();
    setTimeout(() => {
      setStage('advising');
    }, 1200);
  };

  const handleSelectAdvice = (idx: number) => {
    setSelectedAdvice(idx);
    const chosen = currentGuest.adviceChoices[idx];

    if (chosen.isCorrect) {
      soundEngine.playEnlightenment();
      addCongDuc(70);

      // Unlock into journal
      unlockJournalEntry({
        id: `guest-advice-${currentGuest.id}`,
        title: `Hóa Giải Nỗi Đau: ${currentGuest.name}`,
        quote: chosen.text,
        meaning: currentGuest.solvedText,
        unlockedAt: `Ngày ${stats.dayCount} - Khách Thập Phương`,
        category: 'triet_ly',
        artworkId: 'tea',
      });
    } else {
      soundEngine.playWoodenFish();
      addCongDuc(25);
    }

    setStage('finished');
  };

  const handleFinish = () => {
    spendTamLuc(20);
    setModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="zen-paper-panel max-w-2xl w-full rounded-3xl p-6 md:p-8 relative flex flex-col border border-amber-500/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={() => setModal(null)}
          className="absolute top-5 right-5 text-stone-500 hover:text-stone-800 p-2 rounded-full cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Guest Header */}
        <div className="flex items-center gap-4 border-b border-amber-900/15 pb-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shadow-md border border-amber-300">
            🍵
          </div>
          <div>
            <div className="text-xs font-serif text-amber-800 font-bold uppercase tracking-wider">
              Bàn Trà Dưới Gốc Đa Cổ Thụ
            </div>
            <h2 className="font-heading text-xl md:text-2xl text-stone-900 font-bold">
              Tiếp Đón: {currentGuest.name}
            </h2>
            <div className="text-xs text-stone-600 font-serif">
              Tâm sự: {currentGuest.role}
            </div>
          </div>
        </div>

        {/* STAGE 1: LISTENING TO GUEST'S PAIN */}
        {stage === 'listening' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 font-serif text-stone-800 text-sm md:text-base leading-relaxed">
              "{currentGuest.problem}"
            </div>

            <div className="text-xs font-serif text-stone-600 italic">
              * Người khách đang bối rối và cần một ấm trà thanh tịnh để làm dịu tâm trạng trước khi mở lòng đàm đạo.
            </div>

            <button
              onClick={() => setStage('brewing')}
              className="zen-btn-gold mt-3 py-3 px-6 rounded-2xl text-base font-serif flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" /> Chuẩn Bị Ấm Trà Đãi Khách
            </button>
          </div>
        )}

        {/* STAGE 2: CHOOSING THE RIGHT TEA */}
        {stage === 'brewing' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <h3 className="font-heading text-lg font-bold text-stone-900 text-center">
              Hãy Chọn Loại Trà Phù Hợp Với Tâm Trạng Của Khách:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Trà Sen */}
              <button
                onClick={() => handleBrewTea('sen')}
                className="p-4 rounded-2xl border border-amber-200 bg-amber-50/80 hover:bg-amber-100 hover:border-amber-400 flex flex-col items-center text-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-sm"
              >
                <span className="text-3xl">🪷</span>
                <span className="font-heading font-bold text-stone-900 text-base">Trà Sen An Thần</span>
                <span className="text-xs text-stone-600 font-serif">
                  Hương sen thanh khiết giúp dịu thần kinh, giảm âu lo và ngủ ngon.
                </span>
              </button>

              {/* Trà Gừng */}
              <button
                onClick={() => handleBrewTea('gung')}
                className="p-4 rounded-2xl border border-amber-200 bg-amber-50/80 hover:bg-amber-100 hover:border-amber-400 flex flex-col items-center text-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-sm"
              >
                <span className="text-3xl">🫚</span>
                <span className="font-heading font-bold text-stone-900 text-base">Trà Gừng Ấm Lòng</span>
                <span className="text-xs text-stone-600 font-serif">
                  Gừng ấm xua tan giá lạnh, làm ấm trái tim đang tổn thương.
                </span>
              </button>

              {/* Trà Cúc */}
              <button
                onClick={() => handleBrewTea('cuc')}
                className="p-4 rounded-2xl border border-amber-200 bg-amber-50/80 hover:bg-amber-100 hover:border-amber-400 flex flex-col items-center text-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-sm"
              >
                <span className="text-3xl">🌼</span>
                <span className="font-heading font-bold text-stone-900 text-base">Trà Hoa Cúc Tỉnh Tâm</span>
                <span className="text-xs text-stone-600 font-serif">
                  Thanh nhiệt giải độc, hạ hỏa bực bội và tĩnh tâm.
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: GIVING EMPATHETIC ADVICE */}
        {stage === 'advising' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="p-3 rounded-xl bg-amber-100/60 border border-amber-300 text-xs font-serif text-amber-900 flex items-center gap-2">
              <span>🍵</span>
              <span>
                Đã dâng một ấm {selectedTea === 'sen' ? 'Trà Sen an thần' : selectedTea === 'gung' ? 'Trà Gừng ấm lòng' : 'Trà Hoa Cúc thanh nhiệt'} nóng hổi, khói thơm nghi ngút giúp khách thở phào nhẹ nhõm.
              </span>
            </div>

            <h3 className="font-heading text-lg font-bold text-stone-900">
              Hãy Chọn Lời Khuyên Thấu Cảm Dành Cho {currentGuest.name}:
            </h3>

            <div className="flex flex-col gap-3">
              {currentGuest.adviceChoices.map((choice: TeaAdviceChoice, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAdvice(idx)}
                  className="p-4 rounded-2xl border border-amber-900/20 bg-white/80 hover:bg-amber-50 hover:border-amber-500 text-left font-serif text-stone-800 text-sm md:text-base transition-all hover:scale-[1.01] shadow-sm cursor-pointer flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{choice.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 4: FINISHED & GRATITUDE */}
        {stage === 'finished' && selectedAdvice !== null && (
          <div className="flex flex-col gap-4 animate-fade-in text-center py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <HeartHandshake className="w-8 h-8" />
            </div>

            <h3 className="font-heading text-xl font-bold text-stone-900">
              Nút Thắt Tâm Lý Đã Được Cởi Bỏ!
            </h3>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-stone-700 font-serif text-sm leading-relaxed text-left">
              "{currentGuest.solvedText}"
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-serif text-emerald-900 text-left flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Nhận được <strong>+70 Điểm Công Đức</strong> từ thiện nguyện cứu nhân độ thế!
              </span>
            </div>

            <button
              onClick={handleFinish}
              className="zen-btn-gold py-3 px-6 rounded-2xl text-base font-serif flex items-center justify-center gap-2 shadow-xl cursor-pointer mt-2"
            >
              Tiễn Khách Xuống Núi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
