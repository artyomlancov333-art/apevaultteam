// Firestore service for data operations
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { WorkSlot, DayStatus, Earnings, RatingData } from '@/types'

// Work Slots
export const getWorkSlots = async (userId?: string, date?: string) => {
  const slotsRef = collection(db, 'workSlots')
  let q = query(slotsRef, orderBy('date', 'asc'))

  if (userId) {
    q = query(q, where('userId', '==', userId))
  }
  if (date) {
    q = query(q, where('date', '==', date))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as WorkSlot))
}

export const addWorkSlot = async (slot: Omit<WorkSlot, 'id'>) => {
  const slotsRef = collection(db, 'workSlots')
  return await addDoc(slotsRef, slot)
}

export const updateWorkSlot = async (id: string, updates: Partial<WorkSlot>) => {
  const slotRef = doc(db, 'workSlots', id)
  return await updateDoc(slotRef, updates)
}

export const deleteWorkSlot = async (id: string) => {
  const slotRef = doc(db, 'workSlots', id)
  return await deleteDoc(slotRef)
}

// Day Statuses
export const getDayStatuses = async (userId?: string, date?: string) => {
  const statusesRef = collection(db, 'dayStatuses')
  let q = query(statusesRef, orderBy('date', 'asc'))

  if (userId) {
    q = query(q, where('userId', '==', userId))
  }
  if (date) {
    q = query(q, where('date', '==', date))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DayStatus))
}

export const addDayStatus = async (status: Omit<DayStatus, 'id'>) => {
  const statusesRef = collection(db, 'dayStatuses')
  return await addDoc(statusesRef, status)
}

export const updateDayStatus = async (id: string, updates: Partial<DayStatus>) => {
  const statusRef = doc(db, 'dayStatuses', id)
  return await updateDoc(statusRef, updates)
}

export const deleteDayStatus = async (id: string) => {
  const statusRef = doc(db, 'dayStatuses', id)
  return await deleteDoc(statusRef)
}

// Earnings
export const getEarnings = async (userId?: string, startDate?: string, endDate?: string) => {
  const earningsRef = collection(db, 'earnings')
  let q = query(earningsRef, orderBy('date', 'desc'))

  if (userId) {
    q = query(q, where('userId', '==', userId))
  }
  if (startDate && endDate) {
    q = query(q, where('date', '>=', startDate), where('date', '<=', endDate))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Earnings))
}

export const addEarnings = async (earning: Omit<Earnings, 'id'>) => {
  const earningsRef = collection(db, 'earnings')
  return await addDoc(earningsRef, earning)
}

export const updateEarnings = async (id: string, updates: Partial<Earnings>) => {
  const earningRef = doc(db, 'earnings', id)
  return await updateDoc(earningRef, updates)
}

export const deleteEarnings = async (id: string) => {
  const earningRef = doc(db, 'earnings', id)
  return await deleteDoc(earningRef)
}

// Rating
export const getRatingData = async (userId?: string) => {
  const ratingRef = collection(db, 'ratings')
  let q = query(ratingRef)

  if (userId) {
    q = query(q, where('userId', '==', userId))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      userId: data.userId || '',
      earnings: data.earnings || 0,
      messages: data.messages || 0,
      initiatives: data.initiatives || 0,
      signals: data.signals || 0,
      profitableSignals: data.profitableSignals || 0,
      referrals: data.referrals || 0,
      daysOff: data.daysOff || 0,
      sickDays: data.sickDays || 0,
      vacationDays: data.vacationDays || 0,
      poolAmount: data.poolAmount || 0,
      rating: data.rating || 0,
      lastUpdated: data.lastUpdated || new Date().toISOString(),
    } as RatingData
  })
}

export const updateRatingData = async (userId: string, data: Partial<RatingData>) => {
  const ratingRef = doc(db, 'ratings', userId)
  const ratingDoc = await getDoc(ratingRef)
  
  if (ratingDoc.exists()) {
    return await updateDoc(ratingRef, data)
  } else {
    return await addDoc(collection(db, 'ratings'), { userId, ...data })
  }
}

