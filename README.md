# SISCOM ERP — Website (HTML, CSS, JS murni)

Landing page SISCOM ERP dengan gaya visual Kivo:
header pil mengambang, hero ala SaaSez, cerita dua langkah yang mengikuti
scroll, orb 3D dari kubus kecil, seksi HISIS, peta tujuh produk, dan footer
bergaya Kivo. Semua memakai **HTML + CSS + JavaScript biasa**: tanpa
framework, tanpa build, tanpa server.

Cukup **klik dua kali `index.html`** dan halaman langsung berjalan, termasuk
saat offline (font, three.js, dan gambar semuanya tersimpan lokal).

## Cara membuka

1. Ekstrak file ZIP.
2. Buka folder `siscom-website/`.
3. Klik dua kali `index.html` (atau drag ke jendela browser).

| File                                                   | Isi                                                            |
| ------------------------------------------------------ | -------------------------------------------------------------- |
| `index.html`                                           | seluruh struktur halaman utama dan teks, berurutan per section |
| `demo.html`                                            | halaman jadwal demo terpisah (form + kontak)                   |
| `assets/css/style.css`                                 | semua styling; token warna di `:root`, lalu blok per komponen  |
| `assets/js/main.js`                                    | navigasi, scroll story, orb three.js, produk, HISIS            |
| `assets/js/contact.js`                                 | header, menu, dan form untuk halaman `demo.html`               |
| `assets/js/footerlines.js`                             | garis kontur bergerak di footer (kanvas)                       |
| `assets/js/three.min.js`                               | library three.js (lokal, three r137 UMD)                       |
| `assets/fonts/`                                        | Atyp Display & Atyp Text (lokal, `.woff2`)                     |
| `assets/img/`                                          | logo dan gambar OG                                             |
| `404.html`, `robots.txt`, `sitemap.xml`, `vercel.json` | pelengkap hosting                                              |

## Urutan section

1. **Header** — pil mengambang. Saat halaman digulir, header menyusut menjadi
   satu pil putih dengan bayangan; tautan aktif berganti mengikuti posisi
   scroll dan sorotan putih bergeser saat kursor mendekat.
2. **Hero** (homebase ala SaaSez) — judul besar, dua tombol, baris kepercayaan,
   dan mockup dasbor di kanan. Latar berisi jaringan titik 3D yang mengikuti
   kursor.
3. **Statistik** — empat angka dengan animasi hitung.
4. **Cerita dua langkah** — section setinggi `240vh`; layar "menempel" saat
   digulir dan berganti dari langkah 01 ke 02. Visual pertama adalah kartu
   pengetahuan berisi orb, visual kedua orb besar dengan enam pil sistem yang
   menyala bergantian dan garis penghubung yang tergambar.
5. **HISIS by SISCOM** — gaya "Agents Built for How People Really Need" dari
   Kivo: robot di tengah, empat kartu manfaat mengelilinginya, kartu aktif
   berganti otomatis, dan teks perintah di tengah mengetik sendiri.
6. **Produk** — tujuh industri di atas bidang titik, dengan orb samar di
   belakang. Klik pil untuk melihat deskripsi, modul, dan contoh tabel.
7. **Implementasi, keamanan, klien, FAQ** — isi lama yang dirapikan dengan
   bahasa visual baru.
8. **Halaman demo** (`demo.html`) — judul, kartu kontak, dan form permintaan
   demo. Semua tombol "Jadwalkan Demo" mengarah ke halaman ini.
9. **Footer gelap** — ajakan besar, tiga langkah implementasi bernomor, kolom
   produk, perusahaan, dan kontak, dengan latar hitam dan garis kontur yang
   bergerak pelan.

## Mengubah isi

- **Teks** ada langsung di `index.html`, tiap section diberi komentar.
- **Nama brand** — cari `SISCOM` di `index.html` dan `assets/js/main.js`.
- **Nomor WhatsApp** — variabel `WA` di baris awal `assets/js/main.js`.
- **Alamat, telepon, email** — footer `index.html` dan JSON-LD di `<head>`.
- **Produk** — array `suites` di `assets/js/main.js`: `label`, `name`, `desc`,
  `mods` (daftar modul), dan `rows` (contoh tabel).
