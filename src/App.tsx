import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import NotFound from './pages/NotFound'
import { AppProvider } from './stores/useAppStore'

const App = () => (
  <AppProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/participants" element={<Participants />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/voting" element={<Voting />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppProvider>
)

export default App
