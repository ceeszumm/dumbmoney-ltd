'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, CartesianGrid, XAxis, YAxis
} from 'recharts'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2, Edit, Plus, X, Loader2, Trophy } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamic import for Minesweeper to avoid SSR issues
const MinesweeperGame = dynamic(() => import('@/components/MinesweeperGame'), { ssr: false })

// Types
interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
  isCustom?: boolean
}

// Monthly trend data
const monthlyData = [
  { month: 'Aug', income: 12000000, expense: 8000000 },
  { month: 'Sep', income: 14500000, expense: 9500000 },
  { month: 'Oct', income: 13000000, expense: 11000000 },
  { month: 'Nov', income: 16000000, expense: 8500000 },
  { month: 'Dec', income: 18000000, expense: 12000000 },
  { month: 'Jan', income: 18500000, expense: 6800000 },
]

// What You Can Buy - Products based on balance
const affordableItems = [
  { minBalance: 10000, name: 'Gorengan 5 biji', icon: '🍢', price: 10000, desc: 'Cemilan enak!' },
  { minBalance: 15000, name: 'Es Boba', icon: '🧋', price: 15000, desc: 'Segar dan manis!' },
  { minBalance: 20000, name: 'Nasi Goreng', icon: '🍛', price: 20000, desc: 'Makan siang hemat!' },
  { minBalance: 30000, name: 'Kopi Starbucks', icon: '☕', price: 30000, desc: 'Ngopi gaya cafe!' },
  { minBalance: 50000, name: 'Voucher Game 50k', icon: '🎮', price: 50000, desc: 'Top up skin favorite!' },
  { minBalance: 75000, name: 'Paket Data 30 Hari', icon: '📱', price: 75000, desc: 'Internet sepuasnya!' },
  { minBalance: 100000, name: 'Kaos Polos', icon: '👕', price: 100000, desc: 'Fashion minimalis!' },
  { minBalance: 150000, name: 'Sepatu Sneakers Lokal', icon: '👟', price: 150000, desc: 'Trendy dan nyaman!' },
  { minBalance: 250000, name: 'Bluetooth Earphone', icon: '🎧', price: 250000, desc: 'Dengar musik tanpa kabel!' },
  { minBalance: 500000, name: 'Smartband', icon: '⌚', price: 500000, desc: 'Track kesehatan harian!' },
  { minBalance: 750000, name: 'Keyboard Mechanical', icon: '⌨️', price: 750000, desc: 'Ngetik lebih asyik!' },
  { minBalance: 1000000, name: 'Smartphone Entry', icon: '📲', price: 1000000, desc: 'HP baru harga terjangkau!' },
  { minBalance: 2000000, name: 'Tablet Android', icon: '📱', price: 2000000, desc: 'Buat main game dan kerja!' },
  { minBalance: 3000000, name: 'Motor Bebek Second', icon: '🏍️', price: 3000000, desc: 'Wueennng! Punya motor!' },
  { minBalance: 5000000, name: 'iPhone Second', icon: '📱', price: 5000000, desc: 'Apple logo di belakang!' },
  { minBalance: 7500000, name: 'Laptop Entry', icon: '💻', price: 7500000, desc: 'Bisa kerja remote!' },
  { minBalance: 10000000, name: 'Mobil Bekas 90an', icon: '🚗', price: 10000000, desc: 'Wah punya mobil!' },
  { minBalance: 25000000, name: 'DP Motor Baru', icon: '🏍️', price: 25000000, desc: 'Motor baru kredit!' },
  { minBalance: 50000000, name: 'Mobil City Car', icon: '🚙', price: 50000000, desc: 'Mobil mewah!' },
  { minBalance: 100000000, name: 'Rumah Minimalis', icon: '🏠', price: 100000000, desc: 'Punya rumah sendiri!' },
  { minBalance: 500000000, name: 'Rumah Mewah', icon: '🏰', price: 500000000, desc: 'Sultan mode activated!' },
]

// Financial Tips
const financialTips = [
  { icon: '💡', title: 'Tips Hemat', desc: 'Masak sendiri bisa hemat 50% dari makan di luar!' },
  { icon: '📈', title: 'Investasi', desc: 'Mulai investasi dari 100rb/bulan di reksa dana.' },
  { icon: '🏦', title: 'Dana Darurat', desc: 'Simpan 6x pengeluaran bulanan untuk darurat.' },
  { icon: '💳', title: 'Kartu Kredit', desc: 'Bayar penuh setiap bulan, jangan bayar minimum!' },
  { icon: '🎯', title: 'Target', desc: 'Buat goal keuangan jangka pendek & panjang.' },
  { icon: '📱', title: 'Track Spending', desc: 'Catat setiap pengeluaran, termasuk yang kecil!' },
]

