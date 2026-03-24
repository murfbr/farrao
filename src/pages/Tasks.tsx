import { useState } from 'react'
import { Plus, ChevronRight, ChevronLeft, ArrowLeft, Tent } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import useAppStore, { TaskStatus, GroupType } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

const COLUMNS: { id: TaskStatus; title: string; color: string; headerColor: string }[] = [
  {
    id: 'todo',
    title: 'A Fazer',
    color: 'bg-orange-50/50 border-orange-200',
    headerColor: 'bg-orange-100 text-orange-900 border-orange-200',
  },
  {
    id: 'doing',
    title: 'Em Progresso',
    color: 'bg-yellow-50/50 border-yellow-200',
    headerColor: 'bg-yellow-100 text-yellow-900 border-yellow-200',
  },
  {
    id: 'done',
    title: 'Concluído',
    color: 'bg-green-50/50 border-green-200',
    headerColor: 'bg-green-100 text-green-900 border-green-200',
  },
]

const priorityColors: Record<string, string> = {
  Alta: 'bg-red-100 text-red-800 border-red-200',
  Média: 'bg-amber-100 text-amber-800 border-amber-200',
  Baixa: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

export default function Tasks() {
  const { user, groups, joinGroup, tasks, moveTask, addTask, addGroup } = useAppStore()
  const { toast } = useToast()

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('Média')

  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [newGroupType, setNewGroupType] = useState<GroupType>('general')
  const [openGroupAdd, setOpenGroupAdd] = useState(false)

  const availableGroups = groups.filter(
    (g) => g.type === 'general' || g.memberIds.includes(user.id) || user.isGovernance,
  )
  const activeGroup = groups.find((g) => g.id === selectedGroupId)

  const handleAdd = () => {
    if (!newTaskTitle.trim() || !selectedGroupId) return
    addTask(selectedGroupId, newTaskTitle, newTaskPriority)
    setNewTaskTitle('')
  }

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return
    addGroup({ name: newGroupName, description: newGroupDesc, type: newGroupType })
    setNewGroupName('')
    setNewGroupDesc('')
    setNewGroupType('general')
    setOpenGroupAdd(false)
    toast({ title: 'Equipe Criada com Sucesso! 🤝' })
  }

  if (!selectedGroupId) {
    return (
      <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black font-display text-foreground">Equipes de Apoio</h1>
            <p className="text-foreground/60 text-base font-medium mt-1">
              Nossa festa é feita por todos. Escolha um bonde para ajudar na organização!
            </p>
          </div>
          {user.isGovernance && (
            <Dialog open={openGroupAdd} onOpenChange={setOpenGroupAdd}>
              <DialogTrigger asChild>
                <Button className="font-bold shadow-md rounded-xl h-11 px-6 shrink-0 transition-transform hover:scale-105 active:scale-95">
                  <Plus className="w-5 h-5 mr-2" /> Nova Equipe
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] border-amber-200">
                <DialogHeader>
                  <DialogTitle className="font-display font-black text-2xl">
                    Montar Bonde
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-5 py-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Nome da Equipe</Label>
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Ex: Mestres Cervejeiros"
                      className="bg-orange-50/30 border-amber-200 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">O que essa equipe faz?</Label>
                    <Textarea
                      value={newGroupDesc}
                      onChange={(e) => setNewGroupDesc(e.target.value)}
                      placeholder="Comprar barril, gelar a cerveja..."
                      className="h-20 bg-orange-50/30 border-amber-200 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Tipo de Acesso</Label>
                    <Select
                      value={newGroupType}
                      onValueChange={(val: GroupType) => setNewGroupType(val)}
                    >
                      <SelectTrigger className="bg-orange-50/30 border-amber-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general" className="font-medium text-emerald-700">
                          Aberto (Qualquer um participa)
                        </SelectItem>
                        <SelectItem value="governance" className="font-medium text-red-700">
                          Restrito (Apenas Governança)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateGroup}
                    className="font-bold rounded-xl shadow-md w-full"
                  >
                    Confirmar Equipe
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableGroups.map((group) => {
            const isMember = group.memberIds.includes(user.id)
            return (
              <Card
                key={group.id}
                className="shadow-sm hover:shadow-xl transition-all border-amber-200 bg-white/80 backdrop-blur-sm flex flex-col h-full rounded-2xl overflow-hidden group"
              >
                <div className="h-2 w-full bg-gradient-to-r from-primary to-accent" />
                <CardHeader className="flex-1 pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <CardTitle className="text-xl font-bold font-display text-foreground flex items-center">
                      <Tent className="w-5 h-5 mr-2 text-primary" />
                      {group.name}
                    </CardTitle>
                    {group.type === 'governance' && (
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-800 border-red-200 uppercase font-bold tracking-widest text-[10px]"
                      >
                        Restrito
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm font-medium text-foreground/70 leading-relaxed">
                    {group.description}
                  </CardDescription>
                  <div className="mt-5 flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {group.memberIds.slice(0, 4).map((id, i) => (
                        <Avatar key={i} className="w-8 h-8 border-2 border-white">
                          <AvatarImage
                            src={`https://img.usecurling.com/ppl/thumbnail?seed=${id}`}
                          />
                          <AvatarFallback className="bg-primary/20 text-xs">U</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <div className="text-xs text-foreground/50 font-bold uppercase tracking-wider pl-2">
                      {group.memberIds.length} na equipe
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 bg-orange-50/30 p-4 mt-auto">
                  <Button
                    className={cn(
                      'w-full shadow-sm font-bold rounded-xl transition-transform active:scale-95',
                      isMember
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-white text-primary border-primary/20 hover:bg-primary/5',
                    )}
                    variant={isMember ? 'default' : 'outline'}
                    onClick={() => {
                      if (!isMember) joinGroup(group.id)
                      setSelectedGroupId(group.id)
                    }}
                  >
                    {isMember ? 'Ver Tarefas do Bonde' : 'Entrar na Equipe'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 bg-white/80 p-4 rounded-2xl border border-amber-200 shadow-sm backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedGroupId(null)}
            className="shrink-0 rounded-xl w-10 h-10 border-amber-200 hover:bg-amber-100 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black font-display text-foreground">
                {activeGroup?.name}
              </h1>
              {activeGroup?.type === 'governance' && (
                <Badge
                  variant="secondary"
                  className="bg-red-100 text-red-800 border-none text-[10px] uppercase font-bold tracking-widest"
                >
                  Restrito
                </Badge>
              )}
            </div>
            <p className="text-foreground/60 text-sm font-medium">Bora agilizar o que falta!</p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="shrink-0 shadow-md transition-transform hover:scale-105 active:scale-95 font-bold rounded-xl h-11 px-6">
              <Plus className="w-5 h-5 mr-2" /> Puxar Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-amber-200">
            <DialogHeader>
              <DialogTitle className="font-display font-bold text-2xl">Nova Missão</DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-bold">
                  O que precisa ser feito?
                </Label>
                <Input
                  id="title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ex: Comprar carvão..."
                  className="bg-orange-50/30 border-amber-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Prioridade</Label>
                <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                  <SelectTrigger className="bg-orange-50/30 border-amber-200">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa" className="font-medium text-emerald-700">
                      Tranquilo (Baixa)
                    </SelectItem>
                    <SelectItem value="Média" className="font-medium text-amber-700">
                      Importante (Média)
                    </SelectItem>
                    <SelectItem value="Alta" className="font-medium text-red-700">
                      Urgente (Alta)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" className="font-bold">
                  Cancelar
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleAdd} className="font-bold shadow-md rounded-xl">
                  Salvar Missão
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.groupId === selectedGroupId && t.status === col.id)
          return (
            <div
              key={col.id}
              className={cn(
                'flex-1 rounded-2xl border-2 flex flex-col overflow-hidden shadow-sm',
                col.color,
              )}
            >
              <div
                className={cn(
                  'px-4 py-3 border-b flex justify-between items-center',
                  col.headerColor,
                )}
              >
                <h3 className="font-black font-display tracking-wide uppercase text-sm">
                  {col.title}
                </h3>
                <Badge variant="outline" className="bg-white/60 font-bold border-none shadow-sm">
                  {colTasks.length}
                </Badge>
              </div>
              <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto min-h-[150px]">
                {colTasks.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-foreground/40 text-sm font-medium border-2 border-dashed border-current/20 rounded-xl m-2">
                    Nenhuma tarefa aqui
                  </div>
                )}
                {colTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="shadow-sm hover:shadow-md transition-all border-amber-200 group bg-white rounded-xl"
                  >
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-3">
                        <span className="font-bold text-foreground text-sm leading-snug">
                          {task.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] uppercase font-black border shrink-0 py-0.5',
                            priorityColors[task.priority],
                          )}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-3 border-t border-amber-50">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7 border-2 border-white shadow-sm">
                            <AvatarImage
                              src={`https://img.usecurling.com/ppl/thumbnail?seed=${task.assignee}`}
                            />
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                              {task.assignee[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-foreground/60 font-bold truncate max-w-[80px]">
                            {task.assignee}
                          </span>
                        </div>
                        <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          {col.id !== 'todo' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg"
                              onClick={() =>
                                moveTask(task.id, col.id === 'done' ? 'doing' : 'todo')
                              }
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                          )}
                          {col.id !== 'done' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 bg-orange-50 hover:bg-primary hover:text-white text-primary rounded-lg transition-colors shadow-sm"
                              onClick={() =>
                                moveTask(task.id, col.id === 'todo' ? 'doing' : 'done')
                              }
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
