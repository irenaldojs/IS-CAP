'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  User,
  Phone,
  Mail,
  School,
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  Award,
  Video,
  MapPin,
  ClipboardList,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

interface SubjectRelation {
  id: string
  subject: {
    id: string
    name: string
    color: string
  }
}

interface Lesson {
  id: string
  date: Date
  startTime: Date
  durationHours: number
  value: number
  modality: string
  status: string
  notes: string | null
  subjectId: string
}

interface Exam {
  id: string
  title: string
  examDate: Date
  score: number | null
  notes: string | null
  subjectId: string
}

interface Grade {
  id: string
  period: string
  score: number
  notes: string | null
  subjectId: string
}

interface Student {
  id: string
  name: string
  parentName: string | null
  parentPhone: string | null
  email: string | null
  phone: string | null
  school: string | null
  age: number | null
  gradeLevel: string | null
  notes: string | null
  active: boolean
  fixedScheduleActive: boolean
  fixedScheduleDay: string | null
  fixedScheduleTime: string | null
  fixedSchedulePrice: number | null
  fixedScheduleTemporarilyDisabled: boolean
  subjects: SubjectRelation[]
  lessons: Lesson[]
  exams: Exam[]
  grades: Grade[]
}

interface StudentDetailClientProps {
  student: Student
}

type TabType = 'pessoais' | 'aulas' | 'boletim'