// Default categories fallback
const defaultCategories: Category[] = [
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

// Floating Icon Component
const FloatingIcon = ({ icon, delay, x, y }: { icon: string; delay: number; x: number; y: number }) => (
  <motion.div
    className="absolute text-2xl opacity-20 pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%` }}
    animate={{
      opacity: [0.1, 0.3, 0.1],
      y: [0, -30, 0],
    }}
    transition={{
      duration: 4 + delay,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut",
    }}
  >
    {icon}
  </motion.div>
)

// Spinning Coin Component
const SpinningCoin = ({ size = 32 }: { size?: number }) => (
  <motion.div
    className="relative"
    style={{ width: size, height: size }}
    animate={{ rotateY: 360 }}
    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
  >
    <div
      className="w-full h-full rounded-full flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #fde047 0%, #eab308 50%, #a16207 100%)',
        boxShadow: 'inset -4px -4px 0px 0px #a16207, inset 4px 4px 0px 0px #fef08a',
      }}
    >
      <span className="text-xs font-bold text-slate-900">$</span>
    </div>
  </motion.div>
)

// Heart Component for Health Meter
const Heart = ({ filled, animate = false }: { filled: boolean; animate?: boolean }) => (
  <motion.span
    className={`text-3xl ${animate ? 'animate-pulse' : ''}`}
    style={{ filter: filled ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))' : 'none' }}
  >
    {filled ? '❤️' : '🖤'}
  </motion.span>
)

