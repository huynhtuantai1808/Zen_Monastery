import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { soundEngine } from '../services/audioEngine';
import { Sparkles, X, Award, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { DharmaQuestion, DharmaStoryOption } from '../types/game';

const DHARMA_STORIES: DharmaQuestion[] = [
  {
    id: 'story-1',
    title: 'Tách Trà Đầy & Tâm Không',
    story:
      'Một vị giáo sư đại học tìm đến một thiền sư để hỏi về thiền học. Trong lúc tiếp chuyện, vị giáo sư không ngừng thao thao bất tuyệt về những hiểu biết và bằng cấp của mình. Thiền sư lẳng lặng rót trà vào tách của vị giáo sư. Nước trà đã đầy miệng chén nhưng ngài vẫn tiếp tục rót khiến nước tràn ra bàn, nhỏ xuống sàn nhà. Vị giáo sư vội kêu lên: "Bạch thầy, trà đã tràn rồi, xin đừng rót nữa!". Thiền sư bèn mỉm cười đặt ấm trà xuống...',
    monkTeaching:
      'Chén trà này cũng như tâm trí của con vậy, chứa đầy những định kiến, kiêu hãnh và lo toan của thế tục. Nếu con không đổ bớt nước trong tách đi, làm sao ta có thể rót thêm hương vị của đạo pháp vào được?',
    question: 'Theo con, bài học sâu sắc nhất qua câu chuyện "Tách Trà Tràn" là gì?',
    options: [
      {
        text: 'Phải chuẩn bị một chiếc cốc thật to để chứa được nhiều kiến thức hơn.',
        isEnlightened: false,
        explanation: 'Chiếc cốc to hay nhỏ không quan trọng bằng việc chiếc cốc có khoảng trống để tiếp nhận hay không.',
      },
      {
        text: 'Cần buông bỏ bản ngã, định kiến và sự kiêu ngạo để tâm trí rỗng rang, sẵn sàng học hỏi cái mới.',
        isEnlightened: true,
        explanation: 'Chính xác! Tâm có rỗng thì trí mới sáng. Chỉ khi buông bớt cái tôi mới có chỗ chứa đựng sự an lạc và tỉnh thức.',
      },
      {
        text: 'Người rót trà đã bất cẩn làm phí hoài nước trà quý.',
        isEnlightened: false,
        explanation: 'Đó chỉ là hiện tượng bên ngoài, chưa thấy được hàm ý thiền vị sâu xa của Sư Thầy.',
      },
    ],
  },
  {
    id: 'story-2',
    title: 'Hai Nhà Sư & Cô Gái Bên Dòng Suối',
    story:
      'Hai nhà sư nọ cùng đi bộ qua con suối chảy xiết sau cơn mưa rừng. Đến bờ suối, họ gặp một thiếu nữ xinh đẹp mặc áo lụa đang lúng túng không dám bước qua dòng nước bùn lầy. Sư huynh không ngần ngại tiến tới, bế cô gái qua bờ bên kia, đặt cô xuống nhẹ nhàng rồi tiếp tục lên đường. Đi suốt một quãng đường dài đến tận chiều tối, sư đệ ấm ức không chịu nổi bèn lên tiếng: "Huynh là người xuất gia, sao lại có thể ôm một phụ nữ như vậy?". Sư huynh nghe xong quay lại mỉm cười...',
    monkTeaching:
      'Ta đã đặt cô gái ấy lại bên bờ suối từ sáng rồi, còn đệ, đệ vẫn còn vác cô ấy trong tâm trí suốt cả ngày hôm nay sao?',
    question: 'Ý niệm cốt lõi mà Sư Huynh muốn gửi gắm ở đây là gì?',
    options: [
      {
        text: 'Hành động thiện xuất phát từ tâm từ bi trong sáng; việc đã qua thì buông xả ngay, không chấp niệm dằn vặt.',
        isEnlightened: true,
        explanation: 'Thấu triệt! Cứu người bằng tâm trong sáng, xong rồi thì dứt bỏ, không mang theo gánh nặng phán xét trong lòng.',
      },
      {
        text: 'Lần sau qua suối nên tìm một chiếc thuyền để tránh va chạm phiền toái.',
        isEnlightened: false,
        explanation: 'Đó chỉ là giải pháp tình thế vật lý, không giải tỏa được nút thắt trong tâm thức.',
      },
      {
        text: 'Sư đệ có lý vì giới luật phải tuyệt đối nghiêm ngặt hơn lòng trắc ẩn.',
        isEnlightened: false,
        explanation: 'Giới luật sinh ra để bảo hộ tâm từ bi, không phải để biến con người thành tảng đá vô cảm trước khó khăn của tha nhân.',
      },
    ],
  },
];

export const DharmaTalkModal: React.FC = () => {
  const { setModal, addCongDuc, activateTamSangBuff, unlockJournalEntry, stats } = useGameStore();

  const [currentQuestion] = useState<DharmaQuestion>(DHARMA_STORIES[stats.dayCount % DHARMA_STORIES.length]);
  const [stage, setStage] = useState<'listening' | 'answering' | 'result'>('listening');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isEnlightened, setIsEnlightened] = useState(false);

  const handleSelectOption = (idx: number) => {
    setSelectedIdx(idx);
    const chosen = currentQuestion.options[idx];

    if (chosen.isEnlightened) {
      setIsEnlightened(true);
      activateTamSangBuff();
      addCongDuc(80);
      soundEngine.playEnlightenment();

      // Launch golden celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#d97706', '#fbbf24', '#ffffff', '#e11d48'],
      });

      // Unlock into journal
      unlockJournalEntry({
        id: `dharma-${currentQuestion.id}`,
        title: currentQuestion.title,
        quote: currentQuestion.monkTeaching,
        meaning: chosen.explanation,
        unlockedAt: `Ngày ${stats.dayCount} - Đốn Ngộ`,
        category: 'phap_thoai',
        artworkId: 'enlighten',
      });
    } else {
      setIsEnlightened(false);
      addCongDuc(30);
      soundEngine.playWoodenFish();
    }

    setStage('result');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="zen-paper-panel max-w-2xl w-full rounded-3xl p-6 md:p-8 relative flex flex-col border border-amber-500/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setModal(null)}
          className="absolute top-5 right-5 text-stone-500 hover:text-stone-800 p-2 rounded-full cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Monk Avatar & Title */}
        <div className="flex items-center gap-4 border-b border-amber-900/15 pb-5 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-3xl shadow-lg border border-amber-400/50">
            🧘‍♂️
          </div>
          <div>
            <div className="text-xs font-serif text-amber-800 font-bold uppercase tracking-wider">
              Chánh Điện Vân Ẩn Tự
            </div>
            <h2 className="font-heading text-xl md:text-2xl text-stone-900 font-bold">
              Thiền Sư Viên Thông Thuyết Pháp
            </h2>
            <div className="text-xs text-stone-600 font-serif">
              Chủ đề: {currentQuestion.title}
            </div>
          </div>
        </div>

        {/* STAGE 1: LISTENING TO THE DHARMA STORY */}
        {stage === 'listening' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 font-serif text-stone-800 text-sm md:text-base leading-relaxed italic">
              "{currentQuestion.story}"
            </div>

            <div className="p-4 rounded-2xl bg-amber-900/10 border-l-4 border-amber-600 font-serif text-stone-900 text-sm md:text-base leading-relaxed">
              <strong className="text-amber-800 block mb-1 font-heading">Lời Thầy Khuyên Nhủ:</strong>
              "{currentQuestion.monkTeaching}"
            </div>

            <button
              onClick={() => {
                soundEngine.playSingingBowl();
                setStage('answering');
              }}
              className="zen-btn-gold mt-4 py-3.5 px-6 rounded-2xl text-base font-serif flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Bước Vào Vấn Đáp Ngộ Đạo
            </button>
          </div>
        )}

        {/* STAGE 2: QUESTION & ENLIGHTENMENT CHOICES */}
        {stage === 'answering' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-amber-100/60 border border-amber-300">
              <span className="text-xs font-serif font-bold text-amber-800 block mb-1">CÂU HỎI TỰ TÂM:</span>
              <p className="font-serif font-semibold text-stone-900 text-base md:text-lg">
                {currentQuestion.question}
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              {currentQuestion.options.map((opt: DharmaStoryOption, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className="p-4 rounded-2xl border border-amber-900/20 bg-white/70 hover:bg-amber-50 hover:border-amber-500 text-left font-serif text-stone-800 text-sm md:text-base transition-all hover:scale-[1.01] shadow-sm cursor-pointer flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 3: RESULT & BUFF AWARD */}
        {stage === 'result' && selectedIdx !== null && (
          <div className="flex flex-col gap-5 animate-fade-in py-2">
            {isEnlightened ? (
              <div className="p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500 flex flex-col items-center text-center gap-2">
                <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-amber-900">
                  ĐẠT TRẠNG THÁI "ĐỐN NGỘ"!
                </h3>
                <p className="font-serif text-stone-700 text-sm max-w-md">
                  {currentQuestion.options[selectedIdx].explanation}
                </p>

                <div className="mt-3 p-3 rounded-xl bg-amber-100 border border-amber-300 text-xs font-serif text-amber-950 flex flex-col gap-1 w-full text-left">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Nhận Thưởng Phước Báu & Buff Tâm Sáng:
                  </div>
                  <div>✨ +80 Điểm Công Đức (Phước Báu)</div>
                  <div>✨ Kích hoạt Buff "Tâm Sáng" trong 2 ngày (+50% tốc độ làm việc, +30% Công Đức, giảm 40% tiêu hao Tâm Lực)</div>
                  <div>✨ Tăng +35 điểm Định Lực</div>
                  <div>✨ Lưu bài pháp thoại vào Sổ Tay Tỉnh Thức</div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-stone-100 border border-stone-300 flex flex-col items-center text-center gap-2">
                <h3 className="font-heading text-lg font-bold text-stone-800">
                  Lời Khuyên Nhẹ Nhàng Từ Sư Thầy
                </h3>
                <p className="font-serif text-stone-600 text-sm max-w-md">
                  {currentQuestion.options[selectedIdx].explanation}
                </p>
                <div className="text-xs text-amber-800 font-serif mt-2">
                  Vẫn nhận được +30 Công Đức cơ bản từ tấm lòng lắng nghe. Hãy kiên trì suy ngẫm thêm.
                </div>
              </div>
            )}

            <button
              onClick={() => setModal(null)}
              className="zen-btn-gold py-3.5 px-6 rounded-2xl text-base font-serif flex items-center justify-center gap-2 shadow-xl"
            >
              Thành Kính Tri Ân Sư Thầy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
