import React, { createContext, useContext, useState, useMemo } from 'react'

export type MemberCategory = 'adult' | 'child_under_10' | 'child_11_to_16' | 'nanny'

export type FamilyMember = {
  id: string
  name: string
  category: MemberCategory
  isDrinking: boolean
}

export type UserProfile = {
  id: string
  name: string
  email: string
  hasConfirmed: boolean
  members: FamilyMember[]
  daysAttending: number
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
  members: FamilyMember[]
  daysAttending: number
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

export type EventDetails = {
  title: string
  message: string
  date: string
  location: string
  targetDate: string
}

export type MealType = 'Café da Manhã' | 'Almoço' | 'Jantar' | 'Petiscos' | 'Bebidas'

export type DailyMenu = {
  id: string
  day: string
  meals: {
    type: MealType
    description: string
  }[]
}

export type ShoppingItemMode = 'simple' | 'complex'

export type ShoppingItem = {
  id: string
  name: string
  category: string
  mode: ShoppingItemMode
  manualQuantity: string
  unitPerAdult: number
  unitPerChild: number
  unitName: string
  notes: string
  assignedToId: string | null
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

  eventDetails: EventDetails
  updateEventDetails: (details: Partial<EventDetails>) => void
  venuePhotos: string[]

  dailyMenus: DailyMenu[]
  updateDailyMenus: (menus: DailyMenu[]) => void
  shoppingItems: ShoppingItem[]
  addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => void
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void
  deleteShoppingItem: (id: string) => void
  importShoppingItems: (items: Omit<ShoppingItem, 'id'>[]) => void
  bulkAssignShoppingItems: (itemIds: string[], assigneeId: string | null) => void
}

const defaultUser: UserProfile = {
  id: 'u1',
  name: 'João Silva',
  email: 'joao@exemplo.com',
  hasConfirmed: false,
  members: [
    { id: 'u1-1', name: 'João Silva', category: 'adult', isDrinking: true },
    { id: 'u1-2', name: 'Maria Silva', category: 'adult', isDrinking: true },
    { id: 'u1-3', name: 'Pedrinho', category: 'child_under_10', isDrinking: false },
  ],
  daysAttending: 4,
  vegetarian: false,
  restrictions: '',
  isGovernance: true,
}

const mockParticipants: ParticipantRecord[] = [
  {
    id: 'u1',
    name: 'João Silva (Você)',
    hasConfirmed: false,
    members: [
      { id: 'u1-1', name: 'João Silva', category: 'adult', isDrinking: true },
      { id: 'u1-2', name: 'Maria Silva', category: 'adult', isDrinking: true },
      { id: 'u1-3', name: 'Pedrinho', category: 'child_under_10', isDrinking: false },
    ],
    daysAttending: 4,
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
    members: [
      { id: 'p2-1', name: 'Carlos Souza', category: 'adult', isDrinking: true },
      { id: 'p2-2', name: 'Ana Souza', category: 'adult', isDrinking: true },
      { id: 'p2-3', name: 'Bia Souza', category: 'child_11_to_16', isDrinking: false },
    ],
    daysAttending: 3,
    p1: 'paid',
    p2: 'pending',
    p3: 'pending',
    beverageStatus: 'paid',
    socialQuotaOverride: null,
  },
  {
    id: 'p3',
    name: 'Tio Roberto',
    hasConfirmed: true,
    members: [{ id: 'p3-1', name: 'Roberto', category: 'adult', isDrinking: true }],
    daysAttending: 2,
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

const mockDailyMenus: DailyMenu[] = [
  {
    id: 'm1',
    day: 'Sexta-feira (20/12)',
    meals: [
      { type: 'Petiscos', description: 'Tábua de frios, amendoim, azeitonas e pão de alho' },
      { type: 'Jantar', description: 'Lasanha à bolonhesa e salada mix' },
    ],
  },
  {
    id: 'm2',
    day: 'Sábado (21/12)',
    meals: [
      { type: 'Café da Manhã', description: 'Pães, frios, frutas, ovos mexidos, café e suco' },
      {
        type: 'Almoço',
        description:
          'Churrasco completo (Picanha, Linguiça, Frango, Pão de alho, Farofa, Maionese, Vinagrete)',
      },
      { type: 'Petiscos', description: 'Churrasco rolando o dia todo' },
      {
        type: 'Jantar',
        description:
          'Sopa de capeletti ou caldos variados (depende do clima) + Sobras do churrasco',
      },
    ],
  },
  {
    id: 'm3',
    day: 'Domingo (22/12)',
    meals: [
      { type: 'Café da Manhã', description: 'Pães, bolo, queijo, presunto, café e leite' },
      { type: 'Almoço', description: 'Estrogonofe de frango com batata palha e arroz' },
    ],
  },
]

const mockShoppingItems: ShoppingItem[] = [
  {
    id: 's1',
    name: 'Picanha',
    category: 'Carnes',
    mode: 'complex',
    manualQuantity: '',
    unitPerAdult: 0.4,
    unitPerChild: 0.15,
    unitName: 'kg',
    notes: 'Comprar a vácuo, de preferência marca Friboi ou Bassi',
    assignedToId: 'u1',
  },
  {
    id: 's2',
    name: 'Carvão 10kg',
    category: 'Churrasco',
    mode: 'simple',
    manualQuantity: '4 sacos',
    unitPerAdult: 0,
    unitPerChild: 0,
    unitName: '',
    notes: 'Pegar qualquer um, desde que seja de boa procedência.',
    assignedToId: null,
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

  const [dailyMenus, setDailyMenus] = useState<DailyMenu[]>(mockDailyMenus)
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(mockShoppingItems)

  const [eventDetails, setEventDetails] = useState<EventDetails>({
    title: 'Farrão 2024',
    message: 'A festa mais esperada da família. Muita música, resenha e alegria!',
    date: '20 a 24 de Dezembro',
    location: 'Ibiúna, SP',
    targetDate: '2024-12-20T00:00:00',
  })

  const [venuePhotos] = useState<string[]>([
    'https://img.usecurling.com/p/800/800?q=country%20house&seed=1',
    'https://img.usecurling.com/p/800/800?q=swimming%20pool&seed=2',
    'https://img.usecurling.com/p/800/800?q=barbecue%20grill&seed=3',
    'https://img.usecurling.com/p/800/800?q=garden&seed=4',
  ])

  const setUser = (newUser: UserProfile) => {
    setUserState(newUser)
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === newUser.id) {
          return {
            ...p,
            name: newUser.name,
            hasConfirmed: newUser.hasConfirmed,
            members: newUser.members,
            daysAttending: newUser.daysAttending,
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

  const updateEventDetails = (details: Partial<EventDetails>) => {
    setEventDetails((prev) => ({ ...prev, ...details }))
  }

  const updateDailyMenus = (menus: DailyMenu[]) => {
    setDailyMenus(menus)
  }

  const addShoppingItem = (item: Omit<ShoppingItem, 'id'>) => {
    setShoppingItems((prev) => [...prev, { ...item, id: Math.random().toString(36).substr(2, 9) }])
  }

  const updateShoppingItem = (id: string, updates: Partial<ShoppingItem>) => {
    setShoppingItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)))
  }

  const deleteShoppingItem = (id: string) => {
    setShoppingItems((prev) => prev.filter((i) => i.id !== id))
  }

  const importShoppingItems = (items: Omit<ShoppingItem, 'id'>[]) => {
    const newItems = items.map((i) => ({ ...i, id: Math.random().toString(36).substr(2, 9) }))
    setShoppingItems((prev) => [...newItems, ...prev])
  }

  const bulkAssignShoppingItems = (itemIds: string[], assigneeId: string | null) => {
    setShoppingItems((prev) =>
      prev.map((item) =>
        itemIds.includes(item.id) ? { ...item, assignedToId: assigneeId } : item,
      ),
    )
  }

  const totalGuests = useMemo(
    () => participants.reduce((acc, p) => acc + p.members.length, 0),
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
        eventDetails,
        updateEventDetails,
        venuePhotos,
        dailyMenus,
        updateDailyMenus,
        shoppingItems,
        addShoppingItem,
        updateShoppingItem,
        deleteShoppingItem,
        importShoppingItems,
        bulkAssignShoppingItems,
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
