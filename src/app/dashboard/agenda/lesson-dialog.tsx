'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  createLesson, 
  updateLesson, 
  deleteLesson,
  createRecurringSchedule,
  updateRecurringSchedule,
  deleteRecurringSchedule,
  checkLessonOverlap,
  checkRecurringScheduleOverlap,
  checkRecurringScheduleUpdateOverlap
} from '@/actions/lessons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { X, Loader2, Calendar, Clock, DollarSign, BookOpen, User, Video, MapPin, Trash2, Repeat, Gift } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTzDate } from '@/lib/date-utils'

// Helper functions to convert between float hours and HH:MM string
function floatToTime(duration: number): string {
  const hours = Math.floor(duration);
  const minutes = Math.round((duration - hours) * 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function timeToFloat(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h + (m / 60);
}

// Zod Form Validation
const lessonFormSchema = z.object({
  studentId: z.string().min(1, 'Selecione um aluno'),
  subjectId: z.string().optional(),
  date: z.string().min(1, 'Selecione uma data'),
  time: z.string().min(1, 'Selecione o horário de início'),
  durationTime: z.string().min(1, 'Selecione a duração'),
  value: z.coerce.number().min(0, 'Valor não pode ser negativo'),
  modality: z.string().min(1, 'Selecione a modalidade'),
  status: z.string().optional(),
  recurrence: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

type LessonFormValues = z.infer<typeof lessonFormSchema>

interface Student {
  id: string
  name: string
  hourlyRate?: number | null
  promotion?: string | null
}

interface Subject {
  id: string
  name: string
  color: string
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
  studentId: string
  subjectId: string
  subjectIds?: string[]
  recurrence: string | null
  recurringScheduleId?: string | null
}

interface LessonDialogProps {
  isOpen: boolean
  onClose: () => void
  students: Student[]
  subjects: Subject[]
  editingLesson?: Lesson | null
  defaultHourlyRate?: number
}

export function LessonDialog({
  isOpen,
  onClose,
  students,
  subjects,
  editingLesson,
  defaultHourlyRate = 80,
}: LessonDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [scheduleType, setScheduleType] = useState<'AVULSA' | 'SEMANAL'>('AVULSA')
  const [editOption, setEditOption] = useState<'INSTANCE' | 'SERIES'>('INSTANCE')
  
  // Estado para múltiplos temas/matérias selecionados
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema) as any,
    defaultValues: {
      studentId: '',
      subjectId: '',
      date: '',
      time: '',
      durationTime: '01:30',
      value: 80,
      modality: 'ONLINE',
      status: 'AGENDADA',
      recurrence: null,
      notes: '',
    },
  })

  // Assistir mudanças de aluno e duração para auto-preenchimento
  const watchedStudentId = watch('studentId')
  const watchedDurationTime = watch('durationTime')

  const selectedStudent = students.find(s => s.id === watchedStudentId)

  // Auto-preenche o preço quando aluno ou duração mudar
  useEffect(() => {
    if (watchedStudentId && watchedDurationTime) {
      const studentRate = selectedStudent?.hourlyRate ?? defaultHourlyRate
      const durationHours = timeToFloat(watchedDurationTime)
      setValue('value', Number((durationHours * studentRate).toFixed(2)))
    }
  }, [watchedStudentId, watchedDurationTime, selectedStudent, defaultHourlyRate, setValue])

  // Popula formulário se estiver em modo de edição
  useEffect(() => {
    if (editingLesson) {
      const lessonDate = getTzDate(editingLesson.date)
      const dateString = lessonDate.getFullYear() + '-' + String(lessonDate.getMonth() + 1).padStart(2, '0') + '-' + String(lessonDate.getDate()).padStart(2, '0')
      
      const startTime = getTzDate(editingLesson.startTime)
      const timeString = String(startTime.getHours()).padStart(2, '0') + ':' + String(startTime.getMinutes()).padStart(2, '0')
      
      setScheduleType(editingLesson.recurringScheduleId ? 'SEMANAL' : 'AVULSA')
      setEditOption('INSTANCE')
      setSelectedSubjects(editingLesson.subjectIds || [editingLesson.subjectId])

      reset({
        studentId: editingLesson.studentId,
        subjectId: editingLesson.subjectId,
        date: dateString,
        time: timeString,
        durationTime: floatToTime(editingLesson.durationHours),
        value: editingLesson.value,
        modality: editingLesson.modality,
        status: editingLesson.status,
        recurrence: editingLesson.recurrence,
        notes: editingLesson.notes || '',
      })
    } else {
      setScheduleType('AVULSA')
      setEditOption('INSTANCE')
      setSelectedSubjects([])
      
      const nowTz = getTzDate(new Date())
      const currentDateString = nowTz.getFullYear() + '-' + String(nowTz.getMonth() + 1).padStart(2, '0') + '-' + String(nowTz.getDate()).padStart(2, '0')

      reset({
        studentId: '',
        subjectId: '',
        date: currentDateString,
        time: '14:00',
        durationTime: '01:30',
        value: defaultHourlyRate * 1.5,
        modality: 'ONLINE',
        status: 'AGENDADA',
        recurrence: null,
        notes: '',
      })
    }
  }, [editingLesson, reset, isOpen, defaultHourlyRate])

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  const onSubmit = async (values: LessonFormValues) => {
    if (selectedSubjects.length === 0) {
      toast.error('Selecione pelo menos uma matéria para a aula.')
      return
    }

    setIsSubmitting(true)
    try {
      // Concatena data e hora em objetos DateTime correspondentes
      const combinedDateTime = new Date(`${values.date}T${values.time}:00`)

      if (editingLesson) {
        if (editingLesson.recurringScheduleId && editOption === 'SERIES') {
          // Converte data de início para os valores novos
          const firstDate = new Date(combinedDateTime)
          const dayOfWeek = firstDate.getDay()
          const timeString = firstDate.toTimeString().split(' ')[0].substring(0, 5) // HH:MM

          // Verificar colisão
          const durationHours = timeToFloat(values.durationTime)
          const check = await checkRecurringScheduleUpdateOverlap(editingLesson.recurringScheduleId, {
            dayOfWeek,
            startTime: timeString,
            durationHours: durationHours,
          })
          if (check.hasOverlap) {
            const conflictNames = Array.from(new Set(check.overlaps.map(o => o.studentName))).join(', ')
            const confirmMsg = `Conflito de Horários:\nNas datas futuras selecionadas, já existem aulas agendadas com os seguintes alunos: ${conflictNames}.\n\nDeseja salvar mesmo assim para dar aulas conjuntas (criar combo)?`
            if (!confirm(confirmMsg)) {
              setIsSubmitting(false)
              return
            }
          }

          await updateRecurringSchedule(editingLesson.recurringScheduleId, {
            dayOfWeek,
            startTime: timeString,
            durationHours: durationHours,
            value: values.value,
            modality: values.modality,
          })
          toast.success('Série de aulas recorrentes atualizada com sucesso!')
        } else {
          // Verificar colisão
          const durationHours = timeToFloat(values.durationTime)
          const check = await checkLessonOverlap({
            startTime: combinedDateTime,
            durationHours: durationHours,
            ignoreLessonId: editingLesson.id,
          })
          if (check.hasOverlap) {
            const conflictNames = check.overlappingLessons.map(l => l.studentName).join(', ')
            const confirmMsg = `Conflito de Horário:\nJá existe aula agendada com (${conflictNames}) nesse horário.\n\nDeseja salvar mesmo assim para dar aula conjunta (combo)?`
            if (!confirm(confirmMsg)) {
              setIsSubmitting(false)
              return
            }
          }

          // Atualiza apenas a instância selecionada
          const lessonInput = {
            studentId: values.studentId,
            subjectId: selectedSubjects[0],
            subjectIds: selectedSubjects,
            date: combinedDateTime,
            startTime: combinedDateTime,
            durationHours: durationHours,
            value: values.value,
            modality: values.modality,
            status: values.status,
            recurrence: editingLesson.recurringScheduleId ? 'SEMANAL' : 'AVULSA',
            notes: values.notes || null,
          }
          await updateLesson(editingLesson.id, lessonInput)
          toast.success('Esta aula foi atualizada com sucesso!')
        }
      } else {
        // Novo Agendamento
        if (scheduleType === 'SEMANAL') {
          // Verificar colisão
          const durationHours = timeToFloat(values.durationTime)
          const check = await checkRecurringScheduleOverlap({
            startDate: combinedDateTime,
            durationHours: durationHours,
          })
          if (check.hasOverlap) {
            const conflictNames = Array.from(new Set(check.overlaps.map(o => o.studentName))).join(', ')
            const confirmMsg = `Conflito de Horários:\nNas datas deste agendamento, já existem aulas com os seguintes alunos: ${conflictNames}.\n\nDeseja salvar mesmo assim para criar aulas conjuntas (combo)?`
            if (!confirm(confirmMsg)) {
              setIsSubmitting(false)
              return
            }
          }

          await createRecurringSchedule({
            studentId: values.studentId,
            subjectId: selectedSubjects[0],
            startDate: combinedDateTime,
            durationHours: durationHours,
            value: values.value,
            modality: values.modality,
            notes: values.notes,
          })
          toast.success('Agendamento semanal e aulas das próximas 8 semanas gerados!')
        } else {
          // Verificar colisão
          const durationHours = timeToFloat(values.durationTime)
          const check = await checkLessonOverlap({
            startTime: combinedDateTime,
            durationHours: durationHours,
          })
          if (check.hasOverlap) {
            const conflictNames = check.overlappingLessons.map(l => l.studentName).join(', ')
            const confirmMsg = `Conflito de Horário:\nJá existe aula agendada com (${conflictNames}) nesse horário.\n\nDeseja salvar mesmo assim para dar aula conjunta (combo)?`
            if (!confirm(confirmMsg)) {
              setIsSubmitting(false)
              return
            }
          }

          const lessonInput = {
            studentId: values.studentId,
            subjectId: selectedSubjects[0],
            subjectIds: selectedSubjects,
            date: combinedDateTime,
            startTime: combinedDateTime,
            durationHours: durationHours,
            value: values.value,
            modality: values.modality,
            status: values.status,
            recurrence: 'AVULSA',
            notes: values.notes || null,
          }
          await createLesson(lessonInput)
          toast.success('Aula avulsa agendada com sucesso!')
        }
      }
      onClose()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar a aula. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editingLesson) return
    
    const confirmMsg = editingLesson.recurringScheduleId && editOption === 'SERIES'
      ? 'Deseja realmente excluir toda a série recorrente de aulas? Isto apagará todas as aulas futuras agendadas desta série.'
      : 'Deseja realmente excluir esta aula? Esta ação não pode ser desfeita.'

    if (!confirm(confirmMsg)) return

    setIsDeleting(true)
    try {
      if (editingLesson.recurringScheduleId && editOption === 'SERIES') {
        await deleteRecurringSchedule(editingLesson.recurringScheduleId)
        toast.success('Série de aulas recorrentes excluída!')
      } else {
        await deleteLesson(editingLesson.id)
        toast.success('Aula excluída com sucesso!')
      }
      onClose()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao excluir.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/40 px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            {editingLesson ? 'Editar Aula Agendada' : 'Agendar Nova Aula'}
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-h-[72vh] overflow-y-auto p-6 space-y-4">
            
            {/* Seletor Tipo de Agendamento (Apenas na Criação) */}
            {!editingLesson && (
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs font-semibold">Tipo de Agendamento</Label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-850">
                  <button
                    type="button"
                    onClick={() => setScheduleType('AVULSA')}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      scheduleType === 'AVULSA'
                        ? 'bg-indigo-650 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Aula Avulsa
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleType('SEMANAL')}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      scheduleType === 'SEMANAL'
                        ? 'bg-indigo-650 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Aula Semanal (Recorrente)
                  </button>
                </div>
              </div>
            )}

            {/* Aviso e Opção de Edição de Recorrência */}
            {editingLesson && editingLesson.recurringScheduleId && (
              <div className="bg-slate-950/50 border border-slate-800/80 p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Repeat className="size-4 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">Ajuste de Aula Recorrente</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Esta aula faz parte de um agendamento semanal fixo. Como deseja salvar as alterações?
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditOption('INSTANCE')}
                    className={`px-3 py-2 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                      editOption === 'INSTANCE'
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Apenas esta semana
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditOption('SERIES')}
                    className={`px-3 py-2 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                      editOption === 'SERIES'
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Toda a recorrência
                  </button>
                </div>
              </div>
            )}

            {/* Student Select */}
            <div className="space-y-1">
              <Label htmlFor="studentId" className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <User className="size-3.5 text-indigo-400" /> Aluno <span className="text-red-500">*</span>
              </Label>
              <select
                id="studentId"
                disabled={!!editingLesson}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
                {...register('studentId')}
              >
                <option value="" className="bg-slate-900 text-slate-200">Selecione o aluno...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id} className="bg-slate-900 text-slate-200">
                    {student.name}
                  </option>
                ))}
              </select>
              {errors.studentId && (
                <p className="text-xs text-red-400 mt-1">{errors.studentId.message}</p>
              )}
            </div>

            {/* Multiple Subject Checkboxes */}
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-indigo-400" /> Matérias da Aula <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto bg-slate-950/50 p-2.5 rounded-lg border border-slate-805">
                {subjects.map((sub) => {
                  const isChecked = selectedSubjects.includes(sub.id)
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSubjectToggle(sub.id)}
                      className={cn(
                        "flex items-center gap-2 p-1.5 rounded border text-left text-xs font-medium transition-all cursor-pointer",
                        isChecked
                          ? "bg-slate-800/80 border-indigo-650 text-white"
                          : "bg-slate-950/20 border-slate-900 text-slate-400 hover:text-slate-200"
                      )}
                    >
                      <span 
                        className="size-2 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: sub.color }} 
                      />
                      <span>{sub.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="date" className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-indigo-400" /> {scheduleType === 'SEMANAL' && !editingLesson ? 'Data de Início' : 'Data'} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  disabled={!!(editingLesson?.recurringScheduleId && editOption === 'SERIES')}
                  className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 disabled:opacity-50"
                  {...register('date')}
                />
                {errors.date && (
                  <p className="text-xs text-red-400 mt-1">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="time" className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="size-3.5 text-indigo-400" /> Horário <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  step="60"
                  className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                  {...register('time')}
                />
                {errors.time && (
                  <p className="text-xs text-red-400 mt-1">{errors.time.message}</p>
                )}
              </div>
            </div>

            {/* Duration & Value Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="durationTime" className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="size-3.5 text-indigo-400" /> Duração <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="durationTime"
                  type="time"
                  className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                  {...register('durationTime')}
                />
                {errors.durationTime && (
                  <p className="text-xs text-red-400 mt-1">{errors.durationTime.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="value" className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                  <DollarSign className="size-3.5 text-indigo-400" /> Valor (R$) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                  {...register('value')}
                />
                {errors.value && (
                  <p className="text-xs text-red-400 mt-1">{errors.value.message}</p>
                )}
              </div>
            </div>

            {/* Promotion Helper Banner */}
            {selectedStudent?.promotion && (
              <div className="flex items-start gap-2 bg-indigo-950/20 border border-indigo-900/40 p-2.5 rounded-lg">
                <Gift className="size-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider leading-none">Combo / Promoção do Aluno</span>
                  <span className="text-slate-300 text-xs mt-1 block">{selectedStudent.promotion}</span>
                </div>
              </div>
            )}

            {/* Modality & Status Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="modality" className="text-slate-300 text-xs font-semibold">
                  Modalidade <span className="text-red-500">*</span>
                </Label>
                <select
                  id="modality"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  {...register('modality')}
                >
                  <option value="ONLINE" className="bg-slate-900 text-slate-200">Online (Vídeo)</option>
                  <option value="PRESENCIAL" className="bg-slate-900 text-slate-200">Presencial</option>
                </select>
                {errors.modality && (
                  <p className="text-xs text-red-400 mt-1">{errors.modality.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="status" className="text-slate-300 text-xs font-semibold">
                  Status da Aula
                </Label>
                <select
                  id="status"
                  disabled={!!(editingLesson?.recurringScheduleId && editOption === 'SERIES')}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
                  {...register('status')}
                >
                  <option value="AGENDADA" className="bg-slate-900 text-slate-200">Agendada</option>
                  <option value="CONCLUIDA" className="bg-slate-900 text-slate-200">Concluída</option>
                  <option value="CANCELADA" className="bg-slate-900 text-slate-200">Cancelada</option>
                </select>
              </div>
            </div>

            {/* Notes / Obs */}
            <div className="space-y-1">
              <Label htmlFor="notes" className="text-slate-300 text-xs font-semibold">
                Observações / Conteúdo Previsto
              </Label>
              <textarea
                id="notes"
                placeholder="Conteúdo planejado para a aula, observações..."
                className="w-full min-h-20 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
                {...register('notes')}
              />
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/40 px-6 py-4">
            <div>
              {editingLesson && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                  className="text-red-400 hover:text-red-300 hover:bg-red-955/20 cursor-pointer text-xs h-9 px-3"
                >
                  {isDeleting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4 mr-1.5" />
                  )}
                  {editingLesson.recurringScheduleId && editOption === 'SERIES' ? 'Excluir Série' : 'Excluir Aula'}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
                className="cursor-pointer text-xs h-9"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md shadow-indigo-600/15 text-xs h-9"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Aula'
                )}
              </Button>
            </div>
          </div>
        </form>

      </div>
    </div>
  )
}
