'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'

export function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }

    startTransition(() => {
      router.push(`/dashboard/alunos?${params.toString()}`)
    })
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
      {isPending && (
        <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4 animate-spin" />
      )}
      <Input
        placeholder="Buscar por nome, responsável ou escola..."
        className="pl-9 pr-9 bg-slate-900/50 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20"
        defaultValue={searchParams.get('q') || ''}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  )
}
