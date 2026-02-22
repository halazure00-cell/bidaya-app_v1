import { BidayatState, BodyPartScan, HeartDisease } from '../types';
import { motion, useAnimation } from 'motion/react';
import { Eye, Ear, MessageSquare, Utensils, User, Hand, Footprints, AlertTriangle, Shield, Activity, HeartPulse } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ScannerProps {
  state: BidayatState;
  onToggleBodyPart: (id: string) => void;
  onChangeHeartDisease: (id: string, level: number) => void;
}

export default function Scanner({ state, onToggleBodyPart, onChangeHeartDisease }: ScannerProps) {
  const [lastToggled, setLastToggled] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    onToggleBodyPart(id);
    const scan = state.bodyScans.find(s => s.id === id);
    if (scan && !scan.errorCommitted) { // Only set last toggled when a new error is committed
      setLastToggled(id);
    }
  };

  const getIcon = (part: string) => {
    switch (part) {
      case 'Mata': return Eye;
      case 'Telinga': return Ear;
      case 'Lisan': return MessageSquare;
      case 'Perut': return Utensils;
      case 'Kemaluan': return User;
      case 'Tangan': return Hand;
      case 'Kaki': return Footprints;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Muhasabah Diri</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 md:mt-2 text-base md:text-lg">
          Evaluasi anggota tubuh dan kondisi hati dari maksiat.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hardware Scanner (Body Parts) */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
              <Activity size={24} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Anggota Tubuh</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Jaga 7 anggota tubuh dari dosa.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 md:gap-4">
            {state.bodyScans.map((scan) => {
              const Icon = getIcon(scan.part);
              const controls = useAnimation();

              useEffect(() => {
                if (lastToggled === scan.id) {
                  controls.start({
                    x: [0, -5, 5, -5, 5, 0],
                    transition: { duration: 0.4, ease: 'easeInOut' }
                  });
                  setLastToggled(null); // Reset after animation
                }
              }, [lastToggled, scan.id, controls]);

              return (
                <motion.button
                  key={scan.id}
                  animate={controls}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleToggle(scan.id)}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-300 group overflow-hidden ${
                    scan.errorCommitted 
                      ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-900/30' 
                      : 'bg-slate-50 border-slate-200 hover:border-emerald-300 dark:bg-slate-800/50 dark:border-slate-700 dark:hover:border-emerald-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className={`p-2 rounded-lg ${
                      scan.errorCommitted 
                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' 
                        : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-400 group-hover:text-emerald-600 transition-colors'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <span className="font-arabic text-lg text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                      {scan.arabic}
                    </span>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className={`font-semibold ${scan.errorCommitted ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {scan.part}
                    </h3>
                    <p className={`text-xs mt-1 font-medium ${scan.errorCommitted ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                      {scan.errorCommitted ? 'Terjadi Maksiat' : 'Terjaga'}
                    </p>
                  </div>

                  {/* Background Fill Animation for Error */}
                  {scan.errorCommitted && (
                    <motion.div 
                      layoutId={`error-${scan.id}`}
                      className="absolute inset-0 bg-rose-100/50 dark:bg-rose-900/20 z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Core Malware (Heart Diseases) */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-rose-600 dark:text-rose-400">
              <HeartPulse size={24} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Penyakit Hati</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Deteksi dan obati virus hati.</p>
            </div>
          </div>

          <div className="space-y-8">
            {state.heartDiseases.map((disease) => (
              <div key={disease.id} className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base md:text-lg text-slate-800 dark:text-white flex items-center gap-2">
                      {disease.name}
                      {disease.level > 7 && <AlertTriangle size={16} className="text-rose-500 animate-pulse" />}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{disease.description}</p>
                  </div>
                  <span className="font-arabic text-xl text-slate-400 dark:text-slate-500">{disease.arabic}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-slate-400">
                    <span>Aman</span>
                    <span>Waspada</span>
                    <span>Bahaya</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={disease.level}
                    onChange={(e) => onChangeHeartDisease(disease.id, parseInt(e.target.value))}
                    className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    style={{
                      background: `linear-gradient(to right, 
                        #10b981 0%, 
                        #f59e0b 50%, 
                        #ef4444 100%)`
                    }}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-400">Level Intensitas</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      disease.level > 7 ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                      disease.level > 4 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {disease.level}/10
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
