'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createLesson, updateLesson, deleteLesson } from '@/actions/lessons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { X, Loader2, Calendar, Clock, DollarSign, BookOpen, User, Video, MapPin, Trash2 } from 'lucide-react'

// Zod Form Validation
const lessonFormSchema = z.object({
  studentId: z.string().min(1, 'Selecione um aluno'),
  subjectId: z.string().min(1, 'Selecione uma matéria'),
  date: z.string().min(1, 'Selecione uma data'),
  time: z.string().min(1, 'Selecione o horário de início'),
  durationHours: z.coerce.number().min(0.5, 'Mínimo de 0.5 horas').max(24, 'Máximo de 24 horas'),
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
  recurrence: string | null
}

interface LessonDialogProps {
  isOpen: boolean
  onClose: () => void
  students: Student[]
  subjects: Subject[]
  editingLesson?: Lesson | null
}

export function LessonDialog({
  isOpen,
  onClose,
  students,
  subjects,
  editingLesson,
}: LessonDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema) as any,
    defaultValues: {
      studentId: '',
      subjectId: '',
      date: '',
      time: '',
      durationHours: 1.5,
      value: 80,
      modality: 'ONLINE',
      status: 'AGENDADA',
      recurrence: null,
      notes: '',
    },
  })

  // Popula formulário se estiver em modo de edição
  useEffect(() => {
    if (editingLesson) {
      const lessonDate = new Date(editingLesson.date)
      const dateString = lessonDate.toISOString().split('T')[0]
      
      const startTime = new Date(editingLesson.startTime)
      const timeString = startTime.toTimeString().split(' ')[0].substring(0, 5) // HH:MM

      reset({
        studentId: editingLesson.studentId,
        subjectId: editingLesson.subjectId,
        date: dateString,
        time: timeString,
        durationHours: editingLesson.durationHours,
        value: editingLesson.value,
        modality: editingLesson.modality,
        status: editingLesson.status,
        recurrence: editingLesson.recurrence,
        notes: editingLesson.notes || '',
      })
    } else {
      reset({
        studentId: '',
        subjectId: '',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        durationHours: 1.5,
        value: 80,
        modality: 'ONLINE',
        status: 'AGENDADA',
        recurrence: null,
        notes: '',
      })
    }
  }, [editingLesson, reset, isOpen])

  const onSubmit = async (values: LessonFormValues) => {
    setIsSubmitting(true)
    try {
      // Concatena data e hora em objetos DateTime correspondentes
      const combinedDateTime = new Date(`${values.date}T${values.time}:00`)

      const lessonInput = {
        studentId: values.studentId,
        subjectId: values.subjectId,
        date: combinedDateTime,
        startTime: combinedDateTime,
        durationHours: values.durationHours,
        value: values.value,
        modality: values.modality,
        status: values.status,
        recurrence: values.recurrence || null,
        notes: values.notes || null,
      }

      if (editingLesson) {
        await updateLesson(editingLesson.id, lessonInput)
        toast.success('Aula atualizada com sucesso!')
      } else {
        await createLesson(lessonInput)
        toast.success('Aula agendada com sucesso!')
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
    if (!confirm('Deseja realmente excluir esta aula? Esta ação não pode ser desfeita.')) return

    setIsDeleting(true)
    try {
      await deleteLesson(editingLesson.id)
      toast.success('Aula excluída com sucesso!')
      onClose()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao excluir a aula.')
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
            onClick={onClose} 
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-h-[75vh] overflow-y-auto p-6 space-y-4">
            
            {/* Student Select */}
            <div className="space-y-1">
              <Label htmlFor="studentId" className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <User className="size-3.5 text-indigo-400" /> Aluno <span className="text-red-500">*</span>
              </Label>
              <select
                id="studentId"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                {...register('studentId')}
              >
                <option value="">Selecione o aluno...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
              {errors.studentId && (
                <p className="text-xs text-red-400 mt-1">{errors.studentId.message}</p>
              )}
            </div>

            {/* Subject Select */}
            <div className="space-y-1">
              <Label htmlFor="subjectId" className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-indigo-400" /> Matéria <span className="text-red-500">*</span>
              </Label>
              <select
                id="subjectId"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                {...register('subjectId')}
              >
                <option value="">Selecione a matéria...</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              {errors.subjectId && (
                <p className="text-xs text-red-400 mt-1">{errors.subjectId.message}</p>
              )}
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="date" className="text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-indigo-400" /> Data <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
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
                <Label htmlFor="durationHours" className="text-slate-355 text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="size-3.5 text-indigo-400" /> Duração (horas) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="durationHours"
                  type="number"
                  step="0.5"
                  className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                  {...register('durationHours')}
                />
                {errors.durationHours && (
                  <p className="text-xs text-red-400 mt-1">{errors.durationHours.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="value" className="text-slate-355 text-xs font-semibold flex items-center gap-1.5">
                  <DollarSign className="size-3.5 text-indigo-400" /> Valor (R$) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="value"
                  type="number"
                  step="5"
                  className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                  {...register('value')}
                />
                {errors.value && (
                  <p className="text-xs text-red-400 mt-1">{errors.value.message}</p>
                )}
              </div>
            </div>

            {/* Modality & Recurrence Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="modality" className="text-slate-355 text-xs font-semibold">
                  Modalidade <span className="text-red-500">*</span>
                </Label>
                <select
                  id="modality"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  {...register('modality')}
                >
                  <option value="ONLINE">Online (Vídeo)</option>
                  <option value="PRESENCIAL">Presencial</option>
                </select>
                {errors.modality && (
                  <p className="text-xs text-red-400 mt-1">{errors.modality.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="status" className="text-slate-355 text-xs font-semibold">
                  Status da Aula
                </Label>
                <select
                  id="status"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  {...register('status')}
                >
                  <option value="AGENDADA">Agendada</option>
                  <option value="CONCLUIDA">Concluída</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>
            </div>

            {/* Notes / Obs */}
            <div className="space-y-1">
              <Label htmlFor="notes" className="text-slate-355 text-xs font-semibold">
                Observações / Conteúdo Previsto
              </Label>
              <textarea
                id="notes"
                placeholder="Conteúdo planejado para a aula, links importantes ou observações..."
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
                  className="text-red-400 hover:text-red-300 hover:bg-red-950/20 cursor-pointer"
                >
                  {isDeleting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4 mr-2" />
                  )}
                  Excluir
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md shadow-indigo-600/15"
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
