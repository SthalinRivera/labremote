<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'
import type { User } from '~/types'
import UsersBulkModal from '~/components/users/UsersBulkModal.vue'

const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

definePageMeta({
  layout: "dashboard",
  roles: ["admin"]
})

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{
  id: 'email',
  value: ''
}])
const columnVisibility = ref()
const rowSelection = ref({})

const api = useApi()

// Obtener usuarios
const { data: users, status, refresh } = useAsyncData(
  'users',
  () => api<User[]>('/users'),
  { default: () => [] }
)

// --- Eliminaciones ---
async function deleteUser(id: number) {
  try {
    await api(`/users/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Usuario eliminado', description: `ID ${id} eliminado` })
    await refresh()
    if (rowSelection.value[id]) delete rowSelection.value[id]
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
}

async function deleteSelectedUsers() {
  const selectedRows = table.value?.tableApi?.getFilteredSelectedRowModel().rows || []
  const ids = selectedRows.map(row => row.original.id)
  if (!ids.length) return

  try {
    await Promise.all(ids.map(id => api(`/users/${id}`, { method: 'DELETE' })))
    toast.add({ title: `${ids.length} usuario(s) eliminado(s)` })
    await refresh()
    rowSelection.value = {}
  } catch (error: any) {
    toast.add({ title: 'Error en eliminación múltiple', description: error.message, color: 'error' })
  }
}

// --- Cambio de rol ---
async function changeRole(user: User, newRole: 'admin' | 'student') {
  try {
    await api(`/users/${user.id}/role`, {
      method: 'PUT',
      body: { role: newRole }
    })
    toast.add({ title: 'Rol actualizado', description: `${user.email} ahora es ${newRole}` })
    await refresh()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
}

// --- Modales ---
const addModalRef = useTemplateRef('addModal')
const editModalRef = useTemplateRef('editModal')
const bulkModalRef = useTemplateRef('bulkModal')

const userToEdit = ref<User | null>(null)

function openEditModal(user: User) {
  userToEdit.value = user
  editModalRef.value?.open()
}

// --- Menú de acciones por fila ---
function getRowItems(row: Row<User>) {
  const user = row.original
  const isAdmin = user.role === 'admin'

  return [
    { type: 'label', label: 'Acciones' },
    {
      label: 'Copiar ID',
      icon: 'i-lucide-copy',
      onSelect() {
        navigator.clipboard.writeText(user.id.toString())
        toast.add({ title: 'ID copiado', description: 'ID del usuario copiado al portapapeles' })
      }
    },
    {
      label: isAdmin ? 'Cambiar a Estudiante' : 'Cambiar a Administrador',
      icon: 'i-lucide-shield',
      onSelect: () => changeRole(user, isAdmin ? 'student' : 'admin')
    },
    {
      label: 'Editar usuario',
      icon: 'i-lucide-edit',
      onSelect: () => openEditModal(user)
    },
    { type: 'separator' },
    {
      label: 'Ver detalles',
      icon: 'i-lucide-list',
      onSelect: () => navigateTo(`/dashboard/users/${user.id}`)
    },
    {
      label: 'Eliminar usuario',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect: () => deleteUser(user.id)
    }
  ]
}

// --- Columnas de la tabla ---
const columns: TableColumn<User>[] = [
  {
    id: 'select',
    header: ({ table }) => h(UCheckbox, {
      checked: table.getIsAllRowsSelected(),
      indeterminate: table.getIsSomeRowsSelected(),
      'onUpdate:checked': (value: boolean) => table.toggleAllRowsSelected(!!value)
    }),
    cell: ({ row }) => h(UCheckbox, {
      checked: row.getIsSelected(),
      'onUpdate:checked': (value: boolean) => row.toggleSelected(!!value)
    })
  },
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Nombre' },
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'role',
    header: 'Rol',
    cell: ({ row }) => h(UBadge, {
      color: row.original.role === 'admin' ? 'success' : 'neutral'
    }, () => row.original.role === 'admin' ? 'Administrador' : 'Estudiante')
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => h(UDropdownMenu, {
      items: getRowItems(row),
      content: { align: 'end' }
    }, () => h(UButton, { variant: 'ghost', icon: 'i-lucide-more-vertical' }))
  }
]

// --- Filtros ---
const emailFilter = computed({
  get: () => (table.value?.tableApi?.getColumn('email')?.getFilterValue() as string) || '',
  set: (value: string) => {
    table.value?.tableApi?.getColumn('email')?.setFilterValue(value || undefined)
  }
})

const roleFilter = ref('all')
watch(roleFilter, (newVal) => {
  const roleColumn = table.value?.tableApi?.getColumn('role')
  if (!roleColumn) return
  roleColumn.setFilterValue(newVal === 'all' ? undefined : newVal)
})

// --- Paginación ---
const pagination = ref({ pageIndex: 0, pageSize: 10 })
</script>

<template>
  <UDashboardPanel id="users">
    <template #header>
      <UDashboardNavbar title="Usuarios">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <div class="flex gap-2">
            <UsersBulkModal ref="bulkModal" @success="refresh" />
            <UsersAddModal ref="addModal" @success="refresh" />
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5 mb-4">
        <UInput v-model="emailFilter" class="max-w-sm" icon="i-lucide-search" placeholder="Filtrar por email..." />

        <div class="flex flex-wrap items-center gap-1.5">
          <UButton v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length" label="Eliminar seleccionados"
            color="error" variant="subtle" icon="i-lucide-trash" @click="deleteSelectedUsers">
            <template #trailing>
              <UKbd>{{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}</UKbd>
            </template>
          </UButton>

          <USelect v-model="roleFilter" :items="[
            { label: 'Todos', value: 'all' },
            { label: 'Administradores', value: 'admin' },
            { label: 'Estudiantes', value: 'student' }
          ]" placeholder="Filtrar por rol" class="min-w-36" />

          <UDropdownMenu :items="table?.tableApi?.getAllColumns()
            .filter(col => col.getCanHide() && col.id !== 'select')
            .map(col => ({
              label: upperFirst(col.id),
              type: 'checkbox' as const,
              checked: col.getIsVisible(),
              onUpdateChecked: (checked: boolean) => col.toggleVisibility(checked),
              onSelect: (e?: Event) => e?.preventDefault()
            }))" :content="{ align: 'end' }">
            <UButton label="Mostrar columnas" color="neutral" variant="outline" trailing-icon="i-lucide-settings-2" />
          </UDropdownMenu>
        </div>
      </div>

      <UTable ref="table" v-model:row-selection="rowSelection" v-model:pagination="pagination"
        :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }" :data="users" :columns="columns"
        :loading="status === 'pending'" :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          separator: 'h-0'
        }" />

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} de
          {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} fila(s) seleccionada(s).
        </div>
        <div class="flex items-center gap-1.5">
          <UPagination :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)" />
        </div>
      </div>



    </template>


  </UDashboardPanel>
  <!-- Modales -->


</template>