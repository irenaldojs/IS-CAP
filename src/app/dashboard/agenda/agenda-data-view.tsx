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
      return lessonDate >= today
    }
    return true
  })

  // --- Lógica de Visualização em Lista ---
  if (view === 'list') {
    return (
      <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Próximas Sessões</CardTitle>
          <CardDescription className="text-slate-400">
            {filteredLessons.length === 1
              ? '1 aula encontrada'
              : `${filteredLessons.length} aulas encontradas`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredLessons.length === 0 ? (
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
                {filteredLessons.map((lesson) => (
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
                        <span className="inline-flex items-center rounded-full bg-emerald-950/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-900/20">
                          Concluída
                        </span>
                      ) : lesson.status === 'CANCELADA' ? (
                        <span className="inline-flex items-center rounded-full bg-red-950/40 px-2.5 py-0.5 text-xs font-semibold text-red-400 border border-red-900/20">
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

  // --- Lógica de Visualização em Calendário ---
  const selectedDate = new Date(date + 'T12:00:00') // evita problemas de timezone

  const getDaysInMonth = (pivotDate: Date) => {
    const year = pivotDate.getFullYear()
    const month = pivotDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days = []
    
    const startDayOfWeek = firstDay.getDay()
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const calendarDays = getDaysInMonth(selectedDate)
  const monthName = selectedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  // Aulas do dia selecionado
  const getLessonsForDate = (day: Date) => {
    return lessons.filter((lesson) => {
      const d = new Date(lesson.date)
      return (
        d.getDate() === day.getDate() &&
        d.getMonth() === day.getMonth() &&
        d.getFullYear() === day.getFullYear()
      )
    })
  }

  const lessonsForSelectedDay = getLessonsForDate(selectedDate)

  // Cálculo dos meses vizinhos para paginação
  const getNeighborMonthDate = (pivotDate: Date, direction: number) => {
    const newDate = new Date(pivotDate)
    newDate.setMonth(newDate.getMonth() + direction)
    newDate.setDate(1)
    return newDate.toISOString().split('T')[0]
  }

  const prevMonthDateStr = getNeighborMonthDate(selectedDate, -1)
  const nextMonthDateStr = getNeighborMonthDate(selectedDate, 1)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendário Mensal */}
      <Card className="lg:col-span-2 border-slate-800 bg-slate-900/20 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-200 capitalize">
              {monthName}
            </CardTitle>
            <CardDescription className="text-slate-400">
              Dias com aulas estão marcados com pontos coloridos.
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={`/dashboard/agenda?view=calendar&date=${prevMonthDateStr}`}
              className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), "h-8 w-8 cursor-pointer")}
            >
              <ChevronLeft className="size-4" />
            </Link>
            <Link
              href={`/dashboard/agenda?view=calendar&date=${nextMonthDateStr}`}
              className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), "h-8 w-8 cursor-pointer")}
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Dias da semana */}
          <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-500 pb-2 border-b border-slate-800/40">
            <div>DOM</div>
            <div>SEG</div>
            <div>TER</div>
            <div>QUA</div>
            <div>QUI</div>
            <div>SEX</div>
            <div>SÁB</div>
          </div>

          {/* Grid de dias do mês */}
          <div className="grid grid-cols-7 gap-1.5 pt-2">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="aspect-square bg-slate-900/5 rounded-lg opacity-20" />

              const dayLessons = getLessonsForDate(day)
              const hasLessons = dayLessons.length > 0
              const isToday = new Date().toDateString() === day.toDateString()
              const isSelected = selectedDate.toDateString() === day.toDateString()
              const dayStr = day.toISOString().split('T')[0]

              return (
                <Link
                  key={day.toISOString()}
                  href={`/dashboard/agenda?view=calendar&date=${dayStr}`}
                  className={`aspect-square relative flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/40 border-indigo-500 text-white font-bold'
                      : isToday
                      ? 'bg-slate-800/60 border-slate-700 text-indigo-400 font-semibold'
                      : 'bg-slate-950/20 border-slate-900 text-slate-300 hover:bg-slate-800/25 hover:border-slate-800'
                  }`}
                >
                  <span className="text-sm">{day.getDate()}</span>
                  
                  {/* Dots indicando aulas */}
                  {hasLessons && (
                    <div className="absolute bottom-1.5 flex gap-1 justify-center">
                      {dayLessons.slice(0, 3).map((lesson) => (
                        <span
                          key={lesson.id}
                          style={{ backgroundColor: lesson.subject.color }}
                          className="size-1 rounded-full shadow-sm shadow-black"
                          title={`${lesson.student.name}: ${lesson.subject.name}`}
                        />
                      ))}
                      {dayLessons.length > 3 && (
                        <span className="text-[7px] text-slate-400 font-bold -mt-1">+</span>
                      )}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lateral: Aulas do Dia Selecionado */}
      <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
        <CardHeader className="border-b border-slate-800/40 pb-4">
          <CardTitle className="text-base font-bold text-slate-200">
            Aulas de {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </CardTitle>
          <CardDescription className="text-slate-400">
            Agenda detalhada para a data selecionada.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4 max-h-[55vh] overflow-y-auto">
          {lessonsForSelectedDay.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm italic">
              Nenhuma aula agendada para este dia.
            </div>
          ) : (
            lessonsForSelectedDay.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/dashboard/agenda?view=calendar&date=${date}&editLessonId=${lesson.id}`}
                className="flex flex-col gap-2.5 p-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/35 hover:bg-slate-950/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{ color: lesson.subject.color, backgroundColor: `${lesson.subject.color}12` }}
                    className="px-2 py-0.5 text-xs font-semibold rounded border border-slate-800"
                  >
                    {lesson.subject.name}
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="size-3 text-slate-500" />
                    {formatTime(lesson.startTime)} ({lesson.durationHours}h)
                  </span>
                </div>

                <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {lesson.student.name}
                </div>

                {lesson.notes && (
                  <p className="text-xs text-slate-400 line-clamp-2 italic bg-slate-950/50 p-2 rounded">
                    {lesson.notes}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-xs">
                  {lesson.modality === 'ONLINE' ? (
                    <span className="text-sky-400 flex items-center gap-1">
                      <Video className="size-3" /> Online
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <MapPin className="size-3" /> Presencial
                    </span>
                  )}
                  
                  <span className="font-bold text-slate-300">
                    {formatCurrency(lesson.value)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
