import { getPayments, getExpenses, getMonthlyBalance } from '@/actions/financeiro'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TogglePaymentButton } from './toggle-payment-button'
import { DeleteExpenseButton } from './delete-expense-button'
import Link from 'next/link'
import {
  DollarSign,
  CheckCircle,
  Clock,
  Layers,
  Scale,
  TrendingUp,
  Eye,
} from 'lucide-react'

interface FinanceDataViewProps {
  tab: 'receitas' | 'despesas' | 'geral'
  month: number
  year: number
}

export async function FinanceDataView({ tab, month, year }: FinanceDataViewProps) {
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

  if (tab === 'receitas') {
    const allPayments = await getPayments()
    const payments = allPayments.filter((p) => {
      const d = new Date(p.lesson.date)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })

    return (
      <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Faturamento por Aula</CardTitle>
          <CardDescription className="text-slate-400">
            Gerencie os pagamentos das aulas realizadas e agendadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <DollarSign className="size-12 text-slate-700 mb-3" />
              <h3 className="font-semibold text-slate-300">Nenhum pagamento registrado</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-xs">
                Agende novas aulas para gerar cobranças de pagamento nesta listagem.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-950/40 border-b border-slate-800">
                <TableRow className="border-slate-800">
                  <TableHead className="pl-6 py-3.5 text-slate-400 font-medium">Aluno</TableHead>
                  <TableHead className="py-3.5 text-slate-400 font-medium">Matéria</TableHead>
                  <TableHead className="py-3.5 text-slate-400 font-medium">Data da Aula</TableHead>
                  <TableHead className="py-3.5 text-slate-400 font-medium">Valor</TableHead>
                  <TableHead className="py-3.5 text-slate-400 font-medium">Pagamento</TableHead>
                  <TableHead className="py-3.5 text-slate-400 font-medium">Método</TableHead>
                  <TableHead className="pr-6 py-3.5 text-right text-slate-400 font-medium">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="border-slate-800 hover:bg-slate-900/30">
                    {/* Aluno */}
                    <TableCell className="pl-6 py-4 font-semibold text-slate-200">
                      {payment.lesson.student.name}
                    </TableCell>

                    {/* Matéria */}
                    <TableCell className="py-4 font-medium">
                      <span style={{ color: payment.lesson.subject.color }}>
                        {payment.lesson.subject.name}
                      </span>
                    </TableCell>

                    {/* Data */}
                    <TableCell className="py-4 text-slate-300">
                      {formatDate(payment.lesson.date)}
                    </TableCell>

                    {/* Valor */}
                    <TableCell className="py-4 font-mono text-slate-200">
                      {formatCurrency(payment.amount)}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-4">
                      {payment.isPaid ? (
                        <div className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/20">
                          <CheckCircle className="size-3.5" /> Pago
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-amber-400 text-xs font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/20">
                          <Clock className="size-3.5" /> Pendente
                        </div>
                      )}
                    </TableCell>

                    {/* Método */}
                    <TableCell className="py-4 text-slate-300 text-xs font-semibold">
                      {payment.isPaid ? payment.paymentMethod || 'PIX' : '—'}
                    </TableCell>

                    {/* Ações */}
                    <TableCell className="pr-6 py-4 text-right">
                      <TogglePaymentButton
                        id={payment.id}
                        isPaid={payment.isPaid}
                        paymentMethod={payment.paymentMethod}
                      />
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

  if (tab === 'geral') {
    const monthlyBalance = await getMonthlyBalance()
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

    return (
      <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-200">Balanço Geral Consolidado</CardTitle>
          <CardDescription className="text-slate-400">
            Histórico de fechamento de cada mês. Clique em "Detalhar" ou no mês desejado para visualizar as receitas e despesas correspondentes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {monthlyBalance.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Scale className="size-12 text-slate-700 mb-3" />
              <h3 className="font-semibold text-slate-300">Nenhum dado financeiro encontrado</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-xs">
                Registre receitas (aulas) ou despesas para gerar o balanço mensal.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-950/40 border-b border-slate-800">
                <TableRow className="border-slate-800">
                  <TableHead className="pl-6 py-3.5 text-slate-400 font-medium">Mês / Ano</TableHead>
                  <TableHead className="py-3.5 text-slate-400 font-medium">Receitas Realizadas</TableHead>
                  <TableHead className="py-3.5 text-slate-400 font-medium">Receitas Pendentes</TableHead>
                  <TableHead className="py-3.5 text-slate-400 font-medium">Despesas</TableHead>
                  <TableHead className="py-3.5 text-slate-400 font-medium">Saldo Realizado</TableHead>
                  <TableHead className="py-3.5 text-slate-400 font-medium">Saldo Projetado</TableHead>
                  <TableHead className="pr-6 py-3.5 text-right text-slate-400 font-medium">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyBalance.map((item) => {
                  const netRealized = item.revenuesPaid - item.expenses
                  const netProjected = item.revenuesPaid + item.revenuesPending - item.expenses

                  return (
                    <TableRow key={`${item.year}-${item.month}`} className="border-slate-800 hover:bg-slate-900/30">
                      {/* Mês / Ano */}
                      <TableCell className="pl-6 py-4 font-semibold text-slate-200">
                        <Link
                          href={`/dashboard/financeiro?tab=mensal&month=${item.month}&year=${item.year}`}
                          className="hover:text-indigo-400 hover:underline transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          {monthNames[item.month - 1]} / {item.year}
                        </Link>
                      </TableCell>

                      {/* Receitas Realizadas */}
                      <TableCell className="py-4 font-mono text-emerald-400">
                        {formatCurrency(item.revenuesPaid)}
                      </TableCell>

                      {/* Receitas Pendentes */}
                      <TableCell className="py-4 font-mono text-amber-400">
                        {formatCurrency(item.revenuesPending)}
                      </TableCell>

                      {/* Despesas */}
                      <TableCell className="py-4 font-mono text-rose-400">
                        -{formatCurrency(item.expenses)}
                      </TableCell>

                      {/* Saldo Realizado */}
                      <TableCell className="py-4 font-mono">
                        <span className={netRealized >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {formatCurrency(netRealized)}
                        </span>
                      </TableCell>

                      {/* Saldo Projetado */}
                      <TableCell className="py-4 font-mono">
                        <span className={netProjected >= 0 ? 'text-indigo-400 font-bold' : 'text-rose-450 font-bold'}>
                          {formatCurrency(netProjected)}
                        </span>
                      </TableCell>

                      {/* Ações (Redirecionar para Balanço do Mês) */}
                      <TableCell className="pr-6 py-4 text-right">
                        <Link
                          href={`/dashboard/financeiro?tab=mensal&month=${item.month}&year=${item.year}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition-all cursor-pointer shadow-sm"
                        >
                          <Eye className="size-3.5" /> Detalhar
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    )
  }

  // Se a aba for despesas
  const allExpenses = await getExpenses()
  const expenses = allExpenses.filter((e) => {
    const d = new Date(e.date)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  })

  return (
    <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-200">Histórico de Gastos</CardTitle>
        <CardDescription className="text-slate-400">
          Visualize e gerencie todos os investimentos e despesas operacionais realizadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Layers className="size-12 text-slate-700 mb-3" />
            <h3 className="font-semibold text-slate-300">Nenhum despesa registrada</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">
              Cadastre sua primeira despesa clicando no botão no topo da página.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-950/40 border-b border-slate-800">
              <TableRow className="border-slate-800">
                <TableHead className="pl-6 py-3.5 text-slate-400 font-medium">Data</TableHead>
                <TableHead className="py-3.5 text-slate-400 font-medium">Descrição</TableHead>
                <TableHead className="py-3.5 text-slate-400 font-medium">Categoria</TableHead>
                <TableHead className="py-3.5 text-slate-400 font-medium">Valor</TableHead>
                <TableHead className="pr-6 py-3.5 text-right text-slate-400 font-medium">Excluir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id} className="border-slate-800 hover:bg-slate-900/30">
                  {/* Data */}
                  <TableCell className="pl-6 py-4 text-slate-250">
                    {formatDate(expense.date)}
                  </TableCell>

                  {/* Descrição */}
                  <TableCell className="py-4 text-slate-200 font-semibold">
                    <div>
                      <p>{expense.description}</p>
                      {expense.notes && <p className="text-xs text-slate-500 font-normal">{expense.notes}</p>}
                    </div>
                  </TableCell>

                  {/* Categoria */}
                  <TableCell className="py-4">
                    <span className="inline-flex items-center rounded bg-slate-800/80 px-2 py-0.5 text-xs font-semibold text-slate-300 border border-slate-700">
                      {expense.category}
                    </span>
                  </TableCell>

                  {/* Valor */}
                  <TableCell className="py-4 font-mono text-rose-400">
                    -{formatCurrency(expense.amount)}
                  </TableCell>

                  {/* Excluir */}
                  <TableCell className="pr-6 py-4 text-right">
                    <DeleteExpenseButton id={expense.id} />
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
