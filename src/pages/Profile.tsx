import { useState, useEffect, useCallback, useRef } from 'react'
import { Save, Camera, Users, HandPlatter, X, Plus, Calendar, CheckCircle2, RotateCw, AlertCircle, Beer, Leaf } from 'lucide-react'
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
import { ImageUploader } from '@/components/ui/image-uploader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { getInitials, cn } from '@/lib/utils'
import useAppStore, { MemberCategory, ParticipantRecord } from '@/stores/useAppStore'

export default function Profile() {
  const { user, setUser, updateParticipant } = useAppStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState({ ...user })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Use a ref to track if it's the initial mount to avoid auto-saving on first load
  const isInitialMount = useRef(true)

  const handleSave = useCallback(async (dataToSave: typeof user) => {
    setSaveStatus('saving')
    try {
      await setUser(dataToSave)
      await updateParticipant(user.id, {
        name: dataToSave.name,
        members: dataToSave.members,
        daysAttending: dataToSave.daysAttending,
        hasConfirmed: dataToSave.hasConfirmed,
      })
      
      setSaveStatus('saved')
      // Reset to idle after 3 seconds of showing 'saved'
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      setSaveStatus('error')
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as informações automaticamente.',
        variant: 'destructive',
      })
    }
  }, [user.id, setUser, updateParticipant, toast])

  // Debounced effect for auto-saving
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSave(formData)
    }, 1500) // 1.5 seconds debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formData, handleSave])

  const handleChange = (field: keyof typeof user, value: any) => {
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black font-display text-foreground tracking-tight">Minha Galera</h1>
          <p className="text-foreground/60 text-lg mt-1 font-medium italic">
            Gerencie sua tripulação para o Farrão 🥩
          </p>
        </div>
        
        {/* Status de Salvamento Inteligente */}
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-500",
          saveStatus === 'idle' && "bg-slate-50 border-slate-100 opacity-0",
          saveStatus === 'saving' && "bg-amber-50 border-amber-100 opacity-100",
          saveStatus === 'saved' && "bg-emerald-50 border-emerald-100 opacity-100",
          saveStatus === 'error' && "bg-red-50 border-red-100 opacity-100"
        )}>
          {saveStatus === 'saving' && (
            <>
              <RotateCw className="w-4 h-4 text-amber-600 animate-spin" />
              <span className="text-xs font-black text-amber-700 uppercase tracking-widest">Salvando...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Tudo Salvo!</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-black text-red-700 uppercase tracking-widest">Erro</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className={cn(
          "flex flex-row items-center justify-between rounded-[2rem] border-2 p-6 shadow-sm transition-all",
          formData.hasConfirmed 
            ? "border-emerald-500/20 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50" 
            : "border-slate-200 bg-slate-50 opacity-80"
        )}>
          <div className="space-y-1">
            <Label className={cn(
              "text-xl font-black font-display flex items-center gap-2",
              formData.hasConfirmed ? "text-emerald-700" : "text-slate-600"
            )}>
              Confirmação de Presença
              {formData.hasConfirmed && <span>🚀</span>}
            </Label>
            <p className={cn(
              "text-sm font-bold uppercase tracking-wider",
              formData.hasConfirmed ? "text-emerald-600/70" : "text-slate-400"
            )}>
              {formData.hasConfirmed 
                ? 'Vocês estão confirmados!' 
                : 'Ainda não confirmou presença.'}
            </p>
          </div>
          <Switch
            checked={formData.hasConfirmed}
            onCheckedChange={(val) => handleChange('hasConfirmed', val)}
            className="data-[state=checked]:bg-emerald-500 scale-125 mr-2"
          />
        </div>
      </div>

      <Card className="shadow-2xl border-amber-200/50 bg-white/95 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-amber-100/50 p-8">
          <CardTitle className="flex items-center space-x-3 text-2xl font-black font-display text-primary">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <span>Perfil do Titular</span>
          </CardTitle>
          <CardDescription className="text-base font-bold text-primary/60">
            Quem lidera esta família no app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-10">
          <div className="flex flex-col sm:flex-row items-center sm:space-x-10 space-y-6 sm:space-y-0">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-[6px] border-white shadow-2xl transition-transform group-hover:scale-105 duration-300">
                <AvatarImage
                  src={formData.photoUrl}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl font-black bg-primary/10 text-primary">
                  {getInitials(formData.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-4 flex flex-col items-center sm:items-start flex-1 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="name" className="font-bold text-foreground/70 ml-1">
                  Nome do Representante / Família
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="bg-white border-amber-200 h-14 text-xl font-bold px-6 rounded-2xl focus-visible:ring-primary shadow-inner"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary/30">Editável</span>
                  </div>
                </div>
              </div>
              <ImageUploader
                onUploadSuccess={(url) => handleChange('photoUrl', url)}
                storagePath={(file) => `users/${user.id}/profile_${Date.now()}_${file.name}`}
                maxSizeMB={0.5}
                maxWidthOrHeight={800}
                buttonContent={<><Camera className="w-5 h-5 mr-2" /> Alterar Foto de Perfil</>}
                buttonVariant="outline"
                buttonSize="default"
                buttonClassName="border-primary/20 hover:bg-primary/5 text-primary font-black rounded-2xl h-11 px-6 shadow-sm transition-all hover:scale-105 active:scale-95"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-2xl border-amber-200/50 bg-white/95 backdrop-blur-md rounded-[2.5rem] overflow-hidden mb-8">
        <CardHeader className="bg-secondary/5 border-b border-amber-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center p-8 gap-4">
          <div>
            <CardTitle className="flex items-center space-x-3 text-2xl font-black font-display text-secondary">
              <div className="p-2 bg-secondary/10 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <span>Membros da Galera</span>
            </CardTitle>
            <CardDescription className="text-base font-bold text-secondary/60 mt-1">
              Quem está indo com você?
            </CardDescription>
          </div>
          <Button
            onClick={addMember}
            variant="outline"
            className="border-secondary/30 text-secondary hover:bg-secondary/5 font-black rounded-2xl shadow-sm h-12 px-6 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-1" /> Novo Membro
          </Button>
        </CardHeader>
        <CardContent className="space-y-8 p-10">
          {formData.members.map((m, index) => (
            <div
              key={m.id}
              className={cn(
                "flex flex-col gap-6 p-8 border-2 rounded-[2rem] transition-all relative group",
                index === 0 ? "border-primary/20 bg-primary/[0.02]" : "border-amber-100 bg-white shadow-sm"
              )}
            >
              {index === 0 && (
                <div className="absolute -top-3 left-8 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                  Titular / Responsável
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                <div className="w-full flex-1 space-y-2">
                  <Label className="font-bold text-foreground/70 ml-1">Nome Completo</Label>
                  <Input
                    value={m.name}
                    onChange={(e) => updateMember(m.id, 'name', e.target.value)}
                    disabled={index === 0}
                    className={cn(
                      "bg-white border-amber-100 h-12 rounded-xl font-bold px-4 focus-visible:ring-primary shadow-sm",
                      index === 0 && "bg-amber-50/50 cursor-not-allowed border-dashed border-primary/20"
                    )}
                    placeholder="Ex: João da Silva"
                  />
                  {index === 0 && (
                    <p className="text-[10px] font-bold text-primary/60 ml-1 uppercase tracking-wider">
                      Sincronizado com o nome do titular acima
                    </p>
                  )}
                </div>
                <div className="w-full sm:w-56 space-y-2">
                  <Label className="font-bold text-foreground/70 ml-1">Categoria</Label>
                  <Select
                    value={m.category}
                    onValueChange={(val: MemberCategory) => updateMember(m.id, 'category', val)}
                  >
                    <SelectTrigger className="bg-white border-amber-100 h-12 rounded-xl font-bold px-4 focus:ring-primary shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-amber-100 shadow-xl">
                      <SelectItem value="adult" className="font-bold py-3 text-sm">Adulto</SelectItem>
                      <SelectItem value="child_under_10" className="font-bold py-3 text-sm">Criança (até 10)</SelectItem>
                      <SelectItem value="child_11_to_16" className="font-bold py-3 text-sm">Criança (11 a 16)</SelectItem>
                      <SelectItem value="nanny" className="font-bold py-3 text-sm">Babá / Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                   {index > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors order-last sm:order-none"
                      onClick={() => removeMember(m.id)}
                    >
                      <X className="w-6 h-6 border-2 border-red-100 rounded-full p-1" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-orange-50/30 rounded-2xl border border-amber-100/50 transition-all hover:bg-orange-50/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 rounded-xl shadow-sm">
                      <Beer className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-black text-sm text-foreground/80">Bebe Chopp?</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Custo faturado</p>
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
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Ajuste de buffet</p>
                    </div>
                  </div>
                  <Switch
                    checked={m.isVegetarian}
                    onCheckedChange={(val) => updateMember(m.id, 'isVegetarian', val)}
                    className="data-[state=checked]:bg-emerald-500 scale-110"
                  />
                </div>
              </div>

              <div className="w-full space-y-2">
                <Label className="font-bold text-foreground/70 text-xs uppercase tracking-widest ml-1">Restrições / Alergias Alimentares</Label>
                <Input
                  value={m.restrictions || ''}
                  onChange={(e) => updateMember(m.id, 'restrictions', e.target.value)}
                  className="bg-white border-amber-100 h-12 rounded-xl px-4 shadow-inner"
                  placeholder="Ex: Alergia a camarão, sem glutén..."
                />
              </div>
            </div>
          ))}
          
          {formData.members.length === 0 && (
            <div className="text-center bg-white border-2 border-dashed border-amber-100 p-12 rounded-[2rem]">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-amber-200" />
              </div>
              <p className="text-foreground/50 font-black text-lg">Nenhum membro adicionado.</p>
              <p className="text-foreground/40 text-sm mt-1 font-bold">
                Sua galera parece vazia. Adicione alguém para começar a festa!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-2xl border-emerald-200/50 bg-white/95 backdrop-blur-md rounded-[2.5rem] overflow-hidden mb-12">
        <CardHeader className="bg-emerald-500/5 border-b border-emerald-100/50 p-8">
          <CardTitle className="flex items-center space-x-3 text-2xl font-black font-display text-emerald-700">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <span>Dias de Presença</span>
          </CardTitle>
          <CardDescription className="text-base font-bold text-emerald-600/60">
            Quanto tempo pretender curtir?
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
            <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">O Farrão 2026 acontece de 20 a 24 de Dezembro</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
