import { useMemo, useRef } from 'react'
import { CheckCircle2, Clock, XCircle, Download, Upload, ShieldAlert, Banknote } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { PieChart, Pie, Cell } from 'recharts'
import { useToast } from '@/hooks/use-toast'
import useAppStore, { FinanceStatus } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

const expenseData = [
  { name: 'Chácara', value: 4500, fill: 'var(--color-hospedagem)' },
  { name: 'Churras/Comida', value: 2000, fill: 'var(--color-alimentacao)' },
  { name: 'Bebidas/Chopp', value: 1200, fill: 'var(--color-bebidas)' },
  { name: 'Limpeza/Som', value: 800, fill: 'var(--color-staff)' },
]

const chartConfig = {
  hospedagem: { label: 'Chácara', color: 'hsl(var(--chart-1))' },
  alimentacao: { label: 'Comida', color: 'hsl(var(--chart-2))' },
  bebidas: { label: 'Bebidas', color: 'hsl(var(--chart-3))' },
  staff: { label: 'Extras', color: 'hsl(var(--chart-4))' },
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid':
      return <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto drop-shadow-sm" />
    case 'pending':
      return <Clock className="w-6 h-6 text-amber-400 mx-auto opacity-50" />
    case 'late':
      return <XCircle className="w-6 h-6 text-red-500 mx-auto drop-shadow-sm" />
    default:
      return null
  }
}

