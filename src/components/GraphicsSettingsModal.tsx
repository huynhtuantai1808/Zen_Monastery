import React from 'react';
import { X, Sparkles, Zap, Check, Monitor, Sliders } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { GraphicsQuality } from '../types/game';

interface GraphicsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GraphicsSettingsModal: React.FC<GraphicsSettingsModalProps> = ({ isOpen, onClose }) => {
  const { graphicsQuality, setGraphicsQuality } = useGameStore();

  if (!isOpen) return null;

  const handleSelect = (quality: GraphicsQuality) => {
    setGraphicsQuality(quality);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-stone-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl text-stone-100 overflow-hidden font-sans">
        {/* Glow corner decorations */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-amber-200">Cài Đặt Đồ Họa & Hiệu Năng</h2>
              <p className="text-xs text-stone-400 font-serif">Tùy chỉnh để tối ưu FPS hoặc độ sắc nét của hình ảnh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="mt-5 space-y-3.5">
          {/* Low Quality Option */}
          <div
            onClick={() => handleSelect('LOW')}
            className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 ${
              graphicsQuality === 'LOW'
                ? 'bg-amber-950/30 border-amber-500/80 ring-2 ring-amber-500/20'
                : 'bg-stone-950/40 border-stone-800 hover:border-stone-700 hover:bg-stone-800/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${graphicsQuality === 'LOW' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-stone-800 text-stone-400'}`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-stone-100">Đồ họa Tiết Kiệm (Thấp)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Tối ưu mượt mà ⚡
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Độ phân giải 1.0x, tắt bóng động phức tạp. Giảm tải GPU & nhiệt độ máy, tối đa hóa FPS.
                  </p>
                </div>
              </div>
              {graphicsQuality === 'LOW' && (
                <div className="p-1 rounded-full bg-amber-500 text-stone-950">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-stone-800/60 grid grid-cols-2 gap-2 text-[11px] text-stone-400">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">•</span> Pixel Ratio: 1.0 (Tiêu chuẩn)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">•</span> Bóng đổ động: Tắt
              </div>
            </div>
          </div>

          {/* High Quality Option */}
          <div
            onClick={() => handleSelect('HIGH')}
            className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 ${
              graphicsQuality === 'HIGH'
                ? 'bg-amber-950/30 border-amber-500/80 ring-2 ring-amber-500/20'
                : 'bg-stone-950/40 border-stone-800 hover:border-stone-700 hover:bg-stone-800/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${graphicsQuality === 'HIGH' ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-800 text-stone-400'}`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-stone-100">Đồ họa Tiêu Chuẩn (Cao)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Sắc nét ✨
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Độ phân giải 1.25x, bóng đổ PCF Shadow Map 1024x1024 tối ưu (không giật lag GPU).
                  </p>
                </div>
              </div>
              {graphicsQuality === 'HIGH' && (
                <div className="p-1 rounded-full bg-amber-500 text-stone-950">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-stone-800/60 grid grid-cols-2 gap-2 text-[11px] text-stone-400">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">•</span> Pixel Ratio: 1.25x (Khử răng cưa)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">•</span> Bóng đổ PCF: 1024x1024
              </div>
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="mt-5 p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-center gap-2.5 text-xs text-stone-400">
          <Monitor className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Cài đặt được lưu tự động vào trình duyệt và áp dụng tức thì.</span>
        </div>

        {/* Close button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-serif font-bold text-xs transition-all shadow-md active:scale-95"
          >
            Đóng & Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
};

