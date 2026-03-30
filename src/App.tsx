import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Profile from './pages/Profile'
import Tasks from './pages/Tasks'
import Finance from './pages/Finance'
import Voting from './pages/Voting'
import Participants from './pages/Participants'
import Food from './pages/Food'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import useAppStore, { AppProvider } from './stores/useAppStore'

import Register from './pages/Register'
import RegisterProfile from './pages/RegisterProfile'
import AdminInvites from './pages/AdminInvites'

const MainApp = () => {
  const { user, isAuthLoading } = useAppStore()

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <span className="text-6xl">🥩</span>
          <p className="font-bold text-primary font-display text-xl tracking-wider">Acendendo o fogo...</p>
        </div>
      </div>
    )
  }

  if (user.id === 'u1') {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  // Se o usuário está logado mas ainda não completou o perfil, força o redirecionamento
  // Exceto se ele já estiver na página de completar o perfil
  const { pathname } = useLocation()
  const isProfileSetupPath = pathname === '/register-profile'
  if (!user.profileCompleted && !isProfileSetupPath) {
    return <Navigate to="/register-profile" replace />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Index />} />
        <Route path="/participants" element={<Participants />} />
        <Route path="/food" element={<Food />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/voting" element={<Voting />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminInvites />} />
      </Route>
      <Route path="/register-profile" element={<RegisterProfile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <AppProvider>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <MainApp />
      </TooltipProvider>
    </BrowserRouter>
  </AppProvider>
)

export default App
