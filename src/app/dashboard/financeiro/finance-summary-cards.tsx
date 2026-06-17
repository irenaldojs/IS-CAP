import { getFinancialSummary } from '@/actions/financeiro'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

export async function FinanceSummaryCards() {
  const summary = await getFinancialSummary()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Recebido */}
      <Card className="border-slate-800 bg-slate-900/15 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute top-0 right-0 size-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Realizado</span>
          <div className="size-8 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/35 flex items-center justify-center">
            <ArrowUpRight className="size-4.5" />
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-2xl font-bold text-white font-mono">{formatCurrency(summary.totalPaid)}</h3>
          <p className="text-xs text-slate-500 mt-1">Total de receitas pagas</p>
        </CardContent>
      </Card>

      {/* Pendente */}
      <Card className="border-slate-800 bg-slate-900/15 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute top-0 right-0 size-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-300" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pendente</span>
          <div className="size-8 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-900/35 flex items-center justify-center">
            <Clock className="size-4.5" />
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-2xl font-bold text-white font-mono">{formatCurrency(summary.totalPending)}</h3>
          <p className="text-xs text-slate-500 mt-1">Aulas agendadas em aberto</p>
        </CardContent>
      </Card>

      {/* Despesas */}
      <Card className="border-slate-800 bg-slate-900/15 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute top-0 right-0 size-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all duration-300" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Despesas</span>
          <div className="size-8 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-900/35 flex items-center justify-center">
            <ArrowDownRight className="size-4.5" />
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="text-2xl font-bold text-white font-mono">{formatCurrency(summary.totalExpenses)}</h3>
          <p className="text-xs text-slate-500 mt-1">Gasto total acumulado</p>
        </CardContent>
      </Card>

      {/* Saldo Líquido */}
      <Card className="border-slate-800 bg-slate-900/15 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute top-0 right-0 size-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saldo Líquido</span>
          <div className="size-8 rounded-lg bg-indigo-950/40 text-indigo-400 border border-indigo-900/35 flex items-center justify-center">
            <TrendingUp className="size-4.5" />
          </div>
        </CardHeader>
        <CardContent>
          <h3 className={`text-2xl font-bold font-mono ${summary.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(summary.netBalance)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Recebido - Despesas</p>
        </CardContent>
      </Card>
    </div>
  )
}
