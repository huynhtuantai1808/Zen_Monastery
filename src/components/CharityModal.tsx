import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../services/audioEngine';

interface CharityModalProps {
  onComplete: (merit: number, staminaRestore: number) => void;
  onClose: () => void;
  spendStamina: (amount: number) => boolean;
}

interface Beneficiary {
  id: number;
  name: string;
  avatar: string;
  story: string;
  given: boolean;
}

const BENEFICIARIES: Beneficiary[] = [
  {
    id: 1,
    name: 'Cụ Ba (72 tuổi, nhặt ve chai)',
    avatar: '👵',
    story: 'Cụ dầm mưa cả buổi sớm nhặt ve chai nuôi cháu, đôi tay run rẩy vì lạnh và đói.',
    given: false,
  },
  {
    id: 2,
    name: 'Bác Tám (Bác tài xích lô lớn tuổi)',
    avatar: '👴',
    story: 'Cả ngày chưa có cuốc xe nào, bác ngồi nghỉ dưới hiên chùa với ánh mắt trĩu nặng âu lo.',
    given: false,
  },
  {
    id: 3,
    name: 'Bé An (10 tuổi, phụ mẹ bán vé số)',
    avatar: '👦',
    story: 'Bụng đói cồn cào sau khi đi bộ mười mấy con phố, em lễ phép cúi đầu chào cửa Phật.',
    given: false,
  },
];

