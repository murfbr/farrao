import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  addDoc,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, User, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { db, auth, storage } from './config'
import type { 
  UserProfile, 
  ParticipantRecord, 
  Group, 
  Task, 
  Poll, 
  ShoppingItem, 
  Announcement, 
  DailyMenu,
  EventDetails
} from '../stores/useAppStore'

const EVENT_ID = 'farrao-2026'

// --- AUTHENTICATION ---
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

export const checkIfSuperAdmin = async (email: string) => {
  try {
    const snap = await getDoc(doc(db, 'superadmins', email))
    return snap.exists()
  } catch (err) {
    // Se jogar erro de permissão (Missing or insufficient permissions), 
    // sabemos que ele NÃO é superadmin, pois a regra no Firestore bloqueia a leitura.
    return false
  }
}

export const loginWithEmail = async (email: string, pass: string) => {
  return await signInWithEmailAndPassword(auth, email, pass)
}

export const registerWithEmail = async (email: string, pass: string) => {
  return await createUserWithEmailAndPassword(auth, email, pass)
}

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  await signInWithPopup(auth, provider)
}

export const logout = async () => {
  await signOut(auth)
}

// --- ALLOWLIST (CONVITES) ---
export const addAllowedEmail = async (email: string) => {
  const docRef = doc(db, 'allowed_emails', email)
  await setDoc(docRef, { events: [EVENT_ID], addedAt: new Date().toISOString() }, { merge: true })
}

export const getAllowedEmails = (callback: (emails: any[]) => void) => {
  const q = collection(db, 'allowed_emails')
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export const removeAllowedEmail = async (email: string) => {
  const docRef = doc(db, 'allowed_emails', email)
  await deleteDoc(docRef)
}

// --- USERS (GLOBAL) ---
export const getUserProfile = async (userId: string) => {
  const docRef = doc(db, 'users', userId)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? (docSnap.data() as UserProfile) : null
}

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const docRef = doc(db, 'users', userId)
  await setDoc(docRef, data, { merge: true })
}

export const subscribeToUserProfile = (userId: string, callback: (data: UserProfile | null) => void) => {
  return onSnapshot(doc(db, 'users', userId), (doc) => {
    callback(doc.exists() ? (doc.data() as UserProfile) : null)
  })
}

// --- EVENT CONFIGURATION ---
export const subscribeToEventDetails = (callback: (data: EventDetails | null) => void) => {
  return onSnapshot(doc(db, 'events', EVENT_ID), (docSnap) => {
    callback(docSnap.exists() ? (docSnap.data() as EventDetails) : null)
  })
}

export const updateEventDetails = async (data: Partial<EventDetails>) => {
  await setDoc(doc(db, 'events', EVENT_ID), data, { merge: true })
}

// --- EVENT USERS (INSCRICAO) ---
export const subscribeToEventUser = (userId: string, callback: (data: ParticipantRecord | null) => void) => {
  return onSnapshot(doc(db, 'events', EVENT_ID, 'participants', userId), (docSnap) => {
    callback(docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as ParticipantRecord) : null)
  })
}

export const updateEventUser = async (userId: string, data: Partial<ParticipantRecord>) => {
  const docRef = doc(db, 'events', EVENT_ID, 'participants', userId)
  await setDoc(docRef, data, { merge: true })
}

export const subscribeToAllEventUsers = (callback: (data: ParticipantRecord[]) => void) => {
  return onSnapshot(collection(db, 'events', EVENT_ID, 'participants'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParticipantRecord)))
  })
}

// --- PARTICIPANTS (MEMBROS FÍSICOS) ---
// Na arquitetura aprovada, as pessoas físicas ficam num array `members` DENTRO do event_users (ParticipantRecord).
// Portanto, a leitura e gravação dos participantes ocorre através do updateEventUser.

// --- GROUPS ---
export const subscribeToGroups = (callback: (data: Group[]) => void) => {
  return onSnapshot(collection(db, 'events', EVENT_ID, 'groups'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group)))
  })
}

