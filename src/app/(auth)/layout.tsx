export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen text-slate-100 dark">
      {children}
    </div>
  )
}
