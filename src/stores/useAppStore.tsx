import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import * as db from '../firebase/services'

export type MemberCategory = 'adult' | 'child_under_10' | 'child_11_to_16' | 'nanny'

export type FamilyMember = {
  id: string
  name: string
  category: MemberCategory
  isDrinking: boolean
  isVegetarian: boolean
  restrictions: string
}

export type UserProfile = {
  id: string
  name: string
  email: string
  hasConfirmed: boolean
  profileCompleted: boolean
  members: FamilyMember[]
  daysAttending: number
  attendingDates?: string[]
  eventIds: string[]
  isSuperAdmin?: boolean
  photoUrl?: string
}

export type GroupType = 'governance' | 'general'
export type Group = {
  id: string
  name: string
  description: string
  type: GroupType
  memberIds: string[]
  emoji?: string
}

export type TaskStatus = 'todo' | 'doing' | 'done'
export type TaskChecklistItem = { id: string; text: string; completed: boolean }
export type Task = {
  id: string
  groupId: string
  title: string
  status: TaskStatus
  assignee: string
  assigneeId?: string
  priority: string
  description?: string
  checklist?: TaskChecklistItem[]
  images?: string[]
  links?: string[]
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
  attendingDates?: string[]
  payments: Record<string, FinanceStatus> // key is installment ID
  beverageStatus: FinanceStatus
  socialQuotaOverride: number | null
  dueDate?: string // per-family due date override for all payments
  groupIds?: string[]
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
  startDate: string
  endDate: string
  installments: InstallmentConfig[]
  backgroundImage?: string
  venuePhotos?: string[]
}

export type InstallmentConfig = {
  id: string
  label: string
  dueDate: string
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
  user: UserProfile & { isGovernance: boolean }
  setUser: (user: UserProfile) => void
  confirmPresence: () => void

  pricingTiers: PricingTiers
  setPricingTiers: (tiers: PricingTiers) => void
  beverageTotal: number
  setBeverageTotal: (total: number) => void

  participants: ParticipantRecord[]
  updateParticipant: (id: string, updates: Partial<ParticipantRecord>) => void

  groups: Group[]
  joinGroup: (groupId: string) => void
  addGroup: (group: Omit<Group, 'id' | 'memberIds'>) => void
  updateGroup: (groupId: string, updates: Partial<Group>) => void
  deleteGroup: (groupId: string) => void
  leaveGroup: (groupId: string) => void
  removeMemberFromGroup: (groupId: string, userId: string) => void
  tasks: Task[]
  updateTask: (id: string, updates: Partial<Task>) => void
  moveTask: (id: string, newStatus: TaskStatus) => void
  addTask: (task: Omit<Task, 'id'>) => void
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
  updateVenuePhotos: (photos: string[]) => void

  dailyMenus: DailyMenu[]
  updateDailyMenus: (menus: DailyMenu[]) => void
  shoppingItems: ShoppingItem[]
  addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => void
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void
  deleteShoppingItem: (id: string) => void
  importShoppingItems: (items: Omit<ShoppingItem, 'id'>[]) => void
  bulkAssignShoppingItems: (itemIds: string[], assigneeId: string | null) => void
  isAuthLoading: boolean
}

const defaultUser: UserProfile = {
  id: 'u1',
  name: 'João Silva',
  email: 'joao@exemplo.com',
  hasConfirmed: false,
  profileCompleted: false,
  members: [
    { id: 'u1-1', name: 'João Silva', category: 'adult', isDrinking: true, isVegetarian: false, restrictions: '' },
    { id: 'u1-2', name: 'Maria Silva', category: 'adult', isDrinking: true, isVegetarian: true, restrictions: 'Sem glutén' },
    { id: 'u1-3', name: 'Pedrinho', category: 'child_under_10', isDrinking: false, isVegetarian: false, restrictions: '' },
  ],
  daysAttending: 4,
  attendingDates: ['2026-12-20', '2026-12-21', '2026-12-22', '2026-12-23'],
  eventIds: ['farrao-2026'],
  isSuperAdmin: true,
}

