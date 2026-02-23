import { BidayatState } from '../types';
import { defaultState } from './defaultState';
import { supabase } from './supabase';

const STORAGE_KEY = 'bidayat_os_state';

export const store = {
  getState: (): BidayatState => {
    if (typeof window === 'undefined') return defaultState;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initializeState(defaultState);
    
    try {
      const parsed = JSON.parse(saved);
      return initializeState({ ...defaultState, ...parsed });
    } catch (e) {
      console.error('Failed to parse local storage data, resetting to default.');
      return initializeState(defaultState);
    }
  },
  
  saveState: async (state: BidayatState) => {
    if (typeof window === 'undefined') return;
    
    // Optimistic local save
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // Background sync to Supabase if logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        await supabase
          .from('user_states')
          .upsert({ 
            user_id: session.user.id, 
            state_data: state,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      } catch (error) {
        console.error('Failed to sync to Supabase:', error);
      }
    }
  },
  
  resetState: (): BidayatState => {
    const reset = { ...defaultState };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
    }
    return initializeState(reset);
  },

  syncFromSupabase: async (): Promise<BidayatState | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        const { data, error } = await supabase
          .from('user_states')
          .select('state_data')
          .eq('user_id', session.user.id)
          .single();
          
        if (data && data.state_data) {
          const mergedState = initializeState({ ...defaultState, ...data.state_data });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedState));
          return mergedState;
        }
      } catch (error) {
        console.error('Failed to fetch from Supabase:', error);
      }
    }
    return null;
  }
};

export const calculateLevel = (xp: number) => {
  // Simple formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const addXP = (state: BidayatState, amount: number): BidayatState => {
  if (!state.userStats) return state;
  const newXp = state.userStats.xp + amount;
  const newLevel = calculateLevel(newXp);
  
  return {
    ...state,
    userStats: {
      ...state.userStats,
      xp: newXp,
      level: newLevel
    }
  };
};

function initializeState(state: BidayatState): BidayatState {
  const today = new Date().toISOString().split('T')[0];
  let todayPrayer = state.prayerStats?.find(p => p.date === today);
  let newPrayerStats = state.prayerStats || [];
  
  let newState = { ...state };

  // Ensure userStats exists (for backwards compatibility)
  if (!newState.userStats) {
    newState.userStats = { ...defaultState.userStats! };
  }

  // Handle Daily Reset
  if (newState.lastResetDate && newState.lastResetDate !== today) {
    const lastDate = new Date(newState.lastResetDate);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Update streak
    if (diffDays === 1) {
      // Check if they did at least one prayer or task yesterday to maintain streak
      // For simplicity, we just increment if they opened the app consecutive days
      newState.userStats.streak += 1;
    } else {
      newState.userStats.streak = 0; // Reset streak if they missed a day
    }

    // Reset daily items
    newState.tasks = newState.tasks.map(t => ({ ...t, completed: false }));
    newState.bodyScans = newState.bodyScans.map(b => ({ ...b, errorCommitted: false }));
    newState.networkProtocols = newState.networkProtocols.map(p => ({ ...p, completed: false }));
    newState.wiridLogs = newState.wiridLogs.map(w => ({ ...w, count: 0 }));
    
    newState.lastResetDate = today;
  }

  if (!todayPrayer) {
    todayPrayer = { date: today, subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 };
    newPrayerStats = [...newPrayerStats, todayPrayer].slice(-30); // Keep last 30 days
  }

  return {
    ...newState,
    todayPrayer,
    prayerStats: newPrayerStats
  };
}
