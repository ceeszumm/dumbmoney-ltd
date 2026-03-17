import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET all transactions
export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

// POST new transaction
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, amount, category, description } = body

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: parseInt(amount),
        category,
        description,
        date: new Date().toISOString().split('T')[0],
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}

// PUT update transaction
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, type, amount, category, description } = body

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        type,
        amount: parseInt(amount),
        category,
        description,
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
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
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}
