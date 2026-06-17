import { getPayments, getExpenses } from '@/actions/financeiro'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TogglePaymentButton } from './toggle-payment-button'
import { DeleteExpenseButton } from './delete-expense-button'
import {
  DollarSign,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react'

interface FinanceDataViewProps {
  tab: 'receitas' | 'despesas'
}

export async function FinanceDataView({ tab }: FinanceDataViewProps) {
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
    const payments = await getPayments()

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

  // Se a aba for despesas
  const expenses = await getExpenses()

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
            <h3 className="font-semibold text-slate-300">Nenhuma despesa registrada</h3>
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
