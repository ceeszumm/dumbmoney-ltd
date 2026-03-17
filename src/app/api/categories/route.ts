import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Generate unique ID
const generateId = () => {
  return `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Default categories
const defaultCategories = [
  { id: 'food', name: 'Food', icon: '🍕', color: '#f97316', isCustom: false },
  { id: 'games', name: 'Games', icon: '🎮', color: '#a855f7', isCustom: false },
  { id: 'investment', name: 'Investment', icon: '📈', color: '#22c55e', isCustom: false },
  { id: 'shopping', name: 'Shopping', icon: '🛒', color: '#3b82f6', isCustom: false },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#06b6d4', isCustom: false },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#ec4899', isCustom: false },
  { id: 'bills', name: 'Bills', icon: '📄', color: '#6b7280', isCustom: false },
  { id: 'salary', name: 'Salary', icon: '💰', color: '#22c55e', isCustom: false },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#8b5cf6', isCustom: false },
  { id: 'gift', name: 'Gift', icon: '🎁', color: '#f43f5e', isCustom: false },
  { id: 'other', name: 'Other', icon: '📦', color: '#94a3b8', isCustom: false },
]

// GET all categories
export async function GET() {
  try {
    let categories = await prisma.category.findMany()
    
    // If no categories exist, seed with defaults
    if (categories.length === 0) {
      console.log('Seeding default categories...')
      await prisma.category.createMany({
        data: defaultCategories
      })
      categories = await prisma.category.findMany()
    }
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Return default categories if database fails
    return NextResponse.json(defaultCategories)
  }
}

// POST new category
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, icon, color } = body

    console.log('Creating category:', { name, icon, color })

    if (!name || !icon || !color) {
      return NextResponse.json({ error: 'Missing required fields: name, icon, color' }, { status: 400 })
    }

    const id = generateId()

    const category = await prisma.category.create({
      data: {
        id,
        name: String(name),
        icon: String(icon),
        color: String(color),
        isCustom: true,
      }
    })

    console.log('Category created:', category)
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category', details: String(error) }, { status: 500 })
  }
}

// DELETE category
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Category ID required' }, { status: 400 })
    }

    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category', details: String(error) }, { status: 500 })
  }
}
