import { useState } from 'react'
import { Save } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'

export default function Profile() {
  const { user, setUser } = useAppStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState(user)

  const handleChange = (field: keyof typeof user, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Identificação</CardTitle>
          <CardDescription>Como você será identificado no grupo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Crianças</Label>
              <p className="text-xs text-slate-500">Até 11 anos (pagam meia)</p>
            </div>
            <Input
              type="number"
              min={0}
              className="w-24 text-center"
              value={formData.children}
              onChange={(e) => handleChange('children', parseInt(e.target.value) || 0)}
            />
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
            className="w-full sm:w-auto px-8 transition-transform active:scale-95"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
