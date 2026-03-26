import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogIn } from 'lucide-react'
import { loginWithGoogle, loginWithEmail } from '@/firebase/services'
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
      await loginWithEmail(email, password)
    } catch (err: any) {
      toast({
        title: 'Acesso Negado',
        description: 'Email não autorizado ou senha incorreta.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 p-4">
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-amber-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-foreground/40 font-bold tracking-wider">Ou</span>
          </div>
        </div>

        <Button 
          type="button"
          onClick={loginWithGoogle}
          variant="outline"
          className="w-full h-12 font-bold rounded-xl border-amber-200 hover:bg-orange-50"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Continuar com Google
        </Button>

        <p className="text-center text-sm font-medium text-foreground/60 pt-4">
          Não tem conta?{' '}
          <Link to="/register" className="text-primary hover:underline font-bold">
            Cadastre-se com seu convite
          </Link>
        </p>
      </div>
    </div>
  )
}
