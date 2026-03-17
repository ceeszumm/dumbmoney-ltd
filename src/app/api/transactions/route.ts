import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Generate unique ID
const generateId = () => {
  return `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// GET all transactions
export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions', details: String(error) }, { status: 500 })
  }
}

// POST new transaction
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, amount, category, description } = body

    console.log('Creating transaction:', { type, amount, category, description })

    if (!type || amount === undefined || !category || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const id = generateId()
    const date = new Date().toISOString().split('T')[0]

    const transaction = await prisma.transaction.create({
      data: {
        id,
        type: String(type),
        amount: parseInt(String(amount), 10),
        category: String(category),
        description: String(description),
        date,
      }
    })

    console.log('Transaction created:', transaction)
    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction', details: String(error) }, { status: 500 })
  }
}

// PUT update transaction
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, type, amount, category, description } = body

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        type: String(type),
        amount: parseInt(String(amount), 10),
        category: String(category),
        description: String(description),
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ error: 'Failed to update transaction', details: String(error) }, { status: 500 })
  }
}

// DELETE transaction
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
    }

    await prisma.transaction.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ error: 'Failed to delete transaction', details: String(error) }, { status: 500 })
  }
}
