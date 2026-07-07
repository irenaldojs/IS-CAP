'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DatePickerNav } from './date-picker-nav'

interface AgendaHeaderProps {
  prevWeekDateStr: string
  nextWeekDateStr: string
  date: string
  view: string
  dateRangeStr: string
  lessonsCountSpan: React.ReactNode
  durationSpan: React.ReactNode
  valueSpan: React.ReactNode
}

export function AgendaHeader({
  prevWeekDateStr,
  nextWeekDateStr,
  date,
  view,
  dateRangeStr,
  lessonsCountSpan,
  durationSpan,
  valueSpan,
}: AgendaHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/80 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 border border-slate-800 bg-slate-950 p-1 rounded-lg">
          <Link
            href={`/dashboard/agenda?view=calendar&date=${prevWeekDateStr}`}
            className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), "h-7 w-7 cursor-pointer")}
            title="Semana Anterior"
          >
            <ChevronLeft className="size-3.5" />
          </Link>
          <Link
            href={`/dashboard/agenda?view=calendar&date=${nextWeekDateStr}`}
            className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), "h-7 w-7 cursor-pointer")}
            title="Próxima Semana"
          >
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
        <DatePickerNav currentDate={date} view={view} />
        <div>
          <h2 className="text-sm font-bold text-slate-200 capitalize">
            {dateRangeStr}
          </h2>
        </div>
      </div>

      {/* Resumo Rápido da Semana */}
      <div className="flex flex-wrap gap-2 text-[10px]">
        <div className="bg-slate-950/40 px-2 py-1 rounded border border-slate-850">
          <span className="text-slate-500 block">Aulas Semanais</span>
          {lessonsCountSpan}
        </div>
        <div className="bg-slate-950/40 px-2 py-1 rounded border border-slate-850">
          <span className="text-slate-500 block">Horas Totais</span>
          {durationSpan}
        </div>
        <div className="bg-slate-950/40 px-2 py-1 rounded border border-slate-850">
          <span className="text-slate-500 block">Receita Estimada</span>
          {valueSpan}
        </div>
      </div>
    </div>
  )
}
