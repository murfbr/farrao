import { useState } from 'react'
import { CalendarDays, Utensils, Edit, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useAppStore, { DailyMenu, MealType } from '@/stores/useAppStore'

const MEAL_TYPES: MealType[] = ['Café da Manhã', 'Almoço', 'Jantar', 'Petiscos', 'Bebidas']

export default function MenuView() {
  const { user, dailyMenus, updateDailyMenus } = useAppStore()
  const [open, setOpen] = useState(false)
  const [editingMenus, setEditingMenus] = useState<DailyMenu[]>([])

  const handleOpen = () => {
    setEditingMenus(JSON.parse(JSON.stringify(dailyMenus)))
    setOpen(true)
  }

  const handleSave = () => {
    updateDailyMenus(editingMenus)
    setOpen(false)
  }

  const addDay = () =>
    setEditingMenus([
      ...editingMenus,
      { id: Math.random().toString(36).substr(2, 9), day: 'Novo Dia', meals: [] },
    ])
  const updateDay = (id: string, val: string) =>
    setEditingMenus(editingMenus.map((m) => (m.id === id ? { ...m, day: val } : m)))
  const removeDay = (id: string) => setEditingMenus(editingMenus.filter((m) => m.id !== id))

  const addMeal = (menuId: string) =>
    setEditingMenus(
      editingMenus.map((m) =>
        m.id === menuId ? { ...m, meals: [...m.meals, { type: 'Almoço', description: '' }] } : m,
      ),
    )
  const updateMeal = (menuId: string, idx: number, field: string, val: string) =>
    setEditingMenus(
      editingMenus.map((m) =>
        m.id === menuId
          ? {
              ...m,
              meals: m.meals.map((meal, i) => (i === idx ? { ...meal, [field]: val } : meal)),
            }
          : m,
      ),
    )
  const removeMeal = (menuId: string, idx: number) =>
    setEditingMenus(
      editingMenus.map((m) =>
        m.id === menuId ? { ...m, meals: m.meals.filter((_, i) => i !== idx) } : m,
      ),
    )

  return (
    <div className="space-y-6 animate-fade-in">
      {user.isGovernance && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-orange-50/50 p-4 rounded-2xl border border-amber-100">
          <div>
            <h3 className="font-bold text-orange-900">Gerenciar Cardápio</h3>
            <p className="text-sm text-orange-700/80">Atualize as refeições de cada dia.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleOpen}
                className="font-bold shadow-sm bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
              >
                <Edit className="w-4 h-4 mr-2" /> Editar Cardápio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] h-[85vh] flex flex-col p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-2 shrink-0">
                <DialogTitle className="font-display font-black text-2xl">
                  Gerenciar Cardápio
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {editingMenus.map((menu) => (
                  <Card key={menu.id} className="border-amber-200 shadow-sm">
                    <CardHeader className="py-3 px-4 bg-orange-50/50 flex flex-row items-center justify-between space-y-0 border-b border-amber-100">
                      <Input
                        value={menu.day}
                        onChange={(e) => updateDay(menu.id, e.target.value)}
                        className="w-[220px] font-bold h-9 border-amber-200 bg-white"
                        placeholder="Ex: Sexta-feira"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDay(menu.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9 w-9"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4 bg-white/50">
                      {menu.meals.map((meal, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row gap-3 items-start p-3 bg-white rounded-xl border border-amber-100 shadow-sm relative group"
                        >
                          <Select
                            value={meal.type}
                            onValueChange={(val) => updateMeal(menu.id, idx, 'type', val)}
                          >
                            <SelectTrigger className="w-full sm:w-[150px] h-9 shrink-0 bg-orange-50/30 font-medium border-amber-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MEAL_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Textarea
                            value={meal.description}
                            onChange={(e) =>
                              updateMeal(menu.id, idx, 'description', e.target.value)
                            }
                            className="min-h-[36px] h-9 resize-none py-2 border-amber-200 bg-orange-50/30 text-sm w-full"
                            placeholder="Descrição da refeição"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMeal(menu.id, idx)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 h-9 w-9 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addMeal(menu.id)}
                        className="w-full border-dashed border-amber-300 text-amber-700 bg-amber-50/50 hover:bg-amber-100/50 font-bold h-10"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Adicionar Refeição
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  onClick={addDay}
                  className="w-full font-bold h-12 border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 bg-transparent shadow-none"
                  variant="secondary"
                >
                  <Plus className="w-5 h-5 mr-2" /> Adicionar Novo Dia
                </Button>
              </div>
              <DialogFooter className="p-6 pt-4 border-t bg-gray-50/50 shrink-0">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="font-bold">
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {dailyMenus.map((menu) => (
        <Card
          key={menu.id}
          className="overflow-hidden border-amber-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all rounded-2xl"
        >
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-amber-100 py-4">
            <CardTitle className="font-display font-bold text-xl flex items-center text-foreground">
              <CalendarDays className="w-5 h-5 mr-2 text-primary" />
              {menu.day}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-amber-100">
              {menu.meals.map((meal, idx) => (
                <div
                  key={idx}
                  className="p-5 flex flex-col md:flex-row md:items-start gap-4 hover:bg-orange-50/30 transition-colors"
                >
                  <Badge
                    variant="outline"
                    className="w-fit bg-white border-amber-200 text-primary font-bold uppercase tracking-wider text-[10px] py-1 shrink-0 flex items-center"
                  >
                    <Utensils className="w-3 h-3 mr-1.5" />
                    {meal.type}
                  </Badge>
                  <p className="text-foreground/80 font-medium leading-relaxed text-base whitespace-pre-line">
                    {meal.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
