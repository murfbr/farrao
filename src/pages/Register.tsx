import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerWithEmail } from '@/firebase/services'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password.length < 8) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 8 caracteres.',
        variant: 'destructive',
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Senhas incompatíveis',
        description: 'As senhas não coincidem. Tente novamente.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      await registerWithEmail(email.toLowerCase(), password)
      // O listener do `useAppStore` vai rodar automaticamente e checar se o email tá aprovado.
      // Se não estiver, o Firebase vai retornar erro nas queries de onSnapshot, mas a autenticação passa.
      // Idealmente, poderíamos checar o displayName em updateProfile, mas o useAppStore resolve isso.
      toast({
        title: 'Sucesso!',
        description: 'Verificando permissões de acesso...',
      })
      navigate('/register-profile')
    } catch (err: any) {
      toast({
        title: 'Erro ao cadastrar',
        description: 'Verifique se a senha tem pelo menos 8 caracteres ou se o email é válido.',
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
          <h1 className="text-3xl font-black font-display text-primary tracking-tight">Primeiro Acesso</h1>
          <p className="text-foreground/70 font-medium text-sm">
            Seu email precisa ter sido convidado previamente pela organização para entrar no app.
          </p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label>Email Vinculado ao Convite</Label>
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
            <Label>Escolha uma Senha</Label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"}
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="mínimo 8 caracteres"
                className="bg-white pr-10"
                minLength={8}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              A senha deve ter no mínimo 8 caracteres. Letras maiúsculas, minúsculas, números e símbolos são aceitos.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Repita a Senha</Label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"}
                required 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="confirme sua senha"
                className="bg-white pr-10"
                minLength={8}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full font-bold text-base h-12 rounded-xl mt-4">
            {loading ? 'Criando Conta...' : 'Validar Convite e Entrar'}
          </Button>
        </form>

        <p className="text-center text-sm font-medium text-foreground/60 pt-4 border-t border-amber-100">
          Já tem conta?{' '}
          <Link to="/" className="text-primary hover:underline font-bold">
            Faça login aqui
          </Link>
        </p>
      </div>
      </div>
    </div>
  )
}
