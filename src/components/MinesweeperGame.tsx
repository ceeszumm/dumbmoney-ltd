'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMines: number
}

interface MinesweeperGameProps {
  onClose: () => void
}

const GRID_ROWS = 16
const GRID_COLS = 30
const TOTAL_MINES = 99

export default function MinesweeperGame({ onClose }: MinesweeperGameProps) {
  const createEmptyGrid = useCallback((): Cell[][] => {
    return Array(GRID_ROWS).fill(null).map(() =>
      Array(GRID_COLS).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      }))
    )
  }, [])

  const [grid, setGrid] = useState<Cell[][]>(createEmptyGrid)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [flagsCount, setFlagsCount] = useState(0)
  const [firstClick, setFirstClick] = useState(true)
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Track mouse button states
  const leftDown = useRef(false)
  const rightDown = useRef(false)
  const currentCell = useRef<{row: number, col: number} | null>(null)

  // Place mines
  const placeMines = useCallback((grid: Cell[][], startRow: number, startCol: number): Cell[][] => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })))
    let minesPlaced = 0

    while (minesPlaced < TOTAL_MINES) {
      const row = Math.floor(Math.random() * GRID_ROWS)
      const col = Math.floor(Math.random() * GRID_COLS)
      const isNearStart = Math.abs(row - startRow) <= 1 && Math.abs(col - startCol) <= 1

      if (!newGrid[row][col].isMine && !isNearStart) {
        newGrid[row][col].isMine = true
        minesPlaced++
      }
    }

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (!newGrid[row][col].isMine) {
          let count = 0
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = row + dr
              const nc = col + dc
              if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS && newGrid[nr][nc].isMine) {
                count++
              }
            }
          }
          newGrid[row][col].adjacentMines = count
        }
      }
    }
    return newGrid
  }, [])

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && !gameOver && !gameWon) {
      interval = setInterval(() => setTime(t => Math.min(t + 1, 999)), 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, gameOver, gameWon])

  // Confetti on win
  useEffect(() => {
    if (gameWon) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [gameWon])

  // Reveal cell
  const revealCell = useCallback((g: Cell[][], row: number, col: number): Cell[][] => {
    const newGrid = g.map(r => r.map(c => ({ ...c })))
    
    const reveal = (r: number, c: number) => {
      if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) return
      if (newGrid[r][c].isRevealed || newGrid[r][c].isFlagged) return
      newGrid[r][c].isRevealed = true
      if (newGrid[r][c].adjacentMines === 0 && !newGrid[r][c].isMine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            reveal(r + dr, c + dc)
          }
        }
      }
    }
    reveal(row, col)
    return newGrid
  }, [])

  // Check win
  const checkWin = useCallback((g: Cell[][]): boolean => {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (!g[row][col].isMine && !g[row][col].isRevealed) return false
      }
    }
    return true
  }, [])

  // Left click - reveal
  const handleLeftClick = useCallback((row: number, col: number) => {
    if (gameOver || gameWon) return
    if (grid[row][col].isFlagged || grid[row][col].isRevealed) return

    let newGrid = grid.map(r => r.map(c => ({ ...c })))

    if (firstClick) {
      newGrid = placeMines(newGrid, row, col)
      setFirstClick(false)
      setIsRunning(true)
    }

    if (newGrid[row][col].isMine) {
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          if (newGrid[r][c].isMine) newGrid[r][c].isRevealed = true
        }
      }
      setGrid(newGrid)
      setGameOver(true)
      setIsRunning(false)
      return
    }

    newGrid = revealCell(newGrid, row, col)
    if (checkWin(newGrid)) {
      setGameWon(true)
      setIsRunning(false)
    }
    setGrid(newGrid)
  }, [grid, gameOver, gameWon, firstClick, placeMines, revealCell, checkWin])

  // Right click - flag
  const toggleFlag = useCallback((row: number, col: number) => {
    if (gameOver || gameWon) return
    if (grid[row][col].isRevealed) return

    const newGrid = grid.map(r => r.map(c => ({ ...c })))
    newGrid[row][col].isFlagged = !newGrid[row][col].isFlagged
    setFlagsCount(prev => newGrid[row][col].isFlagged ? prev + 1 : prev - 1)
    setGrid(newGrid)
  }, [grid, gameOver, gameWon])

  // Chord (both buttons or middle click) - open 9 cells only if ALL flags are correct
  const handleChord = useCallback((row: number, col: number) => {
    if (gameOver || gameWon) return
    if (!grid[row][col].isRevealed || grid[row][col].adjacentMines === 0) return

    const newGrid = grid.map(r => r.map(c => ({ ...c })))
    
    // Check all flags around - are they ALL correct (on mines)?
    let flaggedCount = 0
    let correctFlags = 0
    let wrongFlags = 0
    
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const nr = row + dr
        const nc = col + dc
        if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
          if (newGrid[nr][nc].isFlagged) {
            flaggedCount++
            if (newGrid[nr][nc].isMine) {
              correctFlags++
            } else {
              wrongFlags++
            }
          }
        }
      }
    }

    // If flag count doesn't match number, don't do anything
    if (flaggedCount !== newGrid[row][col].adjacentMines) return

    // If ANY flag is wrong (placed on non-mine), DON'T open anything
    if (wrongFlags > 0) {
      // Optional: could show a warning shake animation here
      return
    }

    // All flags are correct! Now check if all mines around are flagged
    // Count unflagged mines around
    let unflaggedMines = 0
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const nr = row + dr
        const nc = col + dc
        if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
          if (newGrid[nr][nc].isMine && !newGrid[nr][nc].isFlagged) {
            unflaggedMines++
          }
        }
      }
    }

    // If there are unflagged mines, DON'T open (safety)
    if (unflaggedMines > 0) {
      return
    }

    // ALL flags are correct AND all mines are flagged - safe to open all!
    const reveal = (r: number, c: number) => {
      if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) return
      if (newGrid[r][c].isRevealed || newGrid[r][c].isFlagged || newGrid[r][c].isMine) return
      newGrid[r][c].isRevealed = true
      if (newGrid[r][c].adjacentMines === 0) {
        for (let drr = -1; drr <= 1; drr++) {
          for (let dcc = -1; dcc <= 1; dcc++) {
            reveal(r + drr, c + dcc)
          }
        }
      }
    }

    // Reveal all non-flagged, non-mine cells around
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const nr = row + dr
        const nc = col + dc
        if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
          if (!newGrid[nr][nc].isFlagged && !newGrid[nr][nc].isMine) {
            reveal(nr, nc)
          }
        }
      }
    }

    if (checkWin(newGrid)) {
      setGameWon(true)
      setIsRunning(false)
    }
    setGrid(newGrid)
  }, [grid, gameOver, gameWon, checkWin])

  // Reset
  const resetGame = useCallback(() => {
    setGrid(createEmptyGrid())
    setGameOver(false)
    setGameWon(false)
    setFlagsCount(0)
    setFirstClick(true)
    setTime(0)
    setIsRunning(false)
    leftDown.current = false
    rightDown.current = false
    currentCell.current = null
  }, [createEmptyGrid])

  // Number colors
  const getNumberColor = (num: number): string => {
    const colors: Record<number, string> = {
      1: '#3b82f6', 2: '#22c55e', 3: '#ef4444', 4: '#1d4ed8',
      5: '#a21caf', 6: '#06b6d4', 7: '#1f2937', 8: '#6b7280',
    }
    return colors[num] || '#ffffff'
  }

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    
    if (e.button === 0) {
      leftDown.current = true
    } else if (e.button === 2) {
      rightDown.current = true
    } else if (e.button === 1) {
      // Middle click - chord directly
      handleChord(row, col)
      return
    }
    
    currentCell.current = { row, col }
  }, [handleChord])

  const handleMouseUp = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    
    const wasLeftDown = leftDown.current
    const wasRightDown = rightDown.current
    const wasBothPressed = wasLeftDown && wasRightDown
    
    if (e.button === 0) {
      leftDown.current = false
    } else if (e.button === 2) {
      rightDown.current = false
    }
    
    // Check if both buttons were pressed on the same cell
    if (wasBothPressed && currentCell.current?.row === row && currentCell.current?.col === col) {
      handleChord(row, col)
      return
    }
    
    // Single button actions
    if (e.button === 0 && wasLeftDown && !wasRightDown) {
      handleLeftClick(row, col)
    } else if (e.button === 2 && wasRightDown && !wasLeftDown) {
      toggleFlag(row, col)
    }
  }, [handleLeftClick, toggleFlag, handleChord])

  // Reset button states when mouse leaves
  const handleMouseLeave = useCallback(() => {
    leftDown.current = false
    rightDown.current = false
    currentCell.current = null
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <>
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 pointer-events-none"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: -10,
                  backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#a855f7'][i % 5],
                  borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                }}
                initial={{ y: 0, rotate: 0 }}
                animate={{ y: 500, rotate: 720 }}
                transition={{ duration: 2, delay: i * 0.05 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <div className="bg-slate-900 border-4 border-green-500 rounded-lg p-4 max-w-[95vw] overflow-auto"
           onContextMenu={(e) => e.preventDefault()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-black px-3 py-2 border-2 border-slate-700 pixel-font text-red-500 text-lg">
              💣 {String(TOTAL_MINES - flagsCount).padStart(3, '0')}
            </div>
            
            <Button
              onClick={resetGame}
              className="pixel-font text-2xl bg-yellow-500 hover:bg-yellow-400 text-slate-900 w-12 h-12 p-0"
            >
              <motion.span
                animate={gameOver ? { rotate: [0, -10, 10, 0] } : gameWon ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, repeat: gameOver ? Infinity : 0 }}
              >
                {gameOver ? '😵' : gameWon ? '😎' : '🙂'}
              </motion.span>
            </Button>
            
            <div className="bg-black px-3 py-2 border-2 border-slate-700 pixel-font text-red-500 text-lg">
              ⏱️ {String(time).padStart(3, '0')}
            </div>
          </div>
          
          <Button onClick={onClose} className="pixel-font text-xs bg-red-500 hover:bg-red-400 text-white">
            ✕ CLOSE
          </Button>
        </div>

        {/* Status */}
        <AnimatePresence>
          {(gameOver || gameWon) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`pixel-font text-center mb-4 text-lg ${gameWon ? 'text-green-400' : 'text-red-400'}`}
            >
              {gameWon ? '🎉 YOU WIN! 🎉' : '💥 GAME OVER 💥'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <div className="pixel-font text-[8px] text-slate-400 mb-3 text-center">
          Left Click: Reveal | Right Click: Flag | Both Buttons / Middle Click: Chord
        </div>

        {/* Grid */}
        <div 
          className="grid bg-slate-800 p-1 border-2 border-slate-600"
          style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 20px)`, gap: '1px' }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                className={`w-5 h-5 flex items-center justify-center cursor-pointer border border-slate-700 text-xs font-bold select-none
                  ${cell.isRevealed 
                    ? cell.isMine ? 'bg-red-600' : 'bg-slate-700'
                    : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                whileHover={!cell.isRevealed ? { scale: 1.1 } : {}}
                whileTap={!cell.isRevealed ? { scale: 0.9 } : {}}
                initial={false}
                animate={cell.isRevealed ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.15 }}
                onMouseDown={(e) => handleMouseDown(e, rowIndex, colIndex)}
                onMouseUp={(e) => handleMouseUp(e, rowIndex, colIndex)}
                onMouseLeave={handleMouseLeave}
              >
                <AnimatePresence mode="wait">
                  {cell.isRevealed ? (
                    <motion.span
                      key="revealed"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.1 }}
                    >
                      {cell.isMine ? '💣' : cell.adjacentMines > 0 ? (
                        <span style={{ color: getNumberColor(cell.adjacentMines) }}>
                          {cell.adjacentMines}
                        </span>
                      ) : null}
                    </motion.span>
                  ) : cell.isFlagged ? (
                    <motion.span
                      key="flag"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      🚩
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        <div className="pixel-font text-[8px] text-slate-500 mt-3 text-center">
          Expert: {GRID_ROWS}x{GRID_COLS} | {TOTAL_MINES} Mines
        </div>
      </div>
    </motion.div>
  )
}
