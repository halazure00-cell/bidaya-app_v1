import { useState, useEffect } from 'react';
import { Activity, CheckSquare, LayoutDashboard, Moon, Sun, RotateCcw, Fingerprint, RotateCw, Sunrise, HandHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import DailyRoutine from './components/DailyRoutine';
import Scanner from './components/Scanner';
import Wirid from './components/Wirid';
import PrayerTracker from './components/PrayerTracker';
import AdabTracker from './components/AdabTracker';
import ConfirmationModal from './components/ConfirmationModal';
import Toast, { ToastType } from './components/Toast';
import { BidayatState, PrayerLog } from './types';
import ErrorBoundary from './components/ErrorBoundary';

type Tab = 'dashboard' | 'routine' | 'scanner' | 'wirid' | 'prayer' | 'adab';

export default function App() {
  const [state, setState] = useState<BidayatState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
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

  const fetchState = () => {
    setIsLoading(true);
    setError(null);
    fetch('/api/state')
      .then(async res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error('API returned non-JSON response:', text.substring(0, 150));
          throw new Error('API routing error: Received HTML instead of JSON data. Check Vercel configuration.');
        }
      })
      .then(data => {
        setState(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch state:', err);
        setError(err.message || 'Gagal memuat data. Periksa koneksi Anda dan coba lagi.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchState();
    
    // Check for restart flag
    if (sessionStorage.getItem('justRestarted')) {
      showToast('Aplikasi berhasil dimuat ulang.', 'success');
      sessionStorage.removeItem('justRestarted');
    }
  }, []);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  // Handlers to update state via API
  const toggleTask = async (id: string) => {
    if (!state) return;
    
    // Optimistic update
    const oldTasks = state.tasks;
    setState(s => s ? ({
      ...s,
      tasks: s.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }) : null);

    try {
      await fetch(`/api/tasks/${id}/toggle`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to toggle task:', error);
      setState(s => s ? ({ ...s, tasks: oldTasks }) : null); // Revert
    }
  };

  const toggleBodyPart = async (id: string) => {
    if (!state) return;

    const oldScans = state.bodyScans;
    setState(s => s ? ({
      ...s,
      bodyScans: s.bodyScans.map(b => b.id === id ? { ...b, errorCommitted: !b.errorCommitted } : b)
    }) : null);

    try {
      await fetch(`/api/body-scans/${id}/toggle`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to toggle body scan:', error);
      setState(s => s ? ({ ...s, bodyScans: oldScans }) : null);
    }
  };

  const changeHeartDisease = async (id: string, level: number) => {
    if (!state) return;

    const oldDiseases = state.heartDiseases;
    setState(s => s ? ({
      ...s,
      heartDiseases: s.heartDiseases.map(h => h.id === id ? { ...h, level } : h)
    }) : null);

    try {
      await fetch(`/api/heart-diseases/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level })
      });
    } catch (error) {
      console.error('Failed to update heart disease:', error);
      setState(s => s ? ({ ...s, heartDiseases: oldDiseases }) : null);
    }
  };

  const updateWirid = async (id: string, count: number) => {
    if (!state) return;

    const oldWirid = state.wiridLogs;
    setState(s => s ? ({
      ...s,
      wiridLogs: s.wiridLogs.map(w => w.id === id ? { ...w, count } : w)
    }) : null);

    try {
      await fetch(`/api/wirid/${id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count })
      });
    } catch (error) {
      console.error('Failed to update wirid:', error);
      setState(s => s ? ({ ...s, wiridLogs: oldWirid }) : null);
    }
  };

  const togglePrayer = async (prayer: keyof Omit<PrayerLog, 'date'>, status: boolean) => {
    if (!state || !state.todayPrayer) return;

    const oldPrayer = state.todayPrayer;
    
    // Optimistic update
    setState(s => s ? ({
      ...s,
      todayPrayer: { ...s.todayPrayer!, [prayer]: status ? 1 : 0 },
      // Update stats optimistically too if needed, but simpler to just wait for refetch or ignore for now
      prayerStats: s.prayerStats?.map(p => p.date === oldPrayer.date ? { ...p, [prayer]: status ? 1 : 0 } : p)
    }) : null);

    try {
      await fetch(`/api/prayers/${oldPrayer.date}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prayer, status })
      });
    } catch (error) {
      console.error('Failed to toggle prayer:', error);
      setState(s => s ? ({ ...s, todayPrayer: oldPrayer }) : null);
    }
  };

  const toggleProtocol = async (id: string) => {
    if (!state) return;

    const oldProtocols = state.networkProtocols;
    setState(s => s ? ({
      ...s,
      networkProtocols: s.networkProtocols.map(p => p.id === id ? { ...p, completed: !p.completed } : p)
    }) : null);

    try {
      await fetch(`/api/network-protocols/${id}/toggle`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to toggle protocol:', error);
      setState(s => s ? ({ ...s, networkProtocols: oldProtocols }) : null);
    }
  };

  const handleResetClick = () => {
    setIsResetModalOpen(true);
  };

  const confirmReset = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        fetchState();
        showToast('Data berhasil di-reset.', 'success');
      } else {
        throw new Error('Failed to reset');
      }
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
            onClick={fetchState}
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
                onClick={handleRestartClick}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <RotateCw size={18} />
              </button>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                
                <button 
                  onClick={handleRestartClick}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  title="Restart Application"
                >
                  <RotateCw size={18} />
                </button>
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
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

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
