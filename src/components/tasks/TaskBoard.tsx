import React, { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckSquare, Paperclip, Link as LinkIcon, Check, UserPlus, Trash2, LayoutGrid, List as ListIcon, Search, Calendar, MessageSquare } from 'lucide-react'
import useAppStore, { Task, TaskStatus } from '@/stores/useAppStore'
import { cn, getInitials } from '@/lib/utils'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { isPast, isToday, isTomorrow, format, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

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

function DueDateBadge({ dateString }: { dateString: string }) {
  const date = parseISO(dateString)
  const isOverdue = isPast(date) && !isToday(date)
  const isDueSoon = differenceInDays(date, new Date()) <= 2 && differenceInDays(date, new Date()) >= 0

  let colorClass = 'bg-slate-100 text-slate-600 border-slate-200'
  if (isOverdue) colorClass = 'bg-red-100 text-red-700 border-red-200'
  else if (isDueSoon) colorClass = 'bg-orange-100 text-orange-700 border-orange-200'

  return (
    <Badge variant="outline" className={cn('text-[10px] flex items-center gap-1 font-bold border py-0', colorClass)}>
      <Calendar className="w-3 h-3" />
      {format(date, 'dd/MM', { locale: ptBR })}
    </Badge>
  )
}

function TaskCard({
  task,
  index,
  onClick,
}: {
  task: Task
  index: number
  onClick: () => void
}) {
  const { user, updateTask, deleteTask, participants } = useAppStore()
  const { toast } = useToast()

  const checklistTotal = task.checklist?.length || 0
  const checklistDone = task.checklist?.filter((c) => c.completed).length || 0
  const hasLinks = (task.links?.length || 0) > 0
  const imageCount = task.images?.length || 0
  const commentCount = task.comments?.length || 0

  const canEditTask = user.isSuperAdmin || task.creatorId === user.id || task.assigneeId === user.id
  const canDeleteTask = user.isSuperAdmin || task.creatorId === user.id

  const handleQuickComplete = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateTask(task.id, { status: 'done' })
    toast({ title: 'Tarefa concluída! 🎉' })
  }

  const handleQuickAssign = (e: React.MouseEvent) => {
    e.stopPropagation()
    const myParticipant = participants.find(p => p.id === user.id)
    updateTask(task.id, { assigneeId: user.id, assignee: myParticipant?.name || user.name })
    toast({ title: 'Tarefa atribuída a você.' })
  }

  const handleQuickDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Tem certeza que deseja apagar esta tarefa?')) {
      deleteTask(task.id)
      toast({ title: 'Tarefa apagada.' })
    }
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={cn(
            "shadow-sm hover:shadow-md transition-all border-amber-200 bg-white rounded-xl cursor-grab active:cursor-grabbing group relative overflow-hidden",
            snapshot.isDragging ? "shadow-lg scale-105 z-50 rotate-2" : "hover:-translate-y-0.5",
            task.color ? `border-l-4` : ""
          )}
          style={{
            ...provided.draggableProps.style,
            borderLeftColor: task.color || undefined,
            backgroundColor: task.color ? `${task.color}10` : 'white'
          }}
        >
          {/* Quick Actions (Hover) */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10 bg-white/80 backdrop-blur-sm p-1 rounded-lg border shadow-sm">
            {task.status !== 'done' && canEditTask && (
              <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-600 hover:bg-emerald-50" onClick={handleQuickComplete} title="Concluir">
                <Check className="w-3.5 h-3.5" />
              </Button>
            )}
            {task.assigneeId !== user.id && (
              <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-600 hover:bg-blue-50" onClick={handleQuickAssign} title="Assumir">
                <UserPlus className="w-3.5 h-3.5" />
              </Button>
            )}
            {canDeleteTask && (
              <Button size="icon" variant="ghost" className="h-6 w-6 text-red-600 hover:bg-red-50" onClick={handleQuickDelete} title="Apagar">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start gap-3">
              <span className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors pr-8">
                {task.title}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] uppercase font-black border shrink-0 py-0',
                  priorityColors[task.priority] || priorityColors['Média'],
                )}
              >
                {task.priority}
              </Badge>
              {task.dueDate && <DueDateBadge dateString={task.dueDate} />}
            </div>

            <div className="flex items-center gap-3 text-xs text-foreground/50 font-medium">
              {checklistTotal > 0 && (
                <span className={cn("flex items-center gap-1", checklistDone === checklistTotal ? "text-emerald-600 font-bold" : "")}>
                  <CheckSquare className="w-3.5 h-3.5" /> {checklistDone}/{checklistTotal}
                </span>
              )}
              {hasLinks && <LinkIcon className="w-3.5 h-3.5" />}
              {imageCount > 0 && (
                <span className="flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5" /> {imageCount}
                </span>
              )}
              {commentCount > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> {commentCount}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-1 pt-3 border-t border-amber-50">
              <div className="flex items-center gap-2">
                <Avatar className="w-7 h-7 border-2 border-white shadow-sm">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                    {task.assignee ? getInitials(task.assignee) : '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-foreground/60 font-bold truncate max-w-[100px]">
                  {task.assignee || 'Não atribuído'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  )
}

export default function TaskBoard({
  groupId,
  onTaskClick,
}: {
  groupId: string
  onTaskClick: (taskId: string) => void
}) {
  const { tasks, updateTask, user } = useAppStore()
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMyTasks, setFilterMyTasks] = useState(false)
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')

  // Derive filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => t.groupId === groupId)
      .filter((t) => (filterMyTasks ? t.assigneeId === user.id : true))
      .filter((t) => (filterPriority !== 'all' ? t.priority === filterPriority : true))
      .filter((t) => (filterStatus !== 'all' ? t.status === filterStatus : true))
      .filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => (a.order || 1000) - (b.order || 1000))
  }, [tasks, groupId, filterMyTasks, filterPriority, filterStatus, searchQuery, user.id])

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const startColumn = source.droppableId as TaskStatus
    const finishColumn = destination.droppableId as TaskStatus

    // Extrair apenas as tarefas da coluna de destino, mantendo a ordem atual
    const finishTasks = tasks
      .filter((t) => t.groupId === groupId && t.status === finishColumn)
      .sort((a, b) => (a.order || 1000) - (b.order || 1000))

    let newFinishTasks = Array.from(finishTasks)
    
    // Se estiver movendo na mesma coluna, removemos a tarefa da lista para calcular o index real
    if (startColumn === finishColumn) {
      newFinishTasks.splice(source.index, 1)
    }

    // Calcula a nova ordem
    let newOrder = 1000
    if (newFinishTasks.length === 0) {
      newOrder = 1000
    } else if (destination.index === 0) {
      newOrder = (newFinishTasks[0].order || 1000) - 100
    } else if (destination.index >= newFinishTasks.length) {
      newOrder = (newFinishTasks[newFinishTasks.length - 1].order || 1000) + 100
    } else {
      const prevOrder = newFinishTasks[destination.index - 1].order || 1000
      const nextOrder = newFinishTasks[destination.index].order || 1000
      newOrder = (prevOrder + nextOrder) / 2
    }

    updateTask(draggableId, { status: finishColumn, order: newOrder })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters Toolbar */}
      <div className="bg-white/80 p-3 rounded-2xl border border-amber-200 shadow-sm backdrop-blur-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <Input 
              placeholder="Buscar tarefa..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl border-amber-200 bg-white"
            />
          </div>
          <Button 
            variant={filterMyTasks ? "default" : "outline"} 
            className={cn("h-10 rounded-xl px-4 shrink-0 font-bold", !filterMyTasks && "border-amber-200")}
            onClick={() => setFilterMyTasks(!filterMyTasks)}
          >
            Minhas Tarefas
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[140px] h-10 rounded-xl border-amber-200 bg-white font-medium">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Prioridades</SelectItem>
              <SelectItem value="Alta" className="text-red-600 font-bold">Alta</SelectItem>
              <SelectItem value="Média" className="text-amber-600 font-bold">Média</SelectItem>
              <SelectItem value="Baixa" className="text-emerald-600 font-bold">Baixa</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-10 rounded-xl border-amber-200 bg-white font-medium">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="todo">A Fazer</SelectItem>
              <SelectItem value="doing">Em Progresso</SelectItem>
              <SelectItem value="done">Concluído</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-8 w-px bg-amber-200 mx-1 shrink-0" />

          <div className="flex bg-orange-50/50 p-1 rounded-xl border border-amber-200 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-lg", viewMode === 'board' ? "bg-white shadow-sm" : "text-foreground/50 hover:text-foreground")}
              onClick={() => setViewMode('board')}
              title="Visão Board"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-lg", viewMode === 'list' ? "bg-white shadow-sm" : "text-foreground/50 hover:text-foreground")}
              onClick={() => setViewMode('list')}
              title="Visão Lista"
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'board' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px] overflow-x-auto pb-4">
            {COLUMNS.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id)
              
              // Se tivermos filtro de status, escondemos as colunas que não batem
              if (filterStatus !== 'all' && filterStatus !== col.id) return null

              return (
                <div
                  key={col.id}
                  className={cn(
                    'flex-1 min-w-[300px] rounded-2xl border-2 flex flex-col overflow-hidden shadow-sm transition-colors',
                    col.color,
                  )}
                >
                  <div className={cn('px-4 py-3 border-b flex justify-between items-center', col.headerColor)}>
                    <h3 className="font-black font-display tracking-wide uppercase text-sm">
                      {col.title}
                    </h3>
                    <Badge variant="outline" className="bg-white/60 font-bold border-none shadow-sm">
                      {colTasks.length}
                    </Badge>
                  </div>
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef} 
                        {...provided.droppableProps}
                        className={cn(
                          "p-3 flex-1 flex flex-col gap-3 min-h-[150px] transition-colors",
                          snapshot.isDraggingOver ? "bg-black/5" : ""
                        )}
                      >
                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex-1 flex items-center justify-center text-foreground/40 text-sm font-medium border-2 border-dashed border-current/20 rounded-xl m-2 pointer-events-none">
                            Solte tarefas aqui
                          </div>
                        )}
                        {colTasks.map((task, index) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            index={index}
                            onClick={() => onTaskClick(task.id)}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      ) : (
        /* LIST VIEW */
        <Card className="rounded-2xl border-amber-200 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-foreground/60 uppercase bg-orange-50/50 border-b border-amber-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Tarefa</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Prioridade</th>
                  <th className="px-6 py-4 font-bold">Prazo</th>
                  <th className="px-6 py-4 font-bold">Responsável</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-foreground/50 font-medium">
                      Nenhuma tarefa encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => (
                    <tr 
                      key={task.id} 
                      onClick={() => onTaskClick(task.id)}
                      className="bg-white border-b border-amber-50 hover:bg-orange-50/30 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-foreground max-w-[300px] truncate">
                        <div className="flex items-center gap-2">
                          {task.color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.color }} />}
                          {task.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={COLUMNS.find(c => c.id === task.status)?.headerColor}>
                          {COLUMNS.find(c => c.id === task.status)?.title}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn('text-[10px] uppercase font-black border py-0', priorityColors[task.priority])}>
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {task.dueDate ? <DueDateBadge dateString={task.dueDate} /> : <span className="text-foreground/40">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6 border-2 border-white shadow-sm">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                              {task.assignee ? getInitials(task.assignee) : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-foreground/70 font-bold truncate">
                            {task.assignee || 'Não atribuído'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
