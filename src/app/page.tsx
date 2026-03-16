'use client'

import { useState } from 'react'
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
import { usePixelBankStore, Transaction } from '@/store/pixelbank'
import { Trash2, Edit, Plus, X } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamic import for Minesweeper to avoid SSR issues
const MinesweeperGame = dynamic(() => import('@/components/MinesweeperGame'), { ssr: false })

// Monthly trend data
const monthlyData = [
  { month: 'Aug', income: 12000000, expense: 8000000 },
  { month: 'Sep', income: 14500000, expense: 9500000 },
  { month: 'Oct', income: 13000000, expense: 11000000 },
  { month: 'Nov', income: 16000000, expense: 8500000 },
  { month: 'Dec', income: 18000000, expense: 12000000 },
  { month: 'Jan', income: 18500000, expense: 6800000 },
]

// Floating Icon Component
const FloatingIcon = ({ icon, delay, x, y }: { icon: string; delay: number; x: number; y: number }) => (
  <motion.div
    className="absolute text-2xl opacity-20 pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ opacity: 0, y: 20 }}
    animate={{
      opacity: [0.1, 0.3, 0.1],
      y: [0, -30, 0],
      x: [0, 10, 0],
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
      <span className="pixel-font text-xs text-slate-900 font-bold">$</span>
    </div>
  </motion.div>
)

// Money Bag Component
const MoneyBag = ({ className = "" }: { className?: string }) => (
  <motion.div
    className={`relative ${className}`}
    animate={{ y: [0, -5, 0] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  >
    <div
      className="w-12 h-12 relative"
      style={{
        background: 'linear-gradient(180deg, #854d0e 0%, #713f12 50%, #422006 100%)',
        borderRadius: '0 0 50% 50%',
        boxShadow: 'inset -4px -4px 0px 0px #422006, inset 4px 4px 0px 0px #a16207',
      }}
    >
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pixel-font text-sm text-yellow-300">$</span>
    </div>
  </motion.div>
)

// Heart Component for Health Meter
const Heart = ({ filled, animate = false }: { filled: boolean; animate?: boolean }) => (
  <motion.span
    className={`text-3xl ${filled ? 'heart-full' : 'heart-empty'} ${animate ? 'animate-heart-beat' : ''}`}
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
      <div className="bg-slate-900 border-2 border-green-500 p-3 pixel-font text-xs">
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
  const {
    transactions,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    getSavingsRate,
    getSpendingByCategory
  } = usePixelBankStore()

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

  // Available emojis for category icons
  const availableIcons = ['📦', '💰', '🎮', '🍕', '🛒', '🚗', '🎬', '📄', '💻', '🎁', '📈', '🏠', '💊', '📚', '🎵', '✈️', '🏆', '💎', '🔥', '⭐']
  const availableColors = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#3b82f6', '#06b6d4', '#6b7280', '#84cc16']

  // Get calculated values from store
  const totalIncome = getTotalIncome()
  const totalExpense = getTotalExpense()
  const balance = getBalance()
  const savingsRate = getSavingsRate()
  const spendingByCategory = getSpendingByCategory()

  // Calculate health (3 hearts = good, 2 = ok, 1 = bad)
  const healthHearts = savingsRate >= 30 ? 3 : savingsRate >= 15 ? 2 : savingsRate >= 0 ? 1 : 0

  // Get category info by id
  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || { icon: '📦', color: '#94a3b8', name: categoryId }
  }

  const pieData = Object.entries(spendingByCategory).map(([categoryId, amount]) => {
    const cat = getCategoryInfo(categoryId)
    return {
      name: cat.name || categoryId,
      value: amount,
      color: cat.color || '#94a3b8',
      icon: cat.icon || '📦',
    }
  })

  // Open modal for adding new transaction
  const openAddModal = () => {
    setEditingTransaction(null)
    setNewTransaction({ type: 'expense', amount: '', category: 'food', description: '' })
    setIsModalOpen(true)
  }

  // Open modal for editing transaction
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

  // Handle save transaction (add or update)
  const handleSaveTransaction = () => {
    if (!newTransaction.amount || !newTransaction.description) return

    const amount = parseInt(newTransaction.amount)
    if (isNaN(amount) || amount <= 0) return

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type: newTransaction.type,
        amount,
        category: newTransaction.category,
        description: newTransaction.description,
      })
    } else {
      addTransaction({
        type: newTransaction.type,
        amount,
        category: newTransaction.category,
        description: newTransaction.description,
      })
    }

    setNewTransaction({ type: 'expense', amount: '', category: 'food', description: '' })
    setEditingTransaction(null)
    setIsModalOpen(false)
  }

  // Handle delete transaction
  const handleDeleteTransaction = (id: string) => {
    if (confirm('Hapus transaksi ini?')) {
      deleteTransaction(id)
    }
  }

  // Handle add category
  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return

    addCategory({
      name: newCategory.name.trim(),
      icon: newCategory.icon,
      color: newCategory.color,
    })

    setNewCategory({ name: '', icon: '📦', color: '#22c55e' })
    setIsCategoryModalOpen(false)
  }

  // Handle delete category
  const handleDeleteCategory = (id: string) => {
    if (confirm('Hapus kategori ini?')) {
      deleteCategory(id)
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
    { icon: '💵', x: 45, y: 45, delay: 0.7 },
    { icon: '💰', x: 92, y: 40, delay: 1.8 },
  ]

  return (
    <div className="min-h-screen bg-pixel-slate pixel-grid-bg relative overflow-hidden flex flex-col">
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
              <h1 className="pixel-font text-xl md:text-2xl text-green-400 glow-text">
                DumbMoney.Ltd
              </h1>
              <p className="pixel-font text-xs text-yellow-400">Your 8-Bit Vault</p>
            </div>
          </div>

          {/* Health Meter */}
          <div className="flex items-center gap-2">
            <span className="pixel-font text-xs text-slate-400 hidden md:block">Health:</span>
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
        {/* Balance Display - Command Center */}
        <motion.div
          className="vault-container rounded-lg p-6 mb-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Balance */}
            <div className="md:col-span-2 text-center md:text-left">
              <p className="pixel-font text-xs text-slate-400 mb-2">💰 TOTAL BALANCE</p>
              <motion.div
                className="pixel-font text-2xl md:text-4xl text-green-400 glow-text"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {formatRupiah(balance)}
              </motion.div>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <SpinningCoin size={24} />
                  <span className="pixel-font text-xs text-green-300">
                    Income: {formatRupiah(totalIncome)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-lg"
                  >
                    📤
                  </motion.span>
                  <span className="pixel-font text-xs text-red-400">
                    Expense: {formatRupiah(totalExpense)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-col gap-4">
              {/* Income vs Expense Gauge */}
              <div className="bg-slate-800/50 rounded-lg p-4 border-2 border-slate-700">
                <p className="pixel-font text-xs text-slate-400 mb-2">Savings Rate</p>
                <div className="relative h-6 bg-slate-900 rounded overflow-hidden">
                  <motion.div
                    className="h-full pixel-progress"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, savingsRate)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <p className="pixel-font text-xs text-center mt-2 text-green-400">
                  {savingsRate}% Saved
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Add Button */}
        <motion.div
          className="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          {/* Category Manager Button */}
          <Button
            onClick={() => setIsCategoryModalOpen(true)}
            className="pixel-font text-sm bg-purple-500 hover:bg-purple-400 text-white 
                     w-14 h-14 rounded-full pixel-shadow
                     flex flex-col items-center justify-center gap-0"
          >
            <span className="text-xl">📁</span>
            <span className="text-[6px]">CAT</span>
          </Button>

          {/* Add Transaction Button */}
          <Button
            onClick={openAddModal}
            className="pixel-font text-sm bg-green-500 hover:bg-green-400 text-slate-900 
                     w-16 h-16 rounded-full pixel-shadow animate-pulse-glow
                     flex flex-col items-center justify-center gap-0"
          >
            <span className="text-2xl">+</span>
            <span className="text-[8px]">ADD</span>
          </Button>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Spending Breakdown Pie Chart */}
          <motion.div
            className="bg-slate-800/50 rounded-lg border-4 border-slate-700 p-4"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="pixel-font text-sm text-green-400 mb-4 flex items-center gap-2">
              <MoneyBag className="scale-75" />
              SPENDING BREAKDOWN
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {pieData.slice(0, 6).map((entry, index) => (
                <div key={index} className="flex items-center gap-1">
                  <span>{entry.icon}</span>
                  <span className="pixel-font text-[8px] text-slate-400">{entry.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Monthly Trend Line Chart */}
          <motion.div
            className="bg-slate-800/50 rounded-lg border-4 border-slate-700 p-4"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="pixel-font text-sm text-green-400 mb-4 flex items-center gap-2">
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                📊
              </motion.span>
              MONTHLY TREND
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="5 5" stroke="#334155" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'var(--font-pixel)' }}
                    stroke="#475569"
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'var(--font-pixel)' }}
                    stroke="#475569"
                    tickFormatter={(value) => `${value / 1000000}M`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="stepAfter"
                    dataKey="income"
                    stroke="#22c55e"
                    strokeWidth={3}
                    fill="url(#incomeGradient)"
                    name="Income"
                  />
                  <Area
                    type="stepAfter"
                    dataKey="expense"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fill="url(#expenseGradient)"
                    name="Expense"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-green-500" style={{ imageRendering: 'pixelated' }} />
                <span className="pixel-font text-[8px] text-slate-400">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-red-500" style={{ imageRendering: 'pixelated' }} />
                <span className="pixel-font text-[8px] text-slate-400">Expense</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Transaction Log */}
        <motion.div
          className="bg-slate-800/50 rounded-lg border-4 border-slate-700 p-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="pixel-font text-sm text-green-400 mb-4 flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📜
            </motion.span>
            TRANSACTION LOG
            {/* Hidden Minesweeper Button */}
            <button
              onClick={() => setIsMinesweeperOpen(true)}
              className="ml-2 w-3 h-3 rounded-full bg-slate-700 hover:bg-slate-600 
                       opacity-30 hover:opacity-100 transition-all duration-300
                       border border-slate-600 hover:border-green-500"
              title="??"
            />
          </h2>

          <ScrollArea className="h-80">
            <div className="space-y-2">
              <AnimatePresence>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="pixel-font text-xs text-slate-400">No transactions yet</p>
                    <p className="pixel-font text-[10px] text-slate-500 mt-2">Click the + button to add one!</p>
                  </div>
                ) : (
                  transactions.slice(0, 20).map((transaction, index) => {
                    const catInfo = getCategoryInfo(transaction.category)
                    return (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-3 bg-slate-900/50 rounded border-2 border-slate-700
                                 hover:border-green-500 transition-colors"
                      >
                        {/* Category Icon */}
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${catInfo.color}20` }}
                        >
                          {catInfo.icon}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="pixel-font text-xs text-slate-200 truncate">
                            {transaction.description}
                          </p>
                          <p className="pixel-font text-[8px] text-slate-500">
                            {transaction.date} • {catInfo.name}
                          </p>
                        </div>

                        {/* Amount */}
                        <div className="text-right">
                          <p className={`pixel-font text-xs ${
                            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatRupiah(transaction.amount)}
                          </p>
                        </div>

                        {/* Type Badge */}
                        <div
                          className={`pixel-font text-[8px] px-2 py-1 rounded ${
                            transaction.type === 'income'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {transaction.type.toUpperCase()}
                        </div>

                        {/* Edit Button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditModal(transaction)}
                          className="h-8 w-8 text-slate-400 hover:text-green-400 hover:bg-slate-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Delete Button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </motion.div>
      </main>

      {/* Transaction Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="level-up-modal max-w-md">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <DialogHeader>
              <DialogTitle className="pixel-font text-lg text-green-400 text-center flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  ⭐
                </motion.span>
                {editingTransaction ? 'EDIT TRANSACTION' : 'NEW TRANSACTION'}
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  ⭐
                </motion.span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-6">
              {/* Type Toggle */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setNewTransaction(prev => ({ ...prev, type: 'income' }))}
                  className={`flex-1 pixel-font text-xs ${
                    newTransaction.type === 'income'
                      ? 'bg-green-500 text-slate-900'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  💰 INCOME
                </Button>
                <Button
                  onClick={() => setNewTransaction(prev => ({ ...prev, type: 'expense' }))}
                  className={`flex-1 pixel-font text-xs ${
                    newTransaction.type === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  📤 EXPENSE
                </Button>
              </div>

              {/* Amount */}
              <div>
                <Label className="pixel-font text-xs text-slate-300">Amount (Rp)</Label>
                <Input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  className="pixel-input w-full mt-1"
                  placeholder="Enter amount..."
                />
              </div>

              {/* Category */}
              <div>
                <Label className="pixel-font text-xs text-slate-300">Category</Label>
                <Select
                  value={newTransaction.category}
                  onValueChange={(value) => setNewTransaction(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="pixel-select w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-2 border-green-500 max-h-60">
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={cat.id}
                        className="pixel-font text-xs hover:bg-slate-800"
                      >
                        <span className="mr-2">{cat.icon}</span>
                        {cat.name}
                        {cat.isCustom && <span className="ml-2 text-purple-400">✨</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label className="pixel-font text-xs text-slate-300">Description</Label>
                <Input
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                  className="pixel-input w-full mt-1"
                  placeholder="What's this for?"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSaveTransaction}
                className="w-full pixel-font text-sm bg-yellow-500 hover:bg-yellow-400 text-slate-900
                         pixel-shadow-gold"
              >
                💾 {editingTransaction ? 'UPDATE TRANSACTION' : 'SAVE TRANSACTION'}
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Category Manager Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="level-up-modal max-w-md">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <DialogHeader>
              <DialogTitle className="pixel-font text-lg text-purple-400 text-center flex items-center justify-center gap-2">
                📁 CATEGORY MANAGER
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-6">
              {/* Existing Categories */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-700"
                  >
                    <span
                      className="w-8 h-8 rounded flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${cat.color}30` }}
                    >
                      {cat.icon}
                    </span>
                    <span className="pixel-font text-xs text-slate-300 flex-1">{cat.name}</span>
                    {cat.isCustom && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-slate-800"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Category */}
              <div className="border-t border-slate-700 pt-4">
                <p className="pixel-font text-xs text-slate-400 mb-3">Add New Category</p>
                
                {/* Category Name */}
                <div className="mb-3">
                  <Label className="pixel-font text-[10px] text-slate-400">Name</Label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="pixel-input w-full mt-1"
                    placeholder="Category name..."
                  />
                </div>

                {/* Icon Selector */}
                <div className="mb-3">
                  <Label className="pixel-font text-[10px] text-slate-400">Icon</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {availableIcons.map((icon) => (
                      <Button
                        key={icon}
                        size="sm"
                        variant={newCategory.icon === icon ? "default" : "outline"}
                        onClick={() => setNewCategory(prev => ({ ...prev, icon }))}
                        className={`w-8 h-8 p-0 ${newCategory.icon === icon ? 'bg-green-500 text-slate-900' : 'border-slate-600 text-slate-400'}`}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
                <div className="mb-4">
                  <Label className="pixel-font text-[10px] text-slate-400">Color</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {availableColors.map((color) => (
                      <Button
                        key={color}
                        size="sm"
                        variant="outline"
                        onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 p-0 border-2 ${newCategory.color === color ? 'border-white' : 'border-slate-600'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Add Button */}
                <Button
                  onClick={handleAddCategory}
                  disabled={!newCategory.name.trim()}
                  className="w-full pixel-font text-xs bg-purple-500 hover:bg-purple-400 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  ADD CATEGORY
                </Button>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Minesweeper Game Modal */}
      {isMinesweeperOpen && (
        <MinesweeperGame onClose={() => setIsMinesweeperOpen(false)} />
      )}

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900/80 border-t-4 border-slate-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="text-2xl"
              >
                💎
              </motion.span>
              <p className="pixel-font text-xs text-slate-400">
                DumbMoney.Ltd © 2024 - Your 8-Bit Financial Companion
              </p>
            </div>
            <div className="flex items-center gap-4">
              <motion.div
                className="flex items-center gap-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <SpinningCoin size={20} />
                <span className="pixel-font text-[8px] text-yellow-400">
                  Saving is Fun!
                </span>
                <SpinningCoin size={20} />
              </motion.div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
