import { useState } from 'react'
import { Calculator, X } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import useAppStore, { ShoppingItem } from '@/stores/useAppStore'
import AddShoppingItemDialog from './AddShoppingItemDialog'
import ImportShoppingDialog from './ImportShoppingDialog'

export default function MasterListView() {
  const {
    participants,
    shoppingItems,
    updateShoppingItem,
    deleteShoppingItem,
    bulkAssignShoppingItems,
  } = useAppStore()
  const { toast } = useToast()

  const [selectedItems, setSelectedItems] = useState<string[]>([])

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
    return `${total % 1 === 0 ? total.toString() : total.toFixed(2)} ${item.unitName}`
  }

  const isAllSelected = shoppingItems.length > 0 && selectedItems.length === shoppingItems.length

  const toggleSelectAll = () => {
    if (isAllSelected) setSelectedItems([])
    else setSelectedItems(shoppingItems.map((i) => i.id))
  }

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleBulkAssign = (val: string) => {
    bulkAssignShoppingItems(selectedItems, val === 'unassigned' ? null : val)
    toast({ title: `${selectedItems.length} itens atribuídos com sucesso! ✅` })
    setSelectedItems([])
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-orange-50/50 p-4 rounded-2xl border border-amber-100">
        <div className="flex items-center text-orange-800">
          <Calculator className="w-5 h-5 mr-2 shrink-0" />
          <p className="text-sm font-bold">
            Base: <span className="font-black text-primary">{adultsCount} Adultos</span> e{' '}
            <span className="font-black text-secondary">{kidsCount} Crianças</span>
          </p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <ImportShoppingDialog />
          <AddShoppingItemDialog />
        </div>
      </div>

      <Card className="shadow-md border-amber-200 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-orange-50/50">
              <TableRow className="border-amber-100">
                <TableHead className="w-[50px] text-center px-4">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleSelectAll}
                    className="border-orange-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </TableHead>
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
                  <TableCell className="px-4 text-center">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                      className="border-orange-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </TableCell>
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

      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-primary/20 shadow-2xl rounded-full pl-6 pr-2 py-2 flex items-center gap-4 animate-slide-up z-50">
          <span className="font-bold text-sm text-primary whitespace-nowrap">
            {selectedItems.length} selecionados
          </span>
          <Select onValueChange={handleBulkAssign}>
            <SelectTrigger className="w-[200px] h-10 bg-orange-50/50 border-orange-200 rounded-full font-bold text-primary">
              <SelectValue placeholder="Atribuir para..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned" className="text-foreground/50 italic">
                Ninguém (Remover)
              </SelectItem>
              {participants.map((p) => (
                <SelectItem key={p.id} value={p.id} className="font-medium">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
