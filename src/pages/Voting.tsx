import { useState } from 'react'
import { Plus, Clock } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

export default function Voting() {
  const { user, polls, votePoll, addPoll } = useAppStore()
  const { toast } = useToast()

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  // New Poll State
  const [newPollTitle, setNewPollTitle] = useState('')
  const [newPollDesc, setNewPollDesc] = useState('')
  const [newPollDeadline, setNewPollDeadline] = useState('')
  const [newPollOptions, setNewPollOptions] = useState(['', ''])

  const handleVote = (pollId: string) => {
    const optionId = selectedOptions[pollId]
    if (!optionId) return

    votePoll(pollId, optionId)
    toast({
      title: 'Voto registrado!',
      description: 'Obrigado por participar da decisão.',
    })
  }

  const handleCreatePoll = () => {
    if (!newPollTitle || !newPollDeadline || newPollOptions.filter((o) => o.trim()).length < 2) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios e pelo menos 2 opções.',
        variant: 'destructive',
      })
      return
    }

    addPoll({
      title: newPollTitle,
      description: newPollDesc,
      deadline: new Date(newPollDeadline).toISOString(),
      options: newPollOptions
        .filter((o) => o.trim())
        .map((text) => ({
          id: Math.random().toString(36).substr(2, 9),
          text,
          votes: 0,
        })),
    })

    toast({
      title: 'Votação Criada!',
      description: 'A nova votação já está disponível para o grupo.',
    })
    setNewPollTitle('')
    setNewPollDesc('')
    setNewPollDeadline('')
    setNewPollOptions(['', ''])
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Votações</h1>
          <p className="text-slate-500 text-sm">Painel de transparência e decisões do grupo.</p>
        </div>

        {user.isGovernance && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="shrink-0 shadow-sm transition-transform active:scale-95">
                <Plus className="w-4 h-4 mr-2" /> Nova Votação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Nova Votação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título da Votação</Label>
                  <Input
                    value={newPollTitle}
                    onChange={(e) => setNewPollTitle(e.target.value)}
                    placeholder="Ex: Qual dia faremos a feijoada?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição (Opcional)</Label>
                  <Textarea
                    value={newPollDesc}
                    onChange={(e) => setNewPollDesc(e.target.value)}
                    placeholder="Detalhes adicionais..."
                    className="resize-none h-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prazo Final (Obrigatório)</Label>
                  <Input
                    type="datetime-local"
                    value={newPollDeadline}
                    onChange={(e) => setNewPollDeadline(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Opções de Voto</Label>
                  {newPollOptions.map((opt, i) => (
                    <Input
                      key={i}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...newPollOptions]
                        newOpts[i] = e.target.value
                        setNewPollOptions(newOpts)
                      }}
                      placeholder={`Opção ${i + 1}`}
                    />
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed"
                    onClick={() => setNewPollOptions([...newPollOptions, ''])}
                  >
                    + Adicionar Opção
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleCreatePoll}>Publicar Votação</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-6">
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0)
          const deadlineDate = new Date(poll.deadline)
          const isPastDeadline = deadlineDate < new Date()
          const isClosed = poll.status === 'closed' || isPastDeadline
          const hasVoted = !!poll.votedOptionId
          const showResults = isClosed || hasVoted

          const formattedDeadline = deadlineDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })

          return (
            <Card
              key={poll.id}
              className={cn(
                'shadow-sm overflow-hidden transition-all',
                isClosed ? 'border-slate-200 bg-slate-50/50' : 'border-primary/20',
              )}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5">
                    <CardTitle className="text-xl text-slate-800 leading-tight">
                      {poll.title}
                    </CardTitle>
                    {poll.description && <CardDescription>{poll.description}</CardDescription>}
                    <div className="flex items-center text-xs font-medium text-slate-500 mt-2">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      Prazo: {formattedDeadline}
                    </div>
                  </div>
                  <Badge
                    variant={isClosed ? 'secondary' : 'default'}
                    className="shrink-0 shadow-sm"
                  >
                    {isClosed ? 'Encerrado' : 'Aberto'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {!showResults ? (
                  <RadioGroup
                    value={selectedOptions[poll.id]}
                    onValueChange={(val) =>
                      setSelectedOptions((prev) => ({ ...prev, [poll.id]: val }))
                    }
                    className="space-y-3"
                  >
                    {poll.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-3 bg-white border border-slate-200 p-3 rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() =>
                          setSelectedOptions((prev) => ({ ...prev, [poll.id]: option.id }))
                        }
                      >
                        <RadioGroupItem value={option.id} id={`opt-${option.id}`} />
                        <Label
                          htmlFor={`opt-${option.id}`}
                          className="flex-1 cursor-pointer font-medium text-slate-700"
                        >
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-4">
                    {poll.options.map((option) => {
                      const percentage =
                        totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100)

                      const maxVotes = Math.max(...poll.options.map((o) => o.votes))
                      const isWinner = isClosed && option.votes === maxVotes && totalVotes > 0
                      const isMyVote = poll.votedOptionId === option.id

                      return (
                        <div key={option.id} className="space-y-1.5">
                          <div className="flex justify-between text-sm items-center">
                            <span
                              className={cn(
                                'font-medium',
                                isWinner ? 'text-primary font-bold' : 'text-slate-600',
                              )}
                            >
                              {option.text}{' '}
                              {isMyVote && (
                                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded ml-2 uppercase font-bold tracking-wider">
                                  Seu voto
                                </span>
                              )}
                            </span>
                            <span className="text-slate-500 font-medium text-xs">
                              {percentage}% ({option.votes})
                            </span>
                          </div>
                          <Progress
                            value={percentage}
                            className={cn('h-2.5 bg-slate-200', isWinner && '[&>div]:bg-primary')}
                          />
                        </div>
                      )
                    })}
                    <div className="text-sm text-slate-400 text-right pt-3 border-t mt-4 font-medium">
                      Total de {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
                    </div>
                  </div>
                )}
              </CardContent>

              {!showResults && (
                <CardFooter className="bg-slate-50/50 pt-4 pb-4 border-t border-slate-100">
                  <Button
                    className="w-full transition-transform active:scale-95 shadow-sm"
                    disabled={!selectedOptions[poll.id]}
                    onClick={() => handleVote(poll.id)}
                  >
                    Confirmar Voto
                  </Button>
                </CardFooter>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
