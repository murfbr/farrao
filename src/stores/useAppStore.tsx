import React, { createContext, useContext, useState, useMemo } from 'react'

export type UserProfile = {
  name: string
  email: string
  adults: number
  children: number
  nannies: number
  vegetarian: boolean
  restrictions: string
}

export type TaskStatus = 'todo' | 'doing' | 'done'
export type Task = {
  id: string
  title: string
  status: TaskStatus
  assignee: string
  priority: string
}

export type PollOption = { id: string; text: string; votes: number }
export type Poll = {
  id: string
  title: string
  description: string
  status: 'open' | 'closed'
  options: PollOption[]
  votedOptionId?: string
}

type AppState = {
  user: UserProfile
  setUser: (user: UserProfile) => void
  tasks: Task[]
  moveTask: (id: string, newStatus: TaskStatus) => void
  addTask: (title: string, priority: string) => void
  polls: Poll[]
  votePoll: (pollId: string, optionId: string) => void
  totalGuests: number
}

const defaultUser: UserProfile = {
  name: 'João Silva',
  email: 'joao@exemplo.com',
  adults: 2,
  children: 1,
  nannies: 0,
  vegetarian: false,
  restrictions: '',
}

const mockTasks: Task[] = [
  { id: 't1', title: 'Reservar Airbnb', status: 'todo', assignee: 'João', priority: 'Alta' },
  {
    id: 't2',
    title: 'Comprar carnes pro churrasco',
    status: 'doing',
    assignee: 'Maria',
    priority: 'Média',
  },
  {
    id: 't3',
    title: 'Criar grupo no WhatsApp',
    status: 'done',
    assignee: 'Ana',
    priority: 'Baixa',
  },
]

const mockPolls: Poll[] = [
  {
    id: 'p1',
    title: 'Destino do Jantar de Sábado',
    description: 'Onde vamos comer todos juntos na nossa última noite?',
    status: 'open',
    options: [
      { id: 'o1', text: 'Pizzaria do Bairro', votes: 4 },
      { id: 'o2', text: 'Restaurante Japonês', votes: 7 },
      { id: 'o3', text: 'Churrasco na Casa', votes: 12 },
    ],
  },
  {
    id: 'p2',
    title: 'Atividade da Tarde Livre',
    description: 'O que faremos na tarde de sexta?',
    status: 'closed',
    votedOptionId: 'o5',
    options: [
      { id: 'o4', text: 'Piscina / Descanso', votes: 15 },
      { id: 'o5', text: 'Trilha Ecológica', votes: 5 },
    ],
  },
]

const AppContext = createContext<AppState | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser)
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [polls, setPolls] = useState<Poll[]>(mockPolls)

  const moveTask = (id: string, newStatus: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))
  }

  const addTask = (title: string, priority: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      status: 'todo',
      assignee: user.name,
      priority,
    }
    setTasks((prev) => [...prev, newTask])
  }

  const votePoll = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id === pollId && p.status === 'open' && !p.votedOptionId) {
          return {
            ...p,
            votedOptionId: optionId,
            options: p.options.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o)),
          }
        }
        return p
      }),
    )
  }

  // 12 mock adults + user's family
  const totalGuests = useMemo(() => 12 + user.adults + user.children + user.nannies, [user])

  return (
    <AppContext.Provider
      value={{ user, setUser, tasks, moveTask, addTask, polls, votePoll, totalGuests }}
    >
      {children}
    </AppContext.Provider>
  )
}

export default function useAppStore() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppStore must be used within an AppProvider')
  return context
}