export const CharityModal: React.FC<CharityModalProps> = ({
  onComplete,
  onClose,
  spendStamina,
}) => {
  const [people, setPeople] = useState<Beneficiary[]>(BENEFICIARIES);
  const [tab, setTab] = useState<'MEAL' | 'RELEASE'>('MEAL');
  const [releasedBirds, setReleasedBirds] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('Múc phần cơm chay nóng hổi dâng tặng bằng hai tay với tâm từ bi...');
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const servedCount = people.filter((p) => p.given).length;

  const handleServeMeal = (id: number) => {
    if (!spendStamina(5)) return;
    soundEngine.playCharityChime();

    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, given: true } : p))
    );

    const person = people.find((p) => p.id === id);
    setFeedback(`Đã trao bát cơm ấm đến ${person?.name}. Cụ nở nụ cười rạng rỡ cảm tạ cửa chùa 🙏`);

    if (servedCount + 1 >= people.length) {
      setTimeout(() => {
        soundEngine.playBell(528, 2.5);
        setIsFinished(true);
      }, 700);
    }
  };

  const handleReleaseBird = () => {
    if (!spendStamina(8)) return;
    soundEngine.playCharityChime();
    soundEngine.playBell(528, 1.8);
    setReleasedBirds((prev) => prev + 1);
    setFeedback('Cánh chim tung bay về rừng xanh đại ngàn! Phước báu phóng sinh vô lượng.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-rose-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col text-stone-100 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">🍲</span>
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-bold text-amber-200">
                Hoạt Động Thiện Tâm & Cứu Tế
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-400 font-serif">
                Hiên Cơm Thiện Nguyện • &ldquo;Thương người như thể thương thân&rdquo;
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        {!isFinished && (
          <div className="flex gap-2 my-3 p-1 rounded-2xl bg-stone-950 border border-stone-800 text-xs font-serif">
            <button
              onClick={() => setTab('MEAL')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                tab === 'MEAL' ? 'bg-amber-600 text-stone-950 font-bold shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>🍲 Phát Cơm Chay Từ Thiện</span>
            </button>
            <button
              onClick={() => setTab('RELEASE')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                tab === 'RELEASE' ? 'bg-amber-600 text-stone-950 font-bold shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>🕊️ Phóng Sinh Cứu Mạng</span>
            </button>
          </div>
        )}

        {/* TAB 1: PHÁT CƠM CHAY TỪ THIỆN */}
        {!isFinished && tab === 'MEAL' && (
          <div className="space-y-3 my-2">
            {/* Visual Big Porridge Pot */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/40 border border-amber-600/30 flex items-center justify-between text-xs font-serif">
              <div className="flex items-center gap-2">
                <span className="text-3xl animate-bounce">🍲</span>
                <div>
                  <div className="font-bold text-amber-200">Nồi Cháo Chay Ấm Nóng Tình Người</div>
                  <div className="text-[11px] text-stone-400">Nấu từ gạo mới, hạt sen & củ cải ngọt lành</div>
                </div>
              </div>
              <div className="text-xs font-mono font-bold text-emerald-300">
                Đã sẻ chia: {servedCount}/{people.length}
              </div>
            </div>

            {/* List of People in need */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {people.map((person) => (
                <div
                  key={person.id}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    person.given
                      ? 'bg-emerald-950/20 border-emerald-700/40 opacity-75'
                      : 'bg-stone-950 border-stone-800 hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-3xl shrink-0">{person.avatar}</span>
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-xs text-stone-200 truncate">
                        {person.name}
                      </div>
                      <div className="text-[10px] text-stone-400 font-serif line-clamp-1">
                        {person.story}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleServeMeal(person.id)}
                    disabled={person.given}
                    className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold shrink-0 transition cursor-pointer ${
                      person.given
                        ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-600/40 cursor-default'
                        : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-stone-950 shadow-md active:scale-95'
                    }`}
                  >
                    {person.given ? '✓ Đã Trao Bát Cơm' : 'Trao Cơm Ấm'}
                  </button>
                </div>
              ))}
            </div>

            <div className="text-xs text-center font-serif text-amber-200 italic">
              {feedback}
            </div>
          </div>
        )}

        {/* TAB 2: PHÓNG SINH CỨU MẠNG */}
        {!isFinished && tab === 'RELEASE' && (
          <div className="my-3 space-y-4 text-center">
            <div className="h-44 rounded-2xl bg-gradient-to-b from-sky-950/40 to-stone-900 border border-sky-500/30 flex flex-col items-center justify-center p-4">
              <span className="text-5xl animate-bounce">🕊️</span>
              <div className="text-sm font-serif text-sky-200 mt-2 font-bold">
                Phóng Sinh Cánh Chim Về Trời
              </div>
              <p className="text-xs text-stone-300 font-serif max-w-xs mt-1">
                Mở lồng cho chim sáo, chim sẻ tung cánh bay về với trời cao tự do, nuôi dưỡng lòng đại bi thương xót muôn loài.
              </p>
              <div className="mt-2 text-xs font-mono text-emerald-300">
                Đã phóng sinh: {releasedBirds} sinh linh
              </div>
            </div>

            <button
              onClick={handleReleaseBird}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-stone-950 font-serif font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <span>🕊️ Mở Lồng Phóng Thích Sinh Linh</span>
            </button>
          </div>
        )}

        {/* FINISHED SCREEN */}
        {isFinished && (
          <div className="my-5 text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-3xl shadow-lg">
              💛
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-rose-200">
                Thiện Hạnh Viên Mãn!
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 font-serif mt-1 max-w-sm mx-auto">
                Bát cơm ấm trao đi, nụ cười hạnh phúc nhận lại. Lòng từ ái của bạn đã sưởi ấm những mảnh đời cơ nhỡ trong cuộc sống bộn bề.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 font-serif italic">
              &ldquo;Nguyện cho tất cả chúng sinh muôn loài đều được an lành, không thù hận, không oan trái, sống đời hoan hỷ.&rdquo;
            </div>

            <div className="flex justify-center gap-4 text-xs font-mono">
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ✨ +55 Phước Báu
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
                🍵 +30 Tâm Lực
              </span>
            </div>

            <button
              onClick={() => {
                onComplete(55, 30);
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-serif font-bold text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Tiếp Nhận Phước Báu & Trở Lại</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
