import { CalendarDays, Utensils } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import useAppStore from '@/stores/useAppStore'

export default function MenuView() {
  const { dailyMenus } = useAppStore()

  return (
    <div className="space-y-6 animate-fade-in">
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
                  <p className="text-foreground/80 font-medium leading-relaxed text-base">
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
