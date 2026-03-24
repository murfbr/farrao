import React, { createContext, useContext, useState, useMemo } from 'react'

export type UserProfile = {
  id: string
  name: string
  email: string
  hasConfirmed: boolean
  householdNames: string[]
  daysAttending: number
  adults: number
  children: number
  childrenAges: number[]
  nannies: number
  drinkingAdults: number
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

export type ParticipantRecord = {
  id: string
  name: string
  hasConfirmed: boolean
  householdNames: string[]
  daysAttending: number
  adults: number
  childrenUnder10: number
  children11to16: number
  nannies: number
  drinkingAdults: number
  p1: FinanceStatus
  p2: FinanceStatus
  p3: FinanceStatus
  beverageStatus: FinanceStatus
  socialQuotaOverride: number | null
}

export type PricingTiers = {
  adults: number
  childrenUnder10: number
  children11to16: number
  nannies: number
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
  confirmPresence: () => void
  toggleGovernance: () => void

  pricingTiers: PricingTiers
  setPricingTiers: (tiers: PricingTiers) => void
  beverageTotal: number
  setBeverageTotal: (total: number) => void

  participants: ParticipantRecord[]
  updateParticipant: (id: string, updates: Partial<ParticipantRecord>) => void

  groups: Group[]
  joinGroup: (groupId: string) => void
  addGroup: (group: Omit<Group, 'id' | 'memberIds'>) => void
  tasks: Task[]
  moveTask: (id: string, newStatus: TaskStatus) => void
  addTask: (groupId: string, title: string, priority: string) => void
  polls: Poll[]
  votePoll: (pollId: string, optionId: string) => void
  addPoll: (poll: Omit<Poll, 'id' | 'votedOptionId' | 'status'>) => void
  totalGuests: number
  announcements: Announcement[]
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'date' | 'archived'>) => void
  archiveAnnouncement: (id: string) => void
}

const defaultUser: UserProfile = {
  id: 'u1',
  name: 'João Silva',
  email: 'joao@exemplo.com',
  hasConfirmed: false,
  householdNames: ['João Silva', 'Maria Silva', 'Pedrinho'],
  daysAttending: 4,
  adults: 2,
  children: 1,
  childrenAges: [5],
  nannies: 0,
  drinkingAdults: 2,
  vegetarian: false,
  restrictions: '',
  isGovernance: true,
}

const mockParticipants: ParticipantRecord[] = [
  {
    id: 'u1',
    name: 'João Silva (Você)',
    hasConfirmed: false,
    householdNames: ['João Silva', 'Maria Silva', 'Pedrinho'],
    daysAttending: 4,
    adults: 2,
    childrenUnder10: 1,
    children11to16: 0,
    nannies: 0,
    drinkingAdults: 2,
    p1: 'paid',
    p2: 'paid',
    p3: 'pending',
    beverageStatus: 'pending',
    socialQuotaOverride: null,
  },
  {
    id: 'p2',
    name: 'Família Souza',
    hasConfirmed: true,
    householdNames: ['Carlos Souza', 'Ana Souza', 'Bia Souza'],
    daysAttending: 3,
    adults: 2,
    childrenUnder10: 0,
    children11to16: 1,
    nannies: 0,
    drinkingAdults: 2,
    p1: 'paid',
    p2: 'pending',
    p3: 'pending',
    beverageStatus: 'paid',
    socialQuotaOverride: null,
  },
  {
    id: 'p3',
    name: 'Tio Roberto',
    hasConfirmed: false,
    householdNames: ['Roberto'],
    daysAttending: 2,
    adults: 1,
    childrenUnder10: 0,
    children11to16: 0,
    nannies: 0,
    drinkingAdults: 1,
    p1: 'late',
    p2: 'pending',
    p3: 'pending',
    beverageStatus: 'pending',
    socialQuotaOverride: 150,
  },
]

const defaultPricingTiers: PricingTiers = {
  adults: 400,
  childrenUnder10: 0,
  children11to16: 200,
  nannies: 300,
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
]

const mockGroups: Group[] = [
  {
    id: 'g1',
    name: 'Comissão do Churras',
    description: 'Decisões financeiras e compras de alto escalão da governança.',
    type: 'governance',
    memberIds: ['u1'],
  },
]

const mockTasks: Task[] = []
const mockPolls: Poll[] = []

const AppContext = createContext<AppState | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile>(defaultUser)
  const [participants, setParticipants] = useState<ParticipantRecord[]>(mockParticipants)
  const [pricingTiers, setPricingTiers] = useState<PricingTiers>(defaultPricingTiers)
  const [beverageTotal, setBeverageTotal] = useState<number>(1500)

  const [groups, setGroups] = useState<Group[]>(mockGroups)
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [polls, setPolls] = useState<Poll[]>(mockPolls)
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements)

  const setUser = (newUser: UserProfile) => {
    setUserState(newUser)
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === newUser.id) {
          return {
            ...p,
            name: newUser.name,
            hasConfirmed: newUser.hasConfirmed,
            householdNames: newUser.householdNames,
            daysAttending: newUser.daysAttending,
            adults: newUser.adults,
            childrenUnder10: newUser.childrenAges.filter((a) => a <= 10).length,
            children11to16: newUser.childrenAges.filter((a) => a > 10 && a <= 16).length,
            nannies: newUser.nannies,
            drinkingAdults: newUser.drinkingAdults,
          }
        }
        return p
      }),
    )
  }

  const confirmPresence = () => {
    setUserState((prev) => ({ ...prev, hasConfirmed: true }))
    setParticipants((prev) =>
      prev.map((p) => (p.id === user.id ? { ...p, hasConfirmed: true } : p)),
    )
  }

  const toggleGovernance = () =>
    setUserState((prev) => ({ ...prev, isGovernance: !prev.isGovernance }))

  const updateParticipant = (id: string, updates: Partial<ParticipantRecord>) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

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

  const totalGuests = useMemo(
    () =>
      participants.reduce(
        (acc, p) => acc + p.adults + p.childrenUnder10 + p.children11to16 + p.nannies,
        0,
      ),
    [participants],
  )

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        confirmPresence,
        toggleGovernance,
        pricingTiers,
        setPricingTiers,
        beverageTotal,
        setBeverageTotal,
        participants,
        updateParticipant,
        groups,
        joinGroup,
        addGroup,
        tasks,
        moveTask,
        addTask,
        polls,
        votePoll,
        addPoll,
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
