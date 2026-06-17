'use client'

import { updateLessonStatus } from '@/actions/lessons'
import { toast } from 'sonner'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useState, useTransition } from 'react'

interface LessonStatusButtonProps {
  id: string
  status: string
}

export function LessonStatusButton({ id, status }: LessonStatusButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = () => {
    let nextStatus = 'AGENDADA'
    if (status === 'AGENDADA') {
      nextStatus = 'CONCLUIDA'
    } else if (status === 'CONCLUIDA') {
      nextStatus = 'CANCELADA'
    }

    startTransition(async () => {
      try {
        await updateLessonStatus(id, nextStatus)
        toast.success(`Status da aula atualizado para ${nextStatus.toLowerCase()}!`)
      } catch (error) {
        console.error(error)
        toast.error('Erro ao atualizar status da aula.')
      }
    })
  }

  if (status === 'AGENDADA') {
    return (
      <button
        onClick={handleStatusChange}
        disabled={isPending}
        className="text-xs text-emerald-400 hover:text-white p-1.5 rounded bg-emerald-950/20 hover:bg-emerald-600 transition-colors cursor-pointer border border-emerald-900/30 disabled:opacity-50"
        title="Marcar como Concluída"
      >
        <CheckCircle className="size-4" />
      </button>
    )
  }

  if (status === 'CONCLUIDA') {
    return (
      <button
        onClick={handleStatusChange}
        disabled={isPending}
        className="text-xs text-red-400 hover:text-white p-1.5 rounded bg-red-950/20 hover:bg-red-650 transition-colors cursor-pointer border border-red-900/30 disabled:opacity-50"
        title="Marcar como Cancelada"
      >
        <XCircle className="size-4" />
      </button>
    )
  }

  return (
    <button
      onClick={handleStatusChange}
      disabled={isPending}
      className="text-xs text-indigo-400 hover:text-white p-1.5 rounded bg-indigo-950/20 hover:bg-indigo-650 transition-colors cursor-pointer border border-indigo-900/30 disabled:opacity-50"
      title="Reabrir / Reagendar"
    >
      <AlertCircle className="size-4" />
    </button>
  )
}
