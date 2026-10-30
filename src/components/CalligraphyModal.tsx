import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Feather, RefreshCw, CheckCircle2, Award, Sparkles, X, ScrollText } from 'lucide-react';
import { soundEngine } from '../services/audioEngine';
import { useGameStore } from '../store/gameStore';

export interface SutraCalligraphyItem {
  id: string;
  word: string;
  meaning: string;
  quote: string;
  desc: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Thâm sâu';
  meritReward: number;
}

export const SUTRA_CALLIGRAPHY_LIST: SutraCalligraphyItem[] = [
  {
    id: 'tam',
    word: 'TÂM',
    meaning: 'Tâm an vạn sự an, tâm tịnh bốn mùa xuân',
    quote: 'Tâm là chủ tễ, vạn pháp do tâm tạo. Giữ tâm trong sáng như gương soi bóng nguyệt.',
    desc: 'Nét chữ tròn đầy uốn lượn như giọt sương mai đọng trên lá sen, rèn luyện sự bình an sâu thẳm.',
    difficulty: 'Dễ',
    meritReward: 50,
  },
  {
    id: 'an',
    word: 'AN',
    meaning: 'Bình an trong từng hơi thở, an nhiên giữa chốn bụi trần',
    quote: 'Mỗi bước chân chạm đất biết mình đang an, hơi thở vào ra biết lòng đang tịnh.',
    desc: 'Nét ngang vững chãi như núi đồi Vân Sơn, nét chấm nhẹ buông xua tan ngàn lo toan trần thế.',
    difficulty: 'Dễ',
    meritReward: 45,
  },
  {
    id: 'nhan',
    word: 'NHẪN',
    meaning: 'Nhẫn một chút sóng yên gió lặng, lùi một bước biển rộng trời cao',
    quote: 'Nhẫn nhục là giáp sắt tối thượng vượt qua mọi chướng ngại khổ đau ở thế gian.',
    desc: 'Nét đao dứt khoát rèn dũa tính kiên nhẫn, hóa giải mọi nóng nảy và bức bối trong lòng.',
    difficulty: 'Trung bình',
    meritReward: 55,
  },
  {
    id: 'tinh_thuc',
    word: 'TỈNH THỨC',
    meaning: 'Sống trọn vẹn trong phút giây hiện tại nhiệm mầu',
    quote: 'Quá khứ đã qua, tương lai chưa tới. Chỉ có phút giây hiện tại là nơi sự sống đang diễn ra.',
    desc: 'Từng con chữ mềm mại thanh thoát như dòng suối ngọc len qua kẽ đá, đánh thức tuệ giác.',
    difficulty: 'Thâm sâu',
    meritReward: 65,
  },
];

interface CalligraphyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMerit: (amount: number, x: number, y: number, label?: string) => void;
  spendStamina: (amount: number) => boolean;
}

