import { useState, useRef } from 'react'
import { Save, Camera } from 'lucide-react'
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
      title: 'Perfil atualizado!',
      description: 'Suas informações foram salvas com sucesso.',
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Seu Perfil</h1>
        <p className="text-slate-500 text-sm">
          Gerencie as informações da sua família para a viagem.
        </p>
      </div>

      {/* Permissions Mode Toggle */}
      <div className="flex flex-row items-center justify-between rounded-lg border p-4 bg-primary/5 border-primary/20 shadow-sm">
        <div className="space-y-0.5">
          <Label className="text-base font-semibold text-primary">Modo Governança</Label>
          <p className="text-sm text-primary/80">
            Habilita permissões especiais de organização (Apenas para testes).
          </p>
        </div>
        <Switch
          checked={formData.isGovernance}
          onCheckedChange={(val) => handleChange('isGovernance', val)}
        />
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Identificação</CardTitle>
          <CardDescription>Como você será identificado no grupo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <Avatar className="w-20 h-20 border-2 border-slate-100 shadow-sm">
              <AvatarImage
                src={
                  formData.photoUrl ||
                  `https://img.usecurling.com/ppl/thumbnail?seed=${formData.name}`
                }
              />
              <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-4 h-4 mr-2" /> Alterar Foto
              </Button>
              <p className="text-xs text-slate-500">JPG, PNG ou GIF. Max 5MB.</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Composição do Grupo</CardTitle>
          <CardDescription>
            Quantas pessoas vão com você? (Isto afeta o rateio das despesas)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Adultos (12+ anos)</Label>
              <p className="text-xs text-slate-500">Incluindo você</p>
            </div>
            <Input
              type="number"
              min={1}
              className="w-24 text-center"
              value={formData.adults}
              onChange={(e) => handleChange('adults', parseInt(e.target.value) || 0)}
            />
          </div>
          <Separator />

          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Crianças</Label>
                <p className="text-xs text-slate-500">Até 11 anos</p>
              </div>
              <Input
                type="number"
                min={0}
                className="w-24 text-center"
                value={formData.children}
                onChange={(e) => handleChildrenChange(parseInt(e.target.value) || 0)}
              />
            </div>

            {formData.children > 0 && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <Label className="text-sm font-semibold">Idade das Crianças</Label>
                <div className="flex flex-wrap gap-3">
                  {formData.childrenAges.map((age, i) => (
                    <div key={i} className="flex flex-col space-y-1">
                      <span className="text-xs text-slate-500">Criança {i + 1}</span>
                      <Input
                        type="number"
                        min={0}
                        className="w-20 text-center bg-white"
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

          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Babás / Acompanhantes</Label>
              <p className="text-xs text-slate-500">Staff extra</p>
            </div>
            <Input
              type="number"
              min={0}
              className="w-24 text-center"
              value={formData.nannies}
              onChange={(e) => handleChange('nannies', parseInt(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Restrições e Preferências</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Alguém é Vegetariano?</Label>
              <p className="text-sm text-slate-500">Ajudará na compra do churrasco</p>
            </div>
            <Switch
              checked={formData.vegetarian}
              onCheckedChange={(val) => handleChange('vegetarian', val)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restrictions">Outras restrições ou alergias?</Label>
            <Textarea
              id="restrictions"
              placeholder="Ex: Alergia a camarão, intolerância a lactose..."
              value={formData.restrictions}
              onChange={(e) => handleChange('restrictions', e.target.value)}
              className="resize-none h-24"
            />
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 py-4 mt-4 border-t rounded-b-xl flex justify-end">
          <Button
            onClick={handleSave}
            className="w-full sm:w-auto px-8 transition-transform active:scale-95 shadow-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
