import { useMemo } from 'react'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
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
import { PieChart, Pie, Cell } from 'recharts'
import useAppStore from '@/stores/useAppStore'

const mockParticipants = [
  { name: 'João (Você)', p1: 'paid', p2: 'paid', p3: 'pending', amount: 850 },
  { name: 'Maria F.', p1: 'paid', p2: 'pending', p3: 'pending', amount: 450 },
  { name: 'Carlos S.', p1: 'paid', p2: 'paid', p3: 'late', amount: 1200 },
  { name: 'Ana P.', p1: 'paid', p2: 'late', p3: 'pending', amount: 450 },
]

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
  const { user } = useAppStore()

  // Fake calculation based on profile changes to show data flow
  const personalTotal = useMemo(() => {
    const base = 400
    return base * user.adults + base * 0.5 * user.children + base * 0.8 * user.nannies
  }, [user])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Finanças</h1>
        <p className="text-slate-500 text-sm">Acompanhamento de custos e pagamentos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Allocation Chart */}
        <Card className="lg:col-span-1 shadow-sm">
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
        <Card className="lg:col-span-2 shadow-sm overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>Acompanhamento de Parcelas</CardTitle>
            <CardDescription>Situação dos pagamentos por família.</CardDescription>
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
                {mockParticipants.map((p, i) => (
                  <TableRow key={i} className={i === 0 ? 'bg-primary/5 hover:bg-primary/10' : ''}>
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
    </div>
  )
}
