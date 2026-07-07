'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createExpense } from '@/actions/financeiro'
import { updateDefaultHourlyRate } from '@/actions/profile'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Plus,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Edit3,
  Check,
} from 'lucide-react'

// Validação de despesas com Zod
const expenseFormSchema = z.object({
  description: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres'),
  amount: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0.01, 'Valor deve ser maior que zero')
  ),
  date: z.string().min(1, 'Selecione uma data'),
  category: z.string().min(1, 'Selecione uma categoria'),
  notes: z.string().optional().nullable(),
})

type ExpenseFormValues = z.infer<typeof expenseFormSchema>

interface FinanceiroClientProps {
  tab: 'mensal' | 'geral'
  subTab: 'receitas' | 'despesas'
  summaryCards: React.ReactNode
  children: React.ReactNode
  month: number
  year: number
  defaultHourlyRate: number
}

export function FinanceiroClient({
  tab,
  subTab,
  summaryCards,
  children,
  month,
  year,
  defaultHourlyRate,
}: FinanceiroClientProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estados do valor hora base
  const [currentHourlyRate, setCurrentHourlyRate] = useState(defaultHourlyRate)
  const [isEditingRate, setIsEditingRate] = useState(false)
  const [rateInput, setRateInput] = useState(defaultHourlyRate.toString())
  const [isUpdatingRate, setIsUpdatingRate] = useState(false)

  // Sincroniza o estado caso o valor mude externamente/servidor
  useEffect(() => {
    setCurrentHourlyRate(defaultHourlyRate)
  }, [defaultHourlyRate])

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedRate = parseFloat(rateInput)
    if (isNaN(parsedRate) || parsedRate < 0) {
      toast.error('Por favor, insira um valor válido.')
      return
    }

    setIsUpdatingRate(true)
    try {
      const result = await updateDefaultHourlyRate(parsedRate)
      if (result.success && result.defaultHourlyRate !== undefined) {
        setCurrentHourlyRate(result.defaultHourlyRate)
        toast.success(`Valor hora base atualizado para R$ ${result.defaultHourlyRate.toFixed(2)}`)
        setIsEditingRate(false)
        router.refresh()
      } else {
        toast.error(result.error || 'Erro ao atualizar valor.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Erro de conexão ao atualizar valor.')
    } finally {
      setIsUpdatingRate(false)
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema) as any,
    defaultValues: {
      description: '',
      amount: undefined,
      date: new Date().toISOString().split('T')[0],
      category: 'MATERIAL',
      notes: '',
    },
  })

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]

  const handlePrevMonth = () => {
    let newMonth = month - 1
    let newYear = year
    if (newMonth < 1) {
      newMonth = 12
      newYear = year - 1
    }
    router.push(`/dashboard/financeiro?tab=${tab}&subTab=${subTab}&month=${newMonth}&year=${newYear}`)
  }

  const handleNextMonth = () => {
    let newMonth = month + 1
    let newYear = year
    if (newMonth > 12) {
      newMonth = 1
      newYear = year + 1
    }
    router.push(`/dashboard/financeiro?tab=${tab}&subTab=${subTab}&month=${newMonth}&year=${newYear}`)
  }

  const handleTabChange = (newTab: 'mensal' | 'geral') => {
    router.push(`/dashboard/financeiro?tab=${newTab}&subTab=${subTab}&month=${month}&year=${year}`)
  }

  const handleSubTabChange = (newSubTab: 'receitas' | 'despesas') => {
    router.push(`/dashboard/financeiro?tab=mensal&subTab=${newSubTab}&month=${month}&year=${year}`)
  }

  const onSubmitExpense = async (values: ExpenseFormValues) => {
    setIsSubmitting(true)
    try {
      await createExpense({
        description: values.description,
        amount: values.amount,
        date: values.date,
        category: values.category,
        notes: values.notes,
      })

      toast.success('Despesa cadastrada com sucesso!')
      setIsDialogOpen(false)
      reset()
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao cadastrar despesa.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Controle Financeiro</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o faturamento de suas aulas, controle pagamentos recebidos e gerencie despesas de ensino.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Valor Hora Base Widget */}
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-xl px-3.5 py-1.5 shadow-md">
            <DollarSign className="size-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-350">Hora-Aula Base:</span>
            {isEditingRate ? (
              <form onSubmit={handleRateSubmit} className="flex items-center gap-1.5">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    className="w-20 h-7 bg-slate-950 border border-slate-700 rounded-md text-xs pl-6 pr-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none text-white font-mono"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingRate}
                  className="p-1.5 rounded-md hover:bg-green-500/10 text-green-400 hover:text-green-300 transition-colors cursor-pointer disabled:opacity-50"
                  title="Salvar"
                >
                  {isUpdatingRate ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingRate(false)}
                  className="p-1.5 rounded-md hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  title="Cancelar"
                >
                  <X className="size-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">
                  R$ {currentHourlyRate.toFixed(2)}
                </span>
                <button
                  onClick={() => {
                    setRateInput(currentHourlyRate.toString())
                    setIsEditingRate(true)
                  }}
                  className="p-1 rounded-md hover:bg-indigo-500/15 text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer"
                  title="Editar valor hora-aula base"
                >
                  <Edit3 className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          <Button
            onClick={() => setIsDialogOpen(true)}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md shadow-indigo-600/15"
          >
            <Plus className="mr-2 size-4" />
            Registrar Despesa
          </Button>
        </div>
      </div>

      {/* Main Tabs (Balanço do Mês / Balanço Geral) */}
      <div className="flex border-b border-slate-800 bg-slate-900/40 p-1 rounded-xl max-w-sm">
        <button
          onClick={() => handleTabChange('mensal')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            tab === 'mensal'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Balanço do Mês
        </button>
        <button
          onClick={() => handleTabChange('geral')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
            tab === 'geral'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Balanço Geral
        </button>
      </div>


      {/* Condicional do Balanço do Mês: exibe cards, seletor de mês e sub-abas */}
      {tab === 'mensal' && (
        <div className="space-y-6">
          {/* Cards de Resumo Financeiro */}
          {summaryCards}

          {/* Sub-Tabs (Receitas / Despesas) & Month Selector */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex border-b border-slate-800 bg-slate-900/40 p-1 rounded-xl max-w-xs w-full sm:w-auto">
              <button
                onClick={() => handleSubTabChange('receitas')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer px-4 ${
                  subTab === 'receitas'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Receitas
              </button>
              <button
                onClick={() => handleSubTabChange('despesas')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer px-4 ${
                  subTab === 'despesas'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Despesas
              </button>
            </div>

            <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-1.5 self-start sm:self-auto shadow-md">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="size-5" />
              </button>
              <span className="text-sm font-semibold text-slate-200 min-w-[140px] text-center font-mono">
                {monthNames[month - 1]} / {year}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT */}
      {children}

      {/* OVERLAY / DIALOG PARA NOVA DESPESA */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsDialogOpen(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/40 px-6 py-4">
              <h2 className="text-lg font-bold text-white">Lançar Nova Despesa</h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitExpense)}>
              <div className="p-6 space-y-4">
                {/* Descrição */}
                <div className="space-y-1">
                  <Label htmlFor="description" className="text-slate-300">
                    Descrição / Item <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="description"
                    placeholder="Ex: Livro de Matemática, Gasolina..."
                    className="bg-slate-950 border-slate-800 text-slate-200"
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>
                  )}
                </div>

                {/* Grid Valor & Data */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="amount" className="text-slate-300">
                      Valor (R$) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      className="bg-slate-950 border-slate-800 text-slate-200"
                      {...register('amount')}
                    />
                    {errors.amount && (
                      <p className="text-xs text-red-400 mt-1">{errors.amount.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="date" className="text-slate-300">
                      Data <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      className="bg-slate-950 border-slate-800 text-slate-200"
                      {...register('date')}
                    />
                    {errors.date && (
                      <p className="text-xs text-red-400 mt-1">{errors.date.message}</p>
                    )}
                  </div>
                </div>

                {/* Categoria */}
                <div className="space-y-1">
                  <Label htmlFor="category" className="text-slate-300">
                    Categoria <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="category"
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    {...register('category')}
                  >
                    <option value="MATERIAL" className="bg-slate-900 text-slate-200">Material Didático</option>
                    <option value="TRANSPORTE" className="bg-slate-900 text-slate-200">Locomoção / Transporte</option>
                    <option value="SOFTWARE" className="bg-slate-900 text-slate-200">Softwares / Ferramentas</option>
                    <option value="OUTRO" className="bg-slate-900 text-slate-200">Outros</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <Label htmlFor="notes" className="text-slate-300 text-xs">
                    Notas Adicionais
                  </Label>
                  <textarea
                    id="notes"
                    placeholder="Informações adicionais da despesa..."
                    className="w-full min-h-16 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    {...register('notes')}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-950/40 px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Lançando...
                    </>
                  ) : (
                    'Salvar Despesa'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
