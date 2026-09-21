# Stok Barang

Aplikasi inventaris ringan dengan penyimpanan local-first dan sinkronisasi PostgreSQL melalui Vercel Functions.

## Jalankan lokal

Buka `index.html` untuk mode lokal. Data tetap tersimpan di browser.

Untuk menguji sinkronisasi cloud, jalankan lewat Vercel CLI atau dev server yang menyediakan `/api/data`.

## Deploy ke Vercel

1. Import repository ini ke Vercel.
2. Tambahkan database Postgres dari Vercel Marketplace, atau isi environment variable `POSTGRES_URL` dengan connection string Postgres.
3. Deploy ulang.
4. Tabel `app_state` akan dibuat otomatis pada request pertama. Skrip manual tersedia di `schema.sql`.

API menyimpan satu workspace inventaris dalam satu row JSONB. Endpoint `GET /api/data` mengambil data dan `PUT /api/data` menyimpan perubahan. Aplikasi tetap bekerja offline menggunakan `localStorage` bila database belum dikonfigurasi.

## Fitur

- Ringkasan nilai stok, stok menipis, habis, dan kategori.
- CRUD barang dengan kode, kategori, rak, satuan, stok minimum, dan harga.
- Catat stok masuk/keluar dengan validasi stok dan tombol urungkan.
- Riwayat pergerakan, laporan periode, dan ekspor CSV.
- Backup/pulihkan JSON serta hapus atau reset data.
- Tema terang, gelap, dan ikuti perangkat.
- Sinkronisasi cloud local-first untuk akses lintas perangkat.