// Format currency to Indonesian Rupiah
const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border-2 border-green-500 p-3 text-xs">
        <p className="text-green-400">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {formatRupiah(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DumbMoney() {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isMinesweeperOpen, setIsMinesweeperOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: 'food',
    description: '',
  })
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '📦',
    color: '#22c55e',
  })

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [transactionsRes, categoriesRes] = await Promise.all([
          fetch('/api/transactions'),
          fetch('/api/categories')
        ])
        
        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json()
          setTransactions(transactionsData)
        }
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          if (categoriesData.length > 0) {
            setCategories(categoriesData)
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Available emojis for category icons
  const availableIcons = ['📦', '💰', '🎮', '🍕', '🛒', '🚗', '🎬', '📄', '💻', '🎁', '📈', '🏠', '💊', '📚', '🎵', '✈️', '🏆', '💎', '🔥', '⭐']
  const availableColors = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#3b82f6', '#06b6d4', '#6b7280', '#84cc16']

  // Calculated values
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense
  const savingsRate = totalIncome === 0 ? 0 : Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
  
  // Spending by category
  const spendingByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  // Health hearts
  const healthHearts = savingsRate >= 30 ? 3 : savingsRate >= 15 ? 2 : savingsRate >= 0 ? 1 : 0

  // Get category info by id
  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { icon: '📦', color: '#94a3b8', name: categoryId }
  }

  // Get spending ranking
  const spendingRanking = Object.entries(spendingByCategory)
    .map(([categoryId, amount]) => {
      const cat = getCategoryInfo(categoryId)
      return { id: categoryId, name: cat.name, icon: cat.icon, color: cat.color, amount }
    })
    .sort((a, b) => b.amount - a.amount)

  // Get what you can buy based on balance
  const affordableNow = affordableItems.filter(item => balance >= item.minBalance)
  const nextGoal = affordableItems.find(item => balance < item.minBalance)

  // Get random tip
  const [currentTip, setCurrentTip] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % financialTips.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Pie chart data
  const pieData = Object.entries(spendingByCategory).map(([categoryId, amount]) => {
    const cat = getCategoryInfo(categoryId)
    return {
      name: cat.name || categoryId,
      value: amount,
      color: cat.color || '#94a3b8',
      icon: cat.icon || '📦',
    }
  })

  // Actions
  const openAddModal = () => {
    setEditingTransaction(null)
    setNewTransaction({ type: 'expense', amount: '', category: 'food', description: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setNewTransaction({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
    })
    setIsModalOpen(true)
  }

  const handleSaveTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.description) return

    const amount = parseInt(newTransaction.amount)
    if (isNaN(amount) || amount <= 0) return

    try {
      if (editingTransaction) {
        const res = await fetch('/api/transactions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingTransaction.id, type: newTransaction.type, amount, category: newTransaction.category, description: newTransaction.description })
        })
        if (res.ok) {
          const updated = await res.json()
          setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? updated : t))
        }
      } else {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: newTransaction.type, amount, category: newTransaction.category, description: newTransaction.description })
        })
        if (res.ok) {
          const newTx = await res.json()
          setTransactions(prev => [newTx, ...prev])
        }
      }

      setNewTransaction({ type: 'expense', amount: '', category: 'food', description: '' })
      setEditingTransaction(null)
      setIsModalOpen(false)
    } catch (err) {
      console.error('Error saving transaction:', err)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return
    
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTransactions(prev => prev.filter(t => t.id !== id))
      }
    } catch (err) {
      console.error('Error deleting transaction:', err)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      })
      if (res.ok) {
        const newCat = await res.json()
        setCategories(prev => [...prev, newCat])
      }
    } catch (err) {
      console.error('Error adding category:', err)
    }

    setNewCategory({ name: '', icon: '📦', color: '#22c55e' })
    setIsCategoryModalOpen(false)
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Hapus kategori ini?')) return
    
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id))
      }
    } catch (err) {
      console.error('Error deleting category:', err)
    }
  }

  // Floating icons for background
  const iconPositions = [
    { icon: '💵', x: 5, y: 10, delay: 0 },
    { icon: '💰', x: 15, y: 25, delay: 0.5 },
    { icon: '💸', x: 25, y: 15, delay: 1 },
    { icon: '🪙', x: 35, y: 30, delay: 1.5 },
    { icon: '💲', x: 55, y: 20, delay: 2 },
    { icon: '💎', x: 65, y: 35, delay: 0.3 },
    { icon: '💳', x: 75, y: 12, delay: 0.8 },
    { icon: '🏦', x: 85, y: 28, delay: 1.2 },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-green-400">Loading your vault...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex flex-col">
      {/* Floating Background Icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {iconPositions.map((pos, i) => (
          <FloatingIcon key={i} icon={pos.icon} delay={pos.delay} x={pos.x} y={pos.y} />
        ))}
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 bg-slate-900/80 backdrop-blur-sm border-b-4 border-green-500"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl"
            >
              🏦
            </motion.div>
            <div>
              <h1 className="text-xl md:text-2xl text-green-400 font-bold">
                DumbMoney.Ltd
              </h1>
              <p className="text-xs text-yellow-400">Your 8-Bit Vault</p>
            </div>
          </div>

          {/* Health Meter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden md:block">Health:</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((heart) => (
                <Heart key={heart} filled={heart <= healthHearts} animate={heart <= healthHearts} />
              ))}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 flex-1">
        {/* Balance Display */}
        <motion.div
          className="bg-slate-800/50 rounded-lg p-6 mb-6 border-2 border-slate-700"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 text-center md:text-left">
              <p className="text-xs text-slate-400 mb-2">💰 TOTAL BALANCE</p>
              <motion.div
                className="text-2xl md:text-4xl text-green-400 font-bold"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {formatRupiah(balance)}
              </motion.div>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <SpinningCoin size={24} />
                  <span className="text-xs text-green-300">Income: {formatRupiah(totalIncome)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📤</span>
                  <span className="text-xs text-red-400">Expense: {formatRupiah(totalExpense)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-xs text-slate-400 mb-2">Savings Rate</p>
                <div className="h-6 bg-slate-800 rounded overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, savingsRate)}%` }}
                  />
                </div>
                <p className="text-xs text-center mt-2 text-green-400">{savingsRate}% Saved</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* What Can You Buy */}
        <motion.div
          className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg border-2 border-purple-500 p-4 mb-6"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="text-sm text-purple-400 mb-3 flex items-center gap-2 font-bold">🛒 WHAT YOU CAN BUY NOW!</h2>
          
          {balance > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {affordableNow.slice(-4).reverse().map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-900/50 rounded-lg p-3 border border-purple-500/50 hover:border-purple-400"
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-[10px] text-purple-300 truncate">{item.name}</p>
                  <p className="text-[8px] text-slate-400">{formatRupiah(item.price)}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">Belum ada saldo. Ayo tambah income! 💪</p>
          )}

          {nextGoal && balance > 0 && (
            <div className="mt-4 bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <p className="text-[10px] text-yellow-400 mb-2">🎯 NEXT GOAL</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{nextGoal.icon}</span>
                <div className="flex-1">
                  <p className="text-xs text-slate-200">{nextGoal.name}</p>
                  <p className="text-[10px] text-slate-400">{nextGoal.desc}</p>
                  <div className="mt-2 h-2 bg-slate-800 rounded overflow-hidden">
                    <motion.div
                      className="h-full bg-yellow-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (balance / nextGoal.minBalance) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[8px] text-yellow-400 mt-1">{formatRupiah(balance)} / {formatRupiah(nextGoal.minBalance)}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Financial Tips */}
        <motion.div
          className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg border border-green-700 p-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-3">
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-xl"
            >
              {financialTips[currentTip].icon}
            </motion.span>
            <div className="flex-1">
              <p className="text-[10px] text-green-400 font-bold">{financialTips[currentTip].title}</p>
              <p className="text-xs text-slate-300">{financialTips[currentTip].desc}</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Add Button */}
        <motion.div
          className="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <Button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-purple-500 hover:bg-purple-400 text-white w-14 h-14 rounded-full"
          >
            <span className="text-xl">📁</span>
          </Button>

          <Button
            onClick={openAddModal}
            className="bg-green-500 hover:bg-green-400 text-slate-900 w-16 h-16 rounded-full"
          >
            <span className="text-2xl">+</span>
          </Button>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Top Spending */}
          <motion.div
            className="bg-slate-800/50 rounded-lg border-2 border-slate-700 p-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h2 className="text-sm text-yellow-400 mb-4 flex items-center gap-2 font-bold">
              <Trophy className="w-4 h-4" /> TOP SPENDING
            </h2>
            <div className="space-y-2">
              {spendingRanking.length === 0 ? (
                <p className="text-[10px] text-slate-400 text-center py-4">Belum ada pengeluaran</p>
              ) : (
                spendingRanking.slice(0, 5).map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-slate-900/50 rounded border border-slate-700">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                      ${index === 0 ? 'bg-yellow-500 text-slate-900' : index === 1 ? 'bg-slate-400 text-slate-900' : index === 2 ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      {index + 1}
                    </div>
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-200 truncate">{item.name}</p>
                      <div className="h-1.5 bg-slate-800 rounded overflow-hidden mt-1">
                        <motion.div className="h-full" style={{ backgroundColor: item.color }} initial={{ width: 0 }} animate={{ width: `${(item.amount / (spendingRanking[0]?.amount || 1)) * 100}%` }} />
                      </div>
                    </div>
                    <p className="text-[10px] text-red-400">{formatRupiah(item.amount)}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Pie Chart */}
          <motion.div className="bg-slate-800/50 rounded-lg border-2 border-slate-700 p-4" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2 className="text-sm text-green-400 mb-4 font-bold">💰 SPENDING BREAKDOWN</h2>
            <div className="h-48">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">No data</div>
              )}
            </div>
          </motion.div>

          {/* Trend Chart */}
          <motion.div className="bg-slate-800/50 rounded-lg border-2 border-slate-700 p-4" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2 className="text-sm text-green-400 mb-4 font-bold">📊 MONTHLY TREND</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="5 5" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 9 }} stroke="#475569" />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} stroke="#475569" tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income" stroke="#22c55e" fill="#22c55e33" name="Income" />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="#ef444433" name="Expense" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Transaction Log */}
        <motion.div
          className="bg-slate-800/50 rounded-lg border-2 border-slate-700 p-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="text-sm text-green-400 mb-4 flex items-center gap-2 font-bold">
            📜 TRANSACTION LOG
            <button onClick={() => setIsMinesweeperOpen(true)} className="ml-2 w-3 h-3 rounded-full bg-slate-700 hover:bg-slate-600 opacity-30 hover:opacity-100 border border-slate-600 hover:border-green-500" title="??" />
          </h2>

          <ScrollArea className="h-80">
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400">No transactions yet</p>
                  <p className="text-[10px] text-slate-500 mt-2">Click the + button to add one!</p>
                </div>
              ) : (
                transactions.slice(0, 20).map((transaction) => {
                  const catInfo = getCategoryInfo(transaction.category)
                  return (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-4 p-3 bg-slate-900/50 rounded border border-slate-700 hover:border-green-500"
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${catInfo.color}20` }}>
                        {catInfo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-200 truncate">{transaction.description}</p>
                        <p className="text-[8px] text-slate-500">{transaction.date} • {catInfo.name}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatRupiah(transaction.amount)}
                        </p>
                      </div>
                      <div className={`text-[8px] px-2 py-1 rounded ${transaction.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {transaction.type.toUpperCase()}
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => openEditModal(transaction)} className="h-8 w-8 text-slate-400 hover:text-green-400">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteTransaction(transaction.id)} className="h-8 w-8 text-slate-400 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </motion.div>
      </main>

      {/* Transaction Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-green-500">
          <DialogHeader>
            <DialogTitle className="text-lg text-green-400 text-center">
              {editingTransaction ? 'EDIT TRANSACTION' : 'NEW TRANSACTION'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Button onClick={() => setNewTransaction(prev => ({ ...prev, type: 'income' }))} className={`flex-1 text-xs ${newTransaction.type === 'income' ? 'bg-green-500 text-slate-900' : 'bg-slate-700 text-slate-300'}`}>
                💰 INCOME
              </Button>
              <Button onClick={() => setNewTransaction(prev => ({ ...prev, type: 'expense' }))} className={`flex-1 text-xs ${newTransaction.type === 'expense' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                📤 EXPENSE
              </Button>
            </div>
            <div>
              <Label className="text-xs text-slate-300">Amount (Rp)</Label>
              <Input type="number" value={newTransaction.amount} onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))} className="w-full mt-1 bg-slate-800 border-slate-600" placeholder="Enter amount..." />
            </div>
            <div>
              <Label className="text-xs text-slate-300">Category</Label>
              <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="w-full mt-1 bg-slate-800 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-green-500 max-h-60">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-xs">
                      <span className="mr-2">{cat.icon}</span>{cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-300">Description</Label>
              <Input value={newTransaction.description} onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))} className="w-full mt-1 bg-slate-800 border-slate-600" placeholder="What's this for?" />
            </div>
            <Button onClick={handleSaveTransaction} className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold">
              💾 {editingTransaction ? 'UPDATE' : 'SAVE'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-purple-500">
          <DialogHeader>
            <DialogTitle className="text-lg text-purple-400 text-center">📁 CATEGORY MANAGER</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="max-h-48 overflow-y-auto space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-700">
                  <span className="w-8 h-8 rounded flex items-center justify-center text-lg" style={{ backgroundColor: `${cat.color}30` }}>{cat.icon}</span>
                  <span className="text-xs text-slate-300 flex-1">{cat.name}</span>
                  {cat.isCustom && (
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteCategory(cat.id)} className="h-6 w-6 text-red-400 hover:text-red-300">
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-slate-700 pt-4">
              <p className="text-xs text-slate-400 mb-3">Add New Category</p>
              <div className="mb-3">
                <Label className="text-[10px] text-slate-400">Name</Label>
                <Input value={newCategory.name} onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))} className="w-full mt-1 bg-slate-800 border-slate-600" placeholder="Category name..." />
              </div>
              <div className="mb-3">
                <Label className="text-[10px] text-slate-400">Icon</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {availableIcons.map((icon) => (
                    <Button key={icon} size="sm" variant={newCategory.icon === icon ? "default" : "outline"} onClick={() => setNewCategory(prev => ({ ...prev, icon }))} className={`w-8 h-8 p-0 ${newCategory.icon === icon ? 'bg-green-500 text-slate-900' : 'border-slate-600 text-slate-400'}`}>
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <Label className="text-[10px] text-slate-400">Color</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {availableColors.map((color) => (
                    <Button key={color} size="sm" variant="outline" onClick={() => setNewCategory(prev => ({ ...prev, color }))} className={`w-8 h-8 p-0 border-2 ${newCategory.color === color ? 'border-white' : 'border-slate-600'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddCategory} disabled={!newCategory.name.trim()} className="w-full bg-purple-500 hover:bg-purple-400 text-white">
                <Plus className="h-4 w-4 mr-2" /> ADD CATEGORY
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Minesweeper */}
      {isMinesweeperOpen && <MinesweeperGame onClose={() => setIsMinesweeperOpen(false)} />}

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900/80 border-t-4 border-slate-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            <motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="text-2xl">💎</motion.span>
            <p className="text-xs text-slate-400">DumbMoney.Ltd © 2024 - Your 8-Bit Financial Companion</p>
            <SpinningCoin size={20} />
          </div>
        </div>
      </footer>
    </div>
  )
}
