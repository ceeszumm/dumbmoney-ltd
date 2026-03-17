-- ============================================
-- RUN THIS SQL IN SUPABASE SQL EDITOR
-- ============================================

-- Drop existing tables if any
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
DROP TABLE IF EXISTS "Transaction" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;

-- Create Category table
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Transaction table
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");
CREATE INDEX "Transaction_category_idx" ON "Transaction"("category");

-- Insert default categories
INSERT INTO "Category" ("id", "name", "icon", "color", "isCustom", "updatedAt") VALUES
    ('food', 'Food', '🍕', '#f97316', false, CURRENT_TIMESTAMP),
    ('games', 'Games', '🎮', '#a855f7', false, CURRENT_TIMESTAMP),
    ('investment', 'Investment', '📈', '#22c55e', false, CURRENT_TIMESTAMP),
    ('shopping', 'Shopping', '🛒', '#3b82f6', false, CURRENT_TIMESTAMP),
    ('transport', 'Transport', '🚗', '#06b6d4', false, CURRENT_TIMESTAMP),
    ('entertainment', 'Entertainment', '🎬', '#ec4899', false, CURRENT_TIMESTAMP),
    ('bills', 'Bills', '📄', '#6b7280', false, CURRENT_TIMESTAMP),
    ('salary', 'Salary', '💰', '#22c55e', false, CURRENT_TIMESTAMP),
    ('freelance', 'Freelance', '💻', '#8b5cf6', false, CURRENT_TIMESTAMP),
    ('gift', 'Gift', '🎁', '#f43f5e', false, CURRENT_TIMESTAMP),
    ('other', 'Other', '📦', '#94a3b8', false, CURRENT_TIMESTAMP);

-- Success message
SELECT 'Tables created successfully!' AS message;
