# Portfolio Aldi Pratama Putra

Situs portofolio UI/UX, dibangun dengan Astro dari desain Figma "Portfolio Aldi Pratama Putra 2026".

## Menjalankan di komputer sendiri

```
npm install      (sekali saja, sudah dilakukan)
npm run dev      (buka http://localhost:4321)
npm run build    (hasil siap online ada di folder dist/)
```

- Di `npm run dev`, semua 6 proyek tampil, dengan tag "Dev only" untuk proyek yang izinnya belum ada.
- Di `npm run build`, hanya proyek dengan `permission: 'granted'` yang ikut dibangun. Saat ini: FastTrack Legal.
- Tambahkan `?nomotion` di alamat untuk melihat halaman tanpa animasi (untuk mengecek layout).

## Mengubah isi

| Mau mengubah | File |
|---|---|
| Teks studi kasus, izin tampil, link | `src/data/projects.js` |
| Email, LinkedIn, file resume | `src/data/site.js` |
| Warna, font, ukuran teks | `src/styles/global.css` (sama dengan variabel Figma) |
| Animasi | `src/scripts/motion.js` |

Proyek tayang setelah izin ada: ubah `permission: 'pending'` menjadi `'granted'` di `src/data/projects.js`.
Link situs live atau prototype tayang setelah dikonfirmasi: ubah `confirmed: false` menjadi `true`.

## Gambar

Semua gambar masih placeholder (komponen `Placeholder`). Simpan gambar di `public/images/{slug}/`, lalu ganti placeholder dengan `<img>`.
