// Management page - main component for managing slots, days off, sick leave, and vacation
import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { useThemeStore } from '@/store/themeStore'
import { useAuthStore } from '@/store/authStore'
import { ManagementTable } from '@/components/Management/ManagementTable'
import { ManagementWeekView } from '@/components/Management/ManagementWeekView'
import { SlotForm } from '@/components/Management/SlotForm'
import { DayStatusForm } from '@/components/Management/DayStatusForm'
import { AdminModeButton } from '@/components/Management/AdminModeButton'
import { Calendar, Table2, Plus } from 'lucide-react'

type ViewMode = 'table' | 'week'

export const Management = () => {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showSlotForm, setShowSlotForm] = useState(false)
  const [showStatusForm, setShowStatusForm] = useState(false)
  const [statusType, setStatusType] = useState<'dayoff' | 'sick' | 'vacation' | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [editingSlot, setEditingSlot] = useState<any>(null)
  const [editingStatus, setEditingStatus] = useState<any>(null)

  const handleAddSlot = () => {
    setEditingSlot(null)
    setShowSlotForm(true)
  }

  const handleEditSlot = (slot: any) => {
    setEditingSlot(slot)
    setShowSlotForm(true)
  }

  const handleAddStatus = (type: 'dayoff' | 'sick' | 'vacation') => {
    setStatusType(type)
    setEditingStatus(null)
    setShowStatusForm(true)
  }

  const handleEditStatus = (status: any) => {
    setEditingStatus(status)
    setStatusType(status.type)
    setShowStatusForm(true)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with controls */}
        <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Management</h2>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* View mode toggle */}
              <div className={`flex rounded-lg p-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    viewMode === 'table'
                      ? 'bg-green-500 text-white'
                      : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-600'
                      : 'text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Table2 className="w-4 h-4" />
                  Таблица
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    viewMode === 'week'
                      ? 'bg-green-500 text-white'
                      : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-600'
                      : 'text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Неделя
                </button>
              </div>

              {/* Add buttons */}
              <button
                onClick={handleAddSlot}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Добавить слот
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAddStatus('dayoff')}
                  className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm"
                >
                  Выходной
                </button>
                <button
                  onClick={() => handleAddStatus('sick')}
                  className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
                >
                  Больничный
                </button>
                <button
                  onClick={() => handleAddStatus('vacation')}
                  className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm"
                >
                  Отпуск
                </button>
              </div>
            </div>
          </div>

          {/* Participant filter */}
          <div className="mt-4">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Фильтр по участникам:
            </label>
            <select
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(e.target.value || null)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              <option value="">Все участники</option>
              {user && <option value={user.id}>{user.name}</option>}
            </select>
          </div>
        </div>

        {/* Admin mode button */}
        <AdminModeButton />

        {/* Content view */}
        {viewMode === 'table' ? (
          <ManagementTable
            selectedUserId={selectedUserId}
            onEditSlot={handleEditSlot}
            onEditStatus={handleEditStatus}
          />
        ) : (
          <ManagementWeekView
            selectedUserId={selectedUserId}
            onEditSlot={handleEditSlot}
            onEditStatus={handleEditStatus}
          />
        )}

        {/* Forms */}
        {showSlotForm && (
          <SlotForm
            slot={editingSlot}
            onClose={() => {
              setShowSlotForm(false)
              setEditingSlot(null)
            }}
            onSave={() => {
              setShowSlotForm(false)
              setEditingSlot(null)
            }}
          />
        )}

        {showStatusForm && statusType && (
          <DayStatusForm
            type={statusType}
            status={editingStatus}
            onClose={() => {
              setShowStatusForm(false)
              setStatusType(null)
              setEditingStatus(null)
            }}
            onSave={() => {
              setShowStatusForm(false)
              setStatusType(null)
              setEditingStatus(null)
            }}
          />
        )}
      </div>
    </Layout>
  )
}

