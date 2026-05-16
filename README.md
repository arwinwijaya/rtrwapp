# RT RW App

Platform manajemen terpusat untuk operasional komunitas perumahan RT/RW di Indonesia.

## Fitur Utama (MVP)
- **Dashboard**: Ringkasan jadwal, iuran tertunggak, dan laporan aktif.
- **Manajemen Iuran**: Pencatatan pembayaran warga.
- **RT RW Copilot**: Asisten AI untuk membantu menyusun pengumuman dan pesan warga (Mock ready for Gemini).
- **Manajemen Warga & Laporan**: *Placeholder pages*.

## Teknologi
- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript
- Lucide React (Icons)

## Instalasi Lokal

```bash
npm install
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

## Firebase Setup (Preparation)
1. Buat proyek di Firebase Console.
2. Tambahkan config Firebase ke `.env.local` Anda:
```env
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
```
3. Saat ini `src/services/firebase.ts` menggunakan *mock data*. Anda dapat mengganti fungsi tersebut dengan pemanggilan SDK Firestore.

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
  --allow-unauthenticated \
  --project=rtrwapp
```