- **Section produk** — di layar lebar section ini menempel (540svh): awalnya
  tampil judul tengah, bola kubus besar di tengah (`#globeC`, bisa digeser
  dengan mouse) yang dikelilingi pil industri, di atas ladang titik perspektif
  yang bergerak (`#fieldC`). Latar memakai empat gradien radial ala Kivo yang
  berganti tiap suite (fade 0,7 dtk). Saat kartu muncul, bola yang sama pindah
  ke dalam kartu (mengecil dan berubah oranye) lewat `layoutGlobe()`, lalu
  kembali ke tengah saat digulir naik. Lalu saat digulir berganti ke kartu tiap
  suite
  (kartu kiri, panel modul dan contoh data di kanan); pergantian suite
  menggeser kartu 60px dan panel 90px ke samping sambil memudar. Klik pil akan menggulir ke
  suite tersebut. Transisinya mengikuti Kivo: judul dan pil memudar 0,5 detik
  tanpa bergeser, kartu muncul sambil naik 16px selama 0,7 detik, dan saat
  berganti suite panggung memudar 0,35 detik lalu isinya ditukar di tengah fade
  (180ms). Di layar kecil semua tampil berurutan tanpa menempel.
- **Kartu HISIS** — teks di `index.html`, urutan pesan perintah di array
  `prompts` pada `main.js`.
- **Angka statistik / KPI** — atribut `data-n` di `index.html` dan array
  `branch` di `main.js`.

## Warna dan font

Token di bagian atas `assets/css/style.css`:

```css
:root {
  --navy: #0a1f44; /* warna primer gelap */
  --orange: #ef5a1f; /* aksen & tombol utama */
  --cream: #f6f3ee; /* latar halaman */
  --paper: #fffdfa; /* latar section terang */
  --ink: #14171c; /* teks utama */
}
```

Font memakai `@font-face` di file CSS yang sama (`assets/fonts/`), jadi tidak
butuh Google Fonts. Ganti berkas `.woff2` dan nama `font-family` bila ingin
memakai font lain.

## Animasi

Semua animasi memakai `requestAnimationFrame`, `IntersectionObserver`, dan CSS,
tanpa library animasi tambahan.

- **Jaringan hero** — `initHero()`. Reaksi kursor diatur di:
  ```js
  px += (mx * 1.6 - px) * 0.06;
  group.rotation.y += (spin + px * 0.9 - group.rotation.y) * 0.05;
  ```
  Set `mx * 0.2` untuk mengurangi gerak, atau hapus blok `pointermove` untuk
  mematikan reaksi kursor.
- **Orb kubus** — bola bisa diputar dengan mouse atau jari (drag), punya
  inersia saat dilepas, dan tetap berputar sendiri bila tidak disentuh.
  `initOrbs()` membuat tiga bola dari ribuan kubus kecil
  (InstancedMesh) yang disebar merata dengan pola Fibonacci, jadi siluetnya bulat
  penuh. Jumlah kubus mengikuti `rows` (rows × 86), kecepatan putar `spin`, warna
  gradasi diatur di `tint()`.
- **Scroll story** — `storyUpdate()` menghitung progres section yang menempel,
  mengganti langkah, dan mengisi garis progres. Tiap langkah masuk dari bawah
  32px dengan transisi 0,7 detik `ease-out`; langkah lama turun dan memudar.
  Di kartu pengetahuan, baris data berganti sorotan tiap 1,6 detik
  (`startKnowSync()`). Pada visual sistem, pil yang menyala berganti tiap 2 detik
  dengan badge centang di bawahnya (di layar kecil badge menjadi satu baris
  ringkas di bawah bola).
- **Sorotan navigasi** — `.nav-ink` digeser oleh `moveInk()`.
- Semua animasi berhenti atau disederhanakan bila pengunjung mengaktifkan
  "kurangi gerakan" (`prefers-reduced-motion`).

## Responsif

Titik henti utama: `1100px`, `960px`, `720px`, `440px`.

- Di bawah 960px navigasi berubah menjadi tombol menu dan drawer penuh.
- Scroll story tetap menempel di semua lebar; di bawah 960px teks tampil dulu
  lalu visual ringkas di bawahnya, sedangkan daftar poin dan garis progres
  disembunyikan.
- Kartu HISIS menjadi dua kolom, lalu satu kolom di bawah 440px.
- Semua tombol dan form sudah diuji tanpa scroll horizontal di lebar 360–1280px.

## Publikasi

Statis murni, jadi bisa diunggah apa adanya ke Netlify, Vercel, Cloudflare
Pages, GitHub Pages, atau cPanel. Tidak ada build command.

Sebelum publikasi: ganti nomor WhatsApp, email, telepon, dan domain di
`index.html`, `sitemap.xml`, serta `robots.txt`.
