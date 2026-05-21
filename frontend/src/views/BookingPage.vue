<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CalendarGrid from '@/components/CalendarGrid.vue'
import { mockEventTypes } from '@/mocks/eventTypes'
import { generateMockSlots } from '@/mocks/slots'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const route = useRoute()
const router = useRouter()

const eventTypeId = computed(() => route.params.eventTypeId as string)

const selectedType = computed({
  get: () => eventTypeId.value,
  set: (val: string) => router.push(`/event/${val}`),
})

const slots = computed(() => generateMockSlots(eventTypeId.value))

const selectedDay = ref<Date | null>(new Date())

function localDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isoToLocalTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  })
}

const slotsForDay = computed(() => {
  if (!selectedDay.value) return []
  const day = localDateStr(selectedDay.value)
  return slots.value.filter((s) => s.startTime.slice(0, 10) === day)
})

// ── Dialog state ──

const dialogOpen = ref(false)
const selectedSlotId = ref<string | null>(null)

const selectedSlot = computed(() =>
  slots.value.find((s) => s.id === selectedSlotId.value) ?? null,
)

const guestName = ref('')
const customTime = ref('')

const currentEventType = computed(() =>
  mockEventTypes.find((t) => t.id === eventTypeId.value) ?? null,
)

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + mins
  const nh = Math.floor(total / 60)
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

function timeGt(a: string, b: string): boolean {
  return a > b
}

const timeValidation = computed(() => {
  if (!selectedSlot.value || !currentEventType.value || !customTime.value) {
    return { valid: true, message: '' }
  }
  const slotStart = isoToLocalTime(selectedSlot.value.startTime)
  const slotEnd = isoToLocalTime(selectedSlot.value.endTime)
  const computedEnd = addMinutes(customTime.value, currentEventType.value.duration)

  if (timeGt(slotStart, customTime.value)) {
    return {
      valid: false,
      message: `Время начала (${customTime.value}) раньше начала слота (${slotStart})`,
    }
  }
  if (timeGt(computedEnd, slotEnd)) {
    return {
      valid: false,
      message: `Встреча закончится в ${computedEnd}, что выходит за пределы слота (до ${slotEnd})`,
    }
  }
  return { valid: true, message: '' }
})

function openBooking(slotId: string) {
  selectedSlotId.value = slotId
  const slot = slots.value.find((s) => s.id === slotId)
  if (slot) {
    customTime.value = isoToLocalTime(slot.startTime)
  }
  guestName.value = ''
  dialogOpen.value = true
}

function submitBooking() {
  dialogOpen.value = false
  window.location.reload()
}

const daySlotsForSelect = computed(() => {
  if (!selectedDay.value) return []
  const day = localDateStr(selectedDay.value)
  return slots.value.filter((s) => s.startTime.slice(0, 10) === day)
})

function onSlotSelectChange(val: string) {
  selectedSlotId.value = val
  const slot = slots.value.find((s) => s.id === val)
  if (slot) {
    customTime.value = isoToLocalTime(slot.startTime)
  }
}

function timeMin() {
  return selectedSlot.value ? isoToLocalTime(selectedSlot.value.startTime) : ''
}

function timeMax() {
  return selectedSlot.value ? isoToLocalTime(selectedSlot.value.endTime) : ''
}
</script>

<template>
  <div class="py-8 px-4">
    <!-- Event type selector -->
    <div class="max-w-sm mb-8">
      <Label class="mb-1.5 block">Тип встречи</Label>
      <Select :model-value="selectedType" @update:model-value="selectedType = $event">
        <SelectTrigger class="w-full">
          <SelectValue placeholder="Выберите тип" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="et in mockEventTypes"
            :key="et.id"
            :value="et.id"
          >
            {{ et.name }} ({{ et.duration }} мин)
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Calendar -->
    <div class="max-w-md mb-8">
      <CalendarGrid
        :slots="slots"
        v-model="selectedDay"
      />
    </div>

    <!-- Slot list -->
    <div v-if="selectedDay" class="max-w-md">
      <p class="text-sm text-muted-foreground mb-3">
        Слоты на {{ formatDateLabel(selectedDay) }}
      </p>
      <div v-if="slotsForDay.length === 0" class="text-sm text-muted-foreground">
        Нет доступных слотов
      </div>
      <div v-else class="space-y-2">
        <button
          v-for="slot in slotsForDay"
          :key="slot.id"
          type="button"
          class="w-full rounded-lg border bg-card text-card-foreground px-4 py-3 text-left text-sm hover:bg-accent transition-colors cursor-pointer"
          @click="openBooking(slot.id)"
        >
          {{ formatTime(slot.startTime) }} – {{ formatTime(slot.endTime) }}
        </button>
      </div>
    </div>

    <div v-else class="text-sm text-muted-foreground">
      Выберите день в календаре
    </div>

    <!-- Booking dialog -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Бронирование —
            {{ mockEventTypes.find((t) => t.id === eventTypeId)?.name ?? eventTypeId }},
            {{ selectedDay ? formatDateLabel(selectedDay) : '' }}
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <div class="space-y-1.5">
            <Label>Слот</Label>
            <Select
              :model-value="selectedSlotId ?? undefined"
              @update:model-value="onSlotSelectChange"
            >
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Выберите слот" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="slot in daySlotsForSelect"
                  :key="slot.id"
                  :value="slot.id"
                >
                  {{ formatTime(slot.startTime) }} – {{ formatTime(slot.endTime) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-1.5">
            <Label>Время начала</Label>
            <Input
              v-model="customTime"
              type="time"
              :min="timeMin()"
              :max="timeMax()"
            />
            <p v-if="!timeValidation.valid" class="text-xs text-destructive mt-1">
              {{ timeValidation.message }}
            </p>
          </div>

          <div class="space-y-1.5">
            <Label>Имя гостя</Label>
            <Input v-model="guestName" placeholder="Введите имя" />
          </div>
        </div>

        <DialogFooter class="mt-4">
          <Button @click="submitBooking" :disabled="!timeValidation.valid">
            Забронировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
