import React, { useState } from 'react'
import { Users, Filter, Beer, DollarSign, Search } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { isBefore, parseISO, startOfDay } from 'date-fns'
import useAppStore, { MemberCategory, FinanceStatus } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

export default function Participants() {
  const { participants, user, eventDetails } = useAppStore()
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const confirmedParticipants = participants.filter((p) => p.hasConfirmed)
  const allMembers = confirmedParticipants.flatMap((p) =>
    p.members.map((m) => ({
      ...m,
      familyName: p.name,
      payments: p.payments,
      beverageStatus: p.beverageStatus,
    })),
  )

  const filteredMembers = allMembers.filter((m) => {
    const matchesFilter = filter === 'all' || m.category === filter
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.familyName.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const categoryLabels: Record<MemberCategory, string> = {
    adult: 'Adulto',
    child_under_10: 'Criança (<10)',
    child_11_to_16: 'Criança (11-16)',
    nanny: 'Babá/Staff',
  }

  const categoryColors: Record<MemberCategory, string> = {
    adult: 'bg-blue-100 text-blue-800 border-blue-200',
    child_under_10: 'bg-purple-100 text-purple-800 border-purple-200',
    child_11_to_16: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
    nanny: 'bg-slate-100 text-slate-800 border-slate-200',
  }

  const stats = {
    adults: allMembers.filter((m) => m.category === 'adult').length,
    kids: allMembers.filter(
      (m) => m.category === 'child_under_10' || m.category === 'child_11_to_16',
    ).length,
    nannies: allMembers.filter((m) => m.category === 'nanny').length,
    drinking: allMembers.filter((m) => m.isDrinking).length,
    total: allMembers.length,
  }

  const getStatusBadge = (status: FinanceStatus, dueDate?: string) => {
    const isLate = status === 'pending' && dueDate && isBefore(parseISO(dueDate), startOfDay(new Date()))

    if (status === 'paid')
      return (
        <span
          className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          title="Pago"
        />
      )
    if (isLate || status === 'late')
      return <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" title="Atrasado" />
    
    return <span className="w-3 h-3 rounded-full bg-amber-400" title="Pendente" />
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-display text-foreground flex items-center">
          <Users className="w-8 h-8 mr-3 text-primary" /> A Lista
        </h1>
        <p className="text-foreground/60 text-base mt-2 font-medium">
          Diretório completo de todos os convidados confirmados para o Farrão.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-primary font-display">{stats.total}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary/60 mt-1">
              Pessoas
            </span>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-blue-600 font-display">{stats.adults}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600/60 mt-1">
              Adultos
            </span>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-emerald-600 font-display">
              {stats.drinking}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600/60 mt-1">
              Chopp
            </span>
          </CardContent>
        </Card>
        <Card className="bg-purple-50/50 border-purple-100 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-purple-600 font-display">{stats.kids}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600/60 mt-1">
              Crianças
            </span>
          </CardContent>
        </Card>
        <Card className="bg-slate-50/50 border-slate-100 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-slate-600 font-display">{stats.nannies}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600/60 mt-1">
              Staff/Babás
            </span>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-amber-200 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-orange-50/50 border-b border-amber-100 p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <Input
              placeholder="Buscar por nome ou família..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-amber-200"
            />
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-primary" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-white border-amber-200">
                <SelectValue placeholder="Filtrar categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="adult">Adultos</SelectItem>
                <SelectItem value="child_under_10">Crianças (&lt;10)</SelectItem>
                <SelectItem value="child_11_to_16">Crianças (11-16)</SelectItem>
                <SelectItem value="nanny">Staff / Babás</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-white">
              <TableRow className="border-amber-100">
                <TableHead className="font-bold text-foreground">Nome Completo</TableHead>
                <TableHead className="font-bold text-foreground">Família Representante</TableHead>
                <TableHead className="font-bold text-foreground">Categoria</TableHead>
                <TableHead className="text-center font-bold text-foreground">
                  Pacote Bebida
                </TableHead>
                {user.isGovernance && (
                  <TableHead className="text-center font-bold text-foreground">
                    <span className="flex items-center justify-center gap-1">
                      <DollarSign className="w-4 h-4 text-red-500" />
                      Status (Família)
                    </span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={user.isGovernance ? 5 : 4}
                    className="h-32 text-center text-foreground/50 font-medium"
                  >
                    Nenhum participante encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((m, i) => (
                  <TableRow
                    key={`${m.id}-${i}`}
                    className="border-amber-50 hover:bg-orange-50/30 transition-colors"
                  >
                    <TableCell className="font-bold text-foreground py-4">
                      {m.name || 'Sem nome'}
                    </TableCell>
                    <TableCell className="text-foreground/70 font-medium">{m.familyName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'uppercase text-[10px] font-black border tracking-wider',
                          categoryColors[m.category],
                        )}
                      >
                        {categoryLabels[m.category]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {m.isDrinking && m.category === 'adult' ? (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        >
                          <Beer className="w-3 h-3 mr-1" /> Chopp
                        </Badge>
                      ) : (
                        <span className="text-foreground/30 text-sm font-medium">-</span>
                      )}
                    </TableCell>
                    {user.isGovernance && (
                      <TableCell>
                        <div className="flex justify-center items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg py-1.5 px-2 w-fit mx-auto shadow-inner min-w-[60px]">
                          {eventDetails.installments.map((inst) => (
                            <React.Fragment key={inst.id}>
                              {getStatusBadge(m.payments[inst.id] || 'pending', inst.dueDate)}
                            </React.Fragment>
                          ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
