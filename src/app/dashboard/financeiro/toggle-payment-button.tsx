'use client'

import { togglePaymentStatus } from '@/actions/financeiro'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock } from 'lucide-react'
import { useTransition } from 'react'

interface TogglePaymentButtonProps {
  id: string
  isPaid: boolean
  paymentMethod: string | null
}

export function TogglePaymentButton({ id, isPaid, paymentMethod }: TogglePaymentButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = (status: boolean, method?: string) => {
    const selectedMethod = method || 'PIX'
    startTransition(async () => {
      try {
        await togglePaymentStatus(id, status, selectedMethod)
        toast.success(
          status
            ? `Pagamento registrado via ${selectedMethod}!`
            : 'Pagamento marcado como pendente!'
        )
      } catch (error) {
        console.error(error)
        toast.error('Erro ao atualizar status de pagamento.')
      }
    })
  }

  if (isPaid) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => handleToggle(false)}
        className="text-rose-500 hover:bg-rose-950/15 cursor-pointer border-slate-800 disabled:opacity-50"
      >
        Estornar
      </Button>
    )
  }

  return (
    <div className="flex justify-end gap-1.5">
      <Button
        size="sm"
        disabled={isPending}
        className="bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer text-xs"
        onClick={() => handleToggle(true, 'PIX')}
      >
        Pagar (PIX)
      </Button>
      <select
        className="bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-xs text-slate-300 outline-none"
        disabled={isPending}
        onChange={(e) => {
          if (e.target.value !== '') {
            handleToggle(true, e.target.value)
            e.target.value = ''
          }
        }}
      >
        <option value="">Outro...</option>
        <option value="DINHEIRO">Dinheiro</option>
        <option value="TRANSFERENCIA">Doc/Ted</option>
      </select>
    </div>
  )
}
