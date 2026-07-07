"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Users, 
  Calendar, 
  DollarSign, 
  BookOpen, 
  GraduationCap
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const sidebarItems: SidebarItem[] = [
  {
    name: "Alunos",
    href: "/dashboard/alunos",
    icon: Users,
  },
  {
    name: "Agenda",
    href: "/dashboard/agenda",
    icon: Calendar,
  },
  {
    name: "Financeiro",
    href: "/dashboard/financeiro",
    icon: DollarSign,
  },
  {
    name: "Materiais",
    href: "/dashboard/materiais",
    icon: BookOpen,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="relative flex w-16 flex-col items-center border-r border-sidebar-border bg-sidebar py-4 text-sidebar-foreground select-none shrink-0 shadow-lg">
      {/* Header / Logo */}
      <div className="flex h-12 items-center justify-center mb-6">
        <Link href="/dashboard/alunos" className="flex items-center justify-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform duration-300 hover:scale-110">
            <GraduationCap className="size-6" />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col items-center gap-3 w-full px-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex size-12 items-center justify-center rounded-xl transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md scale-105"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-5.5 shrink-0 transition-all duration-200 group-hover:scale-110",
                  isActive ? "text-sidebar-primary scale-105" : "text-muted-foreground"
                )}
              />

              {/* Tooltip similar to VS Code with smooth slide & fade */}
              <div className="pointer-events-none absolute left-16 z-50 flex items-center opacity-0 -translate-x-2 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-x-0">
                {/* Arrow */}
                <div className="size-1.5 rotate-45 bg-popover border-l border-b border-border -mr-[3px]" />
                {/* Text box */}
                <span className="whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs font-semibold text-popover-foreground shadow-lg">
                  {item.name}
                </span>
              </div>

              {/* Active Indicator Bar on Left */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-md bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

