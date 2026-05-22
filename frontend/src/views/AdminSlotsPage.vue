<script setup lang="ts">
import { ref, computed } from 'vue'
import { generateMockSlots } from '@/mocks/slots'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const todayStr = new Date().toISOString().slice(0, 10)

const maxDateStr = (() => {
  const d = new Date()
  d.setDate(d.getDate() + 13)
  return d.toISOString().slice(0, 10)
})()

const selectedDate = ref(todayStr)

const allSlots = computed(() => generateMockSlots('admin'))

const slotsForDate = computed(() =>
  allSlots.value.filter((s) => s.startTime.slice(0, 10) === selectedDate.value),
)

function isoToLocalTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// ── Slot dialog (create / edit) ──

const slotDialogOpen = ref(false)
const editingSlotId = ref<string | null>(null)
const formStartTime = ref('09:00')
const formEndTime = ref('10:00')

const isEditMode = computed(() => editingSlotId.value !== null)

function checkOverlap(start: string, end: string): string[] {
  const result: string[] = []
  for (const s of slotsForDate.value) {
    if (s.id === editingSlotId.value) continue
    const sStart = isoToLocalTime(s.startTime)
    const sEnd = isoToLocalTime(s.endTime)
    if (start < sEnd && end > sStart) {
      result.push(`${sStart}–${sEnd}`)
    }
  }
  return result
}

function openAdd() {
  editingSlotId.value = null
  formStartTime.value = '09:00'
  formEndTime.value = '10:00'
  slotDialogOpen.value = true
}

function openEdit(slotId: string) {
  const slot = allSlots.value.find((s) => s.id === slotId)
  if (!slot) return
  editingSlotId.value = slotId
  formStartTime.value = isoToLocalTime(slot.startTime)
  formEndTime.value = isoToLocalTime(slot.endTime)
  slotDialogOpen.value = true
}

function handleSubmit() {
  slotDialogOpen.value = false
}

// ── Delete dialog ──

const deleteDialogOpen = ref(false)
const deletingSlotLabel = ref('')

function openDelete(iso: string) {
  deletingSlotLabel.value = `${isoToLocalTime(iso)}`
  deleteDialogOpen.value = true
}

function handleDelete() {
  deleteDialogOpen.value = false
}
</script>

<template>
  <div class="max-w-[1000px]">
    <h1 class="text-2xl font-bold mb-6">Слоты</h1>

    <div class="flex items-end gap-4 mb-6">
      <div class="space-y-1.5">
        <Label>Дата</Label>
        <Input v-model="selectedDate" type="date" :max="maxDateStr" />
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <p class="text-sm text-muted-foreground">
          Слотов на выбранную дату: {{ slotsForDate.length }}
        </p>
        <Button size="sm" @click="openAdd">Добавить слот</Button>
      </div>

      <div
        v-if="slotsForDate.length === 0"
        class="text-sm text-muted-foreground py-8 text-center border rounded-lg"
      >
        Нет слотов на эту дату
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="slot in slotsForDate"
          :key="slot.id"
          class="rounded-lg border bg-card text-card-foreground px-4 py-3 flex items-center justify-between"
        >
          <span class="text-sm font-mono tabular-nums">
            {{ isoToLocalTime(slot.startTime) }} – {{ isoToLocalTime(slot.endTime) }}
          </span>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" @click="openEdit(slot.id)">Редактировать</Button>
            <Button variant="destructive" size="sm" @click="openDelete(slot.startTime)">
              Удалить
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Slot dialog (create / edit) -->
    <Dialog v-model:open="slotDialogOpen">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{{ isEditMode ? 'Редактирование слота' : 'Новый слот' }}</DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <div class="space-y-1.5">
            <Label>Время начала</Label>
            <input
              :value="formStartTime"
              @input="formStartTime = ($event.target as HTMLInputElement).value"
              type="time"
              class="border-input dark:bg-input/30 h-8 w-full rounded-lg border bg-transparent px-2.5 py-1 text-base outline-none md:text-sm"
            />
          </div>
          <div class="space-y-1.5">
            <Label>Время окончания</Label>
            <input
              :value="formEndTime"
              @input="formEndTime = ($event.target as HTMLInputElement).value"
              type="time"
              class="border-input dark:bg-input/30 h-8 w-full rounded-lg border bg-transparent px-2.5 py-1 text-base outline-none md:text-sm"
            />
          </div>
        </div>

        <!-- in-dialog validation -->
        <template v-if="formStartTime && formEndTime">
          <p v-if="formStartTime >= formEndTime" class="text-xs text-destructive">
            Время окончания должно быть позже времени начала
          </p>
          <p
            v-else-if="checkOverlap(formStartTime, formEndTime).length > 0"
            class="text-xs text-destructive"
          >
            Слот пересекается с:
            {{ checkOverlap(formStartTime, formEndTime).join(', ') }}
          </p>
        </template>

        <DialogFooter class="mt-4 gap-2">
          <Button
            variant="default"
            :disabled="!formStartTime || !formEndTime || formStartTime >= formEndTime || checkOverlap(formStartTime, formEndTime).length > 0"
            @click="handleSubmit"
          >
            {{ isEditMode ? 'Обновить' : 'Создать' }}
          </Button>
          <Button variant="outline" @click="slotDialogOpen = false">Отмена</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete dialog -->
    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Удаление слота</DialogTitle>
        </DialogHeader>
        <p class="text-sm text-muted-foreground">Удалить слот {{ deletingSlotLabel }}?</p>
        <DialogFooter class="mt-4 gap-2">
          <Button variant="destructive" @click="handleDelete">Удалить</Button>
          <Button variant="outline" @click="deleteDialogOpen = false">Отмена</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
