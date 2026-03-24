import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Calendar,
  Users,
  Flame,
  Pin,
  ArrowRight,
  Guitar,
  PartyPopper,
  Archive,
  MessageSquarePlus,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

export default function Index() {
  const {
    totalGuests,
    user,
    confirmPresence,
    participants,
    announcements,
    addAnnouncement,
    archiveAnnouncement,
  } = useAppStore()
  const { toast } = useToast()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [pinned, setPinned] = useState(false)
  const [openAdd, setOpenAdd] = useState(false)

  const activeAnnouncements = announcements
    .filter((a) => !a.archived)
    .sort(
      (a, b) =>
        (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

  const archivedAnnouncements = announcements
    .filter((a) => a.archived)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleCreateAnn = () => {
    if (!title || !content) return
    addAnnouncement({ title, content, pinned })
    setTitle('')
    setContent('')
    setPinned(false)
    setOpenAdd(false)
    toast({ title: 'Recado publicado no mural! 📢' })
  }

  const handleConfirmPresence = () => {
    confirmPresence()
    toast({
      title: 'Presença Confirmada! 🎉',
      description: 'Sua família já está na lista oficial da festa.',
    })
  }

  const targetDate = new Date('2024-12-20T00:00:00')
  const today = new Date()
  const diffDays = Math.ceil(
    Math.max(targetDate.getTime() - today.getTime(), 0) / (1000 * 60 * 60 * 24),
  )

  const confirmedParticipants = participants.filter((p) => p.hasConfirmed)
  const confirmedPeople = confirmedParticipants.reduce((acc, p) => acc + p.members.length, 0)

  return (
    <div className="space-y-8 animate-fade-in">
      {!user.hasConfirmed && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white p-6 md:p-8 shadow-xl shadow-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-white/20 p-4 rounded-full shrink-0">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black font-display drop-shadow-sm">
                Confirme sua Presença!
              </h3>
              <p className="text-white/90 font-medium text-base md:text-lg drop-shadow-sm mt-1">
                Isso ajuda muito na organização das compras e divisões.
              </p>
            </div>
          </div>
          <Button
            onClick={handleConfirmPresence}
            size="lg"
            className="w-full md:w-auto bg-white text-emerald-600 hover:bg-emerald-50 font-black text-lg h-14 px-8 rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 shrink-0 z-10"
          >
            Estarei Lá! 🎉
          </Button>
        </div>
      )}

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
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Card className="bg-white/80 backdrop-blur-sm border-amber-100 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer">
                  <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                      <Users className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-3xl font-black font-display text-foreground">
                        {confirmedPeople}
                      </div>
                      <p className="text-xs text-foreground/60 font-bold uppercase tracking-wider mt-1">
                        Confirmados
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto w-full sm:max-w-md border-l-amber-200">
                <SheetHeader className="mb-6 border-b border-amber-100 pb-4">
                  <SheetTitle className="font-display font-black text-2xl flex items-center">
                    <Users className="w-6 h-6 mr-2 text-primary" />
                    Quem já confirmou
                  </SheetTitle>
                  <SheetDescription className="font-medium text-base">
                    Lista oficial das pessoas que estarão na festa.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4">
                  {confirmedParticipants.length === 0 && (
                    <p className="text-sm font-bold text-foreground/40 text-center py-8">
                      Ninguém confirmou ainda.
                    </p>
                  )}
                  {confirmedParticipants.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 bg-orange-50/50 rounded-xl border border-amber-100 shadow-sm"
                    >
                      <h4 className="font-bold text-foreground text-lg">{p.name}</h4>
                      <p className="text-sm text-foreground/60 font-medium mt-1 mb-2">
                        {p.members.map((m) => m.name || 'Sem nome').join(', ')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className="bg-white border-amber-200 text-[10px] uppercase font-bold"
                        >
                          {p.members.filter((m) => m.category === 'adult').length} Adultos
                        </Badge>
                        {p.members.filter((m) => m.category.startsWith('child')).length > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-white border-amber-200 text-[10px] uppercase font-bold"
                          >
                            {p.members.filter((m) => m.category.startsWith('child')).length}{' '}
                            Crianças
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="bg-white border-primary/20 text-primary text-[10px] uppercase font-bold"
                        >
                          {p.daysAttending} Dias
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button asChild className="w-full mt-4 font-bold rounded-xl" variant="outline">
                    <Link to="/participants">Ver Lista Completa</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

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
                  Votar no Setlist/Comida <ArrowRight className="w-4 h-4 ml-2 text-primary" />
                </Link>
              </Button>
              <Button
                asChild
                className="w-full justify-between hover:scale-[1.02] transition-transform"
                variant="outline"
              >
                <Link to="/tasks">
                  Tarefas do Bonde <ArrowRight className="w-4 h-4 ml-2 text-secondary" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-black font-display text-foreground flex items-center">
              Mural de Recados
            </h3>
            <div className="flex items-center space-x-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-bold border-amber-200 hover:bg-amber-50 rounded-xl h-9"
                  >
                    <Archive className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Histórico</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto w-full sm:max-w-md border-l-amber-200">
                  <SheetHeader className="mb-6 border-b border-amber-100 pb-4">
                    <SheetTitle className="font-display font-black text-2xl">Arquivo</SheetTitle>
                    <SheetDescription className="font-medium text-base">
                      Mensagens que não estão mais no mural principal.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4">
                    {archivedAnnouncements.length === 0 && (
                      <p className="text-sm font-bold text-foreground/40 text-center py-8">
                        Vazio por aqui.
                      </p>
                    )}
                    {archivedAnnouncements.map((ann) => (
                      <Card
                        key={ann.id}
                        className="bg-orange-50/30 border-amber-100 shadow-sm opacity-90"
                      >
                        <CardContent className="p-4">
                          <h4 className="font-bold text-foreground line-clamp-1 text-base">
                            {ann.title}
                          </h4>
                          <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest my-1">
                            {new Date(ann.date).toLocaleString('pt-BR')}
                          </p>
                          <p className="text-sm text-foreground/70 line-clamp-3 mt-2">
                            {ann.content}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              {user.isGovernance && (
                <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="font-bold shadow-md rounded-xl h-9">
                      <MessageSquarePlus className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Novo Recado</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] border-amber-200">
                    <DialogHeader>
                      <DialogTitle className="font-display font-black text-2xl">
                        Avisar a Galera
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label className="font-bold">Título</Label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Ex: Roda de Samba..."
                          className="bg-orange-50/30 border-amber-200 font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">Mensagem</Label>
                        <Textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Detalhes do aviso..."
                          className="h-32 bg-orange-50/30 border-amber-200 resize-none"
                        />
                      </div>
                      <div className="flex items-center space-x-3 bg-orange-50/50 p-3 rounded-xl border border-amber-100">
                        <Switch
                          checked={pinned}
                          onCheckedChange={setPinned}
                          className="scale-90 data-[state=checked]:bg-primary"
                        />
                        <div className="space-y-0.5">
                          <Label
                            className="font-bold cursor-pointer"
                            onClick={() => setPinned(!pinned)}
                          >
                            Fixar no topo?
                          </Label>
                          <p className="text-xs text-foreground/60 font-medium">
                            Deixa essa mensagem com destaque.
                          </p>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleCreateAnn}
                        className="font-bold rounded-xl shadow-md w-full"
                      >
                        Publicar Recado
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {activeAnnouncements.map((ann) => (
              <Dialog key={ann.id}>
                <DialogTrigger asChild>
                  <Card
                    className={cn(
                      'shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer border',
                      ann.pinned
                        ? 'border-primary/40 bg-gradient-to-r from-orange-50 to-white'
                        : 'border-amber-100 bg-white/80 backdrop-blur-sm',
                    )}
                  >
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          {ann.pinned && (
                            <div className="p-1.5 bg-primary/10 rounded-full shrink-0">
                              <Pin className="w-4 h-4 text-primary fill-primary/20" />
                            </div>
                          )}
                          <h4 className="font-bold text-foreground font-display text-lg line-clamp-1">
                            {ann.title}
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-foreground/40 uppercase tracking-wide bg-foreground/5 px-2 py-1 rounded-md shrink-0 ml-2">
                          {new Date(ann.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/70 leading-relaxed font-medium line-clamp-2">
                        {ann.content}
                      </p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] border-amber-200">
                  <DialogHeader>
                    <div className="flex items-center space-x-2 mb-2">
                      {ann.pinned && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          Fixado
                        </Badge>
                      )}
                      <span className="text-xs font-bold text-foreground/40 uppercase tracking-wider">
                        {new Date(ann.date).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <DialogTitle className="text-2xl font-black font-display text-foreground leading-tight">
                      {ann.title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {ann.content}
                    </p>
                  </div>
                  {user.isGovernance && (
                    <DialogFooter className="sm:justify-between border-t border-amber-100 pt-4 mt-2">
                      <DialogClose asChild>
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-bold w-full sm:w-auto"
                          onClick={() => archiveAnnouncement(ann.id)}
                        >
                          <Archive className="w-4 h-4 mr-2" /> Arquivar Recado
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  )}
                </DialogContent>
              </Dialog>
            ))}
            {activeAnnouncements.length === 0 && (
              <div className="p-8 text-center bg-white/50 rounded-2xl border-2 border-dashed border-amber-200">
                <p className="text-foreground/50 font-bold">Nenhum recado no mural.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
