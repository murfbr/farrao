import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Users, X, Plus, Calendar, Beer, Leaf } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import useAppStore, { MemberCategory, FamilyMember } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

export default function RegisterProfile() {
  const { user, setUser, updateParticipant } = useAppStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: user.name || '',
    members: user.members.length > 0 ? user.members : [
      {
        id: Math.random().toString(36).substr(2, 9),
        name: user.name || '',
        category: 'adult' as MemberCategory,
        isDrinking: true,
        isVegetarian: false,
        restrictions: '',
      }
    ],
    daysAttending: 3, // Padrão 3 dias conforme solicitado
  })

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }
      
      // Sincroniza o nome principal com o primeiro membro (o titular)
      if (field === 'name' && prev.members.length > 0) {
        newData.members = prev.members.map((m, idx) => 
          idx === 0 ? { ...m, name: value } : m
        )
      }
      
      return newData
    })
  }

  const addMember = () => {
    setFormData((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: '',
          category: 'adult',
          isDrinking: true,
          isVegetarian: false,
          restrictions: '',
        },
      ],
    }))
  }

  const updateMember = (id: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    }))
  }

  const removeMember = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Ops!', description: 'O seu nome é obrigatório.', variant: 'destructive' })
      return
    }

    if (formData.members.some(m => !m.name.trim())) {
      toast({ title: 'Ops!', description: 'Todos os membros da galera precisam de um nome.', variant: 'destructive' })
      return
    }

    try {
      const updatedProfile = {
        ...user,
        name: formData.name,
        members: formData.members,
        daysAttending: formData.daysAttending,
        profileCompleted: true,
        eventIds: ['farrao-2026'],
      }

      await setUser(updatedProfile)
      await updateParticipant(user.id, {
        name: formData.name,
        members: formData.members,
        daysAttending: formData.daysAttending,
        groupIds: [],
      })

      toast({
        title: 'Perfil Completado! 🎉',
        description: 'Tudo pronto para o Farrão 2026. Aproveite!',
      })
      navigate('/')
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não conseguimos salvar seu perfil. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-2 animate-fade-in text-center mb-10">
        <div className="inline-block p-3 bg-white rounded-2xl shadow-sm mb-4 border border-amber-100">
          <span className="text-4xl">🥩</span>
        </div>
        <h1 className="text-4xl font-black font-display text-primary tracking-tight md:text-5xl">
          Quase lá no Farrão!
        </h1>
        <p className="text-foreground/70 text-lg font-medium max-w-md mx-auto">
          Só precisamos alinhar quem vem com você e os detalhes da sua galera.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="shadow-2xl border-amber-200/50 bg-white/95 backdrop-blur-md rounded-[2.5rem] overflow-hidden transition-all hover:shadow-primary/5">
          <CardHeader className="bg-primary/5 border-b border-amber-100/50 pb-8 pt-10">
            <CardTitle className="text-2xl font-black font-display text-primary flex items-center justify-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Users className="w-6 h-6 text-primary" />
              </div>
              Seu Perfil Principal
            </CardTitle>
            <CardDescription className="text-center font-bold text-base text-primary/60">
              Nome que aparecerá na sua família
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-10 px-8 pb-10">
            <div className="space-y-3">
              <Label htmlFor="main-name" className="font-bold text-lg text-foreground/80 ml-1">
                Nome da Família / Titular *
              </Label>
              <div className="relative group">
                <Input
                  id="main-name"
                  value={formData.name === 'Convidado' ? '' : formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ex: Família Silva ou João Silva"
                  className="bg-white border-amber-200 h-14 text-xl focus-visible:ring-primary rounded-2xl px-6 font-bold shadow-inner transition-all group-hover:border-primary/30"
                />
                {formData.name && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-widest text-primary/40 bg-primary/5 px-2 py-1 rounded-md">
                    Titular
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-muted-foreground ml-1">
                Isso também atualizará seu nome na lista da sua galera abaixo.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-amber-200/50 bg-white/95 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-secondary/5 border-b border-amber-100/50 flex flex-col sm:flex-row justify-between items-center gap-4 py-8 px-8">
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl font-black font-display text-secondary flex items-center justify-center sm:justify-start gap-3">
                <div className="p-2 bg-secondary/10 rounded-xl">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                Sua Galera *
              </CardTitle>
              <CardDescription className="font-bold text-secondary/60">
                Adicione todos os membros que vão com você
              </CardDescription>
            </div>
            <Button
              onClick={addMember}
              variant="outline"
              className="border-secondary/30 text-secondary hover:bg-secondary/5 font-black rounded-2xl shadow-sm h-12 px-6 hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5 mr-2" /> Adicionar Pessoa
            </Button>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            {formData.members.map((m, index) => (
              <div
                key={m.id}
                className={cn(
                  "p-8 bg-white border-2 rounded-[2rem] space-y-6 shadow-sm relative transition-all group",
                  index === 0 ? "border-primary/20 bg-primary/[0.02]" : "border-amber-100"
                )}
              >
                {index === 0 && (
                  <div className="absolute -top-3 left-6 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                    Titular / Responsável
                  </div>
                )}
                
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                    onClick={() => removeMember(m.id)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-foreground/70 ml-1">Nome Completo *</Label>
                    <Input
                      value={m.name}
                      onChange={(e) => updateMember(m.id, 'name', e.target.value)}
                      placeholder="Nome do integrante"
                      disabled={index === 0}
                      className={cn(
                        "border-amber-100 focus-visible:ring-primary rounded-xl h-12 font-bold px-4 transition-all",
                        index === 0 && "bg-amber-50/50 cursor-not-allowed border-dashed border-primary/20"
                      )}
                    />
                    {index === 0 && (
                      <p className="text-[10px] font-bold text-primary/60 ml-1 uppercase tracking-wider">
                        Sincronizado com o nome principal acima
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-foreground/70 ml-1">Categoria *</Label>
                    <Select
                      value={m.category}
                      onValueChange={(val: MemberCategory) => updateMember(m.id, 'category', val)}
                    >
                      <SelectTrigger className="border-amber-100 h-12 rounded-xl bg-white font-bold px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-amber-100 shadow-xl">
                        <SelectItem value="adult" className="font-bold py-3">Adulto</SelectItem>
                        <SelectItem value="child_under_10" className="font-bold py-3">Criança (até 10 anos)</SelectItem>
                        <SelectItem value="child_11_to_16" className="font-bold py-3">Criança (11 a 16 anos)</SelectItem>
                        <SelectItem value="nanny" className="font-bold py-3">Babá / Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="flex items-center justify-between p-4 bg-orange-50/30 rounded-2xl border border-amber-100/50 transition-all hover:bg-orange-50/50">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-100 rounded-xl shadow-sm">
                        <Beer className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-foreground/80">Bebe Chopp?</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Valor fixo por pessoa</p>
                      </div>
                    </div>
                    <Switch
                      checked={m.isDrinking}
                      onCheckedChange={(val) => updateMember(m.id, 'isDrinking', val)}
                      disabled={m.category !== 'adult'}
                      className="data-[state=checked]:bg-amber-500 scale-110"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 transition-all hover:bg-emerald-50/50">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 rounded-xl shadow-sm">
                        <Leaf className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-foreground/80">Vegetariano?</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Ajuste de cardápio</p>
                      </div>
                    </div>
                    <Switch
                      checked={m.isVegetarian}
                      onCheckedChange={(val) => updateMember(m.id, 'isVegetarian', val)}
                      className="data-[state=checked]:bg-emerald-500 scale-110"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-foreground/70 ml-1">Restrições Alimentares / Alergias</Label>
                  <Input
                    value={m.restrictions}
                    onChange={(e) => updateMember(m.id, 'restrictions', e.target.value)}
                    placeholder="Ex: Alergia a amendoim, sem glúten..."
                    className="border-amber-100 focus-visible:ring-primary rounded-xl h-12 px-4 shadow-sm"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-emerald-200/50 bg-white/95 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-emerald-500/5 border-b border-emerald-100/50 py-8 px-8">
            <CardTitle className="text-2xl font-black font-display text-emerald-700 flex items-center justify-center sm:justify-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              Dias de Presença
            </CardTitle>
            <CardDescription className="font-bold text-emerald-600/60 text-center sm:text-left">
              Quantos dias vocês estarão na festa?
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10">
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-10">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="w-16 h-16 rounded-3xl border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50 font-black text-2xl shadow-sm transition-all active:scale-90"
                  onClick={() => handleChange('daysAttending', Math.max(1, formData.daysAttending - 1))}
                >
                  -
                </Button>
                <div className="flex flex-col items-center">
                  <div className="text-7xl font-black text-emerald-700 font-display min-w-[80px] text-center drop-shadow-sm">
                    {formData.daysAttending}
                  </div>
                  <p className="font-black text-emerald-600/40 uppercase tracking-[0.2em] text-[10px] mt-1">Dias</p>
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="w-16 h-16 rounded-3xl border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50 font-black text-2xl shadow-sm transition-all active:scale-90"
                  onClick={() => handleChange('daysAttending', Math.min(5, formData.daysAttending + 1))}
                >
                  +
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="pt-4 pb-12">
          <Button
            onClick={handleSave}
            className="w-full h-20 text-2xl font-black rounded-[2rem] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 bg-primary hover:bg-primary/90 flex items-center justify-center group"
          >
            <Save className="w-8 h-8 mr-4 transition-transform group-hover:rotate-12" />
            Concluir meu Perfil 🎉
          </Button>
          <p className="text-center text-sm font-bold text-muted-foreground mt-6 uppercase tracking-widest opacity-50">
            Farrão 2026 • Diversão em Família
          </p>
        </div>
      </div>
    </div>
  )
}
