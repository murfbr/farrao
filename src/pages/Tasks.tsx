import { useState } from 'react'
import { Plus, ChevronRight, ChevronLeft, ArrowLeft, Users } from 'lucide-react'
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
import useAppStore, { TaskStatus } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'A Fazer', color: 'bg-slate-100 border-slate-200' },
  { id: 'doing', title: 'Fazendo', color: 'bg-blue-50 border-blue-100' },
  { id: 'done', title: 'Concluído', color: 'bg-emerald-50 border-emerald-100' },
]

const priorityColors: Record<string, string> = {
  Alta: 'bg-red-100 text-red-700',
  Média: 'bg-amber-100 text-amber-700',
  Baixa: 'bg-emerald-100 text-emerald-700',
}

export default function Tasks() {
  const { user, groups, joinGroup, tasks, moveTask, addTask } = useAppStore()
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('Média')

  const availableGroups = groups.filter((g) => g.type === 'general' || user.isGovernance)
  const activeGroup = groups.find((g) => g.id === selectedGroupId)

  const handleAdd = () => {
    if (!newTaskTitle.trim() || !selectedGroupId) return
    addTask(selectedGroupId, newTaskTitle, newTaskPriority)
    setNewTaskTitle('')
  }

  // 1. Group Selection View
  if (!selectedGroupId) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Grupos de Trabalho</h1>
          <p className="text-slate-500 text-sm">
            Selecione um grupo para visualizar e gerenciar as tarefas organizacionais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableGroups.map((group) => {
            const isMember = group.memberIds.includes(user.id)
            return (
              <Card
                key={group.id}
                className="shadow-sm hover:shadow-md transition-all border-slate-200 flex flex-col h-full"
              >
                <CardHeader className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg text-slate-800">{group.name}</CardTitle>
                    {group.type === 'governance' && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        Governança
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm">{group.description}</CardDescription>
                  <div className="mt-4 flex items-center text-xs text-slate-500 font-medium">
                    <Users className="w-4 h-4 mr-1.5" />
                    {group.memberIds.length} {group.memberIds.length === 1 ? 'membro' : 'membros'}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    className="w-full shadow-sm"
                    variant={isMember ? 'default' : 'outline'}
                    onClick={() => {
                      if (!isMember) joinGroup(group.id)
                      setSelectedGroupId(group.id)
                    }}
                  >
                    {isMember ? 'Acessar Quadro de Tarefas' : 'Participar do Grupo'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // 2. Kanban Board View
  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedGroupId(null)}
            className="shrink-0 rounded-full w-8 h-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-800">{activeGroup?.name}</h1>
              {activeGroup?.type === 'governance' && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  Governança
                </Badge>
              )}
            </div>
            <p className="text-slate-500 text-sm">Gerencie as tarefas deste grupo.</p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="shrink-0 shadow-sm transition-transform active:scale-95">
              <Plus className="w-4 h-4 mr-2" /> Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">O que precisa ser feito?</Label>
                <Input
                  id="title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ex: Comprar carvão..."
                />
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleAdd}>Salvar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.groupId === selectedGroupId && t.status === col.id)
          return (
            <div
              key={col.id}
              className={cn('flex-1 rounded-xl border flex flex-col overflow-hidden', col.color)}
            >
              <div className="p-3 border-b border-inherit bg-white/40 flex justify-between items-center">
                <h3 className="font-semibold text-slate-700">{col.title}</h3>
                <Badge variant="secondary" className="bg-white/60">
                  {colTasks.length}
                </Badge>
              </div>

              <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto min-h-[150px]">
                {colTasks.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
                    Nenhuma tarefa
                  </div>
                )}
                {colTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="shadow-sm hover:shadow-md transition-all border-slate-200 group bg-white"
                  >
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium text-slate-800 text-sm leading-tight">
                          {task.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] uppercase font-bold border-none shrink-0',
                            priorityColors[task.priority],
                          )}
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6 border">
                            <AvatarImage
                              src={`https://img.usecurling.com/ppl/thumbnail?seed=${task.assignee}`}
                            />
                            <AvatarFallback className="text-[10px]">
                              {task.assignee[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-slate-500 truncate max-w-[80px]">
                            {task.assignee}
                          </span>
                        </div>

                        {/* Action Buttons to move tasks */}
                        <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          {col.id !== 'todo' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
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
                              className="w-8 h-8 bg-slate-100 hover:bg-primary hover:text-white text-slate-600 rounded-full transition-colors"
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
