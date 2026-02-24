import { BidayatState } from '../types';
import { Battery, BatteryWarning, Flame, ShieldAlert, ShieldCheck, Zap, Heart, RotateCcw, Quote, Bell, X, RefreshCw, Info, Star, Award, TrendingUp, Calendar, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { quotes } from '../data/quotes';
import moment from 'moment-hijri';
import { generateDailyNasihat } from '../services/geminiService';

interface DashboardProps {
  state: BidayatState;
  onReset: () => void;
}

export default function Dashboard({ state, onReset }: DashboardProps) {
  const userStats = state.userStats || { level: 1, xp: 0, streak: 0, totalGoodDeeds: 0, totalSinsAvoided: 0 };
  const xpForNextLevel = Math.pow(userStats.level, 2) * 100;
  const xpProgress = (userStats.xp / xpForNextLevel) * 100;

  // --- Advanced Battery Logic (Cahaya Amal) ---
  
  // 1. Prayer Score (Weight: 30%)
  // 5 Daily Prayers.
  const prayers = state.todayPrayer || { subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 };
  const prayerCount = (prayers.subuh + prayers.dzuhur + prayers.ashar + prayers.maghrib + prayers.isya);
  const prayerScore = (prayerCount / 5) * 100;
  const prayerWeight = 0.30;

  // 2. Routine Score (Weight: 20%)
  // Daily Tasks (Adab harian)
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.completed).length;
  const routineScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const routineWeight = 0.20;

  // 3. Muhasabah Score (Weight: 20%)
  // Body Scans (Avoiding Sins). Note: errorCommitted = true means SIN committed.
  // So we count parts that are SAFE (!errorCommitted).
  const totalBodyParts = state.bodyScans.length;
  const safeBodyParts = state.bodyScans.filter(b => !b.errorCommitted).length;
  const muhasabahScore = totalBodyParts > 0 ? (safeBodyParts / totalBodyParts) * 100 : 0;
  const muhasabahWeight = 0.20;

  // 4. Adab Score (Weight: 15%)
  // Network Protocols (Adab & Muamalah)
  const totalAdab = state.networkProtocols.length;
  const completedAdab = state.networkProtocols.filter(p => p.completed).length;
  const adabScore = totalAdab > 0 ? (completedAdab / totalAdab) * 100 : 0;
  const adabWeight = 0.15;

  // 5. Wirid Score (Weight: 15%)
  // Wirid Logs (Target achievement)
  const totalWirid = state.wiridLogs.length;
  const completedWirid = state.wiridLogs.filter(w => w.count >= w.target).length;
  const wiridScore = totalWirid > 0 ? (completedWirid / totalWirid) * 100 : 0;
  const wiridWeight = 0.15;

  // Calculate Base Score (Weighted Sum)
  const baseScore = (
    (prayerScore * prayerWeight) +
    (routineScore * routineWeight) +
    (muhasabahScore * muhasabahWeight) +
    (adabScore * adabWeight) +
    (wiridScore * wiridWeight)
  );

  // --- Corruption Factor (Heart Diseases) ---
  const hasad = state.heartDiseases.find(d => d.name.includes('Hasad'))?.level || 1;
  const riya = state.heartDiseases.find(d => d.name.includes('Riya'))?.level || 1;
  const ujub = state.heartDiseases.find(d => d.name.includes('Ujub'))?.level || 1;
  
  // Max disease level determines the severity of the "leak"
  const maxDiseaseLevel = Math.max(hasad, riya, ujub);
  
  // Corruption Multiplier:
  // Level 1 (Min) -> 0% corruption -> Multiplier 1.0
  // Level 10 (Max) -> 50% corruption (Amal reduced by half) -> Multiplier 0.5
  // Formula: 1 - ((Level - 1) / 9) * 0.5
  const corruptionSeverity = 0.5; // Max 50% reduction
  const corruptionFactor = ((maxDiseaseLevel - 1) / 9) * corruptionSeverity;
  const finalScoreMultiplier = 1 - corruptionFactor;

  const finalBatteryPercentage = Math.round(baseScore * finalScoreMultiplier);

  // Status Checks
  const isHasadActive = hasad > 4; // Warning threshold
  const isHighMalware = maxDiseaseLevel > 7;

  // Colors
  const batteryFillColor = isHasadActive 
    ? 'bg-gradient-to-t from-red-600 to-orange-500' 
    : 'bg-gradient-to-t from-emerald-600 to-teal-400';
    
  const glowColor = isHasadActive ? 'shadow-red-500/50' : 'shadow-emerald-500/50';

  // Dynamic Quote State
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [isQuoteVisible, setIsQuoteVisible] = useState(true);
  const [isAiQuote, setIsAiQuote] = useState(false);
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  
  // Time & Date State
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Hijri Date
  // moment-hijri uses 'i' prefix for Hijri formatting tokens
  const hijriDate = moment(currentTime).format('iD iMMMM iYYYY');
  const gregorianDate = moment(currentTime).format('D MMMM YYYY');
  const timeString = moment(currentTime).format('HH:mm');
  const secondsString = moment(currentTime).format('ss');

  useEffect(() => {
    // Try to get AI Nasihat first
    const fetchAiNasihat = async () => {
      if (!process.env.GEMINI_API_KEY) {
        setFallbackQuote();
        return;
      }
      
      try {
        setIsGeneratingQuote(true);
        const nasihat = await generateDailyNasihat(state);
        setCurrentQuote(nasihat);
        setIsAiQuote(true);
      } catch (error) {
        console.error("Failed to get AI Nasihat:", error);
        setFallbackQuote();
      } finally {
        setIsGeneratingQuote(false);
      }
    };

    fetchAiNasihat();
  }, [hasad, riya, ujub]);

  const setFallbackQuote = () => {
    setIsAiQuote(false);
    let relevantQuotes = quotes;
    
    if (hasad > 6) {
      relevantQuotes = quotes.filter(q => q.translation.toLowerCase().includes('hasad') || q.translation.toLowerCase().includes('dengki'));
    } else if (riya > 6) {
      relevantQuotes = quotes.filter(q => q.translation.toLowerCase().includes('riya') || q.translation.toLowerCase().includes('pamer'));
    } else if (ujub > 6) {
      relevantQuotes = quotes.filter(q => q.translation.toLowerCase().includes('ujub') || q.translation.toLowerCase().includes('bangga'));
    }
    
    if (relevantQuotes.length === 0) relevantQuotes = quotes;
    const randomIndex = Math.floor(Math.random() * relevantQuotes.length);
    setCurrentQuote(relevantQuotes[randomIndex]);
  };

  const refreshQuote = async () => {
    setIsQuoteVisible(false);
    
    if (process.env.GEMINI_API_KEY) {
      try {
        setIsGeneratingQuote(true);
        const nasihat = await generateDailyNasihat(state);
        setCurrentQuote(nasihat);
        setIsAiQuote(true);
        setIsQuoteVisible(true);
        setIsGeneratingQuote(false);
        return;
      } catch (error) {
        console.error("Failed to get AI Nasihat:", error);
      }
    }

    // Fallback to static quotes
    setTimeout(() => {
      setFallbackQuote();
      setIsQuoteVisible(true);
      setIsGeneratingQuote(false);
    }, 300);
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Ahwalul Qalb</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 md:mt-2 text-base md:text-lg">Ringkasan keadaan hati dan kualitas amal hari ini.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Minimalist Time & Date Widget */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex flex-col items-end border-r border-slate-200 dark:border-slate-700 pr-3">
              <div className="flex items-baseline gap-1 text-slate-900 dark:text-white">
                <span className="text-xl font-bold tracking-tight">{timeString}</span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-4">{secondsString}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{hijriDate} H</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{gregorianDate}</span>
            </div>
          </div>

          <button
            onClick={onReset}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800 transition-all shadow-sm hover:shadow active:scale-95 h-full"
            title="Reset all progress data"
          >
            <RotateCcw size={18} className="group-hover:-rotate-180 transition-transform duration-500" />
            <span className="font-medium text-sm">Reset Data</span>
          </button>
        </div>
      </header>

      {/* User Stats Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-4"
        >
          <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Level {userStats.level}</p>
            <div className="flex items-center gap-2">
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-16">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(xpProgress, 100)}%` }}></div>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{userStats.xp} XP</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-4"
        >
          <div className="p-3 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-xl">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Streak</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{userStats.streak} Hari</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-4"
        >
          <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl">
            <Star size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Amal Baik</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{userStats.totalGoodDeeds}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-4"
        >
          <div className="p-3 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Dosa Dihindari</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{userStats.totalSinsAvoided}</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Battery Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className={`p-6 md:p-8 rounded-3xl border transition-colors duration-500 ${isHasadActive ? 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50' : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800'} shadow-sm`}
        >
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
              <div className={`p-2.5 rounded-xl ${isHasadActive ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                <Zap size={24} />
              </div>
              Cahaya Amal
            </h2>
            <div className="text-right">
              <span className={`text-3xl md:text-4xl font-bold tracking-tight ${isHasadActive ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {finalBatteryPercentage}%
              </span>
              {corruptionFactor > 0 && (
                <p className="text-xs text-red-500 font-bold mt-1">-{Math.round(corruptionFactor * 100)}% (Penyakit Hati)</p>
              )}
            </div>
          </div>

          <div className="flex justify-center py-4 md:py-6 relative mb-6 md:mb-8">
            {/* Battery Container */}
            <div className="relative w-32 h-64 md:w-40 md:h-72 rounded-[2rem] border-[6px] md:border-[8px] border-slate-200 dark:border-slate-700 p-2 md:p-3 flex flex-col justify-end overflow-hidden bg-slate-50 dark:bg-slate-800/50">
              {/* Battery Terminal */}
              <div className="absolute -top-5 md:-top-6 left-1/2 -translate-x-1/2 w-12 md:w-16 h-4 md:h-5 bg-slate-200 dark:bg-slate-700 rounded-t-lg md:rounded-t-xl"></div>
              
              {/* Battery Fill */}
              <motion.div 
                className={`w-full rounded-xl ${batteryFillColor} shadow-[0_0_30px_rgba(0,0,0,0.15)] ${glowColor} relative z-10`}
                initial={{ height: 0 }}
                animate={{ height: `${finalBatteryPercentage}%` }}
                transition={{ type: 'spring', bounce: 0.4, duration: 1.5 }}
              >
                 <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
              </motion.div>

              {/* Fire Animation Overlay for Hasad */}
              {isHasadActive && (
                <div className="absolute inset-0 flex items-end justify-center z-20 pb-4 opacity-80 pointer-events-none">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7] 
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                  >
                    <Flame className="text-orange-500 w-20 h-20 drop-shadow-lg filter blur-[1px]" fill="currentColor" />
                  </motion.div>
                </div>
              )}
            </div>
          </div>
          
          {/* Breakdown Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-5 gap-2 mt-8 text-center text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
          >
             <div className="flex flex-col items-center gap-2 group">
               <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} className="w-full bg-blue-500 rounded-full origin-bottom transition-all duration-1000" style={{ transform: `scaleY(${prayerScore / 100})` }}></motion.div>
               </div>
               <span>Sholat</span>
             </div>
             <div className="flex flex-col items-center gap-2 group">
               <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} className="w-full bg-emerald-500 rounded-full origin-bottom transition-all duration-1000" style={{ transform: `scaleY(${routineScore / 100})` }}></motion.div>
               </div>
               <span>Amalan</span>
             </div>
             <div className="flex flex-col items-center gap-2 group">
               <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} className="w-full bg-purple-500 rounded-full origin-bottom transition-all duration-1000" style={{ transform: `scaleY(${muhasabahScore / 100})` }}></motion.div>
               </div>
               <span>Muhasabah</span>
             </div>
             <div className="flex flex-col items-center gap-2 group">
               <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} className="w-full bg-amber-500 rounded-full origin-bottom transition-all duration-1000" style={{ transform: `scaleY(${adabScore / 100})` }}></motion.div>
               </div>
               <span>Adab</span>
             </div>
             <div className="flex flex-col items-center gap-2 group">
               <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} className="w-full bg-teal-500 rounded-full origin-bottom transition-all duration-1000" style={{ transform: `scaleY(${wiridScore / 100})` }}></motion.div>
               </div>
               <span>Wirid</span>
             </div>
          </motion.div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6 font-medium bg-slate-50 dark:bg-slate-800/50 py-3 px-4 rounded-xl">
            {isHasadActive 
              ? "PERINGATAN: Hasad sedang membakar amal kebaikan Anda!" 
              : "Amal terjaga. Semoga menjadi cahaya penerang hati."}
          </p>
        </motion.div>

        {/* Malware Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
              <div className={`p-2.5 rounded-xl ${isHighMalware ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                {isHighMalware ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
              </div>
              Status Penyakit Hati
            </h2>
          </div>

          <div className="space-y-8 flex-1">
            {state.heartDiseases.map((disease) => (
              <div key={disease.id} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-lg">{disease.name}</span>
                    <span className="ml-2 text-sm text-slate-500 font-arabic">{disease.arabic}</span>
                  </div>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${disease.level > 7 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                    Level {disease.level}/10
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full rounded-full ${disease.level > 7 ? 'bg-red-600' : disease.level > 4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(disease.level / 10) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Quote Notification */}
          <AnimatePresence mode="wait">
            {isQuoteVisible && (
              <motion.div 
                key={currentQuote.arabic}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mt-10 relative p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-100 dark:border-indigo-800/30 overflow-hidden group hover:shadow-md transition-all"
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Bell size={80} className="text-indigo-600 dark:text-indigo-400 -rotate-12" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAiQuote ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'}`}>
                        {isAiQuote ? <Sparkles size={16} /> : <Bell size={16} />}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${isAiQuote ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-500 dark:text-indigo-300'}`}>
                        {isAiQuote ? 'Nasihat AI Personal' : 'Nasihat Hari Ini'}
                      </span>
                    </div>
                    <button 
                      onClick={refreshQuote}
                      disabled={isGeneratingQuote}
                      className={`p-1.5 rounded-full transition-colors ${isAiQuote ? 'hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-400' : 'hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-400'} ${isGeneratingQuote ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Nasihat Baru"
                    >
                      <RefreshCw size={14} className={isGeneratingQuote ? 'animate-spin' : ''} />
                    </button>
                  </div>
                  
                  <div className="text-center px-2">
                    <p className="font-arabic text-xl text-slate-800 dark:text-indigo-100 mb-3 leading-loose drop-shadow-sm">
                      "{currentQuote.arabic}"
                    </p>
                    
                    <div className="h-px w-12 bg-indigo-200 dark:bg-indigo-800/50 mx-auto mb-3"></div>
                    
                    <p className="text-sm text-slate-600 dark:text-indigo-200/80 font-medium italic">
                      "{currentQuote.translation}"
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
