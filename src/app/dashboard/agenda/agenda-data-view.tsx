import { getLessons } from '@/actions/lessons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LessonStatusButton } from './status-button'
import {
  Calendar as CalendarIcon,
  Video,
  MapPin,
  Clock,
  Repeat,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { getTzDate } from '@/lib/date-utils'
import { AgendaHeader } from './agenda-header'

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
      timeZone: 'America/Sao_Paulo',
    }).format(new Date(dateInput))
  }

  const formatTime = (dateInput: Date | string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    }).format(new Date(dateInput))
  }

  // --- Lógica de Filtros e Datas ---
  const selectedDate = getTzDate(date + 'T12:00:00') // evita problemas de timezone
  const targetDate = new Date(selectedDate)
  targetDate.setHours(0, 0, 0, 0)

  // Obtém a segunda-feira da semana da data selecionada
  const getMonday = (d: Date) => {
    const dateCopy = new Date(d)
    const day = dateCopy.getDay()
    const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1) // ajusta para segunda
    return new Date(dateCopy.setDate(diff))
  }

  const monday = getMonday(targetDate)

  // Início e fim da semana da data selecionada
  const startOfWeek = new Date(monday)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(monday)
  endOfWeek.setDate(monday.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const filteredLessons = lessons.filter((lesson) => {
    const lessonDate = getTzDate(lesson.date)
    lessonDate.setHours(0, 0, 0, 0)

    if (period === 'today') {
      return lessonDate.getTime() === targetDate.getTime()
    }
    if (period === 'week') {
      return lessonDate >= startOfWeek && lessonDate <= endOfWeek
    }
    if (period === 'upcoming') {
      const startOfUpcoming = new Date(targetDate)
      startOfUpcoming.setHours(0, 0, 0, 0)
      
      const endOfUpcoming = new Date(targetDate)
      endOfUpcoming.setDate(targetDate.getDate() + 7)
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
      <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md flex flex-col h-full overflow-hidden">
        <CardHeader className="px-6 py-1.5 shrink-0 flex flex-row items-center justify-between space-y-0 border-b border-slate-800 bg-slate-950/20">
          <CardTitle className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {period === 'today' ? 'Aulas de Hoje' : 'Próximas Aulas (Próximos 7 dias)'}
          </CardTitle>
          <CardDescription className="text-slate-400 text-[10px]">
            {displayLessons.length === 1
              ? '1 aula encontrada'
              : `${displayLessons.length} aulas encontradas`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-slate-800/80">
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
                  <TableHead className="pl-6 py-2.5 text-slate-400 font-medium">Data</TableHead>
                  <TableHead className="py-2.5 text-slate-400 font-medium">Horário / Duração</TableHead>
                  <TableHead className="py-2.5 text-slate-400 font-medium">Aluno</TableHead>
                  <TableHead className="py-2.5 text-slate-400 font-medium">Matéria</TableHead>
                  <TableHead className="py-2.5 text-slate-400 font-medium">Modalidade</TableHead>
                  <TableHead className="py-2.5 text-slate-400 font-medium">Valor</TableHead>
                  <TableHead className="py-2.5 text-slate-400 font-medium">Status</TableHead>
                  <TableHead className="pr-6 py-2.5 text-right text-slate-400 font-medium">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayLessons.map((lesson) => (
                  <TableRow
                    key={lesson.id}
                    className="border-slate-800 hover:bg-slate-900/30 transition-colors"
                  >
                    {/* Data */}
                    <TableCell className="pl-6 py-2.5 text-slate-200 font-medium whitespace-nowrap">
                      {formatDate(lesson.date)}
                    </TableCell>

                    {/* Horário / Duração */}
                    <TableCell className="py-2.5 text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-slate-500" />
                        <span>{formatTime(lesson.startTime)} ({lesson.durationHours}h)</span>
                      </div>
                    </TableCell>

                    {/* Aluno */}
                    <TableCell className="py-2.5 text-slate-200 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded bg-indigo-950/40 text-indigo-400 border border-indigo-900/50 flex items-center justify-center font-bold text-xs uppercase">
                          {lesson.student.name.substring(0, 2)}
                        </div>
                        <span>{lesson.student.name}</span>
                      </div>
                    </TableCell>

                    {/* Matéria */}
                    <TableCell className="py-2.5">
                      <span
                        style={{ color: lesson.subject.color }}
                        className="font-semibold text-sm"
                      >
                        {lesson.subject.name}
                      </span>
                    </TableCell>

                    {/* Modalidade */}
                    <TableCell className="py-2.5 text-slate-300">
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
                    <TableCell className="py-2.5 text-slate-200 font-mono text-sm">
                      {formatCurrency(lesson.value)}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-2.5">
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
                    <TableCell className="pr-6 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/agenda?view=list&period=${period}&date=${date}&editLessonId=${lesson.id}`}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
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
  const weekDays: Date[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday)
    day.setDate(monday.getDate() + i)
    weekDays.push(day)
  }

  // Aulas do período da semana
  const weekLessons = lessons.filter((lesson) => {
    const lessonDate = new Date(lesson.date)
    return lessonDate >= startOfWeek && lessonDate <= endOfWeek
  })

  const getLessonsForDay = (day: Date) => {
    return weekLessons.filter((lesson) => {
      const d = getTzDate(lesson.date)
      return (
        d.getDate() === day.getDate() &&
        d.getMonth() === day.getMonth() &&
        d.getFullYear() === day.getFullYear()
      )
    })
  }

  // Estatísticas da semana
  const totalDuration = weekLessons.reduce((acc, l) => acc + l.durationHours, 0)
  const totalValue = weekLessons.reduce((acc, l) => acc + (l.status !== 'CANCELADA' ? l.value : 0), 0)

  // Configurações do grid de horários
  const startHour = 7
  const endHour = 21
  const hourHeight = 45 // pixels por hora (mais compacto/justo)
  const hoursArray = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

  const getPosition = (startTimeStr: Date | string, durationHours: number) => {
    const startTime = getTzDate(startTimeStr)
    const hours = startTime.getHours()
    const minutes = startTime.getMinutes()
    
    const timeDiff = hours + minutes / 60 - startHour
    const top = timeDiff * hourHeight
    const height = durationHours * hourHeight
    
    return { top, height }
  }

  return (
    <div className="flex flex-col h-full min-h-0 space-y-3 overflow-hidden">
      {/* Informações da Semana Selecionada */}
      <AgendaHeader
        date={date}
        view={view}
        lessonsCountSpan={
          <span className="text-xs font-bold text-white mt-0.5 block">{weekLessons.length} Aulas</span>
        }
        durationSpan={
          <span className="text-xs font-bold text-indigo-400 mt-0.5 block">{totalDuration} Horas</span>
        }
        valueSpan={
          <span className="text-xs font-bold text-emerald-400 mt-0.5 block font-mono">{formatCurrency(totalValue)}</span>
        }
      />

      {/* Calendário Semanal Grid */}
      <div className="relative flex border border-slate-800 bg-slate-900/10 rounded-xl flex-1 min-h-0 overflow-auto scrollbar-thin scrollbar-thumb-slate-800/80">
        
        {/* Coluna de Horas */}
        <div className="w-12 flex-shrink-0 border-r border-slate-800 bg-slate-950/60 text-right pr-2 text-[9px] font-semibold text-slate-500 select-none">
          {/* Cabeçalho Vazio para alinhar */}
          <div className="h-10 border-b border-slate-800 sticky top-0 bg-slate-950/85 z-30" />
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
                    "h-10 flex flex-col items-center justify-center border-b border-slate-800 transition-colors bg-slate-950/90 backdrop-blur-sm sticky top-0 z-30",
                    isToday && "bg-indigo-950/80 text-indigo-400 border-b-2 border-b-indigo-500 font-bold"
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
                    const isCompact = height < 50
                    return (
                      <Link
                        key={lesson.id}
                        href={`/dashboard/agenda?view=calendar&date=${date}&editLessonId=${lesson.id}`}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: `${lesson.subject.color}15`,
                          borderColor: lesson.subject.color,
                        }}
                        className={cn(
                          "absolute left-1 right-1 rounded-lg border-l-4 border-y border-r border-slate-800/85 flex flex-col justify-center transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-indigo-950/20 hover:z-20 group z-10 select-none overflow-hidden cursor-pointer",
                          isCompact ? "p-1" : "p-1.5"
                        )}
                      >
                        <span className={cn(
                          "text-xs font-bold text-slate-100 truncate block group-hover:text-white transition-colors leading-tight",
                          lesson.status === 'CANCELADA' && 'line-through text-slate-500 font-medium'
                        )}>
                          {lesson.student.name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5 flex items-center gap-0.5 leading-none">
                          <Clock className="size-2.5 text-slate-500" />
                          {formatTime(lesson.startTime)} ({lesson.durationHours}h)
                        </span>
                      </Link>
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
