import { BidayatState } from '../types';
import { Download, Upload, ShieldAlert, FileJson, Cloud, LogOut, LogIn, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useRef, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { store } from '../lib/store';

interface SettingsPanelProps {
  state: BidayatState;
  onImport: (newState: BidayatState) => void;
}

export default function SettingsPanel({ state, onImport }: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && _event === 'SIGNED_IN') {
        // Automatically sync when signing in
        store.syncFromSupabase().then(syncedState => {
          if (syncedState) {
            onImport(syncedState);
          } else {
            // Push current state if no cloud state exists
            store.saveState(state);
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Browser Anda tidak mendukung notifikasi.');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
    if (permission === 'granted') {
      new Notification('Bidayat OS', {
        body: 'Notifikasi berhasil diaktifkan. Anda akan menerima pengingat waktu sholat.',
        icon: '/icon.svg'
      });
    }
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const syncedState = await store.syncFromSupabase();
      if (syncedState) {
        onImport(syncedState);
        alert('Sinkronisasi berhasil! Data terbaru telah dimuat.');
      } else {
        // If no state in supabase, push current state
        await store.saveState(state);
        alert('Sinkronisasi berhasil! Data Anda telah disimpan ke cloud.');
      }
    } catch (error) {
      console.error(error);
      alert('Gagal melakukan sinkronisasi dengan cloud.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `bidayat-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedState = JSON.parse(content) as BidayatState;
        
        // Basic validation
        if (!parsedState.tasks || !parsedState.bodyScans || !parsedState.heartDiseases) {
          throw new Error('Invalid backup file format');
        }
        
        onImport(parsedState);
      } catch (error) {
        console.error('Failed to parse backup file:', error);
        alert('Gagal mengimpor data. Pastikan file backup valid.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Pengaturan</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 md:mt-2 text-base md:text-lg">Kelola data dan preferensi aplikasi Anda.</p>
      </header>

      {/* Cloud Sync Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-100 dark:border-indigo-800/30 shadow-sm"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-xl">
            <Cloud size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cloud Sync (Supabase)</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sinkronisasi data antar perangkat.</p>
          </div>
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Login sebagai:</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Cloud size={18} className={isSyncing ? "animate-pulse" : ""} />
              {isSyncing ? "Menyinkronkan..." : "Sinkronisasi Sekarang"}
            </button>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              Data Anda secara otomatis disinkronkan ke cloud setiap ada perubahan.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Login untuk mengaktifkan sinkronisasi cloud. Data Anda akan aman dan dapat diakses dari perangkat mana saja.
            </p>
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-sm active:scale-95"
            >
              <LogIn size={18} />
              Login dengan Google
            </button>
          </div>
        )}
      </motion.div>

      {/* Notifications Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notifikasi Pengingat</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Terima pengingat waktu sholat.</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Aktifkan notifikasi untuk menerima pengingat saat waktu sholat tiba.
          </p>
          <button
            onClick={requestNotificationPermission}
            disabled={notificationStatus === 'granted'}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors shadow-sm active:scale-95 ${
              notificationStatus === 'granted' 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-not-allowed'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            <Bell size={18} />
            {notificationStatus === 'granted' ? 'Notifikasi Aktif' : 'Aktifkan Notifikasi'}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl">
              <Download size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Export Data</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Simpan progress Anda ke file JSON.</p>
            </div>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Karena Bidayat OS berjalan sepenuhnya di perangkat Anda (tanpa server), sangat disarankan untuk melakukan backup data secara berkala agar progress Anda tidak hilang jika browser dibersihkan.
          </p>

          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
          >
            <FileJson size={18} />
            Download Backup (.json)
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl">
              <Upload size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Import Data</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pulihkan progress dari file backup.</p>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 mb-6 flex gap-3">
            <ShieldAlert className="text-amber-600 dark:text-amber-500 shrink-0" size={20} />
            <p className="text-xs text-amber-800 dark:text-amber-400/90 leading-relaxed">
              <strong>Peringatan:</strong> Mengimpor data akan menimpa seluruh progress Anda saat ini. Pastikan Anda memilih file backup yang benar.
            </p>
          </div>

          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-sm active:scale-95"
          >
            <Upload size={18} />
            Pilih File Backup
          </button>
        </motion.div>
      </div>
    </div>
  );
}
