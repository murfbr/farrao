import { useMemo, useRef } from 'react'
import { CheckCircle2, Clock, XCircle, Download, Upload, ShieldAlert } from 'lucide-react'
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
  { name: 'Hospedagem', value: 4500, fill: 'var(--color-hospedagem)' },
  { name: 'Alimentação', value: 2000, fill: 'var(--color-alimentacao)' },
  { name: 'Bebidas', value: 1200, fill: 'var(--color-bebidas)' },
  { name: 'Limpeza/Staff', value: 800, fill: 'var(--color-staff)' },
]

const chartConfig = {
  hospedagem: { label: 'Hospedagem', color: 'hsl(var(--chart-1))' },
  alimentacao: { label: 'Alimentação', color: 'hsl(var(--chart-2))' },
  bebidas: { label: 'Bebidas', color: 'hsl(var(--chart-3))' },
  staff: { label: 'Staff/Extra', color: 'hsl(var(--chart-4))' },
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid':
      return <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
    case 'pending':
      return <Clock className="w-5 h-5 text-slate-300 mx-auto" />
    case 'late':
      return <XCircle className="w-5 h-5 text-red-500 mx-auto" />
    default:
      return null
  }
}

export default function Finance() {
  const { user, participantsFinance, updateParticipantFinance } = useAppStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fake calculation based on profile changes
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
    a.download = 'financas_encontro.csv'
    a.click()
    toast({ title: 'Exportação concluída', description: 'Arquivo CSV gerado com sucesso.' })
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      toast({
        title: 'Importação simulada',
        description: `Arquivo ${e.target.files[0].name} lido com sucesso e dados atualizados.`,
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const toggleStatus = (id: string, field: 'p1' | 'p2' | 'p3', current: string) => {
    const nextStatus = current === 'paid' ? 'pending' : current === 'pending' ? 'late' : 'paid'
    updateParticipantFinance(id, field, nextStatus as FinanceStatus)
  }

  const TransparencyView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Expense Allocation Chart */}
      <Card className="lg:col-span-1 shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Orçamento Previsto</CardTitle>
          <CardDescription>Total estimado: R$ 8.500,00</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <ChartContainer config={chartConfig} className="w-full aspect-square max-h-[300px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={expenseData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={2}
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent />}
                className="-translate-y-2 flex-wrap gap-2"
              />
            </PieChart>
          </ChartContainer>
          <div className="mt-6 w-full p-4 bg-blue-50/50 rounded-lg border border-blue-100">
            <p className="text-sm text-slate-600 text-center">Seu valor estimado</p>
            <p className="text-2xl font-bold text-primary text-center mt-1">
              R$ {personalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Installments Table */}
      <Card className="lg:col-span-2 shadow-sm border-slate-200 overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle>Acompanhamento Geral</CardTitle>
          <CardDescription>
            Situação dos pagamentos por família. Visão de transparência.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto flex-1">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[150px]">Família</TableHead>
                <TableHead className="text-center">Parc. 1 (Out)</TableHead>
                <TableHead className="text-center">Parc. 2 (Nov)</TableHead>
                <TableHead className="text-center">Parc. 3 (Dez)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participantsFinance.map((p, i) => (
                <TableRow key={p.id} className={i === 0 ? 'bg-primary/5 hover:bg-primary/10' : ''}>
                  <TableCell className="font-medium text-slate-700">{p.name}</TableCell>
                  <TableCell>{getStatusIcon(p.p1)}</TableCell>
                  <TableCell>{getStatusIcon(p.p2)}</TableCell>
                  <TableCell>{getStatusIcon(p.p3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 bg-slate-50 border-t flex items-center justify-center space-x-6 text-sm text-slate-500">
          <div className="flex items-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1" /> Pago
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-slate-300 mr-1" /> Pendente
          </div>
          <div className="flex items-center">
            <XCircle className="w-4 h-4 text-red-500 mr-1" /> Atrasado
          </div>
        </div>
      </Card>
    </div>
  )

  const ControlView = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
        <div className="flex items-center text-amber-800">
          <ShieldAlert className="w-5 h-5 mr-2 shrink-0" />
          <p className="text-sm font-medium">
            Modo Controle: Clique nos ícones de pagamento na tabela para alterar os status.
          </p>
        </div>
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
            className="bg-white"
          >
            <Upload className="w-4 h-4 mr-2" /> Importar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="bg-white">
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardHeader>
          <CardTitle>Painel de Monitoramento (Gestão)</CardTitle>
          <CardDescription>Atualize o status dos pagamentos manualmente.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[180px]">Família</TableHead>
                <TableHead className="text-center">Parc. 1</TableHead>
                <TableHead className="text-center">Parc. 2</TableHead>
                <TableHead className="text-center">Parc. 3</TableHead>
                <TableHead className="text-right">Valor Total Estimado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participantsFinance.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-slate-700">{p.name}</TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => toggleStatus(p.id, 'p1', p.p1)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {getStatusIcon(p.p1)}
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => toggleStatus(p.id, 'p2', p.p2)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {getStatusIcon(p.p2)}
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => toggleStatus(p.id, 'p3', p.p3)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {getStatusIcon(p.p3)}
                    </button>
                  </TableCell>
                  <TableCell className="text-right text-slate-600 font-medium">
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Finanças</h1>
        <p className="text-slate-500 text-sm">Acompanhamento de custos e pagamentos do evento.</p>
      </div>

      <Tabs defaultValue="transparency" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
          <TabsTrigger value="transparency">Transparência</TabsTrigger>
          {user.isGovernance && <TabsTrigger value="control">Controle</TabsTrigger>}
        </TabsList>
        <TabsContent value="transparency" className="mt-0">
          <TransparencyView />
        </TabsContent>
        {user.isGovernance && (
          <TabsContent value="control" className="mt-0">
            <ControlView />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
