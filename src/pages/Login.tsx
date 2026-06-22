import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginWithEmail } from '@/firebase/services'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await loginWithEmail(email.toLowerCase(), password)
    } catch (err: any) {
      console.error("Firebase auth error:", err);
      let errorMessage = 'Email não autorizado ou senha incorreta.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Nenhuma conta encontrada ou credenciais inválidas. Verifique seu email e senha.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas falhas. Tente novamente mais tarde.';
      }

      toast({
        title: 'Acesso Negado',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[100dvh] overflow-y-auto bg-gradient-to-br from-orange-50 to-amber-100">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 space-y-8 border border-amber-200 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <span className="text-4xl">🥩</span>
          </div>
          <h1 className="text-4xl font-black font-display text-primary tracking-tight">Farrão</h1>
          <p className="text-foreground/70 font-medium text-sm">
            Bem-vindo à área de convidados.
          </p>
        </div>
        
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="seu@email.com"
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>Senha</Label>
            <Input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              className="bg-white"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full font-bold text-base h-12 rounded-xl">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-amber-200/60 flex flex-col items-center gap-3">
          <p className="text-foreground/70 font-semibold text-sm">É o seu primeiro acesso?</p>
          <Button type="button" variant="outline" className="w-full h-12 font-bold rounded-xl border-2 border-primary text-primary hover:bg-primary/5 shadow-sm" asChild>
            <Link to="/register">
              Cadastre-se com seu convite
            </Link>
          </Button>
        </div>
      </div>
      </div>
    </div>
  )
}
