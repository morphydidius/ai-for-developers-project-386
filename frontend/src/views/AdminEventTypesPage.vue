<script setup lang="ts">
import { ref } from 'vue'
import { mockEventTypes } from '@/mocks/eventTypes'
import type { EventType } from '@/types/api'
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

const dialogOpen = ref(false)
const editingItem = ref<EventType | null>(null)
const isCreate = ref(true)

const formId = ref('')
const formName = ref('')
const formDescription = ref('')
const formDuration = ref(15)

function openCreate() {
  isCreate.value = true
  editingItem.value = null
  formId.value = ''
  formName.value = ''
  formDescription.value = ''
  formDuration.value = 15
  dialogOpen.value = true
}

function openEdit(item: EventType) {
  isCreate.value = false
  editingItem.value = item
  formId.value = item.id
  formName.value = item.name
  formDescription.value = item.description
  formDuration.value = item.duration
  dialogOpen.value = true
}

function handleCreate() {
  dialogOpen.value = false
}

function handleDelete() {
  dialogOpen.value = false
}

function handleCancel() {
  dialogOpen.value = false
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Типы событий</h1>
      <Button @click="openCreate">Добавить</Button>
    </div>

    <div class="space-y-3">
      <div
        v-for="et in mockEventTypes"
        :key="et.id"
        class="rounded-lg border bg-card text-card-foreground px-4 py-3 flex items-center justify-between"
      >
        <div class="flex-1 min-w-0">
          <p class="font-medium">{{ et.name }}</p>
          <p class="text-sm text-muted-foreground truncate">{{ et.description }}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0 ml-4">
          <span class="text-sm text-muted-foreground font-mono tabular-nums">{{ et.duration }} мин</span>
          <Button variant="outline" size="sm" @click="openEdit(et)">Редактировать</Button>
        </div>
      </div>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{ isCreate ? 'Новый тип события' : 'Редактирование типа события' }}
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <div class="space-y-1.5">
            <Label>ID</Label>
            <Input v-model="formId" placeholder="Уникальный идентификатор" />
          </div>
          <div class="space-y-1.5">
            <Label>Название</Label>
            <Input v-model="formName" placeholder="Например: Быстрая встреча" />
          </div>
          <div class="space-y-1.5">
            <Label>Описание</Label>
            <Input v-model="formDescription" placeholder="Описание типа встречи" />
          </div>
          <div class="space-y-1.5">
            <Label>Длительность (мин)</Label>
            <Input v-model.number="formDuration" type="number" min="5" step="5" />
          </div>
        </div>

        <DialogFooter class="mt-4 gap-2">
          <Button v-if="isCreate" variant="default" @click="handleCreate">Создать</Button>
          <template v-else>
            <Button variant="default" @click="handleCreate">Обновить</Button>
            <Button variant="destructive" @click="handleDelete">Удалить</Button>
          </template>
          <Button variant="outline" @click="handleCancel">Отмена</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
