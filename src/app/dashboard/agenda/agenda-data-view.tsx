import { getLessons } from '@/actions/lessons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LessonStatusButton } from './status-button'
import {
  Calendar as CalendarIcon,
  Video,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Repeat,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

interface LessonsDataViewProps {
  view: 'list' | 'calendar'
  period: 'all' | 'today' | 'week' | 'upcoming'
  date: string
}

export async function LessonsDataView({ view, period, date }: LessonsDataViewProps) {
  const lessons = await getLessons()

  // Formatadores de UI
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateInput: Date | string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateInput))
  }

  const formatTime = (dateInput: Date | string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateInput))
  }

  // --- Lógica de Filtros ---
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
  endOfWeek.setHours(23, 59, 59, 999)

  const filteredLessons = lessons.filter((lesson) => {
    const lessonDate = new Date(lesson.date)
    lessonDate.setHours(0, 0, 0, 0)

    if (period === 'today') {
      return lessonDate.getTime() === today.getTime()
    }
    if (period === 'week') {
      return lessonDate >= today && lessonDate <= endOfWeek
    }
    if (period === 'upcoming') {
      const startOfUpcoming = new Date(today)
      startOfUpcoming.setHours(0, 0, 0, 0)
      
      const endOfUpcoming = new Date(today)
      endOfUpcoming.setDate(today.getDate() + 7)
      endOfUpcoming.setHours(23, 59, 59, 999)
      
      return lessonDate >= startOfUpcoming && lessonDate <= endOfUpcoming
    }
    return true
  })

  // --- Limite e exibição das aulas ---
  let displayLessons = filteredLessons
  if (period === 'upcoming') {
    displayLessons = filteredLessons.slice(0, 10)
  }

  // --- Lógica de Visualização em Lista ---
  if (view === 'list') {
    return (
      <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
        <CardHeader className="py-4">
          <CardTitle className="text-base font-semibold text-slate-200">
            {period === 'today' ? 'Aulas de Hoje' : 'Próximas Aulas (Próximos 7 dias)'}
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            {displayLessons.length === 1
              ? '1 aula encontrada'
              : `${displayLessons.length} aulas encontradas`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {displayLessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <CalendarIcon className="size-12 text-slate-700 mb-3" />
              <h3 className="font-semibold text-slate-300">Nenhuma aula agendada</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm">
                {period === 'all'
                  ? 'Nenhuma aula cadastrada no sistema. Comece clicando em Agendar Aula.'
                  : 'Nenhuma aula marcada para o período selecionado.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-950/40 border-b border-slate-800">
                <TableRow className="border-slate-800">
                  <TableHead className="pl-6 py-3 text-slate-400 font-medium">Data</TableHead>
                  <TableHead className="py-3 text-slate-400 font-medium">Horário / Duração</TableHead>
                  <TableHead className="py-3 text-slate-400 font-medium">Aluno</TableHead>
                  <TableHead className="py-3 text-slate-400 font-medium">Matéria</TableHead>
                  <TableHead className="py-3 text-slate-400 font-medium">Modalidade</TableHead>
                  <TableHead className="py-3 text-slate-400 font-medium">Valor</TableHead>
                  <TableHead className="py-3 text-slate-400 font-medium">Status</TableHead>
                  <TableHead className="pr-6 py-3 text-right text-slate-400 font-medium">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayLessons.map((lesson) => (
                  <TableRow
                    key={lesson.id}
                    className="border-slate-800 hover:bg-slate-900/30 transition-colors"
                  >
                    {/* Data */}
                    <TableCell className="pl-6 py-4 text-slate-200 font-medium whitespace-nowrap">
                      {formatDate(lesson.date)}
                    </TableCell>

                    {/* Horário / Duração */}
                    <TableCell className="py-4 text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-slate-500" />
                        <span>{formatTime(lesson.startTime)} ({lesson.durationHours}h)</span>
                      </div>
                    </TableCell>

                    {/* Aluno */}
                    <TableCell className="py-4 text-slate-200 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded bg-indigo-950/40 text-indigo-400 border border-indigo-900/50 flex items-center justify-center font-bold text-xs uppercase">
                          {lesson.student.name.substring(0, 2)}
                        </div>
                        <span>{lesson.student.name}</span>
                      </div>
                    </TableCell>

                    {/* Matéria */}
                    <TableCell className="py-4">
                      <span
                        style={{ color: lesson.subject.color }}
                        className="font-semibold text-sm"
                      >
                        {lesson.subject.name}
                      </span>
                    </TableCell>

                    {/* Modalidade */}
                    <TableCell className="py-4 text-slate-300">
                      {lesson.modality === 'ONLINE' ? (
                        <span className="inline-flex items-center gap-1 text-sky-400">
                          <Video className="size-3.5" />
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <MapPin className="size-3.5" />
                          Presencial
                        </span>
                      )}
                    </TableCell>

                    {/* Valor */}
                    <TableCell className="py-4 text-slate-200 font-mono text-sm">
                      {formatCurrency(lesson.value)}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-4">
                      {lesson.status === 'CONCLUIDA' ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-950/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-450 border border-emerald-900/20">
                          Concluída
                        </span>
                      ) : lesson.status === 'CANCELADA' ? (
                        <span className="inline-flex items-center rounded-full bg-red-950/40 px-2.5 py-0.5 text-xs font-semibold text-red-450 border border-red-900/20">
                          Cancelada
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-indigo-950/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-900/20">
                          Agendada
                        </span>
                      )}
                    </TableCell>

                    {/* Ações Rápidas */}
                    <TableCell className="pr-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/agenda?view=list&period=${period}&date=${date}&editLessonId=${lesson.id}`}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          Detalhes
                        </Link>
                        <LessonStatusButton id={lesson.id} status={lesson.status} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    )
  }

  // --- Lógica de Visualização em Calendário (Semanal) ---
  const selectedDate = new Date(date + 'T12:00:00') // evita problemas de timezone

  // Obtém a segunda-feira da semana da data selecionada
  const getMonday = (d: Date) => {
    const dateCopy = new Date(d)
    const day = dateCopy.getDay()
    const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1) // ajusta para segunda
    return new Date(dateCopy.setDate(diff))
  }

  const monday = getMonday(selectedDate)
  const weekDays: Date[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    weekDays.push(day)
  }

  // Aulas do período da semana
  const startOfWeek = new Date(monday)
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeekCalendar = new Date(monday)
  endOfWeekCalendar.setDate(monday.getDate() + 6)
  endOfWeekCalendar.setHours(23, 59, 59, 999)

  const weekLessons = lessons.filter((lesson) => {
    const lessonDate = new Date(lesson.date)
    return lessonDate >= startOfWeek && lessonDate <= endOfWeekCalendar
  })

  // Formatador de datas da semana para o cabeçalho
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

  const getLessonsForDay = (day: Date) => {
    return weekLessons.filter((lesson) => {
      const d = new Date(lesson.date)
      return (
        d.getDate() === day.getDate() &&
        d.getMonth() === day.getMonth() &&
        d.getFullYear() === day.getFullYear()
      )
    })
  }

  const getNeighborWeekDate = (pivotDate: Date, direction: number) => {
    const newDate = new Date(pivotDate)
    newDate.setDate(newDate.getDate() + direction * 7)
    return newDate.toISOString().split('T')[0]
  }

  const prevWeekDateStr = getNeighborWeekDate(selectedDate, -1)
  const nextWeekDateStr = getNeighborWeekDate(selectedDate, 1)

  // Estatísticas da semana
  const totalDuration = weekLessons.reduce((acc, l) => acc + l.durationHours, 0)
  const totalValue = weekLessons.reduce((acc, l) => acc + (l.status !== 'CANCELADA' ? l.value : 0), 0)

  // Configurações do grid de horários
  const startHour = 7
  const endHour = 21
  const hourHeight = 45 // pixels por hora (mais compacto/justo)
  const hoursArray = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

  const getPosition = (startTimeStr: Date | string, durationHours: number) => {
    const startTime = new Date(startTimeStr)
    const hours = startTime.getHours()
    const minutes = startTime.getMinutes()
    
    const timeDiff = hours + minutes / 60 - startHour
    const top = timeDiff * hourHeight
    const height = durationHours * hourHeight
    
    return { top, height }
  }

  return (
    <div className="space-y-3">
      {/* Informações da Semana Selecionada */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/80 backdrop-blur-md">
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
            <span className="text-xs font-bold text-white mt-0.5 block">{weekLessons.length} Aulas</span>
          </div>
          <div className="bg-slate-950/40 px-2 py-1 rounded border border-slate-850">
            <span className="text-slate-500 block">Horas Totais</span>
            <span className="text-xs font-bold text-indigo-400 mt-0.5 block">{totalDuration} Horas</span>
          </div>
          <div className="bg-slate-950/40 px-2 py-1 rounded border border-slate-850">
            <span className="text-slate-500 block">Receita Estimada</span>
            <span className="text-xs font-bold text-emerald-400 mt-0.5 block font-mono">{formatCurrency(totalValue)}</span>
          </div>
        </div>
      </div>

      {/* Calendário Semanal Grid */}
      <div className="relative flex border border-slate-800 bg-slate-900/10 rounded-xl overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800/80">
        
        {/* Coluna de Horas */}
        <div className="w-12 flex-shrink-0 border-r border-slate-800 bg-slate-950/60 text-right pr-2 text-[9px] font-semibold text-slate-500 select-none">
          {/* Cabeçalho Vazio para alinhar */}
          <div className="h-10 border-b border-slate-800" />
          {/* Linhas de Horas */}
          {hoursArray.map((hour) => (
            <div key={hour} style={{ height: `${hourHeight}px` }} className="flex items-start justify-end pt-1">
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Grid de Dias */}
        <div className="flex-grow grid grid-cols-7 min-w-[980px]">
          {weekDays.map((day, idx) => {
            const dayLessons = getLessonsForDay(day)
            const isToday = new Date().toDateString() === day.toDateString()
            const dayStr = day.toISOString().split('T')[0]
            
            return (
              <div key={idx} className="border-r border-slate-800/60 last:border-r-0 relative">
                {/* Cabeçalho do Dia */}
                <div
                  className={cn(
                    "h-10 flex flex-col items-center justify-center border-b border-slate-800 transition-colors bg-slate-950/20",
                    isToday && "bg-indigo-950/20 text-indigo-400 border-b-2 border-b-indigo-500 font-bold"
                  )}
                >
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider leading-none">
                    {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </span>
                  <span className={cn(
                    "text-xs font-extrabold mt-0.5 leading-none",
                    isToday ? "text-indigo-400" : "text-slate-200"
                  )}>
                    {day.getDate()}
                  </span>
                </div>

                {/* Área de Slots / Grid */}
                <div className="relative" style={{ height: `${hoursArray.length * hourHeight}px` }}>
                  
                  {/* Linhas Horizontais de Fundo e Click para Criar */}
                  {hoursArray.map((hour) => {
                    const timeStr = `${String(hour).padStart(2, '0')}:00`
                    return (
                      <Link
                        key={hour}
                        href={`/dashboard/agenda?view=calendar&date=${date}&createDate=${dayStr}&createTime=${timeStr}`}
                        style={{ 
                          top: `${(hour - startHour) * hourHeight}px`,
                          height: `${hourHeight}px`
                        }}
                        className="absolute left-0 right-0 border-b border-slate-900/35 hover:bg-indigo-550/5 transition-colors cursor-pointer z-0"
                        title={`Agendar aula para ${timeStr}`}
                      />
                    )
                  })}

                  {/* Cards de Aulas */}
                  {dayLessons.map((lesson) => {
                    const { top, height } = getPosition(lesson.startTime, lesson.durationHours)
                    const isCompact = height < 70
                    return (
                      <div
                        key={lesson.id}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: `${lesson.subject.color}15`,
                          borderColor: lesson.subject.color,
                        }}
                        className={cn(
                          "absolute left-1 right-1 rounded-lg border-l-4 border-y border-r border-slate-800/85 flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-950/20 hover:z-20 group z-10 select-none overflow-hidden",
                          isCompact ? "p-1" : "p-1.5"
                        )}
                      >
                        {/* Status / Matéria e Ações Rápidas */}
                        <div className="flex items-center justify-between gap-1 leading-none shrink-0">
                          <span
                            style={{ color: lesson.subject.color }}
                            className="text-[9px] font-extrabold tracking-wide uppercase truncate"
                          >
                            {lesson.subject.name}
                          </span>
                          {isCompact && (
                            <span className="text-[8px] text-slate-400 font-mono leading-none">
                              {formatTime(lesson.startTime)}
                            </span>
                          )}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 items-center shrink-0 z-20">
                            <LessonStatusButton id={lesson.id} status={lesson.status} />
                          </div>
                        </div>

                        {/* Aluno e Horário */}
                        <Link
                          href={`/dashboard/agenda?view=calendar&date=${date}&editLessonId=${lesson.id}`}
                          className="flex-grow flex flex-col justify-center min-w-0"
                        >
                          <span className={cn(
                            "text-xs font-bold text-slate-100 truncate block group-hover:text-white transition-colors leading-tight",
                            lesson.status === 'CANCELADA' && 'line-through text-slate-500 font-medium'
                          )}>
                            {lesson.student.name}
                          </span>
                          {!isCompact && (
                            <span className="text-[9px] text-slate-400 font-mono mt-0.5 flex items-center gap-0.5 leading-none">
                              <Clock className="size-2.5 text-slate-500" />
                              {formatTime(lesson.startTime)} ({lesson.durationHours}h)
                            </span>
                          )}
                        </Link>

                        {/* Rodapé: Modalidade e Recorrência */}
                        {!isCompact && (
                          <div className="flex items-center justify-between text-[9px] pt-1 border-t border-slate-800/40 text-slate-400 leading-none shrink-0">
                            {lesson.modality === 'ONLINE' ? (
                              <span className="text-sky-400 font-semibold flex items-center gap-0.5">
                                <Video className="size-2.5" />
                                Online
                              </span>
                            ) : (
                              <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                                <MapPin className="size-2.5" />
                                Presencial
                              </span>
                            )}
                            
                            <div className="flex items-center gap-1">
                              {lesson.status === 'CONCLUIDA' ? (
                                <span className="text-[8px] bg-emerald-950/50 text-emerald-450 border border-emerald-900/30 rounded px-1 font-bold">
                                  Concl.
                                </span>
                              ) : lesson.status === 'CANCELADA' ? (
                                <span className="text-[8px] bg-red-950/50 text-red-450 border border-red-900/30 rounded px-1 font-bold">
                                  Cancel.
                                </span>
                              ) : null}

                              {lesson.recurringScheduleId && (
                                <span className="flex items-center" title="Aula Semanal Fixa">
                                  <Repeat className="size-3 text-indigo-400 animate-pulse" />
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
