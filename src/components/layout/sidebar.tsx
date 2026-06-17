"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Users, 
  Calendar, 
  DollarSign, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out select-none",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header / Logo */}
      <div className="flex h-16 items-center px-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <GraduationCap className="size-5" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg tracking-tight whitespace-nowrap animate-in fade-in duration-300">
              IS-CAP
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 relative",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                  isActive ? "text-sidebar-primary" : "text-muted-foreground"
                )}
              />
              {!isCollapsed && (
                <span className="ml-3 truncate animate-in fade-in duration-200">
                  {item.name}
                </span>
              )}

              {/* Active Indicator Dot on Collapsed */}
              {isCollapsed && isActive && (
                <span className="absolute right-1 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-sidebar-border flex justify-end">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md"
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <div className="flex items-center gap-1">
              <ChevronLeft className="size-4" />
            </div>
          )}
        </Button>
      </div>
    </aside>
  )
}
