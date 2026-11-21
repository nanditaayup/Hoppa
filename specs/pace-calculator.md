# Spesifikasi Fitur: Kalkulator Pace & Zona Latihan

**Kode Fitur:** `PC-CALC-01`  
**Komponen Terkait:** `components/PaceCalculator.tsx`, `components/TrainingPlanSection.tsx`  
**Logika Murni:** `lib/strava/pace-calculator.ts`  
**Status:** Terimplementasi & Teruji  

## 1. Tujuan Fitur
Menghitung target **Race Pace**, **Kecepatan Rata-rata (km/jam)**, serta tiga zona latihan utama (**Easy**, **Tempo**, dan **Interval**) berdasarkan pilihan jarak lomba (`5K`, `10K`, `21K`, `42K`) dan target waktu finis pelari (`jam`, `menit`, `detik`). Hasil target Race Pace dapat langsung diterapkan ke **Menu Latihan** untuk mengkalibrasi zona pace mingguan secara menyeluruh.

## 2. Rumus Kalkulasi Zona Pace
- **Race Pace ($P_{\text{race}}$):** $\frac{\text{Total Waktu (detik)}}{\text{Jarak (km)}}$
- **Easy Pace (Pemulihan / Dasar Aerobik):** $P_{\text{race}} + 45\text{ dtk/km}$ s.d. $P_{\text{race}} + 75\text{ dtk/km}$
- **Tempo Pace (Ambang Laktat / Threshold):**
  - `5K` & `10K`: $P_{\text{race}} + 10\text{ dtk/km}$ s.d. $P_{\text{race}} + 20\text{ dtk/km}$
  - `21K`: $P_{\text{race}} - 5\text{ dtk/km}$ s.d. $P_{\text{race}} + 5\text{ dtk/km}$
  - `42K`: $P_{\text{race}} - 25\text{ dtk/km}$ s.d. $P_{\text{race}} - 15\text{ dtk/km}$
- **Interval Pace (VO2max / Kecepatan):** $\min(P_{\text{race}}, P_{\text{tempo,min}}) - 25\text{ dtk/km}$ s.d. $\min(P_{\text{race}}, P_{\text{tempo,min}}) - 12\text{ dtk/km}$ (dijaga selalu lebih cepat dari Tempo & Race Pace, batas bawah aman `01:30/km`).

## 3. Aturan Format & UI
- Jarak tampil dengan 2 angka desimal (`5,00 km`, `21,10 km`, `42,20 km` dalam ID; titik desimal dalam EN).
- Pace tampil dalam format `mm:dd/km` (contoh: `05:27/km`).
- Kecepatan tampil dengan 1 angka desimal + satuan (`11,0 km/jam` / `11.0 km/h`).
- Seluruh angka wajib memakai `font-mono tabular-nums`, permukaan `bg-white` / `dark:bg-slate-900`, aksen `teal`/`emerald`/`sky`/`indigo` tanpa kartu bertumpuk, dan tombol minimal `44px`.
