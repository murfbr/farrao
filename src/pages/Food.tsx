import { Utensils } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'
import MenuView from '@/components/food/MenuView'
import MyPurchasesView from '@/components/food/MyPurchasesView'
import MasterListView from '@/components/food/MasterListView'

export default function Food() {
  const { user } = useAppStore()

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-display text-foreground flex items-center">
          <Utensils className="w-8 h-8 mr-3 text-primary" /> Comes & Bebes
        </h1>
        <p className="text-foreground/60 text-base mt-2 font-medium">
          Cardápio dos dias de festa e divisão das compras essenciais.
        </p>
      </div>

      <Tabs defaultValue="menu" className="w-full">
        <TabsList
          className={cn(
            'grid w-full mb-8 bg-white border border-amber-200 p-1 rounded-xl shadow-sm h-auto',
            user.isGovernance
              ? 'grid-cols-2 md:grid-cols-3 max-w-[600px]'
              : 'grid-cols-2 max-w-[400px]',
          )}
        >
          <TabsTrigger
            value="menu"
            className="rounded-lg py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Cardápio Diário
          </TabsTrigger>
          <TabsTrigger
            value="my-purchases"
            className="rounded-lg py-2.5 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
          >
            Minhas Compras
          </TabsTrigger>
          {user.isGovernance && (
            <TabsTrigger
              value="shopping-list"
              className="rounded-lg py-2.5 font-bold data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              Lista Mestre (Admin)
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="menu" className="mt-0 outline-none">
          <MenuView />
        </TabsContent>
        <TabsContent value="my-purchases" className="mt-0 outline-none">
          <MyPurchasesView />
        </TabsContent>
        {user.isGovernance && (
          <TabsContent value="shopping-list" className="mt-0 outline-none">
            <MasterListView />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
