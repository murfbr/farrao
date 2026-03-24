import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'

export default function ImportShoppingDialog() {
  const { importShoppingItems } = useAppStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  const handleImport = () => {
    if (!text.trim()) return
    const lines = text.split('\n').filter((l) => l.trim())
    const newItems = lines.map((line) => {
      const match = line.match(/^([\d.,]+\s*(?:kg|g|L|ml|un|pct|caixa|fardo|litro)s?)\s+(.*)/i)
      if (match) {
        return {
          name: match[2],
          manualQuantity: match[1],
          category: 'Importado',
          mode: 'simple' as const,
          unitPerAdult: 0,
          unitPerChild: 0,
          unitName: '',
          notes: '',
          assignedToId: null,
        }
      }
      return {
        name: line,
        manualQuantity: '1',
        category: 'Importado',
        mode: 'simple' as const,
        unitPerAdult: 0,
        unitPerChild: 0,
        unitName: '',
        notes: '',
        assignedToId: null,
      }
    })
    importShoppingItems(newItems)
    setOpen(false)
    setText('')
    toast({ title: `${newItems.length} itens importados! ✅` })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex-1 sm:flex-none border-primary/20 text-primary font-bold shadow-sm"
        >
          <Upload className="w-4 h-4 mr-2" /> Importar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display font-black text-2xl">Importar Lista</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <p className="text-sm text-foreground/70 font-medium">
            Cole sua lista de compras. Cada linha será um novo item (Ex: "5kg de Arroz").
          </p>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-48 resize-none bg-orange-50/30 border-amber-200"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleImport} className="font-bold shadow-sm w-full">
            Processar Itens
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
