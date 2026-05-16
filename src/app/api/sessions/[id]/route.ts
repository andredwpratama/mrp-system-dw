import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

async function getAuthorizedSession(sessionId: string, userId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      forecastResult: true,
      aggregateResult: true,
      mpsResult: true,
      rccpResult: true,
      mrpResult: true,
      crpResult: true,
      pacEntries: { orderBy: { createdAt: 'asc' } },
    },
  })
  if (!session || session.userId !== userId) return null
  return session
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await getAuthorizedSession(id, user.id)
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(session)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await prisma.session.findUnique({ where: { id } })
  if (!session || session.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.session.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
