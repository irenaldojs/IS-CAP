import { auth } from '@/auth'

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Bem-vindo, {session?.user?.name || 'Professor'}!
        </h1>
        <p className="text-slate-400 mt-1">
          Aqui está o resumo das suas atividades e aulas para hoje.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards para as estatísticas */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Alunos Ativos</p>
          <p className="mt-2 text-3xl font-bold text-white">--</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Aulas esta Semana</p>
          <p className="mt-2 text-3xl font-bold text-white">--</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Receita Estimada</p>
          <p className="mt-2 text-3xl font-bold text-white">R$ --</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Alertas Pendentes</p>
          <p className="mt-2 text-3xl font-bold text-white">--</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white mb-4">Próximas Aulas</h2>
          <div className="flex h-32 items-center justify-center text-sm text-slate-500">
            Nenhuma aula agendada para hoje.
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white mb-4">Pagamentos Pendentes</h2>
          <div className="flex h-32 items-center justify-center text-sm text-slate-500">
            Nenhum pagamento pendente no momento.
          </div>
        </div>
      </div>
    </div>
  )
}
