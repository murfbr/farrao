import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useAppStore, { ShoppingItemMode } from '@/stores/useAppStore'

export default function AddShoppingItemDialog() {
  const { addShoppingItem } = useAppStore()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ShoppingItemMode>('simple')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [qty, setQty] = useState('')
  const [notes, setNotes] = useState('')
  const [unitAdult, setUnitAdult] = useState(0)
  const [unitChild, setUnitChild] = useState(0)
  const [unitName, setUnitName] = useState('')

  const handleAdd = () => {
    if (!name) return
    addShoppingItem({
      name,
      category: category || 'Geral',
      mode,
      manualQuantity: qty,
      unitPerAdult: unitAdult,
      unitPerChild: unitChild,
      unitName,
      notes,
      assignedToId: null,
    })
    setOpen(false)
    setName('')
    setCategory('')
    setQty('')
    setNotes('')
    setUnitAdult(0)
    setUnitChild(0)
    setUnitName('')
    toast({ title: 'Item adicionado! 🛒' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 sm:flex-none font-bold shadow-md">
          <Plus className="w-4 h-4 mr-2" /> Novo Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display font-black text-2xl">Item para Comprar</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-3">
          <div className="space-y-2">
            <Label className="font-bold">O que comprar?</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-amber-200 bg-orange-50/30 font-bold"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Categoria</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border-amber-200 bg-orange-50/30"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold">Observações</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-amber-200 bg-orange-50/30"
            />
          </div>
          <Tabs value={mode} onValueChange={(val: any) => setMode(val)} className="w-full mt-4">
            <TabsList className="w-full grid grid-cols-2 bg-amber-100/50 p-1 rounded-xl">
              <TabsTrigger
                value="simple"
                className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Simples
              </TabsTrigger>
              <TabsTrigger
                value="complex"
                className="rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                Calculado
              </TabsTrigger>
            </TabsList>
            <TabsContent value="simple" className="pt-2">
              <Label className="font-bold">Quantidade Manual</Label>
              <Input
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="border-amber-200 bg-white mt-1"
              />
            </TabsContent>
            <TabsContent
              value="complex"
              className="pt-2 space-y-2 bg-orange-50/50 p-4 rounded-xl border border-amber-100 mt-2"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold text-xs uppercase">Qtd p/ Adulto</Label>
                  <Input
                    type="number"
                    value={unitAdult}
                    onChange={(e) => setUnitAdult(Number(e.target.value))}
                    className="border-amber-200 bg-white mt-1"
                  />
                </div>
                <div>
                  <Label className="font-bold text-xs uppercase">Qtd p/ Criança</Label>
                  <Input
                    type="number"
                    value={unitChild}
                    onChange={(e) => setUnitChild(Number(e.target.value))}
                    className="border-amber-200 bg-white mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="font-bold">Unidade (Ex: kg, un)</Label>
                <Input
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="border-amber-200 bg-white mt-1"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <Button onClick={handleAdd} className="font-bold shadow-md w-full">
            Salvar Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
