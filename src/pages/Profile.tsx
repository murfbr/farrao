import { useState, useRef } from 'react'
import { Save, Camera, Users, Baby, HandPlatter, Beer, X, Plus } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'

export default function Profile() {
  const { user, setUser } = useAppStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({ ...user })

  const handleChange = (field: keyof typeof user, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleHouseholdNameChange = (index: number, val: string) => {
    const newNames = [...formData.householdNames]
    newNames[index] = val
    handleChange('householdNames', newNames)
  }

  const addHouseholdName = () => {
    handleChange('householdNames', [...formData.householdNames, ''])
  }

  const removeHouseholdName = (index: number) => {
    handleChange(
      'householdNames',
      formData.householdNames.filter((_, i) => i !== index),
    )
  }

  const handleChildrenChange = (count: number) => {
    const validCount = Math.max(0, count)
    setFormData((prev) => {
      let newAges = [...prev.childrenAges]
      if (validCount > newAges.length) {
        newAges = [...newAges, ...Array(validCount - newAges.length).fill(0)]
      } else if (validCount < newAges.length) {
        newAges = newAges.slice(0, validCount)
      }
      return { ...prev, children: validCount, childrenAges: newAges }
    })
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
      title: 'Família atualizada! 🎉',
      description: 'As informações do seu bonde foram salvas com sucesso.',
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-display text-foreground">Minha Família</h1>
        <p className="text-foreground/60 text-base mt-1 font-medium">
          Gerencie as informações da sua turma para a festança do Farrão.
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
            Quem é o cabeça desta família?
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

      <Card className="shadow-sm border-amber-100 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-orange-50/50 border-b border-amber-100">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Users className="w-5 h-5 text-secondary" />
            <span>Nomes do Bonde</span>
          </CardTitle>
          <CardDescription className="text-sm font-medium">
            Quem exatamente está indo com você?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {formData.householdNames.map((name, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => handleHouseholdNameChange(i, e.target.value)}
                placeholder={`Pessoa ${i + 1}`}
                className="bg-white border-amber-200"
              />
              {formData.householdNames.length > 1 && (
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeHouseholdName(i)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            onClick={addHouseholdName}
            className="w-full border-dashed border-primary/40 text-primary hover:bg-primary/5"
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar Pessoa
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-amber-100 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-orange-50/50 border-b border-amber-100">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Beer className="w-5 h-5 text-emerald-600" />
            <span>Logística & Chopp</span>
          </CardTitle>
          <CardDescription className="text-sm font-medium">
            Configure os dias e o rateio da bebida.
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
          <Separator className="bg-amber-100" />
          <div className="space-y-2">
            <Label className="text-base font-bold">Quantos adultos vão no Chopp/Álcool?</Label>
            <Input
              type="number"
              min={0}
              max={formData.adults}
              value={formData.drinkingAdults}
              onChange={(e) => handleChange('drinkingAdults', Number(e.target.value))}
              className="w-32 font-bold text-lg border-amber-200 bg-white"
            />
            <p className="text-xs text-foreground/50 font-semibold">
              Isso será usado para dividir o custo exato das bebidas.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-amber-100 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-orange-50/50 border-b border-amber-100">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Baby className="w-5 h-5 text-secondary" />
            <span>Composição por Idade</span>
          </CardTitle>
          <CardDescription className="text-sm font-medium">
            Necessário para o cálculo dos valores (Crianças têm desconto).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-100">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-foreground">Adultos</Label>
              <p className="text-xs font-semibold text-foreground/50">Incluindo você (17+ anos)</p>
            </div>
            <Input
              type="number"
              min={1}
              className="w-20 text-center font-bold text-lg border-amber-200 focus-visible:ring-primary"
              value={formData.adults}
              onChange={(e) => handleChange('adults', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="flex flex-col space-y-4 p-3 bg-white rounded-xl border border-amber-100">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-bold text-foreground">Crianças</Label>
                <p className="text-xs font-semibold text-foreground/50">Até 16 anos</p>
              </div>
              <Input
                type="number"
                min={0}
                className="w-20 text-center font-bold text-lg border-amber-200 focus-visible:ring-primary"
                value={formData.children}
                onChange={(e) => handleChildrenChange(parseInt(e.target.value) || 0)}
              />
            </div>

            {formData.children > 0 && (
              <div className="space-y-3 pt-3 border-t border-amber-100">
                <Label className="text-sm font-bold text-secondary">Idade das Crianças</Label>
                <div className="flex flex-wrap gap-4">
                  {formData.childrenAges.map((age, i) => (
                    <div
                      key={i}
                      className="flex flex-col space-y-1.5 bg-green-50 p-2 rounded-lg border border-green-100"
                    >
                      <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest text-center">
                        Cr. {i + 1}
                      </span>
                      <Input
                        type="number"
                        min={0}
                        max={16}
                        className="w-16 h-8 text-center bg-white border-green-200 font-bold"
                        value={age}
                        onChange={(e) => {
                          const newAges = [...formData.childrenAges]
                          newAges[i] = parseInt(e.target.value) || 0
                          handleChange('childrenAges', newAges)
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-100">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-foreground">Babás / Acompanhantes</Label>
              <p className="text-xs font-semibold text-foreground/50">Staff extra da família</p>
            </div>
            <Input
              type="number"
              min={0}
              className="w-20 text-center font-bold text-lg border-amber-200 focus-visible:ring-primary"
              value={formData.nannies}
              onChange={(e) => handleChange('nannies', parseInt(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-amber-100 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden mb-12">
        <CardHeader className="bg-orange-50/50 border-b border-amber-100">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <HandPlatter className="w-5 h-5 text-accent" />
            <span>Comida & Dieta</span>
          </CardTitle>
          <CardDescription className="text-sm font-medium">
            Pra ninguém passar vontade no churras
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-row items-center justify-between rounded-xl border border-amber-200 p-4 bg-white">
            <div className="space-y-1">
              <Label className="text-base font-bold">Alguém é Vegetariano/Vegano?</Label>
              <p className="text-sm text-foreground/60 font-medium">Garante os legumes na brasa!</p>
            </div>
            <Switch
              checked={formData.vegetarian}
              onCheckedChange={(val) => handleChange('vegetarian', val)}
              className="data-[state=checked]:bg-secondary"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="restrictions" className="font-bold text-base">
              Outras restrições ou alergias?
            </Label>
            <Textarea
              id="restrictions"
              placeholder="Ex: Alergia a camarão, intolerância a lactose..."
              value={formData.restrictions}
              onChange={(e) => handleChange('restrictions', e.target.value)}
              className="resize-none h-28 bg-white border-amber-200 focus-visible:ring-primary text-base p-4"
            />
          </div>
        </CardContent>
        <CardFooter className="bg-gradient-to-r from-orange-50 to-amber-50 py-5 border-t border-amber-100 flex justify-end">
          <Button
            onClick={handleSave}
            size="lg"
            className="w-full sm:w-auto px-10 transition-transform hover:scale-105 active:scale-95 shadow-md font-bold text-base rounded-xl"
          >
            <Save className="w-5 h-5 mr-2" />
            Salvar Minha Turma
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
