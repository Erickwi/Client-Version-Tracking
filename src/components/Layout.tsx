import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clientes', icon: Users },
  { to: '/versions', label: 'Versiones', icon: Tag },
]

export function Layout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r bg-gray-50 flex flex-col shrink-0">
        <div className="px-4 py-5 border-b">
          <span className="font-bold text-sm tracking-tight">Version Tracker</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm border'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
