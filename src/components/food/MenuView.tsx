import { useState, useMemo } from 'react'
import { CalendarDays, Utensils, Edit, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, AlertTriangle, Coffee, Pizza, Wine, Apple, UtensilsCrossed } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import useAppStore, { DailyMenu, MealType } from '@/stores/useAppStore'
import RichTextEditor from '@/components/tasks/RichTextEditor'

const MEAL_TYPES: MealType[] = ['Café da Manhã', 'Almoço', 'Jantar', 'Petiscos', 'Bebidas']

const getMealIcon = (type: string) => {
  switch (type) {
    case 'Café da Manhã': return <Coffee className="w-4 h-4 mr-1.5" />
    case 'Almoço': return <UtensilsCrossed className="w-4 h-4 mr-1.5" />
    case 'Jantar': return <Pizza className="w-4 h-4 mr-1.5" />
    case 'Petiscos': return <Apple className="w-4 h-4 mr-1.5" />
    case 'Bebidas': return <Wine className="w-4 h-4 mr-1.5" />
    default: return <Utensils className="w-4 h-4 mr-1.5" />
  }
}

export default function MenuView() {
  const { user, dailyMenus, updateDailyMenus, participants } = useAppStore()
  const [open, setOpen] = useState(false)
  const [editingMenus, setEditingMenus] = useState<DailyMenu[]>([])

  const groupRestrictions = useMemo(() => {
    return participants
      .flatMap((p) => p.members)
      .filter((m) => m.restrictions && m.restrictions.trim().length > 0)
  }, [participants])

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
      { id: Math.random().toString(36).substr(2, 9), day: 'Novo Dia', date: '', meals: [] },
    ])

  const updateDay = (id: string, dateVal: string) => {
    let displayDay = 'Data Inválida'
    if (dateVal) {
        // T12:00:00 prevents timezone shifts when parsing the date string
        const d = new Date(dateVal + 'T12:00:00') 
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
        displayDay = `${days[d.getDay()]} (${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})`
    } else {
        displayDay = 'Novo Dia'
    }
    setEditingMenus(editingMenus.map((m) => (m.id === id ? { ...m, date: dateVal, day: displayDay } : m)))
  }

  const removeDay = (id: string) => setEditingMenus(editingMenus.filter((m) => m.id !== id))

  const addMeal = (menuId: string) =>
    setEditingMenus(
      editingMenus.map((m) =>
        m.id === menuId ? { ...m, meals: [...m.meals, { type: 'Almoço', description: '', imageUrl: '', isDefault: false }] } : m,
      ),
    )
  
  const updateMeal = (menuId: string, idx: number, field: string, val: any) =>
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

  const toggleDefaultMeal = (menuId: string, idx: number, checked: boolean) => {
    const currentMenu = editingMenus.find(m => m.id === menuId)
    if (!currentMenu) return
    const mealToCopy = currentMenu.meals[idx]

    setEditingMenus(prev => prev.map(menu => {
      if (menu.id === menuId) {
        return {
          ...menu,
          meals: menu.meals.map((meal, i) => i === idx ? { ...meal, isDefault: checked } : meal)
        }
      }
      if (checked) {
         return {
           ...menu,
           meals: menu.meals.map(meal => 
             meal.type === mealToCopy.type 
               ? { ...meal, description: mealToCopy.description, imageUrl: mealToCopy.imageUrl } 
               : meal
           )
         }
      }
      return menu
    }))
  }

  const moveMeal = (menuId: string, idx: number, direction: 'up' | 'down') => {
    setEditingMenus(editingMenus.map(m => {
      if (m.id !== menuId) return m
      const newMeals = [...m.meals]
      if (direction === 'up' && idx > 0) {
        ;[newMeals[idx - 1], newMeals[idx]] = [newMeals[idx], newMeals[idx - 1]]
      } else if (direction === 'down' && idx < newMeals.length - 1) {
        ;[newMeals[idx + 1], newMeals[idx]] = [newMeals[idx], newMeals[idx + 1]]
      }
      return { ...m, meals: newMeals }
    }))
  }

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
            <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col p-0 overflow-hidden bg-[#faf8f5]">
              <DialogHeader className="p-6 pb-4 shrink-0 bg-white border-b border-amber-100">
                <DialogTitle className="font-display font-black text-2xl text-orange-950">
                  Editar Cardápio
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {groupRestrictions.length > 0 && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800 font-bold">Atenção às Restrições Alimentares</AlertTitle>
                    <AlertDescription className="text-red-700 text-sm mt-1">
                      Alguns membros possuem restrições: {groupRestrictions.map(m => m.restrictions).join(', ')}.
                    </AlertDescription>
                  </Alert>
                )}

                <Accordion type="multiple" className="space-y-4">
                  {editingMenus.map((menu) => (
                    <AccordionItem key={menu.id} value={menu.id} className="border border-amber-200 rounded-xl bg-white shadow-sm overflow-hidden px-4">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex flex-1 items-center justify-between pr-4">
                          <div className="flex items-center gap-3 w-full max-w-sm">
                            <Input
                              type="date"
                              value={menu.date || ''}
                              onChange={(e) => updateDay(menu.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()} // Prevent accordion toggle when clicking input
                              className="w-40 font-medium h-9 border-amber-200 bg-orange-50/30"
                            />
                            <span className="font-bold text-orange-950 truncate">{menu.day}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); removeDay(menu.id); }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 ml-2 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 space-y-5">
                        {menu.meals.map((meal, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col gap-3 p-4 bg-[#faf8f5] rounded-xl border border-amber-100 shadow-inner relative"
                          >
                            <div className="flex flex-wrap items-center gap-3">
                              <Select
                                value={meal.type}
                                onValueChange={(val) => updateMeal(menu.id, idx, 'type', val)}
                              >
                                <SelectTrigger className="w-[160px] h-9 bg-white font-bold border-amber-200 text-orange-950">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {MEAL_TYPES.map((t) => (
                                    <SelectItem key={t} value={t} className="font-medium">
                                      {t}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-200 flex-1 min-w-[200px]">
                                <ImageIcon className="w-4 h-4 text-amber-500 shrink-0" />
                                <Input 
                                  placeholder="URL da Imagem de referência (opcional)" 
                                  value={meal.imageUrl || ''}
                                  onChange={(e) => updateMeal(menu.id, idx, 'imageUrl', e.target.value)}
                                  className="border-0 h-7 focus-visible:ring-0 p-0 text-sm shadow-none"
                                />
                              </div>

                              <div className="flex items-center gap-1 shrink-0 ml-auto bg-white rounded-lg border border-amber-100 p-0.5">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-100" onClick={() => moveMeal(menu.id, idx, 'up')} disabled={idx === 0}>
                                  <ArrowUp className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-100" onClick={() => moveMeal(menu.id, idx, 'down')} disabled={idx === menu.meals.length - 1}>
                                  <ArrowDown className="w-4 h-4" />
                                </Button>
                                <div className="w-px h-5 bg-amber-200 mx-1"></div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeMeal(menu.id, idx)}
                                  className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <RichTextEditor 
                              value={meal.description}
                              onChange={(val) => updateMeal(menu.id, idx, 'description', val)}
                            />

                            <div className="flex items-center space-x-2 pt-1">
                              <Switch 
                                id={`default-${menu.id}-${idx}`} 
                                checked={meal.isDefault || false}
                                onCheckedChange={(checked) => toggleDefaultMeal(menu.id, idx, checked)}
                              />
                              <Label htmlFor={`default-${menu.id}-${idx}`} className="text-sm font-medium text-amber-700 cursor-pointer">
                                Definir como Padrão (Copia para outros dias)
                              </Label>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addMeal(menu.id)}
                          className="w-full border-dashed border-primary/40 text-primary hover:bg-primary/5 font-bold h-10 mt-2"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Adicionar Refeição
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <Button
                  onClick={addDay}
                  className="w-full font-bold h-12 border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 bg-transparent shadow-none rounded-xl"
                  variant="secondary"
                >
                  <Plus className="w-5 h-5 mr-2" /> Adicionar Novo Dia
                </Button>
              </div>
              <DialogFooter className="p-6 border-t bg-white shrink-0">
                <Button variant="outline" onClick={() => setOpen(false)} className="font-semibold">
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
                  className="p-5 flex flex-col md:flex-row gap-5 hover:bg-orange-50/30 transition-colors group"
                >
                  <div className="flex flex-col md:items-center gap-3 shrink-0 md:w-40">
                    <Badge
                      variant="outline"
                      className="w-fit bg-white border-amber-200 text-primary font-bold uppercase tracking-wider text-[10px] py-1.5 px-3 flex items-center shadow-sm"
                    >
                      {getMealIcon(meal.type)}
                      {meal.type}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div 
                      className="text-foreground/80 leading-relaxed text-[15px] prose prose-amber prose-p:my-1 prose-ul:my-1 prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: meal.description || '<p className="italic opacity-50">Sem descrição</p>' }}
                    />
                  </div>

                  {meal.imageUrl && (
                    <div className="shrink-0 w-full md:w-32 h-32 rounded-xl overflow-hidden border border-amber-100 shadow-sm bg-white mt-2 md:mt-0">
                      <img src={meal.imageUrl} alt={meal.type} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                    </div>
                  )}
                </div>
              ))}
              
              {menu.meals.length === 0 && (
                <div className="p-8 text-center text-amber-600/60 font-medium flex flex-col items-center">
                  <Utensils className="w-8 h-8 mb-2 opacity-50" />
                  Nenhuma refeição planejada para este dia.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
