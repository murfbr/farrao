import { useMemo } from 'react'
import useAppStore from '@/stores/useAppStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Leaf, AlertCircle, MessageCircle } from 'lucide-react'

export default function RestrictionsView() {
  const { participants } = useAppStore()

  const allMembers = useMemo(() => {
    return participants.flatMap((p) => p.members || [])
  }, [participants])

  const peopleWithRestrictions = useMemo(() => {
    return allMembers.filter((m) => m.isVegetarian || m.restrictions?.trim() || m.suggestions?.trim())
  }, [allMembers])

  const vegetarians = useMemo(() => peopleWithRestrictions.filter((m) => m.isVegetarian), [peopleWithRestrictions])
  const restrictions = useMemo(() => peopleWithRestrictions.filter((m) => m.restrictions?.trim()), [peopleWithRestrictions])
  const suggestions = useMemo(() => peopleWithRestrictions.filter((m) => m.suggestions?.trim()), [peopleWithRestrictions])

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-xl border-amber-200/50 bg-white/95 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-purple-500/5 border-b border-purple-100/50 p-8">
          <CardTitle className="text-2xl font-black font-display text-purple-700">
            Resumo de Restrições e Sugestões
          </CardTitle>
          <CardDescription className="text-base font-bold text-purple-600/60 mt-2">
            Consolidado das informações de todos os participantes para ajudar a equipe da cozinha.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-10">
          
          <div className="space-y-4">
            <h3 className="flex items-center text-xl font-black text-emerald-700">
              <Leaf className="w-6 h-6 mr-2" />
              Vegetarianos ({vegetarians.length})
            </h3>
            {vegetarians.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {vegetarians.map(m => (
                  <div key={m.id} className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-900 font-bold shadow-sm">
                    {m.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm font-medium ml-8">Nenhum vegetariano registrado.</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center text-xl font-black text-red-700">
              <AlertCircle className="w-6 h-6 mr-2" />
              Restrições Alimentares / Alergias ({restrictions.length})
            </h3>
            {restrictions.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {restrictions.map(m => (
                  <div key={m.id} className="p-5 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
                    <span className="font-black text-red-900 block mb-1">{m.name}</span>
                    <span className="text-sm font-bold text-red-800/80">{m.restrictions}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm font-medium ml-8">Nenhuma restrição registrada.</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center text-xl font-black text-blue-700">
              <MessageCircle className="w-6 h-6 mr-2" />
              Sugestões de Cardápio ({suggestions.length})
            </h3>
            {suggestions.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {suggestions.map(m => (
                  <div key={m.id} className="p-5 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
                    <span className="font-black text-blue-900 block mb-1">{m.name}</span>
                    <span className="text-sm font-bold text-blue-800/80">{m.suggestions}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm font-medium ml-8">Nenhuma sugestão registrada.</p>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
