import { BidayatState, WiridLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Plus, Minus, Fingerprint, X, Maximize2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import ConfirmationModal from './ConfirmationModal';

interface WiridProps {
  state: BidayatState;
  onUpdateWirid: (id: string, count: number) => void;
}

export default function Wirid({ state, onUpdateWirid }: WiridProps) {
  const [selectedWirid, setSelectedWirid] = useState<WiridLog | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Update selectedWirid when state changes to keep the modal in sync
  useEffect(() => {
    if (selectedWirid) {
      const updated = state.wiridLogs.find(w => w.id === selectedWirid.id);
      if (updated) setSelectedWirid(updated);
    }
  }, [state.wiridLogs, selectedWirid]);

  const handleUpdate = (id: string, newCount: number, target: number) => {
    onUpdateWirid(id, newCount);
    
    // Trigger confetti if target reached
    if (newCount === target) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B', '#3B82F6']
      });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto h-full flex flex-col pb-10">
      <header className="text-center flex-shrink-0">
        <div className="inline-flex items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-4">
          <Fingerprint className="text-emerald-600 dark:text-emerald-400" size={32} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Wirid & Dzikir</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 md:mt-2 font-arabic text-lg md:text-xl">الأوراد والأذكار</p>
        <p className="text-sm text-slate-500 mt-4 max-w-2xl mx-auto leading-relaxed">
          "Dan bertasbihlah kepada-Nya di waktu pagi dan petang." (QS. Al-Ahzab: 42)
        </p>
      </header>

      {/* Horizontal Scroll Container */}
      {state.wiridLogs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto"
          >
            <div className="inline-flex items-center justify-center p-5 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-6 ring-8 ring-amber-50 dark:ring-amber-900/10">
              <Fingerprint className="text-amber-500 dark:text-amber-400" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Hati yang Tenang</h2>
            <p className="font-arabic text-xl text-slate-500 dark:text-slate-400 mb-4">
              أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              "Ingatlah, hanya dengan mengingat Allah-lah hati menjadi tenteram." <br/> (QS. Ar-Ra'd: 28)
            </p>
            <p className="text-xs text-slate-400 mt-6 font-medium">
              Data wirid akan muncul di sini setelah diinisialisasi.
            </p>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex items-center overflow-x-auto pb-8 pt-4 px-4 snap-x snap-mandatory gap-6 no-scrollbar">
          {state.wiridLogs.map((wirid, index) => {
            const progress = Math.min(100, (wirid.count / wirid.target) * 100);
            const isCompleted = wirid.count >= wirid.target;

            return (
              <motion.div
                key={wirid.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedWirid(wirid)}
                className={`flex-shrink-0 w-[80vw] sm:w-[320px] md:w-[350px] snap-center bg-white dark:bg-slate-800 rounded-3xl p-4 md:p-6 shadow-sm border relative overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-md
                  ${isCompleted 
                    ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                    : 'border-slate-100 dark:border-slate-700'
                  }`}
              >
                {/* Progress Ring Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <div 
                    className={`w-64 h-64 rounded-full border-[20px] transition-all duration-500 ${isCompleted ? 'border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}
                    style={{ clipPath: `inset(${100 - progress}% 0 0 0)` }}
                  ></div>
                </div>

                <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors">
                  <Maximize2 size={20} />
                </div>

                <div className="flex flex-col items-center text-center h-full justify-between py-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-2">{wirid.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Target: {wirid.target}</p>
                  </div>

                  <div className="relative my-6">
                    <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center shadow-inner border-4 transition-colors duration-500
                      ${isCompleted 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span className={`text-4xl md:text-5xl font-mono font-bold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {wirid.count}
                      </span>
                    </div>
                    {isCompleted && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1"
                      >
                        <Check size={12} strokeWidth={3} />
                        SELESAI
                      </motion.div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleUpdate(wirid.id, Math.max(0, wirid.count - 1), wirid.target)}
                      className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Minus size={24} />
                    </button>
                    
                    <button
                      onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(20);
                        handleUpdate(wirid.id, wirid.count + 1, wirid.target);
                      }}
                      className={`flex-1 py-4 rounded-2xl text-white font-bold text-xl active:scale-95 transition-all shadow-lg flex items-center justify-center
                        ${isCompleted 
                          ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' 
                          : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-600 dark:hover:bg-slate-500'
                        }`}
                    >
                      <Plus size={28} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detailed Modal View */}
      <AnimatePresence>
        {selectedWirid && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedWirid(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Detail Wirid</h3>
                <button 
                  onClick={() => setSelectedWirid(null)}
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={24} className="text-slate-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 flex-1 overflow-y-auto flex flex-col items-center">
                <div className="w-full text-center mb-8">
                  <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">{selectedWirid.name}</h2>
                  {selectedWirid.arabic && (
                    <p className="text-4xl font-arabic text-slate-800 dark:text-slate-200 my-6 leading-relaxed">
                      {selectedWirid.arabic}
                    </p>
                  )}
                  {selectedWirid.description && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      {selectedWirid.description}
                    </p>
                  )}
                </div>

                {/* Large Counter */}
                <div 
                  className="flex-1 flex items-center justify-center w-full py-8 cursor-pointer select-none"
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(20);
                    handleUpdate(selectedWirid.id, selectedWirid.count + 1, selectedWirid.target);
                  }}
                >
                  <div className={`w-48 h-48 rounded-full flex items-center justify-center shadow-2xl border-8 transition-all duration-300 active:scale-95
                    ${selectedWirid.count >= selectedWirid.target 
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/40' 
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white'
                    }`}
                  >
                    <span className="text-7xl font-mono font-bold">
                      {selectedWirid.count}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-400 mb-4">Ketuk lingkaran untuk menambah</p>
              </div>

              {/* Modal Footer Controls */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleUpdate(selectedWirid.id, Math.max(0, selectedWirid.count - 1), selectedWirid.target)}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
                  >
                    <Minus size={24} />
                  </button>

                  <button
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="flex-1 py-4 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={20} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          if (selectedWirid) {
            handleUpdate(selectedWirid.id, 0, selectedWirid.target);
          }
        }}
        title="Reset Wirid?"
        message={`Apakah Anda yakin ingin mereset hitungan ${selectedWirid?.name || 'ini'} menjadi 0?`}
        confirmText="Reset"
        cancelText="Batal"
        isDanger={true}
      />
    </div>
  );
}
