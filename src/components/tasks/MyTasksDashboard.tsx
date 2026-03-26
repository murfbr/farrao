import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tent, CheckSquare } from 'lucide-react'
import useAppStore, { Task } from '@/stores/useAppStore'

export default function MyTasksDashboard({ onTaskClick }: { onTaskClick: (task: Task) => void }) {
  const { tasks, groups, user } = useAppStore()

  const myTasks = tasks.filter((t) => t.assigneeId === user.id || t.assignee === user.name)

  if (myTasks.length === 0) {
    return (
      <div className="mb-8 animate-fade-in-up">
        <h2 className="text-2xl font-black font-display text-foreground mb-4">Minhas Missões</h2>
        <Card className="border-dashed border-2 border-amber-200 bg-transparent shadow-none">
          <CardContent className="p-8 text-center flex flex-col items-center justify-center">
            <CheckSquare className="w-8 h-8 text-foreground/30 mb-3" />
            <p className="text-foreground/60 font-medium">
              Você ainda não tem missões. Que tal entrar em uma galera e puxar uma tarefa?
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mb-8 animate-fade-in-up">
      <h2 className="text-2xl font-black font-display text-foreground mb-4">Minhas Missões</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {myTasks.map((task) => {
          const group = groups.find((g) => g.id === task.groupId)
          return (
            <Card
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="cursor-pointer hover:shadow-md transition-all border-amber-200 bg-white/80 backdrop-blur-sm group hover:-translate-y-0.5"
            >
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    {task.title}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-black uppercase tracking-wider shrink-0"
                  >
                    {task.status}
                  </Badge>
                </div>
                {group && (
                  <div className="flex items-center text-xs text-foreground/50 font-bold mt-2 pt-2 border-t border-amber-50">
                    <Tent className="w-3.5 h-3.5 mr-1" /> {group.name}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
