import { Link } from 'react-router-dom'
import { MapPin, Calendar, Users, Flame, Pin, ArrowRight, Guitar, PartyPopper } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Vai ter roda de samba sim!',
    date: 'Hoje, 10:00',
    content:
      'Pessoal, não esqueçam de trazer seus instrumentos. A roda de samba oficial acontece no sábado à tarde!',
    pinned: true,
  },
  {
    id: 2,
    title: 'Lembrete da Vakinha (Parcela 2)',
    date: 'Ontem, 18:30',
    content:
      'Lembrando que o vencimento da segunda parcela é dia 15. Ajudem a governança, paguem em dia! Verifiquem a aba de finanças.',
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
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-orange-500 to-rose-500 text-white p-8 md:p-12 shadow-xl shadow-primary/20">
        <div className="absolute top-0 right-0 opacity-20 pointer-events-none -translate-y-10 translate-x-10">
          <Guitar className="w-64 h-64 rotate-12" />
        </div>
        <div className="absolute bottom-0 left-0 opacity-10 pointer-events-none translate-y-10 -translate-x-10">
          <PartyPopper className="w-48 h-48 -rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col space-y-6">
          <Badge className="w-fit bg-white/20 hover:bg-white/30 text-white border-none shadow-sm backdrop-blur-sm text-sm py-1 px-3">
            Contagem Regressiva
          </Badge>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight drop-shadow-sm">
              Farrão 2024
            </h1>
            <p className="text-xl md:text-2xl font-medium text-white/90 drop-shadow-sm max-w-xl">
              A festa mais esperada da família. Muita música, resenha e alegria!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0 text-white/90 font-semibold bg-black/10 w-fit p-4 rounded-2xl backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span>20 a 24 de Dezembro</span>
            </div>
            <div className="hidden sm:block w-px bg-white/20" />
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span>Ibiúna, SP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Summary & Actions */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white/80 backdrop-blur-sm border-amber-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-3xl font-black font-display text-foreground">
                    {totalGuests}
                  </div>
                  <p className="text-xs text-foreground/60 font-bold uppercase tracking-wider mt-1">
                    Confirmados
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-amber-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Flame className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-3xl font-black font-display text-foreground">{diffDays}</div>
                  <p className="text-xs text-foreground/60 font-bold uppercase tracking-wider mt-1">
                    Dias Restantes
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-amber-100 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display font-bold text-foreground">
                Acesso Rápido
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                asChild
                className="w-full justify-between hover:scale-[1.02] transition-transform"
                variant="outline"
              >
                <Link to="/voting">
                  Votar no Setlist/Comida
                  <ArrowRight className="w-4 h-4 ml-2 text-primary" />
                </Link>
              </Button>
              <Button
                asChild
                className="w-full justify-between hover:scale-[1.02] transition-transform"
                variant="outline"
              >
                <Link to="/tasks">
                  Tarefas do Bonde
                  <ArrowRight className="w-4 h-4 ml-2 text-secondary" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Feed */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-black font-display text-foreground flex items-center mb-2">
            Mural de Recados
          </h3>
          <div className="space-y-4">
            {ANNOUNCEMENTS.map((ann) => (
              <Card
                key={ann.id}
                className={cn(
                  'shadow-sm transition-all hover:shadow-md border',
                  ann.pinned
                    ? 'border-primary/40 bg-gradient-to-r from-orange-50 to-white'
                    : 'border-amber-100 bg-white/80 backdrop-blur-sm',
                )}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      {ann.pinned && (
                        <div className="p-1.5 bg-primary/10 rounded-full">
                          <Pin className="w-4 h-4 text-primary fill-primary/20" />
                        </div>
                      )}
                      <h4 className="font-bold text-foreground font-display text-lg">
                        {ann.title}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-foreground/40 uppercase tracking-wide bg-foreground/5 px-2 py-1 rounded-md">
                      {ann.date}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/70 leading-relaxed font-medium">
                    {ann.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
