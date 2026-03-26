import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck, MailPlus, Trash2, KeyRound } from 'lucide-react'
import { addAllowedEmail, getAllowedEmails, removeAllowedEmail } from '@/firebase/services'
import useAppStore from '@/stores/useAppStore'
import { Navigate } from 'react-router-dom'

export default function AdminInvites() {
  const { user } = useAppStore()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user.isGovernance) return
    const unsub = getAllowedEmails((data) => setList(data))
    return () => unsub()
  }, [user.isGovernance])

  if (!user.isGovernance) {
    return <Navigate to="/" />
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await addAllowedEmail(email.toLowerCase())
      setEmail('')
      toast({ title: 'Sucesso', description: 'Email incluído na lista VIP!' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (emailId: string) => {
    if (!window.confirm('Tem certeza? Isso vai derrubar o acesso da pessoa imediatamente.')) return
    try {
      await removeAllowedEmail(emailId)
      toast({ title: 'Removido', description: 'Acesso revogado.', variant: 'destructive' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black font-display text-foreground flex items-center gap-3">
          <KeyRound className="w-8 h-8 text-primary" />
          Convites do Evento
        </h1>
        <p className="text-foreground/60 text-base mt-2 font-medium">
          Apenas emails cadastrados aqui poderão criar conta e acessar os dados da festa. Esta é a barreira anti-penetra.
        </p>
      </div>

      <Card className="shadow-sm border-amber-100 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-orange-50/50 border-b border-amber-100">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <MailPlus className="w-5 h-5 text-primary" />
            <span>Adicionar Convidado</span>
          </CardTitle>
          <CardDescription>Libere a porta para a conta Google/Email de um familiar.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAdd} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label>Email do Convidado</Label>
              <Input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="tio@gmail.com"
                className="bg-white border-amber-200"
              />
            </div>
            <Button type="submit" disabled={loading} className="font-bold">
              {loading ? 'Adicionando...' : 'Liberar Acesso'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-bold font-display flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          Lista VIP Autorizada ({list.length})
        </h2>
        {list.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-amber-100 rounded-xl shadow-sm">
            <div>
              <p className="font-bold text-foreground">{item.id}</p>
              <p className="text-xs text-foreground/50 uppercase tracking-widest mt-1">
                Adicionado em: {new Date(item.addedAt).toLocaleDateString()}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleRemove(item.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {list.length === 0 && (
          <div className="p-8 text-center bg-white border border-dashed border-amber-200 rounded-xl">
            <p className="text-foreground/50 font-bold">Nenhum email na lista ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
