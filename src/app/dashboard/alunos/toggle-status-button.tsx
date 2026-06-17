'use client'

import { useTransition } from 'react'
import { toggleStudentStatus } from '@/actions/students'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { UserCheck, UserX, Loader2 } from 'lucide-react'

interface ToggleStatusButtonProps {
  id: string
  active: boolean
}

export function ToggleStatusButton({ id, active }: ToggleStatusButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleStudentStatus(id, !active)
        toast.success(`Aluno ${!active ? 'ativado' : 'inativado'} com sucesso!`)
      } catch (error) {
        toast.error('Erro ao alterar status do aluno.')
      }
    })
  }

  return (
    <Button
      variant={active ? 'destructive' : 'outline'}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className="gap-1.5"
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : active ? (
        <UserX className="size-3.5 text-red-400 group-hover/button:text-red-300" />
      ) : (
        <UserCheck className="size-3.5 text-emerald-400 group-hover/button:text-emerald-300" />
      )}
      {active ? 'Inativar' : 'Ativar'}
    </Button>
  )
}
