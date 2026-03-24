import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

export default function Voting() {
  const { polls, votePoll } = useAppStore()
  const { toast } = useToast()
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const handleVote = (pollId: string) => {
    const optionId = selectedOptions[pollId]
    if (!optionId) return

    votePoll(pollId, optionId)
    toast({
      title: 'Voto registrado!',
      description: 'Obrigado por participar da decisão.',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Votações</h1>
          <p className="text-slate-500 text-sm">Decisões importantes do grupo.</p>
        </div>
      </div>

      <div className="space-y-6">
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0)
          const isClosed = poll.status === 'closed'
          const hasVoted = !!poll.votedOptionId
          const showResults = isClosed || hasVoted

          return (
            <Card
              key={poll.id}
              className={cn(
                'shadow-sm overflow-hidden',
                isClosed ? 'border-slate-200 bg-slate-50/50' : 'border-primary/20',
              )}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl text-slate-800">{poll.title}</CardTitle>
                    <CardDescription>{poll.description}</CardDescription>
                  </div>
                  <Badge variant={isClosed ? 'secondary' : 'default'} className="ml-4">
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
                        className="flex items-center space-x-3 bg-white border border-slate-100 p-3 rounded-lg hover:border-primary/30 transition-colors cursor-pointer"
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
                      const isWinner =
                        isClosed &&
                        option.id ===
                          poll.options.reduce((prev, curr) =>
                            prev.votes > curr.votes ? prev : curr,
                          ).id
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
                                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded ml-2">
                                  Seu voto
                                </span>
                              )}
                            </span>
                            <span className="text-slate-500 font-medium">
                              {percentage}% ({option.votes})
                            </span>
                          </div>
                          <Progress
                            value={percentage}
                            className={cn('h-2.5', isWinner && '[&>div]:bg-primary')}
                          />
                        </div>
                      )
                    })}
                    <div className="text-sm text-slate-400 text-right pt-2 border-t mt-4">
                      Total de {totalVotes} votos
                    </div>
                  </div>
                )}
              </CardContent>

              {!showResults && (
                <CardFooter className="bg-slate-50/50 pt-4 pb-4">
                  <Button
                    className="w-full transition-transform active:scale-95"
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
