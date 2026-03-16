import { create } from 'zustand'

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
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchData: () => Promise<void>
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  addCategory: (category: Omit<Category, 'id' | 'isCustom'>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  
  // Computed
  getTotalIncome: () => number
  getTotalExpense: () => number
  getBalance: () => number
  getSavingsRate: () => number
  getSpendingByCategory: () => Record<string, number>
}

export const usePixelBankStore = create<PixelBankState>((set, get) => ({
  transactions: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true, error: null })
    try {
      const [transactionsRes, categoriesRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/categories')
      ])
      
      const transactions = await transactionsRes.json()
      const categories = await categoriesRes.json()
      
      set({ transactions, categories, isLoading: false })
    } catch (error) {
      console.error('Error fetching data:', error)
      set({ error: 'Failed to load data', isLoading: false })
    }
  },

  addTransaction: async (transaction) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      })
      
      if (res.ok) {
        const newTransaction = await res.json()
        set(state => ({
          transactions: [newTransaction, ...state.transactions]
        }))
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
      set({ error: 'Failed to add transaction' })
    }
  },

  updateTransaction: async (id, transaction) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...transaction })
      })
      
      if (res.ok) {
        const updated = await res.json()
        set(state => ({
          transactions: state.transactions.map(t => 
            t.id === id ? updated : t
          )
        }))
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      set({ error: 'Failed to update transaction' })
    }
  },

  deleteTransaction: async (id) => {
    try {
      const res = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        set(state => ({
          transactions: state.transactions.filter(t => t.id !== id)
        }))
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      set({ error: 'Failed to delete transaction' })
    }
  },

  addCategory: async (category) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      })
      
      if (res.ok) {
        const newCategory = await res.json()
        set(state => ({
          categories: [...state.categories, newCategory]
        }))
      }
    } catch (error) {
      console.error('Error adding category:', error)
      set({ error: 'Failed to add category' })
    }
  },

  deleteCategory: async (id) => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        set(state => ({
          categories: state.categories.filter(c => c.id !== id)
        }))
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      set({ error: 'Failed to delete category' })
    }
  },

  getTotalIncome: () => {
    return get().transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  },

  getTotalExpense: () => {
    return get().transactions
      .filter(t => t.type === 'expense')
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
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)
  },
}))
