import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await prisma.session.findUnique({ where: { id: sessionId } })
  if (!session || session.userId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { module, data } = await request.json()
  if (!module || !data) return NextResponse.json({ error: 'module dan data wajib ada' }, { status: 400 })

  switch (module) {
    case 'forecast':
      await prisma.forecastResult.upsert({
        where: { sessionId },
        create: {
          sessionId,
          bestMethod: data.bestMethod,
          maeValue: data.maeValue,
          mseValue: data.mseValue,
          mapeValue: data.mapeValue,
          futureForecasts: data.futureForecasts,
          params: data.params ?? {},
        },
        update: {
          bestMethod: data.bestMethod,
          maeValue: data.maeValue,
          mseValue: data.mseValue,
          mapeValue: data.mapeValue,
          futureForecasts: data.futureForecasts,
          params: data.params ?? {},
        },
      })
      break

    case 'aggregate':
      await prisma.aggregateResult.upsert({
        where: { sessionId },
        create: { sessionId, chosenStrategy: data.chosenStrategy, weeklyPlan: data.weeklyPlan, totalCost: data.totalCost },
        update: { chosenStrategy: data.chosenStrategy, weeklyPlan: data.weeklyPlan, totalCost: data.totalCost },
      })
      break

    case 'mps':
      await prisma.mpsResult.upsert({
        where: { sessionId },
        create: { sessionId, rows: data.rows },
        update: { rows: data.rows },
      })
      break

    case 'rccp':
      await prisma.rccpResult.upsert({
        where: { sessionId },
        create: { sessionId, rows: data.rows, avgUtilization: data.avgUtilization },
        update: { rows: data.rows, avgUtilization: data.avgUtilization },
      })
      break

    case 'mrp':
      await prisma.mrpResult.upsert({
        where: { sessionId },
        create: {
          sessionId,
          bestMethod: data.bestMethod,
          lflRows: data.lflRows, eoqRows: data.eoqRows,
          poqRows: data.poqRows, fprRows: data.fprRows,
          lflTotalCost: data.lflTotalCost, eoqTotalCost: data.eoqTotalCost,
          poqTotalCost: data.poqTotalCost, fprTotalCost: data.fprTotalCost,
        },
        update: {
          bestMethod: data.bestMethod,
          lflRows: data.lflRows, eoqRows: data.eoqRows,
          poqRows: data.poqRows, fprRows: data.fprRows,
          lflTotalCost: data.lflTotalCost, eoqTotalCost: data.eoqTotalCost,
          poqTotalCost: data.poqTotalCost, fprTotalCost: data.fprTotalCost,
        },
      })
      break

    case 'crp':
      await prisma.crpResult.upsert({
        where: { sessionId },
        create: { sessionId, fermentation: data.fermentation, packaging: data.packaging },
        update: { fermentation: data.fermentation, packaging: data.packaging },
      })
      break

    case 'pac':
      await prisma.pacEntry.deleteMany({ where: { sessionId } })
      await prisma.pacEntry.createMany({
        data: data.batches.map((b: any) => ({ ...b, sessionId, batchDate: new Date(b.batchDate) })),
      })
      break

    default:
      return NextResponse.json({ error: `Module '${module}' tidak dikenal` }, { status: 400 })
  }

  await prisma.session.update({ where: { id: sessionId }, data: { updatedAt: new Date() } })
  return NextResponse.json({ success: true })
}
