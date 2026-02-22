# Skema Data Bidaya

Dokumen ini menjelaskan struktur data utama yang digunakan dalam aplikasi Bidaya, seperti yang didefinisikan dalam `src/types.ts`.

## `BidayatState`

Objek `BidayatState` adalah struktur data utama yang menampung seluruh status aplikasi.

```typescript
export interface BidayatState {
  tasks: Task[];
  bodyScans: BodyPartScan[];
  heartDiseases: HeartDisease[];
  wiridLogs: WiridLog[];
  todayPrayer: PrayerLog | null;
  prayerStats: PrayerLog[];
  networkProtocols: NetworkProtocol[];
}
```

### `Task`

Mewakili tugas harian dalam checklist "Rutinitas Harian".

-   `id`: string - Pengidentifikasi unik
-   `title`: string - Nama tugas (misalnya, "Adab Bangun Tidur")
-   `arabic`: string - Teks Arab terkait (opsional)
-   `description`: string - Penjelasan singkat
-   `timeOfDay`: 'Morning' | 'Afternoon' | 'Evening' | 'Night' - Waktu tugas
-   `completed`: boolean - Status penyelesaian

### `BodyPartScan`

Mewakili pemindaian untuk satu anggota tubuh dalam fitur "Muhasabah Diri".

-   `id`: string - Pengidentifikasi unik
-   `part`: string - Nama anggota tubuh (misalnya, "Mata")
-   `arabic`: string - Teks Arab terkait
-   `errorCommitted`: boolean - `true` jika terjadi maksiat

### `HeartDisease`

Mewakili penyakit hati dalam fitur "Penyakit Hati".

-   `id`: string - Pengidentifikasi unik
-   `name`: string - Nama penyakit (misalnya, "Hasad (Dengki)")
-   `arabic`: string - Teks Arab terkait
-   `description`: string - Penjelasan singkat
-   `level`: number - Tingkat keparahan (1-10)

### `WiridLog`

Mewakili log untuk satu jenis wirid.

-   `id`: string - Pengidentifikasi unik
-   `name`: string - Nama wirid (misalnya, "Istighfar")
-   `arabic`: string - Teks Arab terkait
-   `description`: string - Penjelasan singkat
-   `count`: number - Jumlah saat ini
-   `target`: number - Target harian

### `PrayerLog`

Mewakili log sholat untuk satu hari.

-   `date`: string - Tanggal (format YYYY-MM-DD)
-   `subuh`: 0 | 1
-   `dzuhur`: 0 | 1
-   `ashar`: 0 | 1
-   `maghrib`: 0 | 1
-   `isya`: 0 | 1

### `NetworkProtocol`

Mewakili adab dalam fitur "Adab & Muamalah".

-   `id`: string - Pengidentifikasi unik
-   `category`: 'Vertical' | 'Horizontal' - Kategori adab
-   `target`: string - Target adab (misalnya, "Allah", "Parents")
-   `title`: string - Judul adab
-   `arabic`: string - Teks Arab terkait
-   `description`: string - Penjelasan singkat
-   `completed`: boolean - Status penyelesaian
