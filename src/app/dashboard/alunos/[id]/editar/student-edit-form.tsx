'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateStudent } from '@/actions/students'
import { getSubjects } from '@/actions/lessons'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2, Plus, Trash2, Calendar, DollarSign, Gift } from 'lucide-react'
import Link from 'next/link'

// Validação de formulário com Zod
const studentFormSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  school: z.string().optional(),
  age: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().min(0, 'Idade inválida').max(120, 'Idade inválida').optional()
  ),
  gradeLevel: z.string().optional(),
  notes: z.string().optional(),
  hourlyRate: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0, 'Valor inválido').optional()
  ),
  promotion: z.string().optional(),
})

type StudentFormValues = z.infer<typeof studentFormSchema>

interface StudentEditFormProps {
  student: {
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
    hourlyRate: number | null
    promotion: string | null
    subjectIds?: string[]
    recurringSchedules?: {
      dayOfWeek: number
      startTime: string
      value: number
      subjectId: string
    }[]
  }
}

export function StudentEditForm({ student }: StudentEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subjectsList, setSubjectsList] = useState<{ id: string; name: string; color: string }[]>([])
  
  // Estados para novas funcionalidades
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(student.subjectIds || [])
  const [recurringSchedules, setRecurringSchedules] = useState<{
    dayOfWeek: number
    startTime: string
    value: number
    subjectId: string
  }[]>(student.recurringSchedules || [])

  // Carrega matérias disponíveis
  useEffect(() => {
    getSubjects().then(setSubjectsList).catch(console.error)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema) as any,
    defaultValues: {
      name: student.name,
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      email: student.email || '',
      phone: student.phone || '',
      school: student.school || '',
      age: student.age ?? undefined,
      gradeLevel: student.gradeLevel || '',
      notes: student.notes || '',
      hourlyRate: student.hourlyRate ?? undefined,
      promotion: student.promotion || '',
    },
  })

  // Manipulação de Matérias
  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  // Manipulação de Agenda Fixa
  const addScheduleRow = () => {
    setRecurringSchedules(prev => [
      ...prev,
      {
        dayOfWeek: 1, // Segunda
        startTime: '14:00',
        value: 80,
        subjectId: selectedSubjects[0] || (subjectsList[0]?.id || '')
      }
    ])
  }

  const removeScheduleRow = (index: number) => {
    setRecurringSchedules(prev => prev.filter((_, i) => i !== index))
  }

  const updateScheduleRow = (index: number, field: string, value: any) => {
    setRecurringSchedules(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const onSubmit = async (values: StudentFormValues) => {
    setIsSubmitting(true)
    try {
      await updateStudent(student.id, {
        name: values.name,
        parentName: values.parentName || undefined,
        parentPhone: values.parentPhone || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        school: values.school || undefined,
        age: values.age,
        gradeLevel: values.gradeLevel || undefined,
        notes: values.notes || undefined,
        hourlyRate: values.hourlyRate,
        promotion: values.promotion || undefined,
        subjectIds: selectedSubjects,
        recurringSchedules: recurringSchedules.map(sch => ({
          ...sch,
          dayOfWeek: Number(sch.dayOfWeek),
          value: Number(sch.value)
        }))
      })
      toast.success('Aluno atualizado com sucesso!')
      router.push(`/dashboard/alunos/${student.id}`)
      router.refresh()
    } catch (error: any) {
      const message = error?.message || 'Erro ao atualizar aluno. Tente novamente.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Voltar */}
      <div className="flex items-center gap-2">
        <Link href={`/dashboard/alunos/${student.id}`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "text-slate-400 hover:text-white cursor-pointer")}>
          <ArrowLeft className="mr-2 size-4" />
          Voltar para detalhes
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Editar Perfil do Aluno</CardTitle>
            <CardDescription className="text-slate-400">
              Modifique os campos abaixo para atualizar as informações do aluno.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Seção 1: Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-indigo-400 border-b border-slate-800 pb-2">
                  Dados do Aluno
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Nome Completo */}
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="name" className="text-slate-300">
                      Nome Completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Nome do aluno"
                      className="bg-slate-900/50 border-slate-800 text-slate-100 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Idade */}
                  <div className="space-y-1">
                    <Label htmlFor="age" className="text-slate-300">
                      Idade
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Ex: 12"
                      className="bg-slate-900/50 border-slate-800 text-slate-100 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                      {...register('age')}
                    />
                    {errors.age && (
                      <p className="text-xs text-red-400 mt-1">{errors.age.message}</p>
                    )}
                  </div>

                  {/* Escola */}
                  <div className="space-y-1">
                    <Label htmlFor="school" className="text-slate-300">
                      Escola / Colégio
                    </Label>
                    <Input
                      id="school"
                      placeholder="Nome do colégio"
                      className="bg-slate-900/50 border-slate-800 text-slate-100 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                      {...register('school')}
                    />
                  </div>

                  {/* Série/Ano */}
                  <div className="space-y-1 col-span-2">
                    <Label htmlFor="gradeLevel" className="text-slate-300">
                      Série / Ano Letivo
                    </Label>
                    <Input
                      id="gradeLevel"
                      placeholder="Ex: 8º Ano Fundamental"
                      className="bg-slate-900/50 border-slate-800 text-slate-100 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                      {...register('gradeLevel')}
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Matérias do Aluno (Novo) */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-indigo-400 border-b border-slate-800 pb-2">
                  Matérias Associadas
                </h3>
                {subjectsList.length === 0 ? (
                  <p className="text-xs text-slate-500">Nenhuma matéria cadastrada.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {subjectsList.map(subject => {
                      const isSelected = selectedSubjects.includes(subject.id)
                      return (
                        <button
                          key={subject.id}
                          type="button"
                          onClick={() => handleSubjectToggle(subject.id)}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg border text-left text-xs font-semibold transition-all cursor-pointer",
                            isSelected
                              ? "bg-slate-800 border-indigo-550 text-white"
                              : "bg-slate-950/20 border-slate-850 text-slate-400 hover:text-slate-200"
                          )}
                        >
                          <span
                            className="size-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span>{subject.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Seção: Preços e Promoções (Novo) */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-indigo-400 border-b border-slate-800 pb-2">
                  Preço Hora e Promoções
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-slate-950/20 p-4 rounded-lg border border-slate-800/40">
                  {/* Valor hora customizado */}
                  <div className="space-y-1">
                    <Label htmlFor="hourlyRate" className="text-slate-300 flex items-center gap-1">
                      <DollarSign className="size-3.5 text-indigo-400" />
                      Valor da Hora Personalizado (R$)
                    </Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      step="0.01"
                      placeholder="Deixe em branco para usar o padrão"
                      className="bg-slate-900/50 border-slate-800 text-slate-100 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                      {...register('hourlyRate')}
                    />
                  </div>

                  {/* Campo de promoção / combo */}
                  <div className="space-y-1">
                    <Label htmlFor="promotion" className="text-slate-300 flex items-center gap-1">
                      <Gift className="size-3.5 text-indigo-400" />
                      Promoção / Combo Especial
                    </Label>
                    <Input
                      id="promotion"
                      placeholder="Ex: Combo 4 aulas por R$ 300"
                      className="bg-slate-900/50 border-slate-800 text-slate-100 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                      {...register('promotion')}
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Contato dos Responsáveis */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-indigo-400 border-b border-slate-800 pb-2">
                  Responsáveis & Contato
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Nome do Responsável */}
                  <div className="space-y-1">
                    <Label htmlFor="parentName" className="text-slate-300">
                      Nome do Responsável (Pai/Mãe)
                    </Label>
                    <Input
                      id="parentName"
                      placeholder="Nome do responsável"
                      className="bg-slate-900/50 border-slate-800 text-slate-100 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                      {...register('parentName')}
                    />
                  </div>

                  {/* Telefone do Responsável */}
                  <div className="space-y-1">
                    <Label htmlFor="parentPhone" className="text-slate-300">
                      Telefone do Responsável
                    </Label>
                    <Input
                      id="parentPhone"
                      placeholder="Ex: (11) 99999-9999"
                      className="bg-slate-900/50 border-slate-800 text-slate-100 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                      {...register('parentPhone')}
                    />
                  </div>
                  
                  {/* E-mail do Aluno */}
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-slate-300">
                      E-mail do Aluno
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="aluno@exemplo.com"
                      className="bg-slate-900/50 border-slate-800 text-slate-100 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                      {...register('email')}
                    />
                  </div>

                  {/* Contato do Aluno */}
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-slate-300">
                      Contato do Aluno (WhatsApp/Celular)
                    </Label>
                    <Input
                      id="phone"
                      placeholder="Ex: (11) 99999-9999"
                      className="bg-slate-900/50 border-slate-800 text-slate-100 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                      {...register('phone')}
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Notas / Observações */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-indigo-400 border-b border-slate-800 pb-2">
                  Observações Gerais
                </h3>
                <div className="space-y-1">
                  <Label htmlFor="notes" className="text-slate-300">
                    Notas e Observações
                  </Label>
                  <textarea
                    id="notes"
                    placeholder="Informações adicionais sobre o aluno..."
                    className="min-h-24 w-full min-w-0 rounded-lg border border-slate-800 bg-slate-900/50 px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-indigo-500 focus-visible:ring-3 focus-visible:ring-indigo-500/20 md:text-sm text-slate-100"
                    {...register('notes')}
                  />
                </div>
              </div>

              {/* Seção: Agenda Fixa (Múltiplos Dias) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-semibold text-indigo-400">
                    Aulas Recorrentes Semanais (Agenda Fixa)
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addScheduleRow}
                    className="border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer h-7 text-[10px]"
                  >
                    <Plus className="size-3 mr-1" />
                    Adicionar Aula Fixa
                  </Button>
                </div>

                {recurringSchedules.length === 0 ? (
                  <div className="text-center py-6 bg-slate-950/10 rounded-lg border border-dashed border-slate-800/80">
                    <Calendar className="size-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Sem aulas recorrentes programadas para este aluno.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recurringSchedules.map((schedule, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-950/10 p-3 rounded-lg border border-slate-850/50 items-end"
                      >
                        {/* Dia da Semana */}
                        <div className="sm:col-span-3 space-y-1">
                          <Label className="text-[10px] text-slate-400">Dia da Semana</Label>
                          <select
                            value={schedule.dayOfWeek}
                            onChange={(e) => updateScheduleRow(index, 'dayOfWeek', Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-slate-200 outline-none text-xs cursor-pointer focus:border-indigo-500"
                          >
                            <option value={1}>Segunda-feira</option>
                            <option value={2}>Terça-feira</option>
                            <option value={3}>Quarta-feira</option>
                            <option value={4}>Quinta-feira</option>
                            <option value={5}>Sexta-feira</option>
                            <option value={6}>Sábado</option>
                            <option value={0}>Domingo</option>
                          </select>
                        </div>

                        {/* Horário */}
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-[10px] text-slate-400">Horário</Label>
                          <Input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => updateScheduleRow(index, 'startTime', e.target.value)}
                            className="bg-slate-900 border-slate-800 text-slate-200 text-xs h-8 px-2"
                          />
                        </div>

                        {/* Matéria */}
                        <div className="sm:col-span-4 space-y-1">
                          <Label className="text-[10px] text-slate-400">Matéria</Label>
                          <select
                            value={schedule.subjectId}
                            onChange={(e) => updateScheduleRow(index, 'subjectId', e.target.value)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2 py-1.5 text-slate-200 outline-none text-xs cursor-pointer focus:border-indigo-500"
                          >
                            {subjectsList
                              .filter(sub => selectedSubjects.includes(sub.id) || !selectedSubjects.length)
                              .map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                              ))}
                            {subjectsList.length === 0 && <option value="">Sem matérias</option>}
                          </select>
                        </div>

                        {/* Preço por aula */}
                        <div className="sm:col-span-2 space-y-1">
                          <Label className="text-[10px] text-slate-400">Preço Aula (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={schedule.value}
                            onChange={(e) => updateScheduleRow(index, 'value', Number(e.target.value))}
                            className="bg-slate-900 border-slate-800 text-slate-200 text-xs h-8 px-2"
                          />
                        </div>

                        {/* Excluir */}
                        <div className="sm:col-span-1 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeScheduleRow(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/20 cursor-pointer h-8 w-8"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </CardContent>
            <CardFooter className="flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-950/20 px-6 py-4">
              <Link href={`/dashboard/alunos/${student.id}`} className={cn(buttonVariants({ variant: 'outline' }), "cursor-pointer")}>
                Cancelar
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md shadow-indigo-600/15"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
