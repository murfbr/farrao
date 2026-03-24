import { useState } from 'react'
import { Plus, Upload, Calculator, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import useAppStore, { ShoppingItem, ShoppingItemMode } from '@/stores/useAppStore'

export default function MasterListView() {
  const {
    participants,
    shoppingItems,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    importShoppingItems,
  } = useAppStore()
  const { toast } = useToast()

  const adultsCount = participants.reduce(
    (acc, p) => acc + p.members.filter((m) => m.category === 'adult').length,
    0,
  )
  const kidsCount = participants.reduce(
    (acc, p) => acc + p.members.filter((m) => m.category.startsWith('child')).length,
    0,
  )

  const calculateQuantity = (item: ShoppingItem) => {
    if (item.mode === 'simple') return item.manualQuantity
    const total = item.unitPerAdult * adultsCount + item.unitPerChild * kidsCount
    const formatted = total % 1 === 0 ? total.toString() : total.toFixed(2)
    return `${formatted} ${item.unitName}`
  }

  const [openAdd, setOpenAdd] = useState(false)
  const [newItemMode, setNewItemMode] = useState<ShoppingItemMode>('simple')
  const [newItemName, setNewItemName] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('')
  const [newItemQty, setNewItemQty] = useState('')
  const [newItemNotes, setNewItemNotes] = useState('')
  const [newUnitAdult, setNewUnitAdult] = useState(0)
  const [newUnitChild, setNewUnitChild] = useState(0)
  const [newUnitName, setNewUnitName] = useState('')

  const handleAddItem = () => {
    if (!newItemName) return
    addShoppingItem({
      name: newItemName,
      category: newItemCategory || 'Geral',
      mode: newItemMode,
      manualQuantity: newItemQty,
      unitPerAdult: newUnitAdult,
      unitPerChild: newUnitChild,
      unitName: newUnitName,
      notes: newItemNotes,
      assignedToId: null,
    })
    setOpenAdd(false)
    setNewItemName('')
    setNewItemCategory('')
    setNewItemQty('')
    setNewItemNotes('')
    setNewUnitAdult(0)
    setNewUnitChild(0)
    setNewUnitName('')
    toast({ title: 'Item adicionado! 🛒' })
  }

  const [openImport, setOpenImport] = useState(false)
  const [importText, setImportText] = useState('')

  const handleImport = () => {
    if (!importText.trim()) return
    const lines = importText.split('\n').filter((l) => l.trim())
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
    setOpenImport(false)
    setImportText('')
    toast({ title: `${newItems.length} itens importados! ✅` })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-orange-50/50 p-4 rounded-2xl border border-amber-100">
        <div className="flex items-center text-orange-800">
          <Calculator className="w-5 h-5 mr-2 shrink-0" />
          <p className="text-sm font-bold">
            Base atual: <span className="font-black text-primary">{adultsCount} Adultos</span> e{' '}
            <span className="font-black text-secondary">{kidsCount} Crianças</span>
          </p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <Dialog open={openImport} onOpenChange={setOpenImport}>
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
                <DialogTitle className="font-display font-black text-2xl">
                  Importar Lista Rápida
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-3">
                <p className="text-sm text-foreground/70 font-medium">
                  Cole sua lista de compras. Cada linha será um novo item (Ex: "5kg de Arroz").
                </p>
                <Textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
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

          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none font-bold shadow-md">
                <Plus className="w-4 h-4 mr-2" /> Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-display font-black text-2xl">
                  Item para Comprar
                </DialogTitle>
              </DialogHeader>
              <div className="py-2 space-y-3">
                <div className="space-y-2">
                  <Label className="font-bold">O que comprar?</Label>
                  <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="border-amber-200 bg-orange-50/30 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Categoria</Label>
                  <Input
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="border-amber-200 bg-orange-50/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Observações</Label>
                  <Input
                    value={newItemNotes}
                    onChange={(e) => setNewItemNotes(e.target.value)}
                    className="border-amber-200 bg-orange-50/30"
                  />
                </div>

                <Tabs
                  value={newItemMode}
                  onValueChange={(val: any) => setNewItemMode(val)}
                  className="w-full mt-4"
                >
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
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(e.target.value)}
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
                          value={newUnitAdult}
                          onChange={(e) => setNewUnitAdult(Number(e.target.value))}
                          className="border-amber-200 bg-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="font-bold text-xs uppercase">Qtd p/ Criança</Label>
                        <Input
                          type="number"
                          value={newUnitChild}
                          onChange={(e) => setNewUnitChild(Number(e.target.value))}
                          className="border-amber-200 bg-white mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="font-bold">Unidade (Ex: kg, un)</Label>
                      <Input
                        value={newUnitName}
                        onChange={(e) => setNewUnitName(e.target.value)}
                        className="border-amber-200 bg-white mt-1"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <DialogFooter>
                <Button onClick={handleAddItem} className="font-bold shadow-md w-full">
                  Salvar Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-md border-amber-200 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-orange-50/50">
              <TableRow className="border-amber-100">
                <TableHead className="font-bold text-foreground">Item</TableHead>
                <TableHead className="font-bold text-foreground">Categoria</TableHead>
                <TableHead className="font-bold text-foreground text-center">Quantidade</TableHead>
                <TableHead className="font-bold text-foreground">Atribuído para</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shoppingItems.map((item) => (
                <TableRow key={item.id} className="border-amber-50 hover:bg-orange-50/30">
                  <TableCell className="py-4">
                    <p className="font-bold text-base text-foreground">{item.name}</p>
                    {item.notes && (
                      <p className="text-xs text-foreground/50 line-clamp-1 mt-0.5">{item.notes}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-white border-amber-200 text-[10px] uppercase font-bold text-foreground/70"
                    >
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-black text-primary text-base">
                    {calculateQuantity(item)}
                    {item.mode === 'complex' && (
                      <span className="block text-[9px] text-foreground/40 uppercase tracking-widest mt-0.5">
                        Calculado
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.assignedToId || 'unassigned'}
                      onValueChange={(val) =>
                        updateShoppingItem(item.id, {
                          assignedToId: val === 'unassigned' ? null : val,
                        })
                      }
                    >
                      <SelectTrigger className="w-[180px] h-9 bg-white border-amber-200">
                        <SelectValue placeholder="Ninguém" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned" className="text-foreground/50 italic">
                          Sem responsável
                        </SelectItem>
                        {participants.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="font-medium">
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteShoppingItem(item.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
