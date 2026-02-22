# Arsitektur Teknis Bidaya

Dokumen ini memberikan gambaran umum tingkat tinggi tentang arsitektur teknis aplikasi Bidaya.

## Tumpukan Teknologi

-   **Frontend**: React (dengan Vite) dan TypeScript
-   **Styling**: Tailwind CSS
-   **Animasi**: Framer Motion
-   **Backend**: Server Express.js (dijalankan dengan tsx)
-   **Deployment**: Vercel

## Struktur Proyek

-   `/src`: Berisi semua kode sumber frontend.
    -   `/components`: Komponen React yang dapat digunakan kembali.
    -   `/types`: Definisi tipe TypeScript global.
    -   `/data`: Data statis (misalnya, kutipan).
-   `/server`: Kode backend Express.
-   `/public`: Aset statis.
-   `vercel.json`: Konfigurasi deployment Vercel.

## Alur Data

1.  **Inisialisasi**: Saat aplikasi dimuat, frontend mengambil status awal dari backend melalui endpoint `/api/state`.
2.  **Interaksi Pengguna**: Tindakan pengguna (misalnya, menyelesaikan tugas) memicu pembaruan optimis pada state UI.
3.  **Sinkronisasi API**: Panggilan API dikirim ke backend untuk menyimpan perubahan secara persisten.
4.  **Penanganan Kesalahan**: Jika panggilan API gagal, UI akan kembali ke keadaan sebelumnya dan menampilkan pesan kesalahan.

## Prinsip Desain

-   **Mobile-First**: Antarmuka dirancang dengan mempertimbangkan perangkat seluler terlebih dahulu.
-   **Pembaruan Optimis**: Untuk memberikan pengalaman pengguna yang responsif, perubahan UI diterapkan secara instan.
-   **Pemisahan Kepentingan**: Kode dipisahkan menjadi komponen-komponen yang logis dan dapat digunakan kembali.
