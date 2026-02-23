import { BidayatState, Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Sun, Moon, Sunset, Sunrise, Lock, X, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePrayerTimes } from '../hooks/usePrayerTimes';

interface DailyRoutineProps {
  state: BidayatState;
  onToggleTask: (id: string) => void;
}

export default function DailyRoutine({ state, onToggleTask }: DailyRoutineProps) {
  const timeGroups = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;
  const timeLabels: Record<string, string> = {
    'Morning': 'Pagi (Subuh - Dzuhur)',
    'Afternoon': 'Siang (Dzuhur - Maghrib)',
    'Evening': 'Petang (Maghrib - Isya)',
    'Night': 'Malam (Isya - Subuh)'
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { prayerTimes, locationError, isLoading } = usePrayerTimes();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Helper to parse "HH:MM" into a Date object for today
  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const isGroupActive = (group: string) => {
    if (!prayerTimes) return true; // Fallback to unlocked if API fails

    const now = currentTime.getTime();
    const fajr = parseTime(prayerTimes.Fajr).getTime();
    const dhuhr = parseTime(prayerTimes.Dhuhr).getTime();
    const maghrib = parseTime(prayerTimes.Maghrib).getTime();
    const isha = parseTime(prayerTimes.Isha).getTime();

    switch (group) {
      case 'Morning': return now >= fajr && now < dhuhr;
      case 'Afternoon': return now >= dhuhr && now < maghrib;
      case 'Evening': return now >= maghrib && now < isha;
      case 'Night': return now >= isha || now < fajr;
      default: return false;
    }
  };

  const handleTaskClick = (task: Task, isLocked: boolean) => {
    if (!isLocked) {
      setSelectedTask(task);
    }
  };

  const handleToggleFromModal = () => {
    if (selectedTask) {
      onToggleTask(selectedTask.id);
      setSelectedTask(null);
    }
  };

  const SectionHeader = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
    <div className="flex items-center gap-3 mb-6 mt-8 first:mt-0">
      <div className={`p-2.5 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon size={20} className={color.replace('bg-', 'text-')} />
      </div>
      <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-4"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Rutinitas Harian</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 md:mt-2 text-base md:text-lg">
          Panduan adab dan amalan dari bangun tidur hingga tidur kembali.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 inline-flex items-center gap-2">
            Waktu Saat Ini: <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </p>
          {isLoading ? (
            <p className="text-xs text-slate-400 animate-pulse">Menyesuaikan jadwal sholat lokal...</p>
          ) : prayerTimes ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <MapPin size={12} /> Jadwal sholat tersinkronisasi
            </p>
          ) : (
            <p className="text-xs text-amber-600 dark:text-amber-400">{locationError}</p>
          )}
        </div>
      </header>

      <div className="space-y-10">
        {timeGroups.map((time) => {
          const tasks = state.tasks.filter(t => t.timeOfDay === time);
          if (tasks.length === 0) return null;

          const isActive = isGroupActive(time);
          const isLocked = !isActive;
          
          let Icon = Sun;
          let color = "bg-amber-500 text-amber-600";
          
          if (time === 'Morning') { Icon = Sunrise; color = "bg-blue-500 text-blue-600"; }
          else if (time === 'Evening') { Icon = Sunset; color = "bg-orange-500 text-orange-600"; }
          else if (time === 'Night') { Icon = Moon; color = "bg-indigo-500 text-indigo-600"; }

          return (
            <section key={time} className={isLocked ? 'opacity-60 grayscale transition-all duration-500' : 'transition-all duration-500'}>
              <SectionHeader title={`${timeLabels[time]} ${isLocked ? '(Terkunci)' : ''}`} icon={Icon} color={color} />
              
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group relative p-4 md:p-5 rounded-2xl border transition-all duration-300 ${
                      task.completed 
                        ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30' 
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md dark:bg-slate-900/50 dark:border-slate-800 dark:hover:border-slate-700'
                    } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => handleTaskClick(task, isLocked)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 transition-colors duration-300 ${task.completed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400'}`}>
                        {isLocked ? <Lock size={24} /> : task.completed ? <CheckCircle2 size={24} className="fill-emerald-100 dark:fill-emerald-900/20" /> : <Circle size={24} />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                          <h3 className={`font-semibold text-base md:text-lg ${task.completed ? 'text-emerald-900 dark:text-emerald-400 line-through decoration-emerald-500/30' : 'text-slate-900 dark:text-white'}`}>
                            {task.title}
                          </h3>
                          {task.arabic && (
                            <span className="font-arabic text-base md:text-lg text-slate-500 dark:text-slate-400 sm:text-right dir-rtl">
                              {task.arabic}
                            </span>
                          )}
                        </div>
                        
                        <p className={`text-sm leading-relaxed ${task.completed ? 'text-emerald-700/70 dark:text-emerald-500/50' : 'text-slate-600 dark:text-slate-400'}`}>
                          {task.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Selection Glow */}
                    {task.completed && (
                      <motion.div
                        layoutId={`glow-${task.id}`}
                        className="absolute inset-0 rounded-2xl ring-1 ring-emerald-500/20 dark:ring-emerald-400/10 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Educational Popup Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 flex-shrink-0 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white pr-8">
                    {selectedTask.title}
                  </h3>
                  <button 
                    onClick={() => setSelectedTask(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full -mt-1 -mr-1"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-8 flex-1 overflow-y-auto">
                {selectedTask.arabic && (
                  <div className="mb-8 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                    <p className="font-arabic text-3xl text-center text-emerald-800 dark:text-emerald-200 leading-relaxed">
                      {selectedTask.arabic}
                    </p>
                  </div>
                )}

                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                    {selectedTask.description || "Lakukan adab ini dengan niat yang tulus karena Allah SWT."}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                <button
                  onClick={handleToggleFromModal}
                  className={`w-full py-4 px-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg
                    ${selectedTask.completed 
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-none'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] shadow-emerald-600/20'
                    }`}
                >
                  {selectedTask.completed ? (
                    <>
                      <Circle size={22} />
                      <span>Tandai Belum Selesai</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={22} />
                      <span>Tandai Selesai</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
