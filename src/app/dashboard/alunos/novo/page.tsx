'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createStudent } from '@/actions/students'
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
  school: z.string().optional(),
  age: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().int().min(0, 'Idade inválida').max(120, 'Idade inválida').optional()
  ),
  gradeLevel: z.string().optional(),
  notes: z.string().optional(),
})

type StudentFormValues = z.infer<typeof studentFormSchema>

export default function NovoAlunoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema) as any,
    defaultValues: {
      name: '',
      parentName: '',
      parentPhone: '',
      email: '',
      school: '',
      age: undefined,
      gradeLevel: '',
      notes: '',
    },
  })

  const onSubmit = async (values: StudentFormValues) => {
    setIsSubmitting(true)
    try {
      await createStudent({
        name: values.name,
        parentName: values.parentName || undefined,
        parentPhone: values.parentPhone || undefined,
        email: values.email || undefined,
        school: values.school || undefined,
        age: values.age,
        gradeLevel: values.gradeLevel || undefined,
        notes: values.notes || undefined,
      })
      toast.success('Aluno cadastrado com sucesso!')
      router.push('/dashboard/alunos')
      router.refresh()
    } catch (error) {
      toast.error('Erro ao cadastrar aluno. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Voltar */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard/alunos" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), "text-slate-400 hover:text-white cursor-pointer")}>
          <ArrowLeft className="mr-2 size-4" />
          Voltar para lista
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Cadastrar Novo Aluno</CardTitle>
            <CardDescription className="text-slate-400">
              Preencha os dados cadastrais abaixo para criar a ficha do aluno.
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
            </CardContent>
            <CardFooter className="flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-950/20 px-6 py-4">
              <Link href="/dashboard/alunos" className={cn(buttonVariants({ variant: 'outline' }), "cursor-pointer")}>
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
                    Salvar Aluno
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
