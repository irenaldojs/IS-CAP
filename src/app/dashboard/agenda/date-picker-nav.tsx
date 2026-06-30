'use client'

import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'

export function DatePickerNav({ currentDate, view }: { currentDate: string; view: string }) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
      <Calendar className="size-3.5 text-indigo-400" />
      <input
        type="date"
        value={currentDate}
        onChange={(e) => {
          if (e.target.value) {
            router.push(`/dashboard/agenda?view=${view}&period=week&date=${e.target.value}`)
          }
        }}
        className="bg-transparent text-slate-200 text-xs font-semibold border-none outline-none cursor-pointer [color-scheme:dark]"
      />
    </div>
  )
}
