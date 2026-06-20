'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateStudent } from '@/actions/students'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
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
  fixedScheduleActive: z.boolean().optional().default(false),
  fixedScheduleDay: z.string().optional().or(z.literal('')),
  fixedScheduleTime: z.string().optional().or(z.literal('')),
  fixedSchedulePrice: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0, 'Preço inválido').optional()
  ),
  fixedScheduleTemporarilyDisabled: z.boolean().optional().default(false),
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
    fixedScheduleActive: boolean
    fixedScheduleDay: string | null
    fixedScheduleTime: string | null
    fixedSchedulePrice: number | null
    fixedScheduleTemporarilyDisabled: boolean
  }
}

export function StudentEditForm({ student }: StudentEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      fixedScheduleActive: student.fixedScheduleActive ?? false,
      fixedScheduleDay: student.fixedScheduleDay || '',
      fixedScheduleTime: student.fixedScheduleTime || '',
      fixedSchedulePrice: student.fixedSchedulePrice ?? undefined,
      fixedScheduleTemporarilyDisabled: student.fixedScheduleTemporarilyDisabled ?? false,
    },
  })

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
        fixedScheduleActive: values.fixedScheduleActive,
        fixedScheduleDay: values.fixedScheduleDay || undefined,
        fixedScheduleTime: values.fixedScheduleTime || undefined,
        fixedSchedulePrice: values.fixedSchedulePrice,
        fixedScheduleTemporarilyDisabled: values.fixedScheduleTemporarilyDisabled,
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

                  {/* E-mail */}
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
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                    )}
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
                  <div className="space-y-1">
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

              {/* Seção 2: Contato dos Responsáveis */}
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
                </div>
              </div>

              {/* Seção 3: Notas / Observações */}
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
                    placeholder="Informações adicionais sobre o aluno (dificuldades, horários preferidos, objetivos...)"
                    className="min-h-24 w-full min-w-0 rounded-lg border border-slate-800 bg-slate-900/50 px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-indigo-500 focus-visible:ring-3 focus-visible:ring-indigo-500/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-900/80 disabled:opacity-50 md:text-sm text-slate-100"
                    {...register('notes')}
                  />
                </div>
              </div>

              {/* Seção 4: Agenda Fixa (Aula Recorrente) */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-indigo-400 border-b border-slate-800 pb-2">
                  Agenda Fixa (Aula Recorrente)
                </h3>
                <div className="space-y-4 bg-slate-950/20 p-4 rounded-lg border border-slate-800/40">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* Ativar */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="fixedScheduleActive"
                        className="size-4 rounded border-slate-800 bg-slate-900/50 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                        {...register('fixedScheduleActive')}
                      />
                      <Label htmlFor="fixedScheduleActive" className="text-slate-300 font-medium cursor-pointer">
                        Ativar Agenda Fixa
                      </Label>
                    </div>

                    {/* Desativado Temporariamente */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="fixedScheduleTemporarilyDisabled"
                        className="size-4 rounded border-slate-800 bg-slate-900/50 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                        {...register('fixedScheduleTemporarilyDisabled')}
                      />
                      <Label htmlFor="fixedScheduleTemporarilyDisabled" className="text-slate-400 font-medium cursor-pointer">
                        Desativar Temporariamente (Esta semana não teve aula)
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Dia da Semana */}
                    <div className="space-y-1">
                      <Label htmlFor="fixedScheduleDay" className="text-slate-300">
                        Dia da Semana
                      </Label>
                      <select
                        id="fixedScheduleDay"
                        className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-2.5 py-2 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500/20 outline-none text-sm cursor-pointer"
                        {...register('fixedScheduleDay')}
                      >
                        <option value="">Selecione o dia...</option>
                        <option value="Segunda-feira">Segunda-feira</option>
                        <option value="Terça-feira">Terça-feira</option>
                        <option value="Quarta-feira">Quarta-feira</option>
                        <option value="Quinta-feira">Quinta-feira</option>
                        <option value="Sexta-feira">Sexta-feira</option>
                        <option value="Sábado">Sábado</option>
                        <option value="Domingo">Domingo</option>
                      </select>
                    </div>

                    {/* Horário */}
                    <div className="space-y-1">
                      <Label htmlFor="fixedScheduleTime" className="text-slate-300">
                        Horário Reservado
                      </Label>
                      <Input
                        id="fixedScheduleTime"
                        type="time"
                        className="bg-slate-900/50 border-slate-800 text-slate-100 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                        {...register('fixedScheduleTime')}
                      />
                    </div>

                    {/* Valor por Aula */}
                    <div className="space-y-1">
                      <Label htmlFor="fixedSchedulePrice" className="text-slate-300">
                        Preço por Aula (R$)
                      </Label>
                      <Input
                        id="fixedSchedulePrice"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 80,00"
                        className="bg-slate-900/50 border-slate-800 text-slate-100 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
                        {...register('fixedSchedulePrice')}
                      />
                    </div>
                  </div>
                </div>
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
