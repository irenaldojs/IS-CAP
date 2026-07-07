'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DatePickerNav } from './date-picker-nav'
import { getTzDate } from '@/lib/date-utils'

interface AgendaHeaderProps {
  date: string
  view: string
  lessonsCountSpan: React.ReactNode
  durationSpan: React.ReactNode
  valueSpan: React.ReactNode
}

export function AgendaHeader({
  date,
  view,
  lessonsCountSpan,
  durationSpan,
  valueSpan,
}: AgendaHeaderProps) {
  // Parse date and adjust to America/Sao_Paulo
  const selectedDate = getTzDate(date + 'T12:00:00')
  const targetDate = new Date(selectedDate)
  targetDate.setHours(0, 0, 0, 0)

  const getMonday = (d: Date) => {
    const dateCopy = new Date(d)
    const day = dateCopy.getDay()
    const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(dateCopy.setDate(diff))
  }

  const monday = getMonday(targetDate)

  const weekDays: Date[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    weekDays.push(day)
  }

  const getNeighborWeekDate = (pivotDate: Date, direction: number) => {
    const newDate = new Date(pivotDate)
    newDate.setDate(newDate.getDate() + direction * 7)
    return newDate.toISOString().split('T')[0]
  }

  const prevWeekDateStr = getNeighborWeekDate(selectedDate, -1)
  const nextWeekDateStr = getNeighborWeekDate(selectedDate, 1)

  const formatDateRange = () => {
    const formatDay = (d: Date) => d.getDate()
    const formatMonth = (d: Date) => d.toLocaleString('pt-BR', { month: 'short' })
    const formatYear = (d: Date) => d.getFullYear()
    
    const sunday = weekDays[6]
    
    if (monday.getMonth() === sunday.getMonth()) {
      return `${formatDay(monday)} a ${formatDay(sunday)} de ${formatMonth(monday)} de ${formatYear(monday)}`
    } else if (monday.getFullYear() === sunday.getFullYear()) {
      return `${formatDay(monday)} de ${formatMonth(monday)} a ${formatDay(sunday)} de ${formatMonth(sunday)} de ${formatYear(monday)}`
    }
    return `${formatDay(monday)} de ${formatMonth(monday)} de ${formatYear(monday)} a ${formatDay(sunday)} de ${formatMonth(sunday)} de ${formatYear(sunday)}`
  }

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
            {formatDateRange()}
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
