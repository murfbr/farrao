import { Link, Outlet, useLocation } from 'react-router-dom'
import { Tent, ClipboardList, Mic, Wallet, Users, Bell, ShieldAlert, Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import useAppStore from '@/stores/useAppStore'

const NAV_ITEMS = [
  { path: '/', label: 'A Tenda', icon: Tent },
  { path: '/tasks', label: 'Tarefas', icon: ClipboardList },
  { path: '/voting', label: 'Votações', icon: Mic },
  { path: '/finance', label: 'Finanças', icon: Wallet },
  { path: '/profile', label: 'Minha Família', icon: Users },
]

export default function Layout() {
  const location = useLocation()
  const { user, toggleGovernance } = useAppStore()

  return (
    <div className="flex h-screen bg-transparent overflow-hidden text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/60 backdrop-blur-xl border-r border-amber-200/50 z-10 shadow-[2px_0_15px_-3px_rgba(255,102,0,0.05)]">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-rose-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/30 rotate-3">
            <Music className="w-6 h-6 -rotate-3" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-primary tracking-tight">Farrão</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-primary/60 mt-0.5">
              Encontro Anual
            </p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-primary to-orange-400 text-white shadow-md shadow-primary/20 scale-105 origin-left'
                    : 'text-foreground/70 hover:bg-orange-100/50 hover:text-primary',
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="flex-none h-16 bg-white/40 backdrop-blur-md border-b border-amber-200/50 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3 md:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-rose-500 rounded-lg flex items-center justify-center text-white shadow-sm rotate-3">
              <Music className="w-5 h-5 -rotate-3" />
            </div>
            <h2 className="text-xl font-bold font-display text-primary">Farrão</h2>
          </div>
          <div className="hidden md:flex flex-col">
            <h2 className="text-lg font-bold font-display text-foreground/80">
              Festa da Família 2024 🎸
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3 bg-white/80 px-4 py-1.5 rounded-2xl border border-amber-200/50 shadow-sm transition-colors hover:bg-orange-50/50">
              <div className="flex items-center space-x-1.5">
                <ShieldAlert
                  className={cn(
                    'w-4 h-4 transition-colors',
                    user.isGovernance ? 'text-primary' : 'text-foreground/30',
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-black uppercase tracking-widest transition-colors',
                    user.isGovernance ? 'text-primary' : 'text-foreground/40',
                  )}
                >
                  Modo Admin
                </span>
              </div>
              <Switch
                checked={user.isGovernance}
                onCheckedChange={toggleGovernance}
                className="scale-[0.8] data-[state=checked]:bg-primary shadow-inner"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground/60 hover:text-primary hover:bg-orange-100/50"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
            </Button>
            <Link to="/profile">
              <Avatar className="w-10 h-10 border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform">
                <AvatarImage
                  src={
                    user.photoUrl || `https://img.usecurling.com/ppl/thumbnail?seed=${user.name}`
                  }
                />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user.name.charAt(0)}
                </AvatarFallback>
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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-t border-amber-200/50 flex justify-around items-center px-2 z-30 pb-safe shadow-[0_-5px_15px_-3px_rgba(255,102,0,0.05)]">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full space-y-1 relative',
                  isActive ? 'text-primary' : 'text-foreground/40',
                )}
              >
                {isActive && (
                  <span className="absolute -top-2 w-8 h-1 bg-primary rounded-full"></span>
                )}
                <item.icon className={cn('w-5 h-5', isActive && 'fill-primary/10')} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
