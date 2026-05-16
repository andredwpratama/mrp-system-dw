import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sessions = await prisma.session.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, name: true, createdAt: true, updatedAt: true,
      forecastResult: { select: { bestMethod: true, mapeValue: true } },
      mrpResult: { select: { bestMethod: true } },
    },
  })
  return NextResponse.json(sessions)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nama sesi wajib diisi' }, { status: 400 })

  const session = await prisma.session.create({
    data: { userId: user.id, name: name.trim() },
  })
  return NextResponse.json(session, { status: 201 })
}