export const updateGroup = async (groupId: string, data: Partial<Group>) => {
  await updateDoc(doc(db, 'events', EVENT_ID, 'groups', groupId), data)
}

export const addGroup = async (data: Omit<Group, 'id'>) => {
  await addDoc(collection(db, 'events', EVENT_ID, 'groups'), data)
}

export const deleteGroup = async (groupId: string) => {
  await deleteDoc(doc(db, 'events', EVENT_ID, 'groups', groupId))
}

// --- TASKS ---
export const subscribeToTasks = (callback: (data: Task[]) => void) => {
  return onSnapshot(collection(db, 'events', EVENT_ID, 'tasks'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)))
  })
}

export const updateTask = async (taskId: string, data: Partial<Task>) => {
  await updateDoc(doc(db, 'events', EVENT_ID, 'tasks', taskId), data)
}

export const addTask = async (data: Omit<Task, 'id'>) => {
  await addDoc(collection(db, 'events', EVENT_ID, 'tasks'), data)
}

export const deleteTask = async (taskId: string) => {
  await deleteDoc(doc(db, 'events', EVENT_ID, 'tasks', taskId))
}

// --- POLLS ---
export const subscribeToPolls = (callback: (data: Poll[]) => void) => {
  return onSnapshot(collection(db, 'events', EVENT_ID, 'polls'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poll)))
  })
}

export const updatePoll = async (pollId: string, data: Partial<Poll>) => {
  await updateDoc(doc(db, 'events', EVENT_ID, 'polls', pollId), data)
}

export const addPoll = async (data: Omit<Poll, 'id'>) => {
  await addDoc(collection(db, 'events', EVENT_ID, 'polls'), data)
}

// --- SHOPPING ITEMS ---
export const subscribeToShoppingItems = (callback: (data: ShoppingItem[]) => void) => {
  return onSnapshot(collection(db, 'events', EVENT_ID, 'shopping_items'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingItem)))
  })
}

export const updateShoppingItem = async (itemId: string, data: Partial<ShoppingItem>) => {
  await updateDoc(doc(db, 'events', EVENT_ID, 'shopping_items', itemId), data)
}

export const addShoppingItem = async (data: Omit<ShoppingItem, 'id'>) => {
  await addDoc(collection(db, 'events', EVENT_ID, 'shopping_items'), data)
}

export const deleteShoppingItem = async (itemId: string) => {
  await deleteDoc(doc(db, 'events', EVENT_ID, 'shopping_items', itemId))
}

// --- ANNOUNCEMENTS ---
export const subscribeToAnnouncements = (callback: (data: Announcement[]) => void) => {
  return onSnapshot(collection(db, 'events', EVENT_ID, 'announcements'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)))
  })
}

export const updateAnnouncement = async (annId: string, data: Partial<Announcement>) => {
  await updateDoc(doc(db, 'events', EVENT_ID, 'announcements', annId), data)
}

export const addAnnouncement = async (data: Omit<Announcement, 'id'>) => {
  await addDoc(collection(db, 'events', EVENT_ID, 'announcements'), data)
}

// --- MENUS ---
export const subscribeToMenus = (callback: (data: DailyMenu[]) => void) => {
  return onSnapshot(collection(db, 'events', EVENT_ID, 'menus'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyMenu)))
  })
}

export const updateMenu = async (menuId: string, data: Partial<DailyMenu>) => {
  await updateDoc(doc(db, 'events', EVENT_ID, 'menus', menuId), data)
}

export const addMenu = async (data: Omit<DailyMenu, 'id'>) => {
  await addDoc(collection(db, 'events', EVENT_ID, 'menus'), data)
}

// --- STORAGE ---
export const uploadStorageFile = async (path: string, file: File) => {
  const fileRef = ref(storage, path)
  await uploadBytes(fileRef, file)
  return await getDownloadURL(fileRef)
}

export const uploadVenuePhoto = async (file: File) => {
  const path = `events/${EVENT_ID}/venue_photos/${Date.now()}_${file.name}`
  return await uploadStorageFile(path, file)
}
