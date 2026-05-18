# RT RW App - Supabase Database Management

This directory contains the SQL files for managing the RT RW App database structure and data.

## File Descriptions

1.  **`schema.sql`**: Contains the full database structure (DDL), including tables, enums, indexes, triggers, and RLS policies. **Running this file will reset the database.**
2.  **`seed.sql`**: Contains sample and development data (DML), including the default admin account and sample residents. Run this after `schema.sql` for a fresh setup.
3.  **`migrations/migration_activity.sql`**: A safe migration script for existing databases. It adds support for the Agenda submenu, Yasinan, and Ronda scheduling without deleting existing data.

---

## 🚀 Setup Instructions

### Option A: Fresh Setup / Database Reset
Use this if you are setting up the project for the first time or want to wipe all data.

1.  Open your Supabase **SQL Editor**.
2.  Copy and paste the entire content of **`supabase/schema.sql`** and run it.
3.  Copy and paste the entire content of **`supabase/seed.sql`** and run it.

### Option B: Update Existing Database
Use this if you already have data and only want to add the new Yasinan/Ronda features.

1.  Open your Supabase **SQL Editor**.
2.  Copy and paste the entire content of **`supabase/migrations/migration_activity.sql`** and run it.

---

## 🔐 Admin Login (After Seed)

- **Email**: `muhamad.arwinwijaya@gmail.com`
- **Password**: `admin123`

> **⚠️ Warning**: Always change the default admin password immediately after deployment.

---

## 🛠️ Security Notes

- **RLS**: Row Level Security is enabled on all tables.
- **Admin Helper**: The system uses `private.is_admin()` for administrative access checks.
- **Service Role**: Never expose your `SUPABASE_SERVICE_ROLE_KEY` to the client-side code.
