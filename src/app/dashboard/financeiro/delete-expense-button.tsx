'use client'

import { deleteExpense } from '@/actions/financeiro'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'

interface DeleteExpenseButtonProps {
  id: string
}

export function DeleteExpenseButton({ id }: DeleteExpenseButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('Excluir esta despesa permanentemente?')) return

    startTransition(async () => {
      try {
        await deleteExpense(id)
        toast.success('Despesa excluída!')
      } catch (error) {
        console.error(error)
        toast.error('Erro ao excluir despesa.')
      }
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-red-950/20 transition-colors cursor-pointer disabled:opacity-50"
    >
      <Trash2 className="size-4" />
    </button>
  )
}
