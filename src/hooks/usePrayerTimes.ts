import { useState, useEffect } from 'react';

export interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export function usePrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrayerTimes = async (lat: number, lng: number) => {
      try {
        const date = new Date();
        const timestamp = Math.floor(date.getTime() / 1000);
        const response = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=2`);
        const data = await response.json();
        
        if (data.code === 200) {
          setPrayerTimes({
            Fajr: data.data.timings.Fajr,
            Dhuhr: data.data.timings.Dhuhr,
            Asr: data.data.timings.Asr,
            Maghrib: data.data.timings.Maghrib,
            Isha: data.data.timings.Isha,
          });
        }
      } catch (error) {
        console.error('Failed to fetch prayer times:', error);
        setLocationError('Gagal mengambil jadwal sholat.');
      } finally {
        setIsLoading(false);
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Izin lokasi ditolak. Menggunakan jadwal default (Jakarta).');
          // Default to Jakarta
          fetchPrayerTimes(-6.2088, 106.8456);
        }
      );
    } else {
      setLocationError('Geolocation tidak didukung browser ini.');
      fetchPrayerTimes(-6.2088, 106.8456);
    }
  }, []);

  return { prayerTimes, locationError, isLoading };
}
