export interface Task {
  id: string;
  title: string;
  arabic?: string;
  description?: string;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  completed: boolean;
  locked: boolean;
}

export interface BodyPartScan {
  id: string;
  part: string;
  arabic: string;
  errorCommitted: boolean;
}

export interface HeartDisease {
  id: string;
  name: string;
  arabic: string;
  level: number; // 1 to 10
  description: string;
}

export interface WiridLog {
  id: string;
  name: string;
  arabic?: string;
  description?: string;
  count: number;
  target: number;
  lastUpdated: string;
}

export interface PrayerLog {
  date: string;
  subuh: number;
  dzuhur: number;
  ashar: number;
  maghrib: number;
  isya: number;
}

export interface NetworkProtocol {
  id: string;
  category: 'Vertical' | 'Horizontal';
  target: 'Allah' | 'Parents' | 'Scholars' | 'General' | 'Ignorant';
  title: string;
  arabic: string;
  description: string;
  completed: boolean;
}

export interface BidayatState {
  tasks: Task[];
  bodyScans: BodyPartScan[];
  heartDiseases: HeartDisease[];
  wiridLogs: WiridLog[];
  todayPrayer?: PrayerLog;
  prayerStats?: PrayerLog[];
  networkProtocols: NetworkProtocol[];
}