export const CalligraphyModal: React.FC<CalligraphyModalProps> = ({
  isOpen,
  onClose,
  onAddMerit,
  spendStamina,
}) => {
  const { addUnlockedQuote } = useGameStore();
  const [selectedItem, setSelectedItem] = useState<SutraCalligraphyItem>(SUTRA_CALLIGRAPHY_LIST[0]);
  const [inkColor, setInkColor] = useState<string>('#1c1917'); // Mực tàu cổ
  const [brushSize, setBrushSize] = useState<number>(14);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawnPixelsCount, setDrawnPixelsCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasStamped, setHasStamped] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Khởi tạo Canvas và vẽ chữ mẫu mờ (Watermark guidelines)
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Kích thước chuẩn HD
    const width = canvas.width;
    const height = canvas.height;

    // Nền giấy xuyến chỉ vàng ấm loang lổ mộc mạc
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#fef3c7'); // Amber 100
    grad.addColorStop(0.5, '#fef08a'); // Yellow 100
    grad.addColorStop(1, '#fed7aa'); // Orange 100
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Hoa văn hạt sợi giấy cổ mờ
    ctx.fillStyle = 'rgba(180, 83, 9, 0.04)';
    for (let i = 0; i < 300; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const rr = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.arc(rx, ry, rr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Viền khung tranh thủy mặc
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.35)';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, width - 24, height - 24);

    ctx.strokeStyle = 'rgba(120, 53, 15, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(18, 18, width - 36, height - 36);

    // Chữ mẫu nét đứt mờ mờ để người chơi đồ theo (Watermark)
    ctx.font = 'italic bold 76px "Playfair Display", "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(120, 53, 15, 0.16)';
    ctx.fillText(selectedItem.word, width / 2, height / 2 - 20);

    // Dòng ý nghĩa nhỏ phía dưới
    ctx.font = 'italic 16px "Playfair Display", serif';
    ctx.fillStyle = 'rgba(120, 53, 15, 0.35)';
    ctx.fillText(selectedItem.meaning, width / 2, height / 2 + 48);

    setDrawnPixelsCount(0);
    setIsCompleted(false);
    setHasStamped(false);
  }, [selectedItem]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(initCanvas, 100);
    }
  }, [isOpen, initCanvas]);

  if (!isOpen) return null;

  // Lấy tọa độ chuột hoặc cảm ứng trên Canvas
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleStartDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isCompleted) return;

    if (!spendStamina(2)) {
      return;
    }

    const coords = getCoordinates(e);
    if (!coords) return;
    setIsDrawing(true);
    lastPointRef.current = coords;
  };

  const handleMoveDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || isCompleted) return;
    const coords = getCoordinates(e);
    if (!coords || !lastPointRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Nét bút lông thư pháp đượm mực: bo tròn hai đầu
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Điểm nhấn viền mực tự nhiên
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = inkColor;
    ctx.fill();

    lastPointRef.current = coords;
    setDrawnPixelsCount((prev) => prev + 1);

    // Sau khi vẽ đủ số nét (~85 pixel strokes), kích hoạt hoàn thành
    if (drawnPixelsCount >= 80 && !isCompleted) {
      setIsCompleted(true);
      soundEngine.playBell(528, 2.0);
    }
  };

  const handleEndDraw = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  // Đóng dấu triện son đỏ
  const handleStampSeal = () => {
    if (hasStamped) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sealX = canvas.width - 75;
    const sealY = canvas.height - 75;

    // Hộp triện son đỏ
    ctx.fillStyle = '#dc2626'; // Red 600
    ctx.fillRect(sealX - 25, sealY - 25, 50, 50);

    ctx.strokeStyle = '#fef2f2';
    ctx.lineWidth = 2;
    ctx.strokeRect(sealX - 22, sealY - 22, 44, 44);

    // Chữ triện cổ bên trong
    ctx.font = 'bold 11px serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VÂN ẨN', sealX, sealY - 7);
    ctx.fillText('TỰ ẤN', sealX, sealY + 7);

    setHasStamped(true);
    soundEngine.playWoodenFish();
    soundEngine.playBell(639, 2.5);

    // Thưởng công đức
    onAddMerit(selectedItem.meritReward, 50, 35, '✨ Thư Pháp Viên Mãn ');
    addUnlockedQuote(`${selectedItem.word}: ${selectedItem.meaning}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[94vh] overflow-y-auto bg-stone-950/95 border-2 border-amber-500/50 rounded-3xl p-4 sm:p-7 shadow-2xl flex flex-col space-y-4">
        
        {/* Header Modal */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xl">
              🖌️
            </span>
            <div>
              <h3 className="font-heading font-bold text-base sm:text-lg text-amber-100 flex items-center gap-2">
                <span>Tàng Kinh Các: Chép Kinh & Viết Thư Pháp</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-serif">
                  Tâm An Nét Bút Sắc
                </span>
              </h3>
              <p className="text-xs text-stone-300 font-serif">
                Ngồi ngay ngắn, mài mực thơm và đồ theo từng nét chữ kinh văn để rèn luyện sự định tâm.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân Modal: Chọn Câu Kệ & Canvas Bàn Viết */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Cột trái (4 cols): Danh sách câu kinh / thư pháp */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="text-xs font-serif font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <ScrollText className="w-4 h-4" />
              <span>1. Chọn Chữ Viết Tâm Nguyện:</span>
            </div>

            <div className="space-y-2">
              {SUTRA_CALLIGRAPHY_LIST.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    soundEngine.playBell(432, 1.2);
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition flex flex-col gap-1 cursor-pointer ${
                    selectedItem.id === item.id
                      ? 'bg-amber-500/25 border-amber-400 text-amber-100 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:text-stone-100 hover:bg-stone-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-black text-base text-amber-300 tracking-wider">
                      {item.word}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-300 font-serif">
                      +{item.meritReward} Công Đức
                    </span>
                  </div>
                  <div className="text-xs font-serif italic text-amber-200/90 leading-relaxed">
                    &ldquo;{item.meaning}&rdquo;
                  </div>
                </button>
              ))}
            </div>

            {/* Dụng Cụ Bút Mực */}
            <div className="bg-stone-900/90 p-3.5 rounded-2xl border border-stone-800 space-y-3">
              <div className="text-xs font-serif font-bold text-stone-300">Nét Cọ Thư Pháp:</div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-400 font-serif">Nét bút:</span>
                <input
                  type="range"
                  min={8}
                  max={26}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-mono text-amber-300 font-bold">{brushSize}px</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={initCanvas}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-stone-200 flex items-center gap-1.5 border border-stone-700 cursor-pointer font-serif"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Mài nghiên mực mới
                </button>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => setInkColor('#1c1917')}
                    className={`w-6 h-6 rounded-full border-2 bg-stone-900 cursor-pointer ${
                      inkColor === '#1c1917' ? 'border-amber-400 scale-110 shadow' : 'border-stone-700'
                    }`}
                    title="Mực Tàu Đen Truyền Thống"
                  />
                  <button
                    onClick={() => setInkColor('#7f1d1d')}
                    className={`w-6 h-6 rounded-full border-2 bg-red-950 cursor-pointer ${
                      inkColor === '#7f1d1d' ? 'border-amber-400 scale-110 shadow' : 'border-stone-700'
                    }`}
                    title="Mực Chu Sa Đỏ Son"
                  />
                  <button
                    onClick={() => setInkColor('#1e3a5f')}
                    className={`w-6 h-6 rounded-full border-2 bg-slate-900 cursor-pointer ${
                      inkColor === '#1e3a5f' ? 'border-amber-400 scale-110 shadow' : 'border-stone-700'
                    }`}
                    title="Mực Chàm Lam Cổ"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải (8 cols): Canvas Giấy Xuyến Chỉ Thư Pháp */}
          <div className="lg:col-span-8 flex flex-col items-center space-y-3">
            <div className="w-full flex items-center justify-between text-xs text-stone-300 font-serif px-1">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Feather className="w-4 h-4" />
                <span>Chạm & kéo cọ theo chữ mẫu trên giấy:</span>
              </span>
              <span className="text-stone-400">
                Tiến độ: <strong className={isCompleted ? 'text-emerald-400' : 'text-amber-300'}>
                  {Math.min(100, Math.round((drawnPixelsCount / 80) * 100))}%
                </strong>
              </span>
            </div>

            {/* Bàn Giấy Thư Pháp Canvas */}
            <div className="relative w-full aspect-[4/3] max-w-[560px] rounded-3xl overflow-hidden border-4 border-amber-900/60 shadow-2xl bg-amber-100 touch-none select-none">
              <canvas
                ref={canvasRef}
                width={560}
                height={420}
                onMouseDown={handleStartDraw}
                onMouseMove={handleMoveDraw}
                onMouseUp={handleEndDraw}
                onMouseLeave={handleEndDraw}
                onTouchStart={handleStartDraw}
                onTouchMove={handleMoveDraw}
                onTouchEnd={handleEndDraw}
                className="w-full h-full cursor-crosshair"
              />

              {/* Lớp thông báo khi hoàn thành */}
              {isCompleted && !hasStamped && (
                <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center animate-fade-in pointer-events-auto">
                  <div className="bg-stone-900/95 border-2 border-amber-400 p-5 rounded-3xl shadow-2xl space-y-3 max-w-sm">
                    <Sparkles className="w-8 h-8 text-amber-300 mx-auto animate-bounce" />
                    <h4 className="font-heading font-black text-amber-200 text-base">
                      NÉT BÚT ĐÃ ĐỦ ĐẦY CHÁNH NIỆM!
                    </h4>
                    <p className="text-xs text-stone-200 font-serif">
                      Hãy đóng dấu triện son đỏ của Chùa Vân Ẩn để chứng nhận tác phẩm công quả.
                    </p>
                    <button
                      onClick={handleStampSeal}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transform active:scale-95 transition"
                    >
                      <Award className="w-4 h-4" />
                      <span>Đóng Dấu Triện Son Chứng Nhận</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Khi đã đóng dấu triện xong */}
              {hasStamped && (
                <div className="absolute bottom-4 left-4 right-4 bg-emerald-950/90 border border-emerald-400/60 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-xl animate-slide-up">
                  <div className="flex items-center gap-2 text-emerald-200 font-serif">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Đã chứng nhận và lưu bức thư pháp vào Sổ Tay Tỉnh Thức!</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold font-serif text-xs cursor-pointer shrink-0"
                  >
                    Hoàn Tất
                  </button>
                </div>
              )}
            </div>

            {/* Chú dẫn triết lý */}
            <div className="w-full text-center text-stone-400 text-xs italic font-serif max-w-md pt-1">
              &ldquo;{selectedItem.quote}&rdquo;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

