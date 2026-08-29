'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import type {
  Vehicle,
  Maintenance,
  Repair,
  InventoryItem,
  Expense,
  SystemUser,
  FleetDocument,
  AuditLog,
} from '@/lib/data'

type DataContextValue = {
  isLoading: boolean
  vehicles: Vehicle[]
  maintenance: Maintenance[]
  repairs: Repair[]
  inventory: InventoryItem[]
  expenses: Expense[]
  systemUsers: SystemUser[]
  documents: FleetDocument[]
  auditLogs: AuditLog[]
  refreshAllData: () => Promise<void>
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<Vehicle | null>
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<Vehicle | null>
  deleteVehicle: (id: string) => Promise<boolean>
  addMaintenance: (record: Omit<Maintenance, 'id'>) => Promise<Maintenance | null>
  updateMaintenance: (id: string, record: Partial<Maintenance>) => Promise<Maintenance | null>
  deleteMaintenance: (id: string) => Promise<boolean>
  addRepair: (record: Omit<Repair, 'id'>) => Promise<Repair | null>
  updateRepair: (id: string, record: Partial<Repair>) => Promise<Repair | null>
  deleteRepair: (id: string) => Promise<boolean>
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<InventoryItem | null>
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => Promise<InventoryItem | null>
  deleteInventoryItem: (id: string) => Promise<boolean>
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense | null>
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<Expense | null>
  deleteExpense: (id: string) => Promise<boolean>
  addUser: (user: Omit<SystemUser, 'id' | 'lastActive'>) => Promise<SystemUser | null>
  updateUser: (id: string, user: Partial<SystemUser>) => Promise<SystemUser | null>
  deleteUser: (id: string) => Promise<boolean>
  addDocument: (doc: Omit<FleetDocument, 'id'>) => Promise<FleetDocument | null>
  updateDocument: (id: string, doc: Partial<FleetDocument>) => Promise<FleetDocument | null>
  deleteDocument: (id: string) => Promise<boolean>
}

const DataContext = createContext<DataContextValue | null>(null)

