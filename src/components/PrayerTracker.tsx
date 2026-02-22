import { BidayatState, PrayerLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Moon, Sun, Sunrise, Sunset, CloudSun, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import { useEffect, useState } from 'react';

interface PrayerTrackerProps {
  state: BidayatState;
  onTogglePrayer: (prayer: keyof Omit<PrayerLog, 'date'>, status: boolean) => void;
}

const prayers = [
  { id: 'subuh', label: 'Subuh', icon: Sunrise, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
  { id: 'dzuhur', label: 'Dzuhur', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
  { id: 'ashar', label: 'Ashar', icon: CloudSun, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
  { id: 'maghrib', label: 'Maghrib', icon: Sunset, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800' },
  { id: 'isya', label: 'Isya', icon: Moon, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800/50', border: 'border-slate-200 dark:border-slate-700' },
] as const;

export default function PrayerTracker({ state, onTogglePrayer }: PrayerTrackerProps) {
  const todayLog = state.todayPrayer || { date: new Date().toISOString().split('T')[0], subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 };
  
  // Calculate stats
  const completedCount = prayers.reduce((acc, p) => acc + (todayLog[p.id] ? 1 : 0), 0);
  const progress = (completedCount / 5) * 100;

  const [allPrayersDone, setAllPrayersDone] = useState(false);

  useEffect(() => {
    const justCompleted = completedCount === 5 && !allPrayersDone;
    if (justCompleted) {
      // Trigger animation
    }
    setAllPrayersDone(completedCount === 5);
  }, [completedCount, allPrayersDone]);

  // Prepare chart data (Last 7 days)
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const chartData = last7Days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = state.prayerStats?.find(p => p.date === dateStr);
    const count = log ? (log.subuh + log.dzuhur + log.ashar + log.maghrib + log.isya) : 0;
    return {
      day: format(date, 'EEE', { locale: id }),
      count: count,
      fullDate: format(date, 'dd MMM yyyy', { locale: id })
    };
  });

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sholat Wajib</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 md:mt-2 text-base md:text-lg">
          Jagalah sholatmu, karena ia adalah tiang agama.
        </p>
      </header>

      {/* Today's Tracker */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Hari Ini</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}
            </p>
          </div>
          <div className="text-right">
             <span className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}/5</span>
             <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Selesai</p>
          </div>
        </div>

        <AnimatePresence>
          {allPrayersDone && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
              className="absolute top-6 right-6 p-3 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full text-emerald-500 dark:text-emerald-400"
            >
              <Star size={24} className="fill-current" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
                <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
            </motion.div>
          </div>
        </div>

        {/* Prayer Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4 z-10 relative">
          {prayers.map((prayer, index) => {
            const isCompleted = Boolean(todayLog[prayer.id]);
            const Icon = prayer.icon;

            return (
              <motion.button
                key={prayer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onTogglePrayer(prayer.id, !isCompleted)}
                className={`relative p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 md:gap-4 group
                  ${isCompleted 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' 
                    : `${prayer.bg} ${prayer.border} hover:border-slate-300 dark:hover:border-slate-600`
                  }
                `}
              >
                <div className={`p-2 md:p-3 rounded-xl transition-colors ${isCompleted ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-white dark:bg-slate-800 ' + prayer.color}`}>
                  <Icon size={24} />
                </div>
                
                <span className={`font-bold text-base md:text-lg ${isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {prayer.label}
                </span>

                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center transition-colors
                  ${isCompleted 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-slate-300 dark:border-slate-600 text-transparent'
                  }`}
                >
                  <Check size={16} strokeWidth={4} />
                </div>

                {isCompleted && (
                  <motion.div
                    layoutId="outline"
                    className="absolute inset-0 rounded-2xl border-2 border-emerald-500 pointer-events-none"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Statistik Mingguan</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Sempurna</span>
              <div className="w-3 h-3 rounded-full bg-blue-500 ml-2"></div>
              <span>Terisi</span>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis hide domain={[0, 5]} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white text-xs py-2 px-3 rounded-lg shadow-xl border border-slate-700">
                          <p className="font-bold mb-1 text-emerald-400">{payload[0].payload.fullDate}</p>
                          <p className="font-medium">Selesai: {payload[0].value}/5 Sholat</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.count === 5 ? '#10b981' : entry.count === 0 ? '#e2e8f0' : '#3b82f6'} 
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Summary Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h3 className="text-lg font-medium opacity-90 mb-1">Total Sholat</h3>
            <p className="text-sm opacity-70">Bulan Ini</p>
          </div>
          
          <div className="my-8 relative z-10">
            <div className="text-6xl font-bold mb-2 tracking-tight">
              {state.prayerStats?.reduce((acc, curr) => {
                // Filter for current month only (simple approximation for now)
                return acc + (curr.subuh + curr.dzuhur + curr.ashar + curr.maghrib + curr.isya);
              }, 0) || 0}
            </div>
            <div className="text-sm font-medium opacity-80 bg-white/10 inline-block px-3 py-1 rounded-full">Rakaat Terjaga</div>
          </div>

          <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/10 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
              <span className="text-sm font-bold">Konsistensi</span>
            </div>
            <p className="text-xs opacity-80 leading-relaxed font-medium">
              "Amalan yang paling dicintai Allah adalah yang terus-menerus (istiqomah) meskipun sedikit."
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
