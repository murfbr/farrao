import React, { useMemo, useRef, useState } from 'react'
import { isBefore, parseISO, startOfDay } from 'date-fns'
import {
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Upload,
  ShieldAlert,
  Banknote,
  Beer,
  Settings,
  Users,
  Calendar,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useAppStore, { ParticipantRecord, FinanceStatus } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

const getStatusIcon = (status: string, dueDate?: string) => {
  const isLate = status === 'pending' && dueDate && isBefore(parseISO(dueDate), startOfDay(new Date()))

  if (status === 'paid') {
    return (
      <span title="Pago">
        <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto drop-shadow-sm" />
      </span>
    )
  }
  if (isLate || status === 'late') {
    return (
      <span title="Atrasado">
        <XCircle className="w-6 h-6 text-red-500 mx-auto drop-shadow-sm" />
      </span>
    )
  }
  return (
    <span title="Pendente">
      <Clock className="w-6 h-6 text-amber-400 mx-auto opacity-50" />
    </span>
  )
}

export default function Finance() {
  const {
    user,
    participants,
    updateParticipant,
    pricingTiers,
    setPricingTiers,
    beverageTotal,
    setBeverageTotal,
    eventDetails,
    updateEventDetails,
  } = useAppStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalDrinkingDays = useMemo(
    () =>
      participants.reduce(
        (acc, p) => acc + p.members.filter((m) => m.isDrinking).length * p.daysAttending,
        0,
      ),
    [participants],
  )

  const beveragePerDay = useMemo(
    () => (totalDrinkingDays > 0 ? beverageTotal / totalDrinkingDays : 0),
    [totalDrinkingDays, beverageTotal],
  )

  const calculateBaseFee = (p: ParticipantRecord) => {
    if (p.socialQuotaOverride !== null) return p.socialQuotaOverride
    const adults = p.members.filter((m) => m.category === 'adult').length
    const child10 = p.members.filter((m) => m.category === 'child_under_10').length
    const child16 = p.members.filter((m) => m.category === 'child_11_to_16').length
    const nannies = p.members.filter((m) => m.category === 'nanny').length

    return (
      adults * pricingTiers.adults +
      child10 * pricingTiers.childrenUnder10 +
      child16 * pricingTiers.children11to16 +
      nannies * pricingTiers.nannies
    )
  }

  const calculateBeverageFee = (p: ParticipantRecord) => {
    const drinkingAdults = p.members.filter((m) => m.isDrinking).length
    return drinkingAdults * p.daysAttending * beveragePerDay
  }

  const myParticipant = participants.find((p) => p.id === user.id)
  const myBaseFee = myParticipant ? calculateBaseFee(myParticipant) : 0
  const myBeverageFee = myParticipant ? calculateBeverageFee(myParticipant) : 0

  const handleExportCSV = () => {
    const installmentHeaders = eventDetails.installments.map((inst) => inst.label).join(',')
    const header = `Família,${installmentHeaders},Status Bebidas,Qtd Membros,Custo Base,Custo Bebidas,Total\n`
    const rows = participants
      .map((p) => {
        const installmentStatuses = eventDetails.installments
          .map((inst) => p.payments[inst.id] || 'pending')
          .join(',')
        return `${p.name},${installmentStatuses},${p.beverageStatus},${p.members.length},${calculateBaseFee(
          p,
        )},${calculateBeverageFee(p).toFixed(2)},${(
          calculateBaseFee(p) + calculateBeverageFee(p)
        ).toFixed(2)}`
      })
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

  const toggleStatus = (id: string, installmentId: string, current: string) => {
    const p = participants.find((x) => x.id === id)
    if (!p) return
    const nextStatus = current === 'paid' ? 'pending' : current === 'pending' ? 'late' : 'paid'
    updateParticipant(id, {
      payments: { ...p.payments, [installmentId]: nextStatus as FinanceStatus },
    })
  }

  const toggleBeverageStatus = (id: string, current: string) => {
    const nextStatus = current === 'paid' ? 'pending' : current === 'pending' ? 'late' : 'paid'
    updateParticipant(id, { beverageStatus: nextStatus as FinanceStatus })
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
        <Upload className="w-4 h-4 mr-2" /> Importar
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        className="bg-white border-secondary/20 hover:bg-secondary/5 text-secondary font-bold shadow-sm"
      >
        <Download className="w-4 h-4 mr-2" /> Exportar
      </Button>
    </div>
  )

  const TransparencyView = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-sm border-amber-200 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col">
          <CardHeader className="bg-orange-50/50 border-b border-amber-100">
            <CardTitle className="font-display font-bold">Resumo da Sua Família</CardTitle>
            <CardDescription className="font-medium text-foreground/60">
              Valor estimado baseado nas suas configurações de perfil.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-amber-100 pb-3">
              <span className="font-bold text-foreground/70 flex items-center">
                <Users className="w-4 h-4 mr-2" /> Hospedagem / Festa
              </span>
              <span className="font-bold text-lg">
                R$ {myBaseFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-amber-100 pb-3">
              <span className="font-bold text-foreground/70 flex items-center">
                <Beer className="w-4 h-4 mr-2 text-emerald-600" /> Bebidas (Chopp)
              </span>
              <span className="font-bold text-lg text-emerald-600">
                R$ {myBeverageFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-auto pt-6">
              <div className="p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-amber-200 shadow-inner">
                <p className="text-sm font-bold text-foreground/50 uppercase tracking-widest text-center mb-1">
                  Total Previsto
                </p>
                <p className="text-3xl font-black font-display text-primary text-center">
                  R$ {' '}
                  {(myBaseFee + myBeverageFee).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm border-amber-200 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="bg-orange-50/30 border-b border-amber-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display font-bold text-xl">Situação da Vakinha</CardTitle>
              <CardDescription className="font-medium mt-1">
                Acompanhamento das parcelas da festa principal (Hospedagem).
              </CardDescription>
            </div>
            {user.isGovernance && <CSVButtons />}
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto flex-1">
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="border-amber-100">
                  <TableHead className="w-[180px] font-bold text-foreground">Família</TableHead>
                  {eventDetails.installments.map((inst) => (
                    <TableHead key={inst.id} className="text-center font-bold text-foreground min-w-[100px]">
                      {inst.label}
                      <div className="text-[10px] opacity-50 font-normal">{inst.dueDate}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((p, i) => {
                  return (
                    <TableRow
                      key={p.id}
                      className={cn(
                        'border-amber-50 transition-colors',
                        p.id === user.id && 'bg-primary/5 hover:bg-primary/10',
                      )}
                    >
                      <TableCell className="font-bold text-foreground text-base py-4">
                        {p.name}
                      </TableCell>
                      {eventDetails.installments.map((inst) => (
                        <TableCell key={inst.id}>
                          {getStatusIcon(p.payments[inst.id] || 'pending', inst.dueDate)}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
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
            ÁREA DA GOVERNANÇA: Ajuste os preços base, cotas sociais e registre os pagamentos
            clicando nos ícones da tabela.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-md border-amber-200 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-orange-50/50 border-b border-amber-100">
            <CardTitle className="font-display font-black text-xl text-foreground flex items-center">
              <Settings className="w-5 h-5 text-primary mr-2" />
              Motor de Preços Base
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold">Adulto</Label>
              <Input
                type="number"
                value={pricingTiers.adults}
                onChange={(e) => setPricingTiers({ ...pricingTiers, adults: Number(e.target.value) })}
                className="font-bold border-amber-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Crianças &lt; 10</Label>
              <Input
                type="number"
                value={pricingTiers.childrenUnder10}
                onChange={(e) =>
                  setPricingTiers({ ...pricingTiers, childrenUnder10: Number(e.target.value) })
                }
                className="font-bold border-amber-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Crianças 11 a 16</Label>
              <Input
                type="number"
                value={pricingTiers.children11to16}
                onChange={(e) =>
                  setPricingTiers({ ...pricingTiers, children11to16: Number(e.target.value) })
                }
                className="font-bold border-amber-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Staff / Babá</Label>
              <Input
                type="number"
                value={pricingTiers.nannies}
                onChange={(e) =>
                  setPricingTiers({ ...pricingTiers, nannies: Number(e.target.value) })
                }
                className="font-bold border-amber-200"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-primary/20 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between">
            <CardTitle className="font-display font-black text-xl text-primary flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Gestão de Parcelas
            </CardTitle>
            <Button
              size="sm"
              onClick={() => {
                const nextId = String(eventDetails.installments.length + 1)
                updateEventDetails({
                  installments: [
                    ...eventDetails.installments,
                    { id: nextId, label: `Parcela ${nextId}`, dueDate: '' },
                  ],
                })
              }}
              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-8"
            >
              <Plus className="w-4 h-4 mr-1" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {eventDetails.installments.map((inst, idx) => (
                <div key={inst.id} className="flex items-center gap-3 p-3 bg-white border border-primary/10 rounded-xl shadow-sm group">
                  <div className="bg-primary/10 w-8 h-8 rounded-lg flex items-center justify-center text-primary font-black text-sm">
                    {idx + 1}
                  </div>
                  <Input
                    value={inst.label}
                    onChange={(e) => {
                      const newList = [...eventDetails.installments]
                      newList[idx].label = e.target.value
                      updateEventDetails({ installments: newList })
                    }}
                    className="flex-1 font-bold border-none bg-transparent h-8 focus-visible:ring-1"
                  />
                  <Input
                    type="date"
                    value={inst.dueDate}
                    onChange={(e) => {
                      const newList = [...eventDetails.installments]
                      newList[idx].dueDate = e.target.value
                      updateEventDetails({ installments: newList })
                    }}
                    className="w-32 font-bold border-primary/20 h-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      updateEventDetails({
                        installments: eventDetails.installments.filter((i) => i.id !== inst.id),
                      })
                    }}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {eventDetails.installments.length === 0 && (
                <div className="text-center py-6 text-foreground/40 font-medium border-2 border-dashed border-primary/5 rounded-2xl">
                  Nenhuma parcela configurada.
                </div>
              )}
            </div>
            <p className="text-[10px] text-foreground/40 font-medium mt-4 bg-primary/5 p-2 rounded-lg italic">
              * A "Data Limite" define quando o status muda automaticamente para "Atrasado" para pagamentos pendentes.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-amber-200 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-amber-50/50 border-b border-amber-100 flex flex-row items-center justify-between">
          <CardTitle className="font-display font-black text-xl text-foreground flex items-center">
            <Banknote className="w-6 h-6 text-primary mr-2" />
            Controle Principal
          </CardTitle>
          <CSVButtons />
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="border-amber-100">
                <TableHead className="w-[180px] font-bold text-foreground">Família</TableHead>
                {eventDetails.installments.map((inst) => (
                  <TableHead key={inst.id} className="text-center font-bold text-foreground min-w-[80px]">
                    {inst.label}
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold text-foreground w-[120px]">
                  Cota Social
                </TableHead>
                <TableHead className="text-center font-bold text-foreground w-[140px]">
                  Vencimento Indiv.
                </TableHead>
                <TableHead className="text-right font-bold text-foreground pr-6">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((p) => {
                return (
                  <TableRow key={p.id} className="border-amber-50 hover:bg-orange-50/30">
                    <TableCell className="font-bold text-foreground text-base py-4 pl-4">
                      {p.name}
                    </TableCell>
                    {eventDetails.installments.map((inst) => (
                      <TableCell key={inst.id} className="text-center">
                        <button
                          onClick={() => toggleStatus(p.id, inst.id, p.payments[inst.id] || 'pending')}
                          className="p-2 hover:scale-110 hover:bg-orange-100 rounded-xl transition-all"
                        >
                          {getStatusIcon(p.payments[inst.id] || 'pending', inst.dueDate)}
                        </button>
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        placeholder="Padrão"
                        className={cn(
                          'w-20 text-center font-bold mx-auto text-xs',
                          p.socialQuotaOverride !== null ? 'border-primary text-primary' : '',
                        )}
                        value={p.socialQuotaOverride ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : Number(e.target.value)
                          updateParticipant(p.id, { socialQuotaOverride: val })
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="date"
                        className="w-28 text-center font-bold mx-auto text-[10px]"
                        value={p.dueDate || ''}
                        onChange={(e) => updateParticipant(p.id, { dueDate: e.target.value })}
                      />
                    </TableCell>
                    <TableCell className="text-right font-black text-base text-primary pr-6">
                      R$ {calculateBaseFee(p).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const BeverageView = () => (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-md border-amber-200 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
          <CardTitle className="font-display font-black text-xl text-emerald-800 flex items-center">
            <Beer className="w-6 h-6 text-emerald-600 mr-2" />
            Módulo de Rateio: Bebidas & Chopp
          </CardTitle>
          <CardDescription>
            Divisão exata baseada nos dias de presença e adultos que bebem.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-8 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm">
            {user.isGovernance ? (
              <div className="space-y-2 flex-1 w-full md:w-auto">
                <Label className="font-bold text-emerald-900 text-base">
                  Custo Total Estimado de Bebidas (R$)
                </Label>
                <Input
                  type="number"
                  value={beverageTotal}
                  onChange={(e) => setBeverageTotal(Number(e.target.value))}
                  className="font-black text-2xl h-14 border-emerald-300 bg-white text-emerald-700"
                />
              </div>
            ) : (
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-700/60 uppercase tracking-widest mb-1">
                  Custo Total Estimado
                </p>
                <p className="text-3xl font-black text-emerald-800">
                  R$ {beverageTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            <div className="flex gap-4 w-full md:w-auto">
              <div className="bg-white p-4 rounded-xl border border-emerald-100 text-center flex-1 md:px-6 shadow-sm">
                <p className="text-xs font-bold text-emerald-600/70 uppercase mb-1">Dias Totais</p>
                <p className="text-2xl font-black text-emerald-700">{totalDrinkingDays}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-emerald-100 text-center flex-1 md:px-6 shadow-sm">
                <p className="text-xs font-bold text-emerald-600/70 uppercase mb-1">Custo / Dia</p>
                <p className="text-2xl font-black text-emerald-600">
                  R$ {beveragePerDay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-emerald-100">
            <Table>
              <TableHeader className="bg-emerald-50/50">
                <TableRow className="border-emerald-100">
                  <TableHead className="font-bold text-emerald-900 w-[200px]">Família</TableHead>
                  <TableHead className="text-center font-bold text-emerald-900">
                    Adultos (Chopp)
                  </TableHead>
                  <TableHead className="text-center font-bold text-emerald-900">Dias</TableHead>
                  <TableHead className="text-center font-bold text-emerald-900">
                    Status (Cota Única)
                  </TableHead>
                  <TableHead className="text-right font-bold text-emerald-900 pr-6">
                    Total Chopp
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((p) => (
                  <TableRow key={p.id} className="border-emerald-50 hover:bg-emerald-50/30">
                    <TableCell className="font-bold text-foreground py-4 pl-4">{p.name}</TableCell>
                    <TableCell className="text-center font-medium">
                      {p.members.filter((m) => m.isDrinking).length}
                    </TableCell>
                    <TableCell className="text-center font-medium">{p.daysAttending}</TableCell>
                    <TableCell className="text-center">
                      {user.isGovernance ? (
                        <button
                          onClick={() => toggleBeverageStatus(p.id, p.beverageStatus)}
                          className="p-2 hover:scale-110 hover:bg-emerald-100 rounded-xl transition-all"
                        >
                          {getStatusIcon(p.beverageStatus)}
                        </button>
                      ) : (
                        <div className="p-2">{getStatusIcon(p.beverageStatus)}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-black text-lg text-emerald-600 pr-6">
                      R${' '}
                      {calculateBeverageFee(p).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-display text-foreground">Finanças do Farrão</h1>
        <p className="text-foreground/60 text-base mt-1 font-medium">
          Acompanhe a arrecadação e os custos de hospedagem e bebidas.
        </p>
      </div>

      <Tabs defaultValue="transparency" className="w-full">
        <TabsList
          className={cn(
            'grid w-full mb-8 bg-white border border-amber-200 p-1 rounded-xl shadow-sm h-auto',
            user.isGovernance
              ? 'grid-cols-1 sm:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 max-w-[500px]',
          )}
        >
          <TabsTrigger
            value="transparency"
            className="rounded-lg py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white"
          >
            Visão Geral
          </TabsTrigger>
          <TabsTrigger
            value="beverage"
            className="rounded-lg py-2.5 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
          >
            Bebidas & Chopp
          </TabsTrigger>
          {user.isGovernance && (
            <TabsTrigger
              value="control"
              className="rounded-lg py-2.5 font-bold data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              Controle (Admin)
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="transparency" className="mt-0 outline-none">
          <TransparencyView />
        </TabsContent>
        <TabsContent value="beverage" className="mt-0 outline-none">
          <BeverageView />
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
