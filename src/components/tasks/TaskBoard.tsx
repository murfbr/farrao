import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckSquare, Paperclip, Link as LinkIcon } from 'lucide-react'
import useAppStore, { Task, TaskStatus } from '@/stores/useAppStore'
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

function TaskCard({
  task,
  onClick,
  onDragStart,
}: {
  task: Task
  onClick: () => void
  onDragStart: (e: React.DragEvent) => void
}) {
  const checklistTotal = task.checklist?.length || 0
  const checklistDone = task.checklist?.filter((c) => c.completed).length || 0
  const hasLinks = (task.links?.length || 0) > 0
  const imageCount = task.images?.length || 0

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="shadow-sm hover:shadow-md transition-all border-amber-200 bg-white rounded-xl cursor-grab active:cursor-grabbing hover:-translate-y-0.5 group"
    >
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-3">
          <span className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
            {task.title}
          </span>
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] uppercase font-black border shrink-0 py-0.5',
              priorityColors[task.priority] || priorityColors['Média'],
            )}
          >
            {task.priority}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-foreground/50 font-medium">
          {checklistTotal > 0 && (
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5" /> {checklistDone}/{checklistTotal}
            </span>
          )}
          {hasLinks && <LinkIcon className="w-3.5 h-3.5" />}
          {imageCount > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" /> {imageCount}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-1 pt-3 border-t border-amber-50">
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7 border-2 border-white shadow-sm">
              <AvatarImage
                src={`https://img.usecurling.com/ppl/thumbnail?seed=${task.assigneeId || task.assignee}`}
              />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                {task.assignee?.[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-foreground/60 font-bold truncate max-w-[100px]">
              {task.assignee}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TaskBoard({
  groupId,
  onTaskClick,
}: {
  groupId: string
  onTaskClick: (taskId: string) => void
}) {
  const { tasks, updateTask } = useAppStore()

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId)
  }

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    if (taskId) {
      updateTask(taskId, { status })
    }
  }

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  return (
    <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.groupId === groupId && t.status === col.id)
        return (
          <div
            key={col.id}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
            className={cn(
              'flex-1 rounded-2xl border-2 flex flex-col overflow-hidden shadow-sm transition-colors',
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
                <div className="flex-1 flex items-center justify-center text-foreground/40 text-sm font-medium border-2 border-dashed border-current/20 rounded-xl m-2 pointer-events-none">
                  Solte tarefas aqui
                </div>
              )}
              {colTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task.id)}
                  onDragStart={(e) => handleDragStart(e, task.id)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
