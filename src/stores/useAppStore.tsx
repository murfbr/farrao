import React, { createContext, useContext, useState, useMemo } from 'react'

export type UserProfile = {
  id: string
  name: string
  email: string
  adults: number
  children: number
  childrenAges: number[]
  nannies: number
  vegetarian: boolean
  restrictions: string
  isGovernance: boolean
  photoUrl?: string
}

export type GroupType = 'governance' | 'general'
export type Group = {
  id: string
  name: string
  description: string
  type: GroupType
  memberIds: string[]
}

export type TaskStatus = 'todo' | 'doing' | 'done'
export type Task = {
  id: string
  groupId: string
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
  deadline: string
  status: 'open' | 'closed'
  options: PollOption[]
  votedOptionId?: string
}

export type FinanceStatus = 'paid' | 'pending' | 'late'
export type ParticipantFinance = {
  id: string
  name: string
  p1: FinanceStatus
  p2: FinanceStatus
  p3: FinanceStatus
  amount: number
}

export type Announcement = {
  id: string
  title: string
  date: string
  content: string
  pinned: boolean
  archived: boolean
}

type AppState = {
  user: UserProfile
  setUser: (user: UserProfile) => void
  toggleGovernance: () => void
  groups: Group[]
  joinGroup: (groupId: string) => void
  addGroup: (group: Omit<Group, 'id' | 'memberIds'>) => void
  tasks: Task[]
  moveTask: (id: string, newStatus: TaskStatus) => void
  addTask: (groupId: string, title: string, priority: string) => void
  polls: Poll[]
  votePoll: (pollId: string, optionId: string) => void
  addPoll: (poll: Omit<Poll, 'id' | 'votedOptionId' | 'status'>) => void
  participantsFinance: ParticipantFinance[]
  updateParticipantFinance: (id: string, field: 'p1' | 'p2' | 'p3', status: FinanceStatus) => void
  totalGuests: number
  announcements: Announcement[]
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'date' | 'archived'>) => void
  archiveAnnouncement: (id: string) => void
}

const defaultUser: UserProfile = {
  id: 'u1',
  name: 'João Silva',
  email: 'joao@exemplo.com',
  adults: 2,
  children: 1,
  childrenAges: [5],
  nannies: 0,
  vegetarian: false,
  restrictions: '',
  isGovernance: true,
}

const mockAnnouncements: Announcement[] = [
  {
    id: 'a1',
    title: 'Vai ter roda de samba sim!',
    date: new Date().toISOString(),
    content:
      'Pessoal, não esqueçam de trazer seus instrumentos. A roda de samba oficial acontece no sábado à tarde!',
    pinned: true,
    archived: false,
  },
  {
    id: 'a2',
    title: 'Lembrete da Vakinha (Parcela 2)',
    date: new Date(Date.now() - 86400000).toISOString(),
    content:
      'Lembrando que o vencimento da segunda parcela é dia 15. Ajudem a governança, paguem em dia! Verifiquem a aba de finanças.',
    pinned: false,
    archived: false,
  },
]

const mockGroups: Group[] = [
  {
    id: 'g1',
    name: 'Comissão do Churras e Bebidas',
    description: 'Decisões financeiras e compras de alto escalão da governança.',
    type: 'governance',
    memberIds: ['u1'],
  },
  {
    id: 'g2',
    name: 'Bonde da Limpeza',
    description: 'Ajudar a manter a casa habitável e recolher as latas.',
    type: 'general',
    memberIds: [],
  },
]

const mockTasks: Task[] = [
  {
    id: 't1',
    groupId: 'g1',
    title: 'Pagar sinal da chácara pro dono',
    status: 'done',
    assignee: 'João',
    priority: 'Alta',
  },
  {
    id: 't2',
    groupId: 'g2',
    title: 'Comprar sacos de lixo de 100L',
    status: 'doing',
    assignee: 'Maria',
    priority: 'Média',
  },
]

const mockPolls: Poll[] = [
  {
    id: 'p1',
    title: 'O que vai ter no Jantar de Sábado?',
    description: 'Vamos fechar o cardápio da nossa última noite na chácara!',
    deadline: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 16),
    status: 'open',
    options: [
      { id: 'o1', text: 'Rodízio de Pizza', votes: 4 },
      { id: 'o2', text: 'Noite do Hamburguer', votes: 7 },
    ],
  },
]

const mockParticipantsFinance: ParticipantFinance[] = [
  { id: 'pf1', name: 'João (Você)', p1: 'paid', p2: 'paid', p3: 'pending', amount: 850 },
  { id: 'pf2', name: 'Maria F.', p1: 'paid', p2: 'pending', p3: 'pending', amount: 450 },
]

const AppContext = createContext<AppState | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser)
  const [groups, setGroups] = useState<Group[]>(mockGroups)
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [polls, setPolls] = useState<Poll[]>(mockPolls)
  const [participantsFinance, setParticipantsFinance] =
    useState<ParticipantFinance[]>(mockParticipantsFinance)
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements)

  const toggleGovernance = () => setUser((prev) => ({ ...prev, isGovernance: !prev.isGovernance }))

  const joinGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, memberIds: [...g.memberIds, user.id] } : g)),
    )
  }

  const addGroup = (group: Omit<Group, 'id' | 'memberIds'>) => {
    setGroups((prev) => [
      ...prev,
      { ...group, id: Math.random().toString(36).substr(2, 9), memberIds: [user.id] },
    ])
  }

  const moveTask = (id: string, newStatus: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))
  }

  const addTask = (groupId: string, title: string, priority: string) => {
    setTasks((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        groupId,
        title,
        status: 'todo',
        assignee: user.name,
        priority,
      },
    ])
  }

  const addPoll = (pollData: Omit<Poll, 'id' | 'votedOptionId' | 'status'>) => {
    setPolls((prev) => [
      { ...pollData, id: Math.random().toString(36).substr(2, 9), status: 'open' },
      ...prev,
    ])
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

  const updateParticipantFinance = (
    id: string,
    field: 'p1' | 'p2' | 'p3',
    status: FinanceStatus,
  ) => {
    setParticipantsFinance((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: status } : p)))
  }

  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'date' | 'archived'>) => {
    setAnnouncements((prev) => [
      {
        ...ann,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        archived: false,
      },
      ...prev,
    ])
  }

  const archiveAnnouncement = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, archived: true, pinned: false } : a)),
    )
  }

  const totalGuests = useMemo(() => 12 + user.adults + user.children + user.nannies, [user])

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        toggleGovernance,
        groups,
        joinGroup,
        addGroup,
        tasks,
        moveTask,
        addTask,
        polls,
        votePoll,
        addPoll,
        participantsFinance,
        updateParticipantFinance,
        totalGuests,
        announcements,
        addAnnouncement,
        archiveAnnouncement,
      }}
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
