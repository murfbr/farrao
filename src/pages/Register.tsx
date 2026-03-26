import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerWithEmail } from '@/firebase/services'
import { useToast } from '@/hooks/use-toast'

export default function Register() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await registerWithEmail(email, password)
      // O listener do `useAppStore` vai rodar automaticamente e checar se o email tá aprovado.
      // Se não estiver, o Firebase vai retornar erro nas queries de onSnapshot, mas a autenticação passa.
      // Idealmente, poderíamos checar o displayName em updateProfile, mas o useAppStore resolve isso.
      toast({
        title: 'Sucesso!',
        description: 'Verificando permissões de acesso...',
      })
      navigate('/')
    } catch (err: any) {
      toast({
        title: 'Erro ao cadastrar',
        description: 'Verifique se a senha tem mais de 6 caracteres ou se o email é válido.',
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
            <Input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="mínimo 6 caracteres"
              className="bg-white"
              minLength={6}
            />
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
  )
}
