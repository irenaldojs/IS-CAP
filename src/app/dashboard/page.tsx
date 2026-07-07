import { auth } from '@/auth'
import { getDashboardSummary } from '@/actions/dashboard'
import {
  Users,
  Calendar,
  DollarSign,
  Bell,
  Video,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()
  const summary = await getDashboardSummary()

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Bem-vindo, {session?.user?.name || 'Professor'}!
          </h1>
          <p className="text-slate-400 mt-1">
            Aqui está o resumo das suas atividades e aulas para hoje.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Última atualização: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Alunos Ativos */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 size-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Alunos Ativos</p>
            <div className="size-8 rounded-lg bg-indigo-950/40 text-indigo-400 border border-indigo-900/35 flex items-center justify-center">
              <Users className="size-4.5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-white font-mono">{summary.activeStudentsCount}</p>
          <p className="text-xs text-slate-500 mt-1">Alunos matriculados ativos</p>
        </div>

        {/* Aulas esta Semana */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 size-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Aulas esta Semana</p>
            <div className="size-8 rounded-lg bg-violet-950/40 text-violet-400 border border-violet-900/35 flex items-center justify-center">
              <Calendar className="size-4.5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-white font-mono">{summary.lessonsThisWeekCount}</p>
          <p className="text-xs text-slate-500 mt-1">Total de aulas agendadas</p>
        </div>

        {/* Receita Estimada */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 size-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Receita Estimada</p>
            <div className="size-8 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/35 flex items-center justify-center">
              <DollarSign className="size-4.5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-white font-mono">{formatCurrency(summary.estimatedRevenue)}</p>
          <p className="text-xs text-slate-500 mt-1">Previsão de ganho este mês</p>
        </div>

        {/* Alertas Pendentes */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 size-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Alertas Pendentes</p>
            <div className="size-8 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-900/35 flex items-center justify-center">
              <Bell className="size-4.5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-white font-mono">{summary.pendingAlertsCount}</p>
          <p className="text-xs text-slate-500 mt-1">Notificações não lidas</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Próximas Aulas */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Próximas Aulas</h2>
              <Link
                href="/dashboard/agenda"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5 transition-colors"
              >
                Ver agenda <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {summary.upcomingLessons.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-sm text-slate-500 border border-dashed border-slate-800/80 rounded-lg bg-slate-950/10">
                <Calendar className="size-8 text-slate-700 mb-2" />
                <span>Nenhuma aula agendada em breve.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {summary.upcomingLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="size-9 rounded flex items-center justify-center font-bold text-xs border bg-slate-950/30 uppercase shrink-0"
                        style={{ borderColor: `${lesson.subject.color}80`, color: lesson.subject.color }}
                      >
                        {lesson.student.name.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-200 truncate">{lesson.student.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span style={{ color: lesson.subject.color }} className="font-semibold text-[11px]">
                            {lesson.subject.name}
                          </span>
                          <span>•</span>
                          {lesson.modality === 'ONLINE' ? (
                            <span className="text-sky-400 flex items-center gap-0.5 text-[11px]">
                              <Video className="size-3" /> Online
                            </span>
                          ) : (
                            <span className="text-amber-400 flex items-center gap-0.5 text-[11px]">
                              <MapPin className="size-3" /> Presencial
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-slate-300">{formatDate(lesson.date)}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center justify-end gap-1">
                        <Clock className="size-3" />
                        {formatTime(lesson.startTime)} ({lesson.durationHours}h)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagamentos Pendentes */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Pagamentos Pendentes</h2>
              <Link
                href="/dashboard/financeiro"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5 transition-colors"
              >
                Ver financeiro <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {summary.pendingPayments.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-sm text-slate-500 border border-dashed border-slate-800/80 rounded-lg bg-slate-950/10">
                <DollarSign className="size-8 text-slate-700 mb-2" />
                <span>Nenhum pagamento pendente no momento.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {summary.pendingPayments.map((payment) => {
                  const studentName = payment.lesson?.student?.name || 'Aluno'
                  const subjectName = payment.lesson?.subject?.name || 'Matéria'
                  const subjectColor = payment.lesson?.subject?.color || '#6366f1'
                  const lessonDate = payment.lesson?.date ? formatDate(payment.lesson.date) : '--/--'

                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded bg-amber-950/30 text-amber-400 border border-amber-900/35 flex items-center justify-center shrink-0">
                          <DollarSign className="size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-200 truncate">{studentName}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                            <span style={{ color: subjectColor }} className="font-semibold text-[11px]">
                              {subjectName}
                            </span>
                            <span>•</span>
                            <span className="text-[11px]">Aula em {lessonDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-amber-400 font-mono">
                          {formatCurrency(payment.amount)}
                        </p>
                        <Link
                          href="/dashboard/financeiro?tab=receitas"
                          className="text-[10px] text-slate-500 hover:text-slate-400 transition-colors underline mt-0.5 block"
                        >
                          Detalhes
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

