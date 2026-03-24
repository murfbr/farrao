import { ShoppingCart, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import useAppStore, { ShoppingItem } from '@/stores/useAppStore'

export default function MyPurchasesView() {
  const { user, shoppingItems, participants } = useAppStore()
  const myPurchases = shoppingItems.filter((i) => i.assignedToId === user.id)

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-sm">
        <div className="bg-white p-3 rounded-full shrink-0 shadow-sm">
          <ShoppingCart className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-black font-display text-emerald-900">
            Sua Missão nas Compras
          </h2>
          <p className="text-emerald-700/80 text-sm font-medium">
            Os itens abaixo foram atribuídos para você comprar.
          </p>
        </div>
      </div>

      {myPurchases.length === 0 ? (
        <Card className="border-dashed border-2 border-amber-200 bg-white/50 text-center p-10 rounded-2xl">
          <div className="mx-auto w-12 h-12 bg-orange-100 text-orange-400 rounded-full flex items-center justify-center mb-3 shadow-inner">
            <Check className="w-6 h-6" />
          </div>
          <p className="text-foreground/60 font-bold">Nenhum item atribuído a você no momento.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myPurchases.map((item) => (
            <Card
              key={item.id}
              className="border-amber-200 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden rounded-2xl"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-400" />
              <CardContent className="p-5 pl-6 flex flex-col h-full justify-between gap-4">
                <div>
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 hover:bg-amber-200 text-[10px] uppercase font-bold tracking-widest mb-3"
                  >
                    {item.category}
                  </Badge>
                  <h3 className="font-bold text-lg leading-tight text-foreground">{item.name}</h3>
                  {item.notes && (
                    <p className="text-xs text-foreground/60 italic border-l-2 border-emerald-200 pl-2 mt-3 font-medium bg-emerald-50/30 p-1.5 rounded-r-md">
                      {item.notes}
                    </p>
                  )}
                </div>
                <div className="pt-4 border-t border-amber-50 mt-auto">
                  <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest mb-1">
                    Quantidade a comprar
                  </p>
                  <p className="text-2xl font-black text-emerald-600 font-display">
                    {calculateQuantity(item)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
