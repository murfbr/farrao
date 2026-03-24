import { Link, Outlet, useLocation } from 'react-router-dom'
import { Home, CheckSquare, Vote, DollarSign, User, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import useAppStore from '@/stores/useAppStore'

const NAV_ITEMS = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/tasks', label: 'Tarefas', icon: CheckSquare },
  { path: '/voting', label: 'Votações', icon: Vote },
  { path: '/finance', label: 'Finanças', icon: DollarSign },
  { path: '/profile', label: 'Perfil', icon: User },
]

export default function Layout() {
  const location = useLocation()
  const { user } = useAppStore()

  return (
    <div className="flex h-screen bg-background overflow-hidden text-slate-700">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary tracking-tight">AmigoTrip</h1>
          <p className="text-xs text-slate-500 mt-1">Organizador Anual</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="flex-none h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 md:hidden">AmigoTrip</h2>
            <h2 className="text-lg font-bold text-slate-800 hidden md:block">
              Encontro Anual 2024
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative text-slate-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
            </Button>
            <Link to="/profile">
              <Avatar className="w-9 h-9 border border-slate-200 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${user.name}`} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto w-full h-full">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center px-2 z-30 pb-safe">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full space-y-1',
                  isActive ? 'text-primary' : 'text-slate-400',
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive && 'fill-primary/20')} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