const mockParticipants: ParticipantRecord[] = [
  {
    id: 'u1',
    name: 'João Silva',
    hasConfirmed: true,
    members: [
      { id: 'u1-1', name: 'João Silva', category: 'adult', isDrinking: true, isVegetarian: false, restrictions: '' },
      { id: 'u1-2', name: 'Maria Silva', category: 'adult', isDrinking: true, isVegetarian: true, restrictions: 'Sem glutén' },
      { id: 'u1-3', name: 'Pedrinho', category: 'child_under_10', isDrinking: false, isVegetarian: false, restrictions: '' },
    ],
    daysAttending: 4,
    attendingDates: ['2026-12-20', '2026-12-21', '2026-12-22', '2026-12-23'],
    payments: { 'i1': 'paid', 'i2': 'pending' },
    beverageStatus: 'pending',
    socialQuotaOverride: null,
    groupIds: ['g1'],
  },
  {
    id: 'p2',
    name: 'Família Souza',
    hasConfirmed: true,
    members: [
      { id: 'p2-1', name: 'Carlos Souza', category: 'adult', isDrinking: true, isVegetarian: false, restrictions: '' },
      { id: 'p2-2', name: 'Ana Souza', category: 'adult', isDrinking: true, isVegetarian: false, restrictions: '' },
      { id: 'p2-3', name: 'Bia Souza', category: 'child_11_to_16', isDrinking: false, isVegetarian: false, restrictions: '' },
    ],
    daysAttending: 3,
    attendingDates: ['2026-12-20', '2026-12-21', '2026-12-22'],
    payments: { 'i1': 'paid', 'i2': 'pending' },
    beverageStatus: 'paid',
    socialQuotaOverride: null,
    groupIds: [],
  },
  {
    id: 'p3',
    name: 'Tio Roberto',
    hasConfirmed: true,
    members: [{ id: 'p3-1', name: 'Roberto', category: 'adult', isDrinking: true, isVegetarian: false, restrictions: '' }],
    daysAttending: 2,
    attendingDates: ['2026-12-20', '2026-12-21'],
    payments: { 'i1': 'late', 'i2': 'pending' },
    beverageStatus: 'pending',
    socialQuotaOverride: 150,
    groupIds: [],
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

const mockTasks: Task[] = [
  {
    id: 't1',
    groupId: 'g1',
    title: 'Comprar carnes e acompanhamentos',
    status: 'doing',
    assignee: 'João Silva (Você)',
    assigneeId: 'u1',
    priority: 'Alta',
    description:
      'Comprar as carnes listadas no cardápio de sábado. <b>Garantir picanha de qualidade!</b>',
    checklist: [
      { id: 'c1', text: 'Picanha (4kg)', completed: true },
      { id: 'c2', text: 'Linguiça toscana (2kg)', completed: false },
      { id: 'c3', text: 'Pão de alho', completed: false },
    ],
    links: ['https://www.swift.com.br'],
    images: ['https://img.usecurling.com/p/400/300?q=barbecue%20meat&dpr=1'],
  },
  {
    id: 't2',
    groupId: 'g1',
    title: 'Alugar caixa de som',
    status: 'todo',
    assignee: 'Família Souza',
    assigneeId: 'p2',
    priority: 'Média',
    description: 'Pegar uma caixa JBL ou similar para a beira da piscina.',
    checklist: [],
    links: [],
    images: [],
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

const mockPolls: Poll[] = []

const AppContext = createContext<AppState | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile>(defaultUser)
  const [participants, setParticipants] = useState<ParticipantRecord[]>([])
  const [pricingTiers, setPricingTiers] = useState<PricingTiers>(defaultPricingTiers)
  const [beverageTotal, setBeverageTotal] = useState<number>(0)

  const [groups, setGroups] = useState<Group[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  const [dailyMenus, setDailyMenus] = useState<DailyMenu[]>([])
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([])

  const [eventDetails, setEventDetails] = useState<EventDetails>({
    title: 'Farrão',
    message: '',
    date: '',
    location: '',
    targetDate: '',
    startDate: '',
    endDate: '',
    installments: [
      { id: '1', label: 'Parcela 1', dueDate: '2025-10-10' },
      { id: '2', label: 'Parcela 2', dueDate: '2025-11-10' },
      { id: '3', label: 'Parcela 3', dueDate: '2025-12-10' },
    ],
    backgroundImage: '',
  })

  const [venuePhotos, setVenuePhotos] = useState<string[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Auth Listener
  useEffect(() => {
    const unsubAuth = db.subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        let profile = await db.getUserProfile(firebaseUser.uid)
        const isGod = firebaseUser.email ? await db.checkIfSuperAdmin(firebaseUser.email) : false

        if (!profile) {
          profile = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Convidado',
            email: firebaseUser.email || '',
            hasConfirmed: false,
            profileCompleted: false,
            members: [
              {
                id: firebaseUser.uid + '-1',
                name: firebaseUser.displayName || 'Convidado',
                category: 'adult',
                isDrinking: true,
                isVegetarian: false,
                restrictions: '',
              },
            ],
            daysAttending: 1,
            isSuperAdmin: isGod,
            photoUrl: firebaseUser.photoURL || '',
            eventIds: ['farrao-2026'],
          }
          await db.updateUserProfile(firebaseUser.uid, profile)
          // Garante que o flag isSuperAdmin esteja no estado local mesmo se já tiver perfil
          profile.isSuperAdmin = true
        }
        setIsAdmin(isGod)
        setUserState(profile)
      } else {
        setUserState(defaultUser)
      }
      setIsAuthLoading(false)
    })
    return unsubAuth
  }, [])

  useEffect(() => {
    if (isAuthLoading || user.id === 'u1') return

    // Escuta os dados do Evento
    const unsubEvent = db.subscribeToEventDetails((data) => {
      if (data) {
        setEventDetails(data)
        if (data.venuePhotos) {
          setVenuePhotos(data.venuePhotos)
        }
      }
    })

    // Escuta o perfil do usuário atual (simulado como user.id por enquanto)
    const unsubProfile = db.subscribeToUserProfile(user.id, (data) => {
      if (data) setUserState(data)
    })

    // Escuta as coleções
    const unsubUsers = db.subscribeToAllEventUsers(setParticipants)

    const unsubGroups = db.subscribeToGroups(setGroups)
    const unsubTasks = db.subscribeToTasks(setTasks)
    const unsubPolls = db.subscribeToPolls(setPolls)
    const unsubAnnouncements = db.subscribeToAnnouncements(setAnnouncements)
    const unsubMenus = db.subscribeToMenus(setDailyMenus)
    const unsubShopping = db.subscribeToShoppingItems(setShoppingItems)

    return () => {
      unsubEvent()
      unsubProfile()
      unsubUsers()
      unsubGroups()
      unsubTasks()
      unsubPolls()
      unsubAnnouncements()
      unsubMenus()
      unsubShopping()
    }
  }, [user.id])

  const setUser = async (newUser: UserProfile) => {
    await db.updateUserProfile(newUser.id, newUser)
  }

  const confirmPresence = async () => {
    await db.updateEventUser(user.id, { hasConfirmed: true })
  }

  const updateParticipant = async (id: string, updates: Partial<ParticipantRecord>) => {
    await db.updateEventUser(id, updates)
  }

  const joinGroup = async (groupId: string) => {
    const group = groups.find((g) => g.id === groupId)
    if (group && !group.memberIds.includes(user.id)) {
      await db.updateGroup(groupId, { memberIds: [...group.memberIds, user.id] })

      const myParticipant = participants.find(p => p.id === user.id)
      if (myParticipant) {
        await db.updateEventUser(user.id, {
          groupIds: [...(myParticipant.groupIds || []), groupId]
        })
      }
    }
  }

  const addGroup = async (group: Omit<Group, 'id' | 'memberIds'>) => {
    await db.addGroup({ ...group, memberIds: [user.id] })
  }

  const updateGroup = async (groupId: string, updates: Partial<Group>) => {
    await db.updateGroup(groupId, updates)
  }

  const deleteGroup = async (groupId: string) => {
    await db.deleteGroup(groupId)
  }

  const leaveGroup = async (groupId: string) => {
    const group = groups.find((g) => g.id === groupId)
    if (group && group.memberIds.includes(user.id)) {
      const newMemberIds = group.memberIds.filter((id) => id !== user.id)
      await db.updateGroup(groupId, { memberIds: newMemberIds })

      const myParticipant = participants.find(p => p.id === user.id)
      if (myParticipant) {
        await db.updateEventUser(user.id, {
          groupIds: (myParticipant.groupIds || []).filter(id => id !== groupId)
        })
      }

      // Unassign tasks from this group that are not done
      const groupTasks = tasks.filter((t) => t.groupId === groupId && t.assigneeId === user.id && t.status !== 'done')
      for (const task of groupTasks) {
        await db.updateTask(task.id, { assignee: '', assigneeId: '' })
      }
    }
  }

  const removeMemberFromGroup = async (groupId: string, userId: string) => {
    const group = groups.find((g) => g.id === groupId)
    if (group && group.memberIds.includes(userId)) {
      const newMemberIds = group.memberIds.filter((id) => id !== userId)
      await db.updateGroup(groupId, { memberIds: newMemberIds })

      const targetParticipant = participants.find(p => p.id === userId)
      if (targetParticipant) {
        await db.updateEventUser(userId, {
          groupIds: (targetParticipant.groupIds || []).filter(id => id !== groupId)
        })
      }

      // Unassign tasks from this group that are not done for this user
      const groupTasks = tasks.filter((t) => t.groupId === groupId && t.assigneeId === userId && t.status !== 'done')
      for (const task of groupTasks) {
        await db.updateTask(task.id, { assignee: '', assigneeId: '' })
      }
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    await db.updateTask(id, updates)
  }

  const moveTask = async (id: string, newStatus: TaskStatus) => {
    await db.updateTask(id, { status: newStatus })
  }

  const addTask = async (task: Omit<Task, 'id'>) => {
    await db.addTask(task)
  }

  const addPoll = async (pollData: Omit<Poll, 'id' | 'votedOptionId' | 'status'>) => {
    await db.addPoll({ ...pollData, status: 'open' })
  }

  const votePoll = async (pollId: string, optionId: string) => {
    const poll = polls.find((p) => p.id === pollId)
    if (poll && poll.status === 'open' && !poll.votedOptionId) {
      // In a real app we would use Firebase Transactions to avoid race conditions.
      const updatedOptions = poll.options.map((o) =>
        o.id === optionId ? { ...o, votes: o.votes + 1 } : o
      )
      // For simplicity matching the UI mock
      await db.updatePoll(pollId, { options: updatedOptions, votedOptionId: optionId })
    }
  }

  const addAnnouncement = async (ann: Omit<Announcement, 'id' | 'date' | 'archived'>) => {
    await db.addAnnouncement({ ...ann, date: new Date().toISOString(), archived: false })
  }

  const archiveAnnouncement = async (id: string) => {
    await db.updateAnnouncement(id, { archived: true, pinned: false })
  }

  const updateEventDetails = async (details: Partial<EventDetails>) => {
    await db.updateEventDetails(details)
  }

  const updateVenuePhotos = async (photos: string[]) => {
    await db.updateEventDetails({ venuePhotos: photos } as any)
    setVenuePhotos(photos)
  }

  const updateDailyMenus = async (menus: DailyMenu[]) => {
    // Note: If menus are an array of documents, we handle them document by document. 
    // The original app states replaces the whole array. We will mock the replacement.
    setDailyMenus(menus)
  }

  const addShoppingItem = async (item: Omit<ShoppingItem, 'id'>) => {
    await db.addShoppingItem(item)
  }

  const updateShoppingItem = async (id: string, updates: Partial<ShoppingItem>) => {
    await db.updateShoppingItem(id, updates)
  }

  const deleteShoppingItem = async (id: string) => {
    await db.deleteShoppingItem(id)
  }

  const importShoppingItems = async (items: Omit<ShoppingItem, 'id'>[]) => {
    for (const item of items) {
      await db.addShoppingItem(item)
    }
  }

  const bulkAssignShoppingItems = async (itemIds: string[], assigneeId: string | null) => {
    for (const id of itemIds) {
      await db.updateShoppingItem(id, { assignedToId: assigneeId })
    }
  }

  const totalGuests = useMemo(
    () => participants.reduce((acc, p) => acc + (p.members?.length || 0), 0),
    [participants],
  )

  const isGovernance = useMemo(() => {
    if (isAdmin || user.isSuperAdmin) return true
    const myParticipant = participants.find(p => p.id === user.id)
    if (!myParticipant) return false

    // Check if any of user's groups in this event are governance type
    const userGroupIds = myParticipant.groupIds || []
    return groups.some(g => userGroupIds.includes(g.id) && g.type === 'governance')
  }, [user.id, user.isSuperAdmin, isAdmin, participants, groups])

  const userWithGovernance = useMemo(() => ({
    ...user,
    isSuperAdmin: isAdmin || user.isSuperAdmin,
    isGovernance
  }), [user, isAdmin, isGovernance])

  return (
    <AppContext.Provider
      value={{
        user: userWithGovernance,
        setUser,
        confirmPresence,
        pricingTiers,
        setPricingTiers,
        beverageTotal,
        setBeverageTotal,
        participants,
        updateParticipant,
        groups,
        joinGroup,
        addGroup,
        updateGroup,
        deleteGroup,
        leaveGroup,
        removeMemberFromGroup,
        tasks,
        updateTask,
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
        updateVenuePhotos,
        dailyMenus,
        updateDailyMenus,
        shoppingItems,
        addShoppingItem,
        updateShoppingItem,
        deleteShoppingItem,
        importShoppingItems,
        bulkAssignShoppingItems,
        isAuthLoading,
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