async function safeFetchJson(url: string) {
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}: ${res.statusText}` }
    }
    const text = await res.text()
    if (!text) return { success: false, error: 'Empty response' }
    return JSON.parse(text)
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to parse JSON' }
  }
}

async function safeFetchMutation(url: string, method: string, body?: any) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data: any = {}
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { success: false, error: text }
    }
  }
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`)
  }
  return data
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [maintenance, setMaintenance] = useState<Maintenance[]>([])
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([])
  const [documents, setDocuments] = useState<FleetDocument[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true)

      const endpoints = [
        { key: 'vehicles', url: '/api/vehicles', setter: setVehicles },
        { key: 'maintenance', url: '/api/maintenance', setter: setMaintenance },
        { key: 'repairs', url: '/api/repairs', setter: setRepairs },
        { key: 'inventory', url: '/api/inventory', setter: setInventory },
        { key: 'expenses', url: '/api/expenses', setter: setExpenses },
        { key: 'users', url: '/api/users', setter: setSystemUsers },
        { key: 'documents', url: '/api/documents', setter: setDocuments },
        { key: 'audit', url: '/api/audit', setter: setAuditLogs },
      ]

      const results = await Promise.allSettled(
        endpoints.map((ep) => safeFetchJson(ep.url))
      )

      results.forEach((res, index) => {
        const ep = endpoints[index]
        if (res.status === 'fulfilled' && res.value.success && Array.isArray(res.value.data)) {
          ep.setter(res.value.data)
        } else if (res.status === 'rejected' || (res.status === 'fulfilled' && !res.value.success)) {
          console.warn(`API ${ep.key} failed:`, res.status === 'fulfilled' ? res.value.error : res.reason)
        }
      })
    } catch (err: any) {
      console.error('Failed to load data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthLoading) {
      setIsLoading(true)
      return
    }

    if (user) {
      fetchAllData()
    } else {
      setVehicles([])
      setMaintenance([])
      setRepairs([])
      setInventory([])
      setExpenses([])
      setSystemUsers([])
      setDocuments([])
      setAuditLogs([])
      setIsLoading(false)
    }
  }, [user, isAuthLoading, fetchAllData])

  // Vehicle CRUD
  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      const data = await safeFetchMutation('/api/vehicles', 'POST', vehicle)
      setVehicles((prev) => [data.data, ...prev])
      toast.success(data.message || 'Vehicle saved to MongoDB')
      return data.data
    } catch (err: any) {
      toast.error(err.message || 'Error creating vehicle')
      return null
    }
  }, [])

  const updateVehicle = useCallback(async (id: string, vehicle: Partial<Vehicle>) => {
    try {
      const data = await safeFetchMutation(`/api/vehicles/${id}`, 'PUT', vehicle)
      setVehicles((prev) => prev.map((v) => (v.id === id ? data.data : v)))
      toast.success(data.message || 'Vehicle updated in MongoDB')
      return data.data
    } catch (err: any) {
      toast.error(err.message || 'Error updating vehicle')
      return null
    }
  }, [])

  const deleteVehicle = useCallback(async (id: string) => {
    try {
      const data = await safeFetchMutation(`/api/vehicles/${id}`, 'DELETE')
      setVehicles((prev) => prev.filter((v) => v.id !== id))
      toast.success(data.message || 'Vehicle deleted from MongoDB')
      return true
    } catch (err: any) {
      toast.error(err.message || 'Error deleting vehicle')
      return false
    }
  }, [])

  // Maintenance CRUD
  const addMaintenance = useCallback(async (record: Omit<Maintenance, 'id'>) => {
    try {
      const data = await safeFetchMutation('/api/maintenance', 'POST', record)
      setMaintenance((prev) => [data.data, ...prev])
      toast.success(data.message || 'Maintenance record created')
      return data.data
    } catch (err: any) {
      toast.error(err.message || 'Error creating maintenance')
      return null
    }
  }, [])

  const updateMaintenance = useCallback(async (id: string, record: Partial<Maintenance>) => {
    try {
      const data = await safeFetchMutation(`/api/maintenance/${id}`, 'PUT', record)
      setMaintenance((prev) => prev.map((m) => (m.id === id ? data.data : m)))
      toast.success(data.message || 'Maintenance record updated')
      return data.data
    } catch (err: any) {
      toast.error(err.message || 'Error updating maintenance')
      return null
    }
  }, [])

  const deleteMaintenance = useCallback(async (id: string) => {
    try {
      const data = await safeFetchMutation(`/api/maintenance/${id}`, 'DELETE')
      setMaintenance((prev) => prev.filter((m) => m.id !== id))
      toast.success(data.message || 'Maintenance record deleted')
      return true
    } catch (err: any) {
      toast.error(err.message || 'Error deleting maintenance')
      return false
    }
  }, [])

  // Repair CRUD
  const addRepair = useCallback(async (record: Omit<Repair, 'id'>) => {
    try {
      const data = await safeFetchMutation('/api/repairs', 'POST', record)
      setRepairs((prev) => [data.data, ...prev])
      toast.success(data.message || 'Repair record created')
      return data.data
    } catch (err: any) {
      toast.error(err.message || 'Error creating repair')
      return null
    }
  }, [])

  const updateRepair = useCallback(async (id: string, record: Partial<Repair>) => {
    try {
      const data = await safeFetchMutation(`/api/repairs/${id}`, 'PUT', record)
      setRepairs((prev) => prev.map((r) => (r.id === id ? data.data : r)))
      toast.success(data.message || 'Repair record updated')
      return data.data
    } catch (err: any) {
      toast.error(err.message || 'Error updating repair')
      return null
    }
  }, [])

  const deleteRepair = useCallback(async (id: string) => {
    try {
      const data = await safeFetchMutation(`/api/repairs/${id}`, 'DELETE')
      setRepairs((prev) => prev.filter((r) => r.id !== id))
      toast.success(data.message || 'Repair record deleted')
      return true
    } catch (err: any) {
      toast.error(err.message || 'Error deleting repair')
      return false
    }
  }, [])

  // Inventory CRUD
  const addInventoryItem = useCallback(async (item: Omit<InventoryItem, 'id'>) => {
    try {
      const data = await safeFetchMutation('/api/inventory', 'POST', item)
      setInventory((prev) => [data.data, ...prev])
      toast.success(data.message || 'Inventory item added')
      return data.data
    } catch (err: any) {
      toast.error(err.message || 'Error creating inventory item')
      return null
    }
  }, [])

  const updateInventoryItem = useCallback(async (id: string, item: Partial<InventoryItem>) => {
    try {
      const data = await safeFetchMutation(`/api/inventory/${id}`, 'PUT', item)
      setInventory((prev) => prev.map((i) => (i.id === id ? data.data : i)))
      toast.success(data.message || 'Inventory item updated')
      return data.data
    } catch (err: any) {
      toast.error(err.message || 'Error updating inventory item')
      return null
    }
  }, [])

  const deleteInventoryItem = useCallback(async (id: string) => {
    try {
      const data = await safeFetchMutation(`/api/inventory/${id}`, 'DELETE')
      setInventory((prev) => prev.filter((i) => i.id !== id))
      toast.success(data.message || 'Inventory item deleted')
      return true
    } catch (err: any) {
      toast.error(err.message || 'Error deleting item')
      return false
    }
  }, [])

  // Expense CRUD
  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    try {
      const data = await safeFetchMutation('/api/expenses', 'POST', expense)
      setExpenses((prev) => [data.data, ...prev])
      toast.success(data.message || 'Expense logged')
      return data.data
    } catch (err: any) {
      toast.error(err.message || 'Error logging expense')
      return null
    }
  }, [])

  const updateExpense = useCallback(async (id: string, expense: Partial<Expense>) => {
    try {
      const data = await safeFetchMutation(`/api/expenses/${id}`, 'PUT', expense)
      setExpenses((prev) => prev.map((e) => (e.id === id ? data.data : e)))
      toast.success(data.message || 'Expense updated')
      return data.data
    } catch (err: any) {
      toast.error(err.message || 'Error updating expense')
      return null
    }
  }, [])

  const deleteExpense = useCallback(async (id: string) => {
    try {
      const data = await safeFetchMutation(`/api/expenses/${id}`, 'DELETE')
      setExpenses((prev) => prev.filter((e) => e.id !== id))
      toast.success(data.message || 'Expense deleted')
      return true
    } catch (err: any) {
      toast.error(err.message || 'Error deleting expense')
      return false
    }
  }, [])

  // User CRUD
  const addUser = useCallback(async (user: Omit<SystemUser, 'id' | 'lastActive'>) => {
    try {
      const data = await safeFetchMutation('/api/users', 'POST', user)
      setSystemUsers((prev) => [data.data, ...prev])
      toast.success(data.message || 'User created')
      return data.data
    } catch (err: any) {
      toast.error(err.message || 'Error creating user')
      return null
    }
  }, [])

  const updateUser = useCallback(async (id: string, user: Partial<SystemUser>) => {
    try {
      const data = await safeFetchMutation(`/api/users/${id}`, 'PUT', user)
      setSystemUsers((prev) => prev.map((u) => (u.id === id ? data.data : u)))
      toast.success(data.message || 'User updated')
      return data.data
    } catch (err: any) {
      toast.error(err.message || 'Error updating user')
      return null
    }
  }, [])

  const deleteUser = useCallback(async (id: string) => {
    try {
      const data = await safeFetchMutation(`/api/users/${id}`, 'DELETE')
      setSystemUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success(data.message || 'User removed')
      return true
    } catch (err: any) {
      toast.error(err.message || 'Error deleting user')
      return false
    }
  }, [])

  // Document CRUD
  const addDocument = useCallback(async (doc: Omit<FleetDocument, 'id'>) => {
    try {
      const data = await safeFetchMutation('/api/documents', 'POST', doc)
      setDocuments((prev) => [data.data, ...prev])
      toast.success(data.message || 'Document uploaded')
      return data.data
    } catch (err: any) {
      toast.error(err.message || 'Error uploading document')
      return null
    }
  }, [])

  const updateDocument = useCallback(async (id: string, doc: Partial<FleetDocument>) => {
    try {
      const data = await safeFetchMutation(`/api/documents/${id}`, 'PUT', doc)
      setDocuments((prev) => prev.map((d) => (d.id === id ? data.data : d)))
      toast.success(data.message || 'Document updated')
      return data.data
    } catch (err: any) {
      toast.error(err.message || 'Error updating document')
      return null
    }
  }, [])

  const deleteDocument = useCallback(async (id: string) => {
    try {
      const data = await safeFetchMutation(`/api/documents/${id}`, 'DELETE')
      setDocuments((prev) => prev.filter((d) => d.id !== id))
      toast.success(data.message || 'Document deleted')
      return true
    } catch (err: any) {
      toast.error(err.message || 'Error deleting document')
      return false
    }
  }, [])

  const value = useMemo(
    () => ({
      isLoading,
      vehicles,
      maintenance,
      repairs,
      inventory,
      expenses,
      systemUsers,
      documents,
      auditLogs,
      refreshAllData: fetchAllData,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      addMaintenance,
      updateMaintenance,
      deleteMaintenance,
      addRepair,
      updateRepair,
      deleteRepair,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      addExpense,
      updateExpense,
      deleteExpense,
      addUser,
      updateUser,
      deleteUser,
      addDocument,
      updateDocument,
      deleteDocument,
    }),
    [
      isLoading,
      vehicles,
      maintenance,
      repairs,
      inventory,
      expenses,
      systemUsers,
      documents,
      auditLogs,
      fetchAllData,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      addMaintenance,
      updateMaintenance,
      deleteMaintenance,
      addRepair,
      updateRepair,
      deleteRepair,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      addExpense,
      updateExpense,
      deleteExpense,
      addUser,
      updateUser,
      deleteUser,
      addDocument,
      updateDocument,
      deleteDocument,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