export function StudentDetailClient({ student }: StudentDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pessoais')

  // Mapeamento de matérias para busca de nome por id
  const subjectMap = new Map(
    student.subjects.map((s) => [s.subject.id, s.subject])
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date))
  }

  const formatTime = (date: Date | string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      {/* Abas de Navegação */}
      <div className="flex border-b border-slate-800 bg-slate-900/40 p-1 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('pessoais')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'pessoais'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="size-4" />
          Dados Pessoais
        </button>
        <button
          onClick={() => setActiveTab('aulas')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'aulas'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="size-4" />
          Aulas
        </button>
        <button
          onClick={() => setActiveTab('boletim')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'boletim'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="size-4" />
          Notas & Provas
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="transition-all duration-300">
        {/* ABA: DADOS PESSOAIS */}
        {activeTab === 'pessoais' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            {/* Bloco Central de Informações */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-200">
                    Informações Cadastrais
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Dados pessoais e informações acadêmicas do aluno.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                      Nome Completo
                    </p>
                    <p className="text-sm font-medium text-slate-200">{student.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                      E-mail
                    </p>
                    <p className="text-sm font-medium text-slate-200">
                      {student.email || <span className="text-slate-500 italic">Não informado</span>}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                      Contato do Aluno
                    </p>
                    <p className="text-sm font-medium text-slate-200">
                      {student.phone || <span className="text-slate-500 italic">Não informado</span>}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                      Idade
                    </p>
                    <p className="text-sm font-medium text-slate-200">
                      {student.age ? `${student.age} anos` : <span className="text-slate-500 italic">Não informada</span>}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                      Série / Ano Letivo
                    </p>
                    <p className="text-sm font-medium text-slate-200">
                      {student.gradeLevel || <span className="text-slate-500 italic">Não informado</span>}
                    </p>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                      Escola / Colégio
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-sm font-medium text-slate-200">
                      <School className="size-4 text-indigo-400" />
                      <span>{student.school || <span className="text-slate-500 italic">Não informado</span>}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Observações */}
              <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-200">
                    Observações e Notas
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Anotações pedagógicas, dificuldades e objetivos de aprendizado.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  {student.notes ? (
                    <div className="bg-slate-950/40 border-l-2 border-indigo-500 rounded-r-lg p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {student.notes}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">Nenhuma observação cadastrada para este aluno.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Lateral: Responsável & Matérias */}
            <div className="space-y-6">
              {/* Card Contato Responsável */}
              <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-200">
                    Contato do Responsável
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pb-6">
                  <div className="flex items-start gap-3">
                    <User className="size-5 text-indigo-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Responsável</p>
                      <p className="text-sm font-medium text-slate-200">
                        {student.parentName || <span className="text-slate-500 italic">Não cadastrado</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-2">
                    <Phone className="size-5 text-indigo-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Telefone</p>
                      <p className="text-sm font-mono text-slate-200">
                        {student.parentPhone || <span className="text-slate-500 italic">Não cadastrado</span>}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Matérias Vinculadas */}
              <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-200">
                    Matérias Associadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                  {student.subjects.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">Nenhuma matéria vinculada.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {student.subjects.map((subRel) => (
                        <div
                          key={subRel.id}
                          style={{
                            backgroundColor: `${subRel.subject.color}15`,
                            borderColor: `${subRel.subject.color}35`,
                            color: subRel.subject.color,
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-full border"
                        >
                          {subRel.subject.name}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card Agenda Fixa */}
              <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-slate-200 flex items-center gap-2">
                    <Clock className="size-4.5 text-indigo-400" />
                    Agenda Fixa (Semanal)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pb-6">
                  {student.fixedScheduleActive ? (
                    <>
                      <div className="flex items-center gap-2">
                        {student.fixedScheduleTemporarilyDisabled ? (
                          <span className="inline-flex items-center rounded-full bg-amber-950/40 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-900/20">
                            Pausada Temporariamente
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-950/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-900/20">
                            Ativa e Recorrente
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 pt-1">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Horário Reservado</p>
                        <p className="text-sm font-medium text-slate-200">
                          {student.fixedScheduleDay} às {student.fixedScheduleTime}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Preço Fixo da Aula</p>
                        <p className="text-sm font-mono font-medium text-indigo-300">
                          {student.fixedSchedulePrice ? formatCurrency(student.fixedSchedulePrice) : 'R$ 0,00'}
                        </p>
                      </div>

                      {student.fixedScheduleTemporarilyDisabled && (
                        <p className="text-xs text-amber-450 italic mt-1 leading-normal">
                          * Esta semana não haverá aula recorrente para este aluno.
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-sm text-slate-500 italic">Nenhum horário fixo configurado.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ABA: HISTÓRICO DE AULAS */}
        {activeTab === 'aulas' && (
          <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-200">Histórico de Aulas</CardTitle>
              <CardDescription className="text-slate-400">
                Lista de todas as aulas agendadas e realizadas para este aluno.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Resumo de Aulas e Financeiro do Aluno */}
              <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-800 bg-slate-950/15 p-4 gap-4">
                <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-800/40">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total de Aulas</p>
                  <p className="mt-1 text-2xl font-bold text-slate-200">
                    {student.lessons.length}
                  </p>
                </div>
                <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-800/40">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Valor Total Acumulado</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-400 font-mono">
                    {formatCurrency(student.lessons.reduce((sum, l) => sum + l.value, 0))}
                  </p>
                </div>
                <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-800/40">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Preço Fixo da Aula</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-400 font-mono">
                    {student.fixedScheduleActive && student.fixedSchedulePrice
                      ? formatCurrency(student.fixedSchedulePrice)
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {student.lessons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Calendar className="size-12 text-slate-700 mb-3" />
                  <h3 className="font-semibold text-slate-300">Nenhuma aula registrada</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Este aluno ainda não possui aulas agendadas no sistema.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-950/40 border-b border-slate-800">
                    <TableRow className="border-slate-800">
                      <TableHead className="pl-6 py-3 text-slate-400 font-medium">Data</TableHead>
                      <TableHead className="py-3 text-slate-400 font-medium">Horário / Duração</TableHead>
                      <TableHead className="py-3 text-slate-400 font-medium">Matéria</TableHead>
                      <TableHead className="py-3 text-slate-400 font-medium">Modalidade</TableHead>
                      <TableHead className="py-3 text-slate-400 font-medium">Valor</TableHead>
                      <TableHead className="py-3 text-slate-400 font-medium">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.lessons.map((lesson) => {
                      const subject = subjectMap.get(lesson.subjectId)
                      return (
                        <TableRow key={lesson.id} className="border-slate-800 hover:bg-slate-900/30">
                          {/* Data da Aula */}
                          <TableCell className="pl-6 py-4 text-slate-200 font-medium">
                            {formatDate(lesson.date)}
                          </TableCell>

                          {/* Horário / Duração */}
                          <TableCell className="py-4 text-slate-300">
                            <div className="flex items-center gap-1">
                              <Clock className="size-3.5 text-slate-500" />
                              <span>
                                {formatTime(lesson.startTime)} ({lesson.durationHours}h)
                              </span>
                            </div>
                          </TableCell>

                          {/* Matéria */}
                          <TableCell className="py-4 text-slate-300">
                            {subject ? (
                              <span
                                style={{ color: subject.color }}
                                className="font-medium"
                              >
                                {subject.name}
                              </span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </TableCell>

                          {/* Modalidade */}
                          <TableCell className="py-4 text-slate-300">
                            {lesson.modality === 'ONLINE' ? (
                              <div className="inline-flex items-center gap-1 text-sky-400">
                                <Video className="size-3.5" />
                                <span>Online</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 text-amber-400">
                                <MapPin className="size-3.5" />
                                <span>Presencial</span>
                              </div>
                            )}
                          </TableCell>

                          {/* Valor da Aula */}
                          <TableCell className="py-4 text-slate-200 font-mono">
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
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* ABA: NOTAS & PROVAS */}
        {activeTab === 'boletim' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
            {/* Provas Realizadas (Exams) */}
            <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
              <CardHeader className="border-b border-slate-800/40 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <ClipboardList className="size-5 text-indigo-400" />
                  Histórico de Provas
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Notas de exames, provas e testes específicos.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {student.exams.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <ClipboardList className="size-10 text-slate-700 mb-2" />
                    <p className="text-slate-500 text-sm">Nenhuma prova cadastrada para este aluno.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-slate-950/20 border-b border-slate-800">
                      <TableRow className="border-slate-800">
                        <TableHead className="pl-6 py-3 text-slate-400 font-medium">Prova / Título</TableHead>
                        <TableHead className="py-3 text-slate-400 font-medium">Matéria</TableHead>
                        <TableHead className="py-3 text-slate-400 font-medium">Data</TableHead>
                        <TableHead className="pr-6 py-3 text-right text-slate-400 font-medium">Nota</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.exams.map((exam) => {
                        const subject = subjectMap.get(exam.subjectId)
                        const score = exam.score !== null ? exam.score : null
                        const scoreColor = score !== null ? (score >= 7.0 ? 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40' : 'text-rose-400 bg-rose-950/30 border-rose-900/40') : 'text-slate-500'

                        return (
                          <TableRow key={exam.id} className="border-slate-800/60 hover:bg-slate-900/20">
                            <TableCell className="pl-6 py-4 text-slate-200 font-medium">
                              <div>
                                <p className="font-semibold">{exam.title}</p>
                                {exam.notes && <p className="text-xs text-slate-500 truncate max-w-[150px]">{exam.notes}</p>}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              {subject ? (
                                <span
                                  style={{ color: subject.color }}
                                  className="font-medium text-sm"
                                >
                                  {subject.name}
                                </span>
                              ) : (
                                <span className="text-slate-550">—</span>
                              )}
                            </TableCell>
                            <TableCell className="py-4 text-slate-300 text-sm">
                              {formatDate(exam.examDate)}
                            </TableCell>
                            <TableCell className="pr-6 py-4 text-right">
                              {score !== null ? (
                                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-sm font-bold border ${scoreColor}`}>
                                  {score.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-slate-500 italic text-sm">Pendente</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Boletim / Notas Bimestrais/Trimestrais (Grades) */}
            <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
              <CardHeader className="border-b border-slate-800/40 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <TrendingUp className="size-5 text-indigo-400" />
                  Boletim Escolar (Períodos)
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Médias e notas finais agregadas por bimestre ou período.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {student.grades.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <TrendingUp className="size-10 text-slate-700 mb-2" />
                    <p className="text-slate-500 text-sm">Nenhuma nota final cadastrada.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-slate-950/20 border-b border-slate-800">
                      <TableRow className="border-slate-800">
                        <TableHead className="pl-6 py-3 text-slate-400 font-medium">Período</TableHead>
                        <TableHead className="py-3 text-slate-400 font-medium">Matéria</TableHead>
                        <TableHead className="pr-6 py-3 text-right text-slate-400 font-medium">Média Final</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.grades.map((grade) => {
                        const subject = subjectMap.get(grade.subjectId)
                        const scoreColor = grade.score >= 7.0 ? 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40' : 'text-rose-400 bg-rose-950/30 border-rose-900/40'

                        return (
                          <TableRow key={grade.id} className="border-slate-800/60 hover:bg-slate-900/20">
                            <TableCell className="pl-6 py-4 text-slate-200 font-semibold">
                              {grade.period}
                            </TableCell>
                            <TableCell className="py-4">
                              {subject ? (
                                <span
                                  style={{ color: subject.color }}
                                  className="font-medium text-sm"
                                >
                                  {subject.name}
                                </span>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </TableCell>
                            <TableCell className="pr-6 py-4 text-right">
                              <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded font-bold border text-sm ${scoreColor}`}>
                                {grade.score.toFixed(1)}
                              </span>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
