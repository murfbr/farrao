import { Link } from 'react-router-dom'
import { MapPin, Calendar, Users, Clock, Pin, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Endereço da Chácara Atualizado',
    date: 'Hoje, 10:00',
    content:
      'Pessoal, o proprietário enviou o link do Waze correto. A entrada é pela via secundária!',
    pinned: true,
  },
  {
    id: 2,
    title: 'Lembrete: Pagamento Parcela 2',
    date: 'Ontem, 18:30',
    content:
      'Não esqueçam que o vencimento da segunda parcela é dia 15. Verifiquem a aba de finanças.',
    pinned: false,
  },
]

export default function Index() {
  const { totalGuests } = useAppStore()

  // Calculate days remaining roughly
  const targetDate = new Date('2024-12-20T00:00:00')
  const today = new Date()
  const diffTime = Math.max(targetDate.getTime() - today.getTime(), 0)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-blue-700 text-white p-6 md:p-10 shadow-lg">
        <div className="absolute top-0 right-0 opacity-10">
          <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 22h20L12 2zm0 3.8l7.2 14.2H4.8L12 5.8z" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col space-y-4">
          <Badge className="w-fit bg-white/20 hover:bg-white/30 text-white border-none">
            Oficial
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Chácara Recanto Feliz</h1>
          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0 text-blue-100 font-medium">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>20 a 24 de Dezembro</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Ibiúna, SP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Summary & Actions */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white border-slate-100 shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-3 bg-blue-50 rounded-full text-primary">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{totalGuests}</div>
                <p className="text-xs text-slate-500 font-medium">Confirmados</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-100 shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-3 bg-orange-50 rounded-full text-secondary">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{diffDays}</div>
                <p className="text-xs text-slate-500 font-medium">Dias Restantes</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Acesso Rápido</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button asChild className="w-full justify-between" variant="outline">
                <Link to="/voting">
                  Votar em Atividades
                  <ArrowRight className="w-4 h-4 ml-2 opacity-50" />
                </Link>
              </Button>
              <Button asChild className="w-full justify-between" variant="outline">
                <Link to="/tasks">
                  Minhas Tarefas
                  <ArrowRight className="w-4 h-4 ml-2 opacity-50" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Feed */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            Informativos Gerais
          </h3>
          <div className="space-y-4">
            {ANNOUNCEMENTS.map((ann) => (
              <Card
                key={ann.id}
                className={cn(
                  'shadow-sm transition-all',
                  ann.pinned ? 'border-primary/50 bg-blue-50/30' : 'border-slate-100',
                )}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      {ann.pinned && <Pin className="w-4 h-4 text-primary fill-primary/20" />}
                      <h4 className="font-semibold text-slate-800">{ann.title}</h4>
                    </div>
                    <span className="text-xs text-slate-400">{ann.date}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{ann.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
