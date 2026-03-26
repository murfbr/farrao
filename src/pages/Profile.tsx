import { useState, useRef } from 'react'
import { Save, Camera, Users, HandPlatter, X, Plus, Calendar } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import useAppStore, { MemberCategory } from '@/stores/useAppStore'

export default function Profile() {
  const { user, setUser } = useAppStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({ ...user })

  const handleChange = (field: keyof typeof user, value: any) => {
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
          isDrinking: false,
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0])
      handleChange('photoUrl', url)
    }
  }

  const handleSave = () => {
    setUser(formData)
    toast({
      title: 'Galera atualizada! 🎉',
      description: 'As informações da sua galera foram salvas com sucesso.',
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-display text-foreground">Minha Galera</h1>
        <p className="text-foreground/60 text-base mt-1 font-medium">
          Gerencie as informações da sua galera para a festança do Farrão.
        </p>
      </div>

      <div className="flex flex-row items-center justify-between rounded-2xl border-2 border-primary/20 p-5 bg-gradient-to-r from-orange-50 to-amber-50 shadow-sm">
        <div className="space-y-1">
          <Label className="text-lg font-bold font-display text-primary flex items-center">
            Modo Organização (Governança)
          </Label>
          <p className="text-sm font-medium text-foreground/70">
            Acesso VIP para gerenciar finanças e enquetes do evento.
          </p>
        </div>
        <Switch
          checked={formData.isGovernance}
          onCheckedChange={(val) => handleChange('isGovernance', val)}
          className="data-[state=checked]:bg-primary"
        />
      </div>

      <Card className="shadow-sm border-amber-100 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-orange-50/50 border-b border-amber-100">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Users className="w-5 h-5 text-primary" />
            <span>Perfil do Representante</span>
          </CardTitle>
          <CardDescription className="text-sm font-medium">
            Quem é o cabeça desta galera?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:space-x-8 space-y-4 sm:space-y-0">
            <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
              <AvatarImage
                src={
                  formData.photoUrl ||
                  `https://img.usecurling.com/ppl/thumbnail?seed=${formData.name}`
                }
                className="object-cover"
              />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {formData.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-3 flex flex-col items-center sm:items-start text-center sm:text-left">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="border-primary/20 hover:bg-primary/5 text-primary font-bold"
              >
                <Camera className="w-4 h-4 mr-2" /> Escolher Foto Top
              </Button>
              <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
                JPG, PNG. Max 5MB.
              </p>
            </div>
          </div>

          <Separator className="bg-amber-100" />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold">
                Nome do Representante
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="bg-white border-amber-200 focus-visible:ring-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-amber-100 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden mb-8">
        <CardHeader className="bg-orange-50/50 border-b border-amber-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <Users className="w-5 h-5 text-secondary" />
              <span>Membros da Galera</span>
            </CardTitle>
            <CardDescription className="text-sm font-medium mt-1">
              Quem exatamente está indo com você? Adicione o nome e idade/tipo.
            </CardDescription>
          </div>
          <Button
            onClick={addMember}
            size="sm"
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5 font-bold shrink-0 shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Membro
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {formData.members.map((m) => (
            <div
              key={m.id}
              className="flex flex-col gap-4 p-4 bg-orange-50/30 border border-amber-200 rounded-xl transition-all hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <div className="w-full flex-1 space-y-2">
                  <Label className="font-bold text-foreground">Nome Completo</Label>
                  <Input
                    value={m.name}
                    onChange={(e) => updateMember(m.id, 'name', e.target.value)}
                    className="bg-white border-amber-200 focus-visible:ring-primary"
                    placeholder="Ex: João da Silva"
                  />
                </div>
                <div className="w-full sm:w-48 space-y-2">
                  <Label className="font-bold text-foreground">Categoria</Label>
                  <Select
                    value={m.category}
                    onValueChange={(val: MemberCategory) => updateMember(m.id, 'category', val)}
                  >
                    <SelectTrigger className="bg-white border-amber-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adult">Adulto</SelectItem>
                      <SelectItem value="child_under_10">Criança (até 10)</SelectItem>
                      <SelectItem value="child_11_to_16">Criança (11 a 16)</SelectItem>
                      <SelectItem value="nanny">Babá / Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                  {m.category === 'adult' ? (
                    <div className="flex flex-col items-center space-y-2">
                      <Label className="font-bold text-foreground text-[10px] uppercase tracking-wider text-center">
                        Bebe Chopp?
                      </Label>
                      <Switch
                        checked={m.isDrinking}
                        onCheckedChange={(val) => updateMember(m.id, 'isDrinking', val)}
                        className="data-[state=checked]:bg-emerald-500 scale-[0.85]"
                      />
                    </div>
                  ) : (
                    <div className="w-[66px]" />
                  )}
                  <div className="flex flex-col items-center space-y-2">
                    <Label className="font-bold text-foreground text-[10px] uppercase tracking-wider text-center">
                      Vegetariano?
                    </Label>
                    <Switch
                      checked={m.isVegetarian}
                      onCheckedChange={(val) => updateMember(m.id, 'isVegetarian', val)}
                      className="data-[state=checked]:bg-secondary scale-[0.85]"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-4 sm:mt-0 rounded-xl shrink-0"
                    onClick={() => removeMember(m.id)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="w-full space-y-2">
                <Label className="font-bold text-foreground text-xs uppercase tracking-wider">Restrições / Alergias Alimentares</Label>
                <Input
                  value={m.restrictions || ''}
                  onChange={(e) => updateMember(m.id, 'restrictions', e.target.value)}
                  className="bg-white border-amber-200 focus-visible:ring-primary"
                  placeholder="Ex: Alergia a camarão, sem glutén..."
                />
              </div>
            </div>
          ))}
          {formData.members.length === 0 && (
            <div className="text-center bg-white border border-dashed border-amber-200 p-8 rounded-xl">
              <p className="text-foreground/50 font-bold">Nenhum membro adicionado.</p>
              <p className="text-foreground/40 text-sm mt-1">
                Adicione você e sua galera para continuar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-amber-100 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-orange-50/50 border-b border-amber-100">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>Dias de Presença</span>
          </CardTitle>
          <CardDescription className="text-sm font-medium">
            Configure os dias que vão curtir a festa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label className="text-base font-bold">Quantos dias vão participar?</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={formData.daysAttending}
              onChange={(e) => handleChange('daysAttending', Number(e.target.value))}
              className="w-32 font-bold text-lg border-amber-200 bg-white"
            />
            <p className="text-xs text-foreground/50 font-semibold">
              O Farrão oficial dura até 5 dias (20 a 24 de Dezembro).
            </p>
          </div>
        </CardContent>
      </Card>


      <Card className="shadow-sm border-amber-100 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden mb-12">
        <CardFooter className="bg-gradient-to-r from-orange-50 to-amber-50 py-5 border-t border-amber-100 flex justify-center">
          <Button
            onClick={handleSave}
            size="lg"
            className="w-full sm:w-auto px-10 transition-transform hover:scale-105 active:scale-95 shadow-md font-bold text-base rounded-xl"
          >
            <Save className="w-5 h-5 mr-2" />
            Salvar Minha Galera
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
