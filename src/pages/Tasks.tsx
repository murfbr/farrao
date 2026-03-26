import { useState } from 'react'
import { Plus, ArrowLeft, Tent } from 'lucide-react'
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
import useAppStore, { GroupType, Task } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

import MyTasksDashboard from '@/components/tasks/MyTasksDashboard'
import TaskBoard from '@/components/tasks/TaskBoard'
import TaskDetailDialog from '@/components/tasks/TaskDetailDialog'

export default function Tasks() {
  const { user, groups, joinGroup, addGroup } = useAppStore()
  const { toast } = useToast()

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [newGroupType, setNewGroupType] = useState<GroupType>('general')
  const [openGroupAdd, setOpenGroupAdd] = useState(false)

  const availableGroups = groups.filter(
    (g) => g.type === 'general' || g.memberIds.includes(user.id) || user.isGovernance,
  )
  const activeGroup = groups.find((g) => g.id === selectedGroupId)

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return
    addGroup({ name: newGroupName, description: newGroupDesc, type: newGroupType })
    setNewGroupName('')
    setNewGroupDesc('')
    setNewGroupType('general')
    setOpenGroupAdd(false)
    toast({ title: 'Equipe Criada com Sucesso! 🤝' })
  }

  const handleTaskClick = (task: Task) => {
    setSelectedGroupId(task.groupId)
    setSelectedTaskId(task.id)
    setIsTaskModalOpen(true)
  }

  const openNewTask = () => {
    setSelectedTaskId(null)
    setIsTaskModalOpen(true)
  }

  if (!selectedGroupId) {
    return (
      <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
        <MyTasksDashboard onTaskClick={handleTaskClick} />

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
    <div className="space-y-6 animate-fade-in h-full flex flex-col max-w-6xl mx-auto">
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

        <Button
          onClick={openNewTask}
          className="shrink-0 shadow-md transition-transform hover:scale-105 active:scale-95 font-bold rounded-xl h-11 px-6"
        >
          <Plus className="w-5 h-5 mr-2" /> Puxar Tarefa
        </Button>
      </div>

      <TaskBoard
        groupId={selectedGroupId}
        onTaskClick={(taskId) => {
          setSelectedTaskId(taskId)
          setIsTaskModalOpen(true)
        }}
      />

      <TaskDetailDialog
        taskId={selectedTaskId}
        groupId={selectedGroupId}
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
      />
    </div>
  )
}