export default function Finance() {
  const { user, participantsFinance, updateParticipantFinance } = useAppStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const personalTotal = useMemo(() => {
    const base = 400
    return base * user.adults + base * 0.5 * user.children + base * 0.8 * user.nannies
  }, [user])

  const handleExportCSV = () => {
    const header = 'Família,Parc 1,Parc 2,Parc 3,Valor Total\n'
    const rows = participantsFinance
      .map((p) => `${p.name},${p.p1},${p.p2},${p.p3},${p.amount}`)
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'financas_farrao.csv'
    a.click()
    toast({ title: 'Planilha Exportada! 📊', description: 'O arquivo foi gerado com sucesso.' })
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      toast({
        title: 'Planilha Importada! ✅',
        description: `Dados de ${e.target.files[0].name} sincronizados.`,
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const toggleStatus = (id: string, field: 'p1' | 'p2' | 'p3', current: string) => {
    const nextStatus = current === 'paid' ? 'pending' : current === 'pending' ? 'late' : 'paid'
    updateParticipantFinance(id, field, nextStatus as FinanceStatus)
  }

  const CSVButtons = () => (
    <div className="flex space-x-3 shrink-0">
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImportCSV}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="bg-white border-primary/20 hover:bg-primary/5 text-primary font-bold shadow-sm"
      >
        <Upload className="w-4 h-4 mr-2" /> Importar CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        className="bg-white border-secondary/20 hover:bg-secondary/5 text-secondary font-bold shadow-sm"
      >
        <Download className="w-4 h-4 mr-2" /> Exportar Planilha
      </Button>
    </div>
  )

  const TransparencyView = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-end mb-2">
        <CSVButtons />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Allocation Chart */}
        <Card className="lg:col-span-1 shadow-sm border-amber-200 bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="font-display font-bold">Orçamento da Festa</CardTitle>
            <CardDescription className="font-medium text-foreground/60">
              Estimativa total: R$ 8.500,00
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer config={chartConfig} className="w-full aspect-square max-h-[280px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={expenseData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  strokeWidth={3}
                  stroke="hsl(var(--background))"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent />}
                  className="-translate-y-2 flex-wrap gap-2 text-xs font-bold"
                />
              </PieChart>
            </ChartContainer>
            <div className="mt-8 w-full p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-amber-200 shadow-inner">
              <p className="text-sm font-bold text-foreground/50 uppercase tracking-widest text-center mb-1">
                Previsão da Sua Família
              </p>
              <p className="text-3xl font-black font-display text-primary text-center">
                R$ {personalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Installments Table */}
        <Card className="lg:col-span-2 shadow-sm border-amber-200 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="bg-orange-50/30 border-b border-amber-100">
            <CardTitle className="font-display font-bold text-xl">Pagamentos da Galera</CardTitle>
            <CardDescription className="font-medium">
              Transparência total. Quem já pagou e quem tá devendo a Vakinha.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto flex-1">
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="border-amber-100">
                  <TableHead className="w-[180px] font-bold text-foreground">Família</TableHead>
                  <TableHead className="text-center font-bold text-foreground">
                    Parc. 1 (Out)
                  </TableHead>
                  <TableHead className="text-center font-bold text-foreground">
                    Parc. 2 (Nov)
                  </TableHead>
                  <TableHead className="text-center font-bold text-foreground">
                    Parc. 3 (Dez)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participantsFinance.map((p, i) => (
                  <TableRow
                    key={p.id}
                    className={cn(
                      'border-amber-50 transition-colors',
                      i === 0 && 'bg-primary/5 hover:bg-primary/10',
                    )}
                  >
                    <TableCell className="font-bold text-foreground text-base py-4">
                      {p.name}
                    </TableCell>
                    <TableCell>{getStatusIcon(p.p1)}</TableCell>
                    <TableCell>{getStatusIcon(p.p2)}</TableCell>
                    <TableCell>{getStatusIcon(p.p3)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <div className="p-4 bg-orange-50/50 border-t border-amber-100 flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-foreground/60 uppercase tracking-widest">
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 drop-shadow-sm" /> Ta Pago
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-amber-400 mr-2" /> No Prazo
            </div>
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2 drop-shadow-sm" /> Atrasado
            </div>
          </div>
        </Card>
      </div>
    </div>
  )

  const ControlView = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-red-50 p-5 rounded-2xl border-2 border-red-200 shadow-sm">
        <div className="flex items-center text-red-800">
          <ShieldAlert className="w-6 h-6 mr-3 shrink-0" />
          <p className="text-sm font-bold leading-relaxed">
            ÁREA DA GOVERNANÇA: Clique nos ícones da tabela abaixo para alterar os status de
            pagamento.
          </p>
        </div>
        <CSVButtons />
      </div>

      <Card className="shadow-md border-amber-200 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-amber-50/50 border-b border-amber-100">
          <CardTitle className="font-display font-black text-xl text-foreground flex items-center">
            <Banknote className="w-6 h-6 text-primary mr-2" />
            Controle de Caixa
          </CardTitle>
          <CardDescription className="font-medium text-foreground/70">
            Atualize quem fez o PIX.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="border-amber-100">
                <TableHead className="w-[200px] font-bold text-foreground">Família</TableHead>
                <TableHead className="text-center font-bold text-foreground">Parc. 1</TableHead>
                <TableHead className="text-center font-bold text-foreground">Parc. 2</TableHead>
                <TableHead className="text-center font-bold text-foreground">Parc. 3</TableHead>
                <TableHead className="text-right font-bold text-foreground pr-6">
                  Total Estimado
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participantsFinance.map((p) => (
                <TableRow key={p.id} className="border-amber-50 hover:bg-orange-50/30">
                  <TableCell className="font-bold text-foreground text-base py-4 pl-4">
                    {p.name}
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => toggleStatus(p.id, 'p1', p.p1)}
                      className="p-2 hover:scale-110 hover:bg-orange-100 rounded-xl transition-all outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {getStatusIcon(p.p1)}
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => toggleStatus(p.id, 'p2', p.p2)}
                      className="p-2 hover:scale-110 hover:bg-orange-100 rounded-xl transition-all outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {getStatusIcon(p.p2)}
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => toggleStatus(p.id, 'p3', p.p3)}
                      className="p-2 hover:scale-110 hover:bg-orange-100 rounded-xl transition-all outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {getStatusIcon(p.p3)}
                    </button>
                  </TableCell>
                  <TableCell className="text-right font-black text-lg text-primary pr-6">
                    R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-display text-foreground">Finanças do Farrão</h1>
        <p className="text-foreground/60 text-base mt-1 font-medium">
          Acompanhe a arrecadação da Vakinha e o orçamento da festa.
        </p>
      </div>

      <Tabs defaultValue="transparency" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[500px] mb-8 bg-white border border-amber-200 p-1 rounded-xl shadow-sm h-auto">
          <TabsTrigger
            value="transparency"
            className="rounded-lg py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Transparência
          </TabsTrigger>
          {user.isGovernance && (
            <TabsTrigger
              value="control"
              className="rounded-lg py-2.5 font-bold data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              Controle e Acompanhamento
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="transparency" className="mt-0 outline-none">
          <TransparencyView />
        </TabsContent>
        {user.isGovernance && (
          <TabsContent value="control" className="mt-0 outline-none">
            <ControlView />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
