import { useState, useEffect } from 'react';
import { Activity, CheckSquare, LayoutDashboard, Moon, Sun, RotateCcw, Fingerprint, RotateCw, Sunrise, HandHeart, Settings, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import DailyRoutine from './components/DailyRoutine';
import Scanner from './components/Scanner';
import Wirid from './components/Wirid';
import PrayerTracker from './components/PrayerTracker';
import AdabTracker from './components/AdabTracker';
import SettingsPanel from './components/SettingsPanel';
import AIMuhasabah from './components/AIMuhasabah';
import ConfirmationModal from './components/ConfirmationModal';
import Toast, { ToastType } from './components/Toast';
import { BidayatState, PrayerLog } from './types';
import ErrorBoundary from './components/ErrorBoundary';
import { store, addXP } from './lib/store';

type Tab = 'dashboard' | 'prayer' | 'routine' | 'scanner' | 'adab' | 'wirid' | 'settings';

export default function App() {
  const [state, setState] = useState<BidayatState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Initialize dark mode from localStorage or system preference
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });
  
  // UI State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string | null; type: ToastType }>({ message: null, type: 'success' });

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const loadState = async () => {
    setIsLoading(true);
    try {
      // Try to sync from Supabase first
      const syncedState = await store.syncFromSupabase();
      if (syncedState) {
        setState(syncedState);
      } else {
        // Fallback to local storage
        const localState = store.getState();
        setState(localState);
      }
    } catch (err: any) {
      console.error('Failed to load state:', err);
      setError('Gagal memuat data dari penyimpanan lokal.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadState();
    
    // Check for restart flag
    if (sessionStorage.getItem('justRestarted')) {
      showToast('Aplikasi berhasil dimuat ulang.', 'success');
      sessionStorage.removeItem('justRestarted');
    }
  }, []);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  // Handlers to update state locally
  const toggleTask = (id: string) => {
    if (!state) return;
    const task = state.tasks.find(t => t.id === id);
    const isCompleting = !task?.completed;
    
    let newState = {
      ...state,
      tasks: state.tasks.map(t => t.id === id ? { ...t, completed: isCompleting } : t)
    };

    if (isCompleting) {
      newState = addXP(newState, 10);
      if (newState.userStats) newState.userStats.totalGoodDeeds += 1;
      showToast('Alhamdulillah, +10 XP', 'success');
    }

    setState(newState);
    store.saveState(newState);
  };

  const toggleBodyPart = (id: string) => {
    if (!state) return;
    const scan = state.bodyScans.find(b => b.id === id);
    const isCommittingError = !scan?.errorCommitted;

    let newState = {
      ...state,
      bodyScans: state.bodyScans.map(b => b.id === id ? { ...b, errorCommitted: isCommittingError } : b)
    };

    if (isCommittingError) {
      // Penalty or just record it
      showToast('Astaghfirullah, perbanyak istighfar.', 'error');
    } else {
      // Undoing an error, maybe they repented
      newState = addXP(newState, 5);
      if (newState.userStats) newState.userStats.totalSinsAvoided += 1;
    }

    setState(newState);
    store.saveState(newState);
  };

  const changeHeartDisease = (id: string, level: number) => {
    if (!state) return;
    const newState = {
      ...state,
      heartDiseases: state.heartDiseases.map(h => h.id === id ? { ...h, level } : h)
    };
    setState(newState);
    store.saveState(newState);
  };

  const updateWirid = (id: string, count: number) => {
    if (!state) return;
    const wirid = state.wiridLogs.find(w => w.id === id);
    const wasCompleted = wirid ? wirid.count >= wirid.target : false;
    const isCompleted = wirid ? count >= wirid.target : false;

    let newState = {
      ...state,
      wiridLogs: state.wiridLogs.map(w => w.id === id ? { ...w, count, lastUpdated: new Date().toISOString() } : w)
    };

    if (!wasCompleted && isCompleted) {
      newState = addXP(newState, 10);
      if (newState.userStats) newState.userStats.totalGoodDeeds += 1;
      showToast('Alhamdulillah, Target Wirid Tercapai! +10 XP', 'success');
    }

    setState(newState);
    store.saveState(newState);
  };

  const togglePrayer = (prayer: keyof Omit<PrayerLog, 'date'>, status: boolean) => {
    if (!state || !state.todayPrayer) return;
    const val = status ? 1 : 0;
    
    let newState: BidayatState = {
      ...state,
      todayPrayer: { ...state.todayPrayer, [prayer]: val },
      prayerStats: state.prayerStats?.map(p => p.date === state.todayPrayer!.date ? { ...p, [prayer]: val } : p) || []
    };

    if (status) {
      newState = addXP(newState, 20); // Prayers give more XP
      if (newState.userStats) newState.userStats.totalGoodDeeds += 1;
      showToast('Alhamdulillah, +20 XP', 'success');
    }

    setState(newState);
    store.saveState(newState);
  };

  const toggleProtocol = (id: string) => {
    if (!state) return;
    const protocol = state.networkProtocols.find(p => p.id === id);
    const isCompleting = !protocol?.completed;

    let newState = {
      ...state,
      networkProtocols: state.networkProtocols.map(p => p.id === id ? { ...p, completed: isCompleting } : p)
    };

    if (isCompleting) {
      newState = addXP(newState, 15);
      if (newState.userStats) newState.userStats.totalGoodDeeds += 1;
      showToast('Alhamdulillah, +15 XP', 'success');
    }

    setState(newState);
    store.saveState(newState);
  };

  const handleResetClick = () => {
    setIsResetModalOpen(true);
  };

  const confirmReset = () => {
    try {
      const resetState = store.resetState();
      setState(resetState);
      showToast('Data berhasil di-reset.', 'success');
    } catch (error) {
      console.error('Failed to reset data:', error);
      showToast('Gagal me-reset data. Silakan coba lagi.', 'error');
    }
  };

  const handleRestartClick = () => {
    setIsRestartModalOpen(true);
  };

  const confirmRestart = () => {
    sessionStorage.setItem('justRestarted', 'true');
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold font-arabic text-2xl">
            ب
          </div>
          <p className="text-sm font-medium opacity-70">Loading Bidaya...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="text-center p-8 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto">
           <div className="inline-flex items-center justify-center p-5 bg-red-100 dark:bg-red-900/20 rounded-full mb-6 ring-8 ring-red-50 dark:ring-red-900/10">
              <RotateCcw className="text-red-500 dark:text-red-400" size={40} />
            </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Oops! Terjadi Kesalahan</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {error}
          </p>
          <button 
            onClick={loadState}
            className="mt-8 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 active:scale-95">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!state) {
    // This case should ideally not be reached if loading and error states are handled properly,
    // but it's a good safeguard.
    return null;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'prayer', label: 'Sholat', icon: Sunrise },
    { id: 'routine', label: 'Amalan', icon: CheckSquare },
    { id: 'scanner', label: 'Muhasabah', icon: Activity },
    { id: 'adab', label: 'Adab', icon: HandHeart },
    { id: 'wirid', label: 'Wirid', icon: Fingerprint },
  ] as const;

  return (
    <ErrorBoundary>
      <div className="min-h-screen transition-colors duration-300">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 flex flex-col md:flex-row">
        
        {/* Sidebar Navigation */}
        <nav className="md:w-72 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 md:p-6 flex flex-col shadow-sm z-10">
          <div className="flex items-center justify-between md:justify-start gap-4 mb-8 md:mb-10 md:px-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold font-arabic text-2xl shadow-lg shadow-emerald-500/20">
                ب
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Bidaya</h1>
                <p className="hidden md:block text-sm text-slate-500 dark:text-slate-400 font-medium">Sistem Operasi Hati</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 md:hidden">
              <button 
                onClick={() => setActiveTab('settings')}
                className={`p-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                title="Pengaturan"
              >
                <Settings size={18} />
              </button>
              <button 
                onClick={handleRestartClick}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                title="Restart Aplikasi"
              >
                <RotateCw size={18} />
              </button>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
              </button>
            </div>
          </div>

          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3.5 px-4 py-4 md:py-3.5 rounded-xl transition-all duration-200 whitespace-nowrap group relative overflow-hidden flex-1 md:flex-none justify-center md:justify-start ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-semibold shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full"
                    />
                  )}
                  <Icon size={24} className={`transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                  <span className="hidden md:block text-base">{tab.label}</span>
                </button>
              );
            })}
          </div>
          
          <div className="mt-auto hidden md:flex flex-col gap-4">
             <div className="flex items-center justify-between px-2 py-2 border-t border-slate-100 dark:border-slate-800/50 pt-6">
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                  <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className={`p-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    title="Pengaturan"
                  >
                    <Settings size={18} />
                  </button>
                  <button 
                    onClick={handleRestartClick}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    title="Restart Application"
                  >
                    <RotateCw size={18} />
                  </button>
                </div>
             </div>
            
            <div className="px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-arabic mb-1">
                بداية الهداية
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium uppercase tracking-wider">
                Imam Al-Ghazali
              </p>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto bg-slate-50/50 dark:bg-slate-950">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
              >
                {activeTab === 'dashboard' && <Dashboard state={state} onReset={handleResetClick} />}
                {activeTab === 'prayer' && <PrayerTracker state={state} onTogglePrayer={togglePrayer} />}
                {activeTab === 'routine' && <DailyRoutine state={state} onToggleTask={toggleTask} />}
                {activeTab === 'scanner' && <Scanner state={state} onToggleBodyPart={toggleBodyPart} onChangeHeartDisease={changeHeartDisease} />}
                {activeTab === 'adab' && <AdabTracker state={state} onToggleProtocol={toggleProtocol} />}
                {activeTab === 'wirid' && <Wirid state={state} onUpdateWirid={updateWirid} />}
                {activeTab === 'settings' && <SettingsPanel state={state} onImport={(newState) => { setState(newState); store.saveState(newState); showToast('Data berhasil diimpor', 'success'); }} showToast={showToast} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* AI Floating Button */}
      <motion.div
        drag
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setTimeout(() => setIsDragging(false), 150);
        }}
        className="fixed bottom-20 right-6 z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={() => {
            if (!isDragging) setIsAiOpen(true);
          }}
          className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 border-2 border-white/20"
        >
          <Moon size={24} className="fill-current" />
        </button>
      </motion.div>

      {/* AI Modal */}
      <AnimatePresence>
        {isAiOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[400px] md:h-[600px] z-50 flex flex-col bg-white dark:bg-slate-900 md:rounded-3xl md:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
          >
            <AIMuhasabah state={state} onClose={() => setIsAiOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Components */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={confirmReset}
        title="Reset Data?"
        message="Apakah Anda yakin ingin menghapus semua progress? Tindakan ini tidak dapat dibatalkan dan semua data amalan hari ini akan kembali ke 0."
        confirmText="Ya, Reset Data"
        cancelText="Batal"
        isDanger={true}
      />

      <ConfirmationModal
        isOpen={isRestartModalOpen}
        onClose={() => setIsRestartModalOpen(false)}
        onConfirm={confirmRestart}
        title="Restart Aplikasi?"
        message="Aplikasi akan dimuat ulang. Halaman akan disegarkan kembali ke tampilan awal."
        confirmText="Restart"
        cancelText="Batal"
        isDanger={false}
      />
      
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, message: null })} 
      />
    </div>
    </ErrorBoundary>
  );
}
