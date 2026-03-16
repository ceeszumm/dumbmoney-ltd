# 🚀 Panduan Deploy DumbMoney.Ltd dengan Database

## Langkah-langkah Lengkap

### Step 1: Setup Database Gratis (Supabase)

1. **Buka** https://supabase.com
2. **Login** dengan GitHub
3. **Create Organization** → Next
4. **Create Project**:
   - Name: `dumbmoney`
   - Database Password: **SIMPAN PASSWORD!**
   - Region: Singapore (untuk Indonesia)
   - Klik **Create new project**
5. Tunggu ~2 menit sampai project siap

### Step 2: Dapatkan Connection String

1. Di project Supabase, buka **Project Settings** (icon gear)
2. Klik **Database** di sidebar
3. Scroll ke **Connection string**
4. Copy **URI** format:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

### Step 3: Update Prisma Schema

Pastikan `prisma/schema.prisma` sudah benar:

### Step 4: Set Environment Variables di Vercel

1. Buka https://vercel.com
2. Pilih project `dumbmoney-ltd`
3. Klik **Settings** → **Environment Variables**
4. Tambahkan:

```
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### Step 5: Redeploy

1. Klik **Deployments**
2. Klik **Redeploy** pada deployment terakhir

### Step 6: Push Schema ke Database

Di Vercel, buka **Storage** → **Neon Postgres** atau gunakan Prisma CLI:

```bash
# Di local (setelah pull dari GitHub):
npx prisma db push
```

Atau bisa gunakan Prisma Studio untuk manage data.

---

## 📊 Database Schema

```prisma
model Transaction {
  id          String   @id
  type        String   // 'income' | 'expense'
  amount      Int
  category    String
  description String
  date        String
  createdAt   DateTime
}

model Category {
  id        String  @id
  name      String
  icon      String
  color     String
  isCustom  Boolean
  createdAt DateTime
}
```

---

## 🔄 Cara Kerja

### Sebelum (LocalStorage):
```
Browser → localStorage → Data hilang jika clear cache/device berbeda
```

### Sesudah (Database):
```
Browser → API → Database (Supabase) → Data permanen, bisa diakses dari mana saja
```

---

## ⚠️ Penting!

1. **Jangan commit .env** ke GitHub
2. **Simpan password database** di tempat aman
3. **Backup database** secara berkala (Supabase auto-backup)

---

## 🆘 Jika Ada Error

### Error: "Can't reach database server"
- Cek connection string
- Pastikan password benar
- Cek region database

### Error: "Table doesn't exist"
- Jalankan `npx prisma db push`

### Error: "Prisma Client could not be generated"
- Jalankan `npx prisma generate`
