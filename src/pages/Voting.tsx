import { useState } from 'react'
import { Plus, Flame, Music, Beer } from 'lucide-react'
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
      title: 'Voto na Urna! 🎸',
      description: 'Obrigado por ajudar a decidir a nossa festa.',
    })
  }

  const handleCreatePoll = () => {
    if (!newPollTitle || !newPollDeadline || newPollOptions.filter((o) => o.trim()).length < 2) {
      toast({
        title: 'Calma lá!',
        description: 'Preencha o título, o prazo e pelo menos 2 opções de resposta.',
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
      title: 'Votação Lançada! 📢',
      description: 'A galera já pode votar.',
    })
    setNewPollTitle('')
    setNewPollDesc('')
    setNewPollDeadline('')
    setNewPollOptions(['', ''])
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-display text-foreground flex items-center">
            <Music className="w-8 h-8 mr-3 text-primary" /> Votações do Farrão
          </h1>
          <p className="text-foreground/60 text-base mt-2 font-medium">
            Deixe sua opinião nas decisões do evento. A voz do povo é a voz de Deus!
          </p>
        </div>

        {user.isGovernance && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="shrink-0 shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95 font-bold rounded-xl h-12 px-6 text-base">
                <Plus className="w-5 h-5 mr-2" /> Criar Votação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border-amber-200">
              <DialogHeader>
                <DialogTitle className="font-display font-black text-2xl">
                  Lançar Pergunta
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label className="font-bold">Qual é a boa?</Label>
                  <Input
                    value={newPollTitle}
                    onChange={(e) => setNewPollTitle(e.target.value)}
                    placeholder="Ex: O que vamos beber no sábado?"
                    className="bg-orange-50/30 border-amber-200 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Detalhes (Opcional)</Label>
                  <Textarea
                    value={newPollDesc}
                    onChange={(e) => setNewPollDesc(e.target.value)}
                    placeholder="Explique melhor as opções..."
                    className="resize-none h-20 bg-orange-50/30 border-amber-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold flex items-center text-red-600">
                    <Flame className="w-4 h-4 mr-1" /> Prazo Final (Obrigatório)
                  </Label>
                  <Input
                    type="datetime-local"
                    value={newPollDeadline}
                    onChange={(e) => setNewPollDeadline(e.target.value)}
                    className="border-red-200 focus-visible:ring-red-500 bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-bold">Opções pro pessoal escolher</Label>
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
                      className="border-amber-200 bg-white"
                    />
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed border-primary/40 text-primary font-bold hover:bg-primary/5"
                    onClick={() => setNewPollOptions([...newPollOptions, ''])}
                  >
                    + Mais uma opção
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost" className="font-bold">
                    Cancelar
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleCreatePoll} className="font-bold shadow-md rounded-xl">
                    Publicar
                  </Button>
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
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          })

          return (
            <Card
              key={poll.id}
              className={cn(
                'shadow-md overflow-hidden transition-all rounded-2xl border-2',
                isClosed
                  ? 'border-amber-100 bg-white/50 grayscale-[20%]'
                  : 'border-primary/40 bg-white/90 backdrop-blur-sm',
              )}
            >
              <CardHeader
                className={cn(
                  'pb-5',
                  !isClosed && 'bg-gradient-to-r from-orange-50 to-amber-50/50',
                )}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-black font-display text-foreground leading-tight flex items-start">
                      {poll.title}
                    </CardTitle>
                    {poll.description && (
                      <CardDescription className="text-base font-medium">
                        {poll.description}
                      </CardDescription>
                    )}
                    <div
                      className={cn(
                        'flex items-center text-xs font-bold uppercase tracking-widest mt-3 px-3 py-1.5 rounded-lg w-fit',
                        isPastDeadline ? 'bg-red-100 text-red-700' : 'bg-primary/10 text-primary',
                      )}
                    >
                      <Flame className="w-4 h-4 mr-1.5" />
                      Encerra em: {formattedDeadline}
                    </div>
                  </div>
                  <Badge
                    variant={isClosed ? 'secondary' : 'default'}
                    className={cn(
                      'shrink-0 shadow-sm font-black uppercase tracking-wider',
                      isClosed ? 'bg-foreground/10 text-foreground/60' : '',
                    )}
                  >
                    {isClosed ? 'Encerrada' : 'No Ar'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {!showResults ? (
                  <RadioGroup
                    value={selectedOptions[poll.id]}
                    onValueChange={(val) =>
                      setSelectedOptions((prev) => ({ ...prev, [poll.id]: val }))
                    }
                    className="space-y-4"
                  >
                    {poll.options.map((option) => (
                      <Label
                        key={option.id}
                        htmlFor={`opt-${poll.id}-${option.id}`}
                        className={cn(
                          'flex items-center space-x-4 bg-white border-2 p-4 rounded-xl transition-all cursor-pointer',
                          selectedOptions[poll.id] === option.id
                            ? 'border-primary bg-primary/5 shadow-sm scale-[1.02]'
                            : 'border-amber-100 hover:border-primary/50 hover:bg-orange-50/30',
                        )}
                      >
                        <RadioGroupItem
                          value={option.id}
                          id={`opt-${poll.id}-${option.id}`}
                          className="w-5 h-5 text-primary border-primary"
                        />
                        <span className="flex-1 font-bold text-lg text-foreground">
                          {option.text}
                        </span>
                      </Label>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-5">
                    {poll.options.map((option) => {
                      const percentage =
                        totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100)

                      const maxVotes = Math.max(...poll.options.map((o) => o.votes))
                      const isWinner = isClosed && option.votes === maxVotes && totalVotes > 0
                      const isMyVote = poll.votedOptionId === option.id

                      return (
                        <div key={option.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span
                              className={cn(
                                'text-lg font-bold flex items-center',
                                isWinner ? 'text-primary' : 'text-foreground/70',
                              )}
                            >
                              {option.text}
                              {isWinner && (
                                <Beer className="w-5 h-5 ml-2 text-primary animate-bounce" />
                              )}
                              {isMyVote && (
                                <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-1 rounded-md ml-3 uppercase font-black tracking-widest border border-secondary/30">
                                  Seu voto
                                </span>
                              )}
                            </span>
                            <span className="font-black text-sm text-foreground/50 bg-foreground/5 px-2 py-1 rounded-md">
                              {percentage}% ({option.votes})
                            </span>
                          </div>
                          <Progress
                            value={percentage}
                            className={cn('h-3 bg-amber-100', isWinner && '[&>div]:bg-primary')}
                          />
                        </div>
                      )
                    })}
                    <div className="text-sm text-foreground/40 text-right pt-4 border-t border-amber-100 mt-6 font-bold uppercase tracking-widest">
                      Total de {totalVotes}{' '}
                      {totalVotes === 1 ? 'voto computado' : 'votos computados'}
                    </div>
                  </div>
                )}
              </CardContent>

              {!showResults && (
                <CardFooter className="bg-orange-50/50 pt-5 pb-5 border-t border-amber-100">
                  <Button
                    size="lg"
                    className="w-full transition-transform hover:scale-[1.02] active:scale-95 shadow-md font-black text-lg rounded-xl"
                    disabled={!selectedOptions[poll.id]}
                    onClick={() => handleVote(poll.id)}
                  >
                    Confirmar Escolha
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
