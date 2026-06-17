'use client'

import { deleteMaterial } from '@/actions/materiais'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'

interface DeleteMaterialButtonProps {
  id: string
}

export function DeleteMaterialButton({ id }: DeleteMaterialButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('Deseja excluir este material permanentemente?')) return

    startTransition(async () => {
      try {
        await deleteMaterial(id)
        toast.success('Material removido!')
      } catch (err) {
        console.error(err)
        toast.error('Erro ao excluir material.')
      }
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/15 rounded transition-colors cursor-pointer disabled:opacity-50"
      title="Excluir arquivo"
    >
      <Trash2 className="size-4" />
    </button>
  )
}
