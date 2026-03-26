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
    setFormData((prev) => ({ ...prev, [field]: value }))
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
      }

      await setUser(updatedProfile)
      await updateParticipant(user.id, {
        name: formData.name,
        members: formData.members,
        daysAttending: formData.daysAttending,
      })

      toast({
        title: 'Perfil Completado! 🎉',
        description: 'Tudo pronto para o Farrão 2026.',
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in text-center mb-8">
        <h1 className="text-4xl font-black font-display text-primary tracking-tight">Bem-vindo ao Farrão! 🥩</h1>
        <p className="text-foreground/70 text-lg font-medium">
          Para começar, precisamos conhecer você e sua galera.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="shadow-xl border-amber-200 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-amber-100 pb-6">
            <CardTitle className="text-2xl font-black font-display text-primary flex items-center justify-center gap-2">
              Seu Perfil
            </CardTitle>
            <CardDescription className="text-center font-medium">
              Como devemos te chamar no app?
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 px-8">
            <div className="space-y-2 text-left">
              <Label htmlFor="main-name" className="font-bold text-lg">Seu Nome *</Label>
              <Input
                id="main-name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: João Silva"
                className="bg-white border-amber-200 h-12 text-lg focus-visible:ring-primary rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-amber-200 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-secondary/5 border-b border-amber-100 flex flex-col sm:flex-row justify-between items-center gap-4 py-6 px-8">
            <div className="text-center sm:text-left">
              <CardTitle className="text-2xl font-black font-display text-secondary flex items-center justify-center sm:justify-start gap-2">
                <Users className="w-6 h-6" />
                Sua Galera *
              </CardTitle>
              <CardDescription className="font-medium">
                Adicione todos os membros que vão com você.
              </CardDescription>
            </div>
            <Button
              onClick={addMember}
              variant="outline"
              className="border-secondary text-secondary hover:bg-secondary/5 font-bold rounded-xl shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar Pessoa
            </Button>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            {formData.members.map((m, index) => (
              <div
                key={m.id}
                className="p-6 bg-white border-2 border-amber-100 rounded-2xl space-y-6 shadow-sm relative"
              >
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 rounded-full"
                    onClick={() => removeMember(m.id)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Nome Completo *</Label>
                    <Input
                      value={m.name}
                      onChange={(e) => updateMember(m.id, 'name', e.target.value)}
                      placeholder="Nome do membro"
                      className="border-amber-100 focus-visible:ring-primary rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Categoria *</Label>
                    <Select
                      value={m.category}
                      onValueChange={(val: MemberCategory) => updateMember(m.id, 'category', val)}
                    >
                      <SelectTrigger className="border-amber-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adult">Adulto</SelectItem>
                        <SelectItem value="child_under_10">Criança (até 10 anos)</SelectItem>
                        <SelectItem value="child_11_to_16">Criança (11 a 16 anos)</SelectItem>
                        <SelectItem value="nanny">Babá / Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-3 bg-orange-50/50 rounded-xl border border-amber-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Beer className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Bebe Chopp?</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Pode ser alterado depois</p>
                      </div>
                    </div>
                    <Switch
                      checked={m.isDrinking}
                      onCheckedChange={(val) => updateMember(m.id, 'isDrinking', val)}
                      disabled={m.category !== 'adult'}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Leaf className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Vegetariano?</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Pode ser alterado depois</p>
                      </div>
                    </div>
                    <Switch
                      checked={m.isVegetarian}
                      onCheckedChange={(val) => updateMember(m.id, 'isVegetarian', val)}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Restrições Alimentares / Alergias</Label>
                  <Input
                    value={m.restrictions}
                    onChange={(e) => updateMember(m.id, 'restrictions', e.target.value)}
                    placeholder="Ex: Alergia a amendoim, sem glúten..."
                    className="border-amber-100 focus-visible:ring-primary rounded-lg"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-xl border-amber-200 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-emerald-50 border-b border-emerald-100 py-6 px-8">
            <CardTitle className="text-2xl font-black font-display text-emerald-700 flex items-center justify-center sm:justify-start gap-2">
              <Calendar className="w-6 h-6" />
              Dias de Presença
            </CardTitle>
            <CardDescription className="font-medium text-emerald-600/80 text-center sm:text-left">
              Quantos dias vocês estarão na festa?
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-6">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="w-12 h-12 rounded-full border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold text-xl"
                  onClick={() => handleChange('daysAttending', Math.max(1, formData.daysAttending - 1))}
                >
                  -
                </Button>
                <div className="text-5xl font-black text-emerald-700 font-display min-w-[60px] text-center">
                  {formData.daysAttending}
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="w-12 h-12 rounded-full border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold text-xl"
                  onClick={() => handleChange('daysAttending', Math.min(5, formData.daysAttending + 1))}
                >
                  +
                </Button>
              </div>
              <p className="font-bold text-emerald-600/60 uppercase tracking-widest text-sm">Dias confirmados</p>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          className="w-full h-16 text-xl font-black rounded-3xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 bg-primary hover:bg-primary/90 mt-4"
        >
          <Save className="w-6 h-6 mr-3" />
          Concluir Cadastro e Entrar 🎉
        </Button>
      </div>
    </div>
  )
}
