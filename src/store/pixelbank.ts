import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  isCustom?: boolean
}

interface PixelBankState {
  transactions: Transaction[]
  categories: Category[]
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id' | 'date'>) => void
  deleteTransaction: (id: string) => void
  addCategory: (category: Omit<Category, 'id' | 'isCustom'>) => void
  deleteCategory: (id: string) => void
  getTotalIncome: () => number
  getTotalExpense: () => number
  getBalance: () => number
  getSavingsRate: () => number
  getSpendingByCategory: () => Record<string, number>
}

const initialCategories: Category[] = [
  { id: 'food', name: 'Food', icon: '🍕', color: '#f97316' },
  { id: 'games', name: 'Games', icon: '🎮', color: '#a855f7' },
  { id: 'investment', name: 'Investment', icon: '📈', color: '#22c55e' },
  { id: 'shopping', name: 'Shopping', icon: '🛒', color: '#3b82f6' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#06b6d4' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#ec4899' },
  { id: 'bills', name: 'Bills', icon: '📄', color: '#6b7280' },
  { id: 'salary', name: 'Salary', icon: '💰', color: '#22c55e' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#8b5cf6' },
  { id: 'gift', name: 'Gift', icon: '🎁', color: '#f43f5e' },
  { id: 'other', name: 'Other', icon: '📦', color: '#94a3b8' },
]

const initialTransactions: Transaction[] = [
  { id: '1', type: 'income', amount: 15000000, category: 'salary', description: 'Monthly Salary', date: '2024-01-01' },
  { id: '2', type: 'expense', amount: 2500000, category: 'food', description: 'Grocery Shopping', date: '2024-01-05' },
  { id: '3', type: 'expense', amount: 500000, category: 'games', description: 'Steam Games', date: '2024-01-08' },
  { id: '4', type: 'income', amount: 3000000, category: 'freelance', description: 'Web Project', date: '2024-01-10' },
  { id: '5', type: 'expense', amount: 1000000, category: 'investment', description: 'Stock Purchase', date: '2024-01-12' },
  { id: '6', type: 'expense', amount: 800000, category: 'shopping', description: 'New Clothes', date: '2024-01-15' },
  { id: '7', type: 'expense', amount: 300000, category: 'transport', description: 'Gas', date: '2024-01-18' },
  { id: '8', type: 'income', amount: 500000, category: 'gift', description: 'Birthday Gift', date: '2024-01-20' },
  { id: '9', type: 'expense', amount: 200000, category: 'entertainment', description: 'Movie Night', date: '2024-01-22' },
  { id: '10', type: 'expense', amount: 1500000, category: 'bills', description: 'Electricity Bill', date: '2024-01-25' },
]

export const usePixelBankStore = create<PixelBankState>()(
  persist(
    (set, get) => ({
      transactions: initialTransactions,
      categories: initialCategories,

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: new Date().toISOString().split('T')[0],
        }
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }))
      },

      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id
              ? { ...t, ...transaction }
              : t
          ),
        }))
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }))
      },

      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isCustom: true,
        }
        set((state) => ({
          categories: [...state.categories, newCategory],
        }))
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }))
      },

      getTotalIncome: () => {
        return get().transactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
      },

      getTotalExpense: () => {
        return get().transactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
      },

      getBalance: () => {
        return get().getTotalIncome() - get().getTotalExpense()
      },

      getSavingsRate: () => {
        const income = get().getTotalIncome()
        if (income === 0) return 0
        return Math.round(((income - get().getTotalExpense()) / income) * 100)
      },

      getSpendingByCategory: () => {
        return get().transactions
          .filter((t) => t.type === 'expense')
          .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount
            return acc
          }, {} as Record<string, number>)
      },
    }),
    {
      name: 'dumbmoney-storage',
    }
  )
)
