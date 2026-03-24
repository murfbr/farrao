import { useState } from 'react'
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react'
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
  const { tasks, moveTask, addTask } = useAppStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('Média')

  const handleAdd = () => {
    if (!newTaskTitle.trim()) return
    addTask(newTaskTitle, newTaskPriority)
    setNewTaskTitle('')
  }

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Grupos de Trabalho</h1>
          <p className="text-slate-500 text-sm">Organize e divida as tarefas da viagem.</p>
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
          const colTasks = tasks.filter((t) => t.status === col.id)
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
                            'text-[10px] uppercase font-bold border-none',
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
                              className="w-6 h-6 h-8 w-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
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
                              className="w-6 h-6 h-8 w-8 bg-slate-100 hover:bg-primary hover:text-white text-slate-600 rounded-full transition-colors"
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
