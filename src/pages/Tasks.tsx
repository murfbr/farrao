import { useState } from 'react'
import { Plus, ArrowLeft, Tent, Pencil, Trash2, Check, Users, X as CloseIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { cn, getInitials } from '@/lib/utils'

import MyTasksDashboard from '@/components/tasks/MyTasksDashboard'
import TaskBoard from '@/components/tasks/TaskBoard'
import TaskDetailDialog from '@/components/tasks/TaskDetailDialog'

export default function Tasks() {
  const { user, groups, joinGroup, addGroup, updateGroup, deleteGroup, leaveGroup, removeMemberFromGroup, participants } = useAppStore()
  const { toast } = useToast()

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [newGroupEmoji, setNewGroupEmoji] = useState('🤝')
  const [newGroupType, setNewGroupType] = useState<GroupType>('general')
  const [openGroupAdd, setOpenGroupAdd] = useState(false)
  const [isParticipantsDialogOpen, setIsParticipantsDialogOpen] = useState(false)

  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [editDescValue, setEditDescValue] = useState('')
  const [isEditingEmoji, setIsEditingEmoji] = useState(false)
  const [editEmojiValue, setEditEmojiValue] = useState('🤝')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const availableGroups = groups.filter(
    (g) => g.type === 'general' || g.memberIds.includes(user.id) || user.isGovernance,
  )
  const activeGroup = groups.find((g) => g.id === selectedGroupId)
  const activeGroupMembers = participants.filter(p => activeGroup?.memberIds.includes(p.id))

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return
    addGroup({ 
      name: newGroupName, 
      description: newGroupDesc, 
      type: newGroupType,
      emoji: newGroupEmoji 
    })
    setNewGroupName('')
    setNewGroupDesc('')
    setNewGroupEmoji('🤝')
    setNewGroupType('general')
    setOpenGroupAdd(false)
    toast({ title: 'Equipe Criada com Sucesso! 🤝' })
  }

  const handleUpdateDesc = () => {
    if (!selectedGroupId) return
    updateGroup(selectedGroupId, { description: editDescValue })
    setIsEditingDesc(false)
    toast({ title: 'Descrição atualizada! ✨' })
  }

  const handleUpdateEmoji = () => {
    if (!selectedGroupId) return
    updateGroup(selectedGroupId, { emoji: editEmojiValue })
    setIsEditingEmoji(false)
    toast({ title: 'Emoji da equipe atualizado! ✨' })
  }

  const handleDeleteGroup = () => {
    if (!selectedGroupId) return
    deleteGroup(selectedGroupId)
    setSelectedGroupId(null)
    setIsDeleteDialogOpen(false)
    toast({ title: 'Equipe apagada.', variant: 'destructive' })
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
              Nossa festa é feita por todos. Escolha uma galera para ajudar na organização!
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
                    Montar Galera
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
                    <Label className="font-bold">Emoji da Equipe</Label>
                    <div className="flex gap-2 flex-wrap">
                      {['🤝', '🍖', '🍻', '🎸', '⚽', '🏊', '⛺', '🔥', '🚗', '🧹'].map((emo) => (
                        <Button
                          key={emo}
                          variant={newGroupEmoji === emo ? 'default' : 'outline'}
                          className={cn(
                            "w-10 h-10 p-0 text-xl rounded-xl",
                            newGroupEmoji === emo ? "bg-primary" : "bg-orange-50/30 border-amber-200"
                          )}
                          onClick={() => setNewGroupEmoji(emo)}
                        >
                          {emo}
                        </Button>
                      ))}
                      <Input
                        value={newGroupEmoji}
                        onChange={(e) => setNewGroupEmoji(e.target.value)}
                        placeholder="Emoji"
                        className="w-16 h-10 bg-orange-50/30 border-amber-200 text-center text-xl"
                      />
                    </div>
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
                      <span className="mr-2 text-2xl">{group.emoji || '🤝'}</span>
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
                            src={undefined}
                          />
                          <AvatarFallback className="bg-primary/20 text-xs">
                            {getInitials(participants.find(p => p.id === id)?.name || 'U')}
                          </AvatarFallback>
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
                      if (isMember) {
                        setSelectedGroupId(group.id)
                      } else {
                        joinGroup(group.id)
                        toast({ title: 'Você agora faz parte desta equipe! 🤝' })
                      }
                    }}
                  >
                    {isMember ? 'Ver Tarefas' : 'Participar da Equipe'}
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
              {user.isSuperAdmin ? (
                <Dialog open={isEditingEmoji} onOpenChange={setIsEditingEmoji}>
                  <DialogTrigger asChild>
                    <button 
                      className="text-3xl hover:scale-110 transition-transform cursor-pointer" 
                      title="Mudar Emoji"
                      onClick={() => setEditEmojiValue(activeGroup?.emoji || '🤝')}
                    >
                      {activeGroup?.emoji || '🤝'}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] border-amber-200">
                    <DialogHeader>
                      <DialogTitle className="font-display font-black text-2xl">
                        Mudar Emoji da Equipe
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {['🤝', '🍖', '🍻', '🎸', '⚽', '🏊', '⛺', '🔥', '🚗', '🧹'].map((emo) => (
                          <Button
                            key={emo}
                            variant={editEmojiValue === emo ? 'default' : 'outline'}
                            className={cn(
                              "w-10 h-10 p-0 text-xl rounded-xl",
                              editEmojiValue === emo ? "bg-primary" : "bg-orange-50/30 border-amber-200"
                            )}
                            onClick={() => setEditEmojiValue(emo)}
                          >
                            {emo}
                          </Button>
                        ))}
                        <Input
                          value={editEmojiValue}
                          onChange={(e) => setEditEmojiValue(e.target.value)}
                          placeholder="Emoji"
                          className="w-16 h-10 bg-orange-50/30 border-amber-200 text-center text-xl"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleUpdateEmoji}
                        className="font-bold rounded-xl shadow-md w-full"
                      >
                        Salvar Emoji
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <span className="text-3xl">{activeGroup?.emoji || '🤝'}</span>
              )}
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
            <div className="flex items-center gap-2 mt-1">
              {isEditingDesc ? (
                <div className="flex items-center gap-2 w-full max-w-md">
                  <Input 
                    value={editDescValue}
                    onChange={(e) => setEditDescValue(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" onClick={handleUpdateDesc} className="h-8 w-8 p-0 text-emerald-600">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingDesc(false)} className="h-8 w-8 p-0 text-red-600">
                    <CloseIcon className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-foreground/60 text-sm font-medium">
                    {activeGroup?.description || 'Bora agilizar o que falta!'}
                  </p>
                  {activeGroup?.memberIds.includes(user.id) && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-foreground/40 hover:text-primary"
                      onClick={() => {
                        setEditDescValue(activeGroup.description || '')
                        setIsEditingDesc(true)
                      }}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeGroup?.memberIds.includes(user.id) && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 font-bold h-11 px-6 shadow-sm mr-2"
              onClick={() => {
                if (window.confirm('Tem certeza que deseja sair desta galera? Suas tarefas não concluídas serão desatribuídas.')) {
                  leaveGroup(activeGroup.id)
                  setSelectedGroupId(null)
                  toast({ title: 'Você saiu da galera.' })
                }
              }}
            >
              Sair da Galera
            </Button>
          )}
          {user.isSuperAdmin && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl w-11 h-11 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 mr-2"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl w-11 h-11 border-blue-100 text-blue-500 hover:bg-blue-50 hover:text-blue-600 mr-2"
            onClick={() => setIsParticipantsDialogOpen(true)}
            title="Membros da Equipe"
          >
            <Users className="w-5 h-5" />
          </Button>
          <Button
            onClick={openNewTask}
            className="shrink-0 shadow-md transition-transform hover:scale-105 active:scale-95 font-bold rounded-xl h-11 px-6"
          >
            <Plus className="w-5 h-5 mr-2" /> Puxar Tarefa
          </Button>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-amber-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-black text-2xl">
              Apagar Equipe?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium">
              Essa ação não tem volta. Todas as tarefas vinculadas a esta equipe também podem ficar órfãs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteGroup}
              className="bg-red-500 hover:bg-red-600 rounded-xl font-bold"
            >
              Sim, Apagar Tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isParticipantsDialogOpen} onOpenChange={setIsParticipantsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl border-amber-200">
          <DialogHeader>
            <DialogTitle className="font-display font-black text-2xl flex items-center">
              <Users className="w-6 h-6 mr-2 text-primary" /> Membros da Equipe
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {activeGroupMembers.length === 0 ? (
              <p className="text-center text-foreground/50 py-8 font-medium">Nenhum membro nesta equipe ainda.</p>
            ) : (
              activeGroupMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-orange-50/50 transition-colors border border-transparent hover:border-amber-100">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-white shadow-sm shrink-0">
                      <AvatarImage src={undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{member.name}</p>
                      <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">{member.members.length} {member.members.length === 1 ? 'pessoa' : 'pessoas'}</p>
                    </div>
                  </div>
                  {user.isSuperAdmin && member.id !== user.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg h-8 w-8 shrink-0"
                      onClick={() => {
                        if (window.confirm(`Remover ${member.name} desta equipe? Todas as tarefas desta pessoa nesta equipe serão desatribuídas.`)) {
                          removeMemberFromGroup(activeGroup!.id, member.id)
                          toast({ title: 'Membro removido da equipe.' })
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

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
