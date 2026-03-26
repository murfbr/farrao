import React, { useState, useEffect } from 'react'
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
import { Trash, Plus, Link as LinkIcon, Image as ImageIcon, CheckSquare } from 'lucide-react'
import useAppStore, { Task, TaskStatus } from '@/stores/useAppStore'
import RichTextEditor from './RichTextEditor'
import { cn } from '@/lib/utils'

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
  const { tasks, addTask, updateTask, participants, user } = useAppStore()
  const [data, setData] = useState<Partial<Task>>({})
  const [newItem, setNewItem] = useState('')
  const [newLink, setNewLink] = useState('')
  const [newImg, setNewImg] = useState('')

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
          assigneeId: user.id,
          checklist: [],
          links: [],
          images: [],
        })
      }
      setNewItem('')
      setNewLink('')
      setNewImg('')
    }
  }, [open, taskId, groupId, tasks, user.id])

  const handleSave = () => {
    if (!data.title?.trim() || !data.groupId) return
    const assigneeName = participants.find((p) => p.id === data.assigneeId)?.name || user.name
    if (taskId) {
      updateTask(taskId, { ...data, assignee: assigneeName })
    } else {
      addTask({ ...data, assignee: assigneeName } as Omit<Task, 'id'>)
    }
    onOpenChange(false)
  }

  const addChecklist = () => {
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
  const toggleCheck = (id: string) =>
    setData((p) => ({
      ...p,
      checklist: p.checklist?.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c)),
    }))
  const removeCheck = (id: string) =>
    setData((p) => ({ ...p, checklist: p.checklist?.filter((c) => c.id !== id) }))
  const addLink = () => {
    if (newLink.trim()) {
      setData((p) => ({ ...p, links: [...(p.links || []), newLink] }))
      setNewLink('')
    }
  }
  const removeLink = (l: string) =>
    setData((p) => ({ ...p, links: p.links?.filter((x) => x !== l) }))
  const addImg = () => {
    if (newImg.trim()) {
      setData((p) => ({ ...p, images: [...(p.images || []), newImg] }))
      setNewImg('')
    }
  }
  const removeImg = (img: string) =>
    setData((p) => ({ ...p, images: p.images?.filter((x) => x !== img) }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-amber-200 max-h-[90vh] flex flex-col p-0 overflow-hidden bg-orange-50/10">
        <DialogHeader className="p-6 pb-4 border-b border-amber-100 bg-white">
          <DialogTitle className="font-display font-black text-2xl">
            {taskId ? 'Detalhes da Missão' : 'Nova Missão'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <Label className="font-bold">Título da Missão</Label>
            <Input
              value={data.title || ''}
              onChange={(e) => setData((p) => ({ ...p, title: e.target.value }))}
              className="bg-white font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider text-foreground/60">
                Status
              </Label>
              <Select
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
                value={data.priority || 'Média'}
                onValueChange={(val) => setData((p) => ({ ...p, priority: val }))}
              >
                <SelectTrigger className="bg-white font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alta" className="text-red-600 font-bold">
                    Alta
                  </SelectItem>
                  <SelectItem value="Média" className="text-amber-600 font-bold">
                    Média
                  </SelectItem>
                  <SelectItem value="Baixa" className="text-emerald-600 font-bold">
                    Baixa
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-wider text-foreground/60">
              Responsável
            </Label>
            <Select
              value={data.assigneeId || ''}
              onValueChange={(val) => setData((p) => ({ ...p, assigneeId: val }))}
            >
              <SelectTrigger className="bg-white font-medium">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {participants.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-xs uppercase tracking-wider text-foreground/60">
              Descrição
            </Label>
            <RichTextEditor
              value={data.description || ''}
              onChange={(val) => setData((p) => ({ ...p, description: val }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-foreground/60">
              <CheckSquare className="w-4 h-4" /> Checklist
            </Label>
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
            <div className="space-y-2 mt-2">
              {data.checklist?.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between group bg-white p-2 rounded-xl border border-amber-100 shadow-sm transition-colors hover:border-amber-200"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={c.completed} onCheckedChange={() => toggleCheck(c.id)} />
                    <span
                      className={cn(
                        'text-sm font-medium transition-all',
                        c.completed && 'line-through text-foreground/40',
                      )}
                    >
                      {c.text}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50"
                    onClick={() => removeCheck(c.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-foreground/60">
              <LinkIcon className="w-4 h-4" /> Links Úteis
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="URL (ex: https://...)"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLink()}
                className="bg-white"
              />
              <Button onClick={addLink}>
                <Plus className="w-5 h-5" />
              </Button>
            </div>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 hover:bg-red-50 text-foreground/50 hover:text-red-500 rounded-full"
                      onClick={() => removeLink(l)}
                    >
                      <Trash className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-foreground/60">
              <ImageIcon className="w-4 h-4" /> Imagens (URLs)
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="URL da Imagem..."
                value={newImg}
                onChange={(e) => setNewImg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addImg()}
                className="bg-white"
              />
              <Button onClick={addImg}>
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            {data.images?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {data.images.map((img) => (
                  <div
                    key={img}
                    className="relative group rounded-xl overflow-hidden border-2 border-amber-200 aspect-video bg-amber-50 shadow-sm"
                  >
                    <img src={img} alt="Attachment" className="w-full h-full object-cover" />
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
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <DialogFooter className="p-4 border-t border-amber-100 bg-white">
          <Button
            onClick={handleSave}
            className="font-bold shadow-md rounded-xl w-full sm:w-auto px-8 h-11 text-base"
          >
            Salvar Missão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
