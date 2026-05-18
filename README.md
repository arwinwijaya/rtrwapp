# RT RW App

Platform manajemen terpusat untuk operasional komunitas perumahan RT/RW di Indonesia.

## Fitur Utama (MVP)
- **Dashboard**: Ringkasan jadwal, iuran tertunggak, dan laporan aktif.
- **Admin Panel**: CRUD lengkap untuk data warga, iuran, agenda, pengumuman, dan laporan.
- **Manajemen Iuran**: Pencatatan pembayaran warga dengan otomatisasi tagihan.
- **RT RW Copilot**: Asisten AI untuk membantu menyusun pengumuman dan pesan warga (Gemini Integrated).
- **Laporan Warga**: Sistem pelaporan masalah lingkungan secara real-time.

## Teknologi
- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- Supabase (Auth, Database, RLS)
- TypeScript
- Lucide React (Icons)

## Instalasi Lokal

```bash
npm install
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

## Supabase Setup
1. Buat proyek di [Supabase Console](https://app.supabase.com).
2. Jalankan isi file `supabase/schema.sql` di **SQL Editor** Supabase.
3. Tambahkan environment variables ke `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL="your-project-url"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

*Note: `SUPABASE_SERVICE_ROLE_KEY` hanya dibaca di sisi server (Server Actions/API) untuk keperluan pembuatan akun login warga secara otomatis.*

## Akun Admin Default
Setelah menjalankan `schema.sql`, gunakan akun berikut untuk mencoba Admin Panel:
- **Email**: `muhamad.arwinwijaya@gmail.com`
- **Password**: `admin123`

## Deployment ke Google Cloud Run

Aplikasi ini sudah dikonfigurasi untuk `output: 'standalone'` dan memiliki `Dockerfile` untuk kemudahan deploy ke Cloud Run.

### 1. Build Docker Image Lokal (Opsional untuk testing)
```bash
docker build -t rtrw-app .
docker run -p 8080:8080 rtrw-app
```

### 2. Deploy ke Cloud Run
```bash
gcloud run deploy rtrw-app \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated
```
