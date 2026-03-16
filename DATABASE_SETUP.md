# 🚀 Panduan Setup Database Gratis (Supabase)

## Langkah-langkah Setup Supabase

### 1. Buat Akun Supabase

1. Buka **https://supabase.com**
2. Klik **"Start your project"**
3. Login dengan GitHub atau Email
4. Buat **Organization** baru (gratis)
5. Buat **Project** baru:
   - Name: `dumbmoney`
   - Database Password: (simpan password ini!)
   - Region: pilih yang terdekat (Singapore untuk Indonesia)
   - Klik **"Create new project"**

### 2. Dapatkan Connection String

1. Setelah project jadi, buka **Project Settings** → **Database**
2. Scroll ke **Connection string** → pilih **URI**
3. Copy connection string (ganti `[YOUR-PASSWORD]` dengan password yang tadi)
4. Contoh: `postgresql://postgres.xxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`

### 3. Tambahkan Environment Variables

Di **Vercel Dashboard**:
1. Buka project Anda
2. Klik **Settings** → **Environment Variables**
3. Tambahkan:

\`\`\`
DATABASE_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_DATABASE_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
\`\`\`

> **Penting**: Gunakan port **6543** untuk DATABASE_URL (connection pooling) dan port **5432** untuk DIRECT_DATABASE_URL

### 4. Deploy Ulang

Setelah menambahkan environment variables:
1. Klik **Deployments** di Vercel
2. Klik **Redeploy** pada deployment terakhir

### 5. Inisialisasi Database

Buka aplikasi Anda, database akan otomatis terisi dengan data default.

---

## 📊 Batas Gratis Supabase

| Resource | Limit |
|----------|-------|
| Database | 500 MB |
| Bandwidth | 5 GB/bulan |
| Storage | 1 GB |
| Projects | 2 active projects |

**Cukup untuk aplikasi personal finance!** ✅

---

## 🔧 Alternatif Lain

### Turso (SQLite Serverless - Gratis)
- **Free tier**: 9 GB storage
- URL: https://turso.tech
- Setup: Lebih mudah, SQLite-based

### PlanetScale (MySQL - Gratis)
- **Free tier**: 5 GB storage
- URL: https://planetscale.com
- Setup: Branch-based workflow

### Neon (PostgreSQL - Gratis)
- **Free tier**: 0.5 GB storage
- URL: https://neon.tech
- Setup: Serverless PostgreSQL

---

## ❓ FAQ

**Q: Apakah data aman?**
A: Ya, Supabase menggunakan enkripsi dan backup otomatis.

**Q: Bisakah upgrade ke berbayar?**
A: Ya, tapi untuk penggunaan pribadi, tier gratis sudah cukup.

**Q: Bagaimana kalau lupa password database?**
A: Reset di Project Settings → Database → Reset database password.
