import React, { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Trash,
  Plus,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckSquare,
  Upload,
  CalendarIcon,
  Palette,
  MessageSquare,
  Send,
} from 'lucide-react'
import useAppStore, { Task, TaskStatus } from '@/stores/useAppStore'
import RichTextEditor from './RichTextEditor'
import { cn, getInitials } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const TASK_COLORS = [
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#f97316', label: 'Laranja' },
  { value: '#f59e0b', label: 'Amarelo' },
  { value: '#84cc16', label: 'Lima' },
  { value: '#22c55e', label: 'Verde' },
  { value: '#06b6d4', label: 'Ciano' },
  { value: '#3b82f6', label: 'Azul' },
  { value: '#8b5cf6', label: 'Roxo' },
  { value: '#d946ef', label: 'Fúcsia' },
  { value: '#f43f5e', label: 'Rosa' },
]

export default function TaskDetailDialog({
  taskId,
  groupId,
  open,
  onOpenChange,
}: {
  taskId: string | null
  groupId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { tasks, addTask, updateTask, participants, user, groups } = useAppStore()
  const [data, setData] = useState<Partial<Task>>({})
  const [newItem, setNewItem] = useState('')
  const [newLink, setNewLink] = useState('')
  const [newImg, setNewImg] = useState('')
  const [newComment, setNewComment] = useState('')
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      if (taskId) {
        const t = tasks.find((x) => x.id === taskId)
        if (t) setData(t)
      } else {
        setData({
          title: '',
          status: 'todo',
          priority: 'Média',
          groupId: groupId || '',
          assigneeId: 'unassigned',
          checklist: [],
          links: [],
          images: [],
          comments: [],
          creatorId: user.id, // Set creatorId immediately
        })
      }
      setNewItem('')
      setNewLink('')
      setNewImg('')
      setNewComment('')
      setEditingChecklistId(null)
    }
  }, [open, taskId, groupId, tasks, user.id])

  const canEdit = !taskId || user.isSuperAdmin || data.creatorId === user.id || data.assigneeId === user.id

  const handleSave = () => {
    if (!canEdit) {
      onOpenChange(false)
      return
    }

    if (!data.title?.trim() || !data.groupId) return
    
    const actualAssigneeId = data.assigneeId === 'unassigned' ? '' : data.assigneeId
    const assigneeName = actualAssigneeId 
      ? (participants.find((p) => p.id === actualAssigneeId)?.name || '') 
      : ''
      
    if (taskId) {
      updateTask(taskId, { ...data, assigneeId: actualAssigneeId, assignee: assigneeName })
    } else {
      addTask({ ...data, assigneeId: actualAssigneeId, assignee: assigneeName } as Omit<Task, 'id'>)
    }
    onOpenChange(false)
  }

  // Filter participants to only those who are members of the selected group
  const currentGroup = groups.find((g) => g.id === data.groupId)
  const groupParticipants = participants.filter((p) => currentGroup?.memberIds.includes(p.id))

  const addChecklist = () => {
    if (!canEdit) return
    if (newItem.trim()) {
      setData((p) => ({
        ...p,
        checklist: [
          ...(p.checklist || []),
          { id: Math.random().toString(), text: newItem, completed: false },
        ],
      }))
      setNewItem('')
    }
  }

  const toggleCheck = (id: string) => {
    if (!canEdit) return
    setData((p) => ({
      ...p,
      checklist: p.checklist?.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c)),
    }))
  }

  const updateChecklistText = (id: string, newText: string) => {
    if (!canEdit) return
    if (!newText.trim()) return
    setData((p) => ({
      ...p,
      checklist: p.checklist?.map((c) => (c.id === id ? { ...c, text: newText } : c)),
    }))
    setEditingChecklistId(null)
  }

  const removeCheck = (id: string) => {
    if (!canEdit) return
    setData((p) => ({ ...p, checklist: p.checklist?.filter((c) => c.id !== id) }))
  }
  
  const addLink = () => {
    if (!canEdit) return
    if (newLink.trim()) {
      setData((p) => ({ ...p, links: [...(p.links || []), newLink] }))
      setNewLink('')
    }
  }
  const removeLink = (l: string) => {
    if (!canEdit) return
    setData((p) => ({ ...p, links: p.links?.filter((x) => x !== l) }))
  }

  const addImg = () => {
    if (!canEdit) return
    if (newImg.trim()) {
      setData((p) => ({ ...p, images: [...(p.images || []), newImg] }))
      setNewImg('')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        setData((p) => ({ ...p, images: [...(p.images || []), result] }))
      }
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImg = (img: string) => {
    if (!canEdit) return
    setData((p) => ({ ...p, images: p.images?.filter((x) => x !== img) }))
  }

  const addComment = () => {
    // Anyone can comment
    if (newComment.trim()) {
      const myParticipant = participants.find(p => p.id === user.id)
      setData((p) => ({
        ...p,
        comments: [
          ...(p.comments || []),
          {
            id: Math.random().toString(),
            text: newComment,
            author: myParticipant?.name || user.name,
            authorId: user.id,
            date: new Date().toISOString()
          }
        ]
      }))
      setNewComment('')
      
      // If we are commenting on an existing task and !canEdit, 
      // we need to save the task immediately because handleSave won't save if !canEdit
      if (taskId && !canEdit) {
        updateTask(taskId, {
          comments: [
            ...(data.comments || []),
            {
              id: Math.random().toString(),
              text: newComment,
              author: myParticipant?.name || user.name,
              authorId: user.id,
              date: new Date().toISOString()
            }
          ]
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] border-amber-200 max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white">
        <DialogHeader className="p-6 pb-4 border-b border-amber-100 bg-white" style={{ borderTop: data.color ? `4px solid ${data.color}` : 'none' }}>
          <DialogTitle className="font-display font-black text-2xl">
            {taskId ? 'Detalhes da Missão' : 'Nova Missão'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold">Título da Missão</Label>
              <Input
                value={data.title || ''}
                onChange={(e) => setData((p) => ({ ...p, title: e.target.value }))}
                className="bg-white font-bold text-lg"
                disabled={!canEdit}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-foreground/60">
                  Status
                </Label>
                <Select
                  disabled={!canEdit}
                  value={data.status}
                  onValueChange={(val: TaskStatus) => setData((p) => ({ ...p, status: val }))}
                >
                  <SelectTrigger className="bg-white font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">A Fazer</SelectItem>
                    <SelectItem value="doing">Em Progresso</SelectItem>
                    <SelectItem value="done">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-foreground/60">
                  Prioridade
                </Label>
                <Select
                  disabled={!canEdit}
                  value={data.priority || 'Média'}
                  onValueChange={(val) => setData((p) => ({ ...p, priority: val }))}
                >
                  <SelectTrigger className="bg-white font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta" className="text-red-600 font-bold">Alta</SelectItem>
                    <SelectItem value="Média" className="text-amber-600 font-bold">Média</SelectItem>
                    <SelectItem value="Baixa" className="text-emerald-600 font-bold">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-foreground/60">
                  Responsável
                </Label>
                <Select
                  disabled={!canEdit}
                  value={data.assigneeId || 'unassigned'}
                  onValueChange={(val) => setData((p) => ({ ...p, assigneeId: val }))}
                >
                  <SelectTrigger className="bg-white font-medium">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Não atribuído</SelectItem>
                    {groupParticipants.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-foreground/60">
                  <CalendarIcon className="w-4 h-4" /> Prazo Final
                </Label>
                <Input
                  type="date"
                  disabled={!canEdit}
                  value={data.dueDate ? data.dueDate.split('T')[0] : ''}
                  onChange={(e) => {
                    const dateVal = e.target.value;
                    setData(p => ({ ...p, dueDate: dateVal ? new Date(dateVal + 'T12:00:00').toISOString() : undefined }))
                  }}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-foreground/60">
                  <Palette className="w-4 h-4" /> Cor do Card
                </Label>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    disabled={!canEdit}
                    className={cn("w-8 h-8 p-0 rounded-full", !data.color && "ring-2 ring-primary ring-offset-1", !canEdit && "opacity-50 cursor-not-allowed")}
                    onClick={() => setData(p => ({ ...p, color: undefined }))}
                    title="Sem cor"
                  >
                    <div className="w-full h-full rounded-full border-2 border-dashed border-slate-300 bg-white" />
                  </Button>
                  {TASK_COLORS.map(color => (
                    <Button
                      key={color.value}
                      variant="outline"
                      disabled={!canEdit}
                      className={cn(
                        "w-8 h-8 p-0 rounded-full border-transparent transition-transform",
                        canEdit && "hover:scale-110",
                        !canEdit && "opacity-50 cursor-not-allowed",
                        data.color === color.value && "ring-2 ring-primary ring-offset-1"
                      )}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setData(p => ({ ...p, color: color.value }))}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-wider text-foreground/60">
              Descrição
            </Label>
            <RichTextEditor
              value={data.description || ''}
              onChange={(val) => setData((p) => ({ ...p, description: val }))}
              readOnly={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-foreground/60">
              <CheckSquare className="w-4 h-4" /> Checklist
            </Label>
            {canEdit && (
              <div className="flex gap-2">
                <Input
                  placeholder="Novo item..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addChecklist()}
                  className="bg-white"
                />
                <Button onClick={addChecklist}>
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            )}
            <div className="space-y-2 mt-2">
              {data.checklist?.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between group bg-white p-2 rounded-xl border border-amber-100 shadow-sm transition-colors hover:border-amber-200"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Checkbox disabled={!canEdit} checked={c.completed} onCheckedChange={() => toggleCheck(c.id)} />
                    {editingChecklistId === c.id && canEdit ? (
                      <Input
                        autoFocus
                        defaultValue={c.text}
                        onBlur={(e) => updateChecklistText(c.id, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && updateChecklistText(c.id, e.currentTarget.value)}
                        className="h-8 text-sm bg-orange-50"
                      />
                    ) : (
                      <span
                        onClick={() => canEdit && setEditingChecklistId(c.id)}
                        className={cn(
                          'text-sm font-medium transition-all w-full rounded-md px-2 py-1',
                          canEdit && 'cursor-text hover:bg-orange-50',
                          c.completed && 'line-through text-foreground/40',
                        )}
                      >
                        {c.text}
                      </span>
                    )}
                  </div>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 shrink-0"
                      onClick={() => removeCheck(c.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-foreground/60">
              <MessageSquare className="w-4 h-4" /> Comentários
            </Label>
            <div className="bg-white rounded-xl border border-amber-200 p-4 space-y-4 shadow-sm">
              <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {data.comments?.length === 0 ? (
                  <p className="text-sm text-foreground/50 text-center py-4 font-medium">Nenhum comentário ainda. Comece a conversa!</p>
                ) : (
                  data.comments?.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{getInitials(comment.author)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-none p-3 border border-slate-100">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-xs">{comment.author}</span>
                          <span className="text-[10px] text-foreground/40 font-medium">
                            {format(parseISO(comment.date), "dd/MM 'às' HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-snug">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Input
                  placeholder="Escreva um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addComment()}
                  className="bg-slate-50"
                />
                <Button size="icon" onClick={addComment} className="shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-foreground/60">
                <LinkIcon className="w-4 h-4" /> Links Úteis
              </Label>
              {canEdit && (
                <div className="flex gap-2">
                  <Input
                    placeholder="URL (ex: https://...)"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addLink()}
                    className="bg-white"
                  />
                  <Button onClick={addLink} variant="secondary">
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              )}
              {data.links?.length ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.links.map((l) => (
                    <Badge
                      key={l}
                      variant="secondary"
                      className="pl-3 pr-1 py-1.5 flex items-center gap-2 bg-white border border-amber-200 shadow-sm"
                    >
                      <a
                        href={l}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs hover:underline max-w-[200px] truncate text-primary font-semibold"
                      >
                        {l}
                      </a>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 hover:bg-red-50 text-foreground/50 hover:text-red-500 rounded-full"
                          onClick={() => removeLink(l)}
                        >
                          <Trash className="w-3 h-3" />
                        </Button>
                      )}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-foreground/60">
                <ImageIcon className="w-4 h-4" /> Imagens
              </Label>
              {canEdit && (
                <div className="flex gap-2">
                  <Input
                    placeholder="URL da Imagem..."
                    value={newImg}
                    onChange={(e) => setNewImg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addImg()}
                    className="bg-white"
                  />
                  <Button onClick={addImg} variant="secondary" title="Adicionar por URL">
                    <Plus className="w-5 h-5" />
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload"
                    className="shrink-0 bg-white"
                  >
                    <Upload className="w-5 h-5" />
                  </Button>
                </div>
              )}
              {data.images?.length ? (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {data.images.map((img, idx) => (
                    <div
                      key={`${img}-${idx}`}
                      className="relative group rounded-xl overflow-hidden border-2 border-amber-200 aspect-video bg-amber-50 shadow-sm"
                    >
                      <img src={img} alt="Attachment" className="w-full h-full object-cover" />
                      {canEdit && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeImg(img)}
                            className="h-10 w-10 rounded-full shadow-lg"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

        </div>
        <DialogFooter className="p-4 border-t border-amber-100 bg-white">
          <Button
            onClick={handleSave}
            disabled={!canEdit}
            className="font-bold shadow-md rounded-xl w-full sm:w-auto px-8 h-11 text-base"
          >
            {canEdit ? 'Salvar Missão' : 'Visualização Apenas'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
