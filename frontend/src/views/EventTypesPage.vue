<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { mockEventTypes } from '@/mocks/eventTypes'

const router = useRouter()

function goToBooking(eventTypeId: string) {
  router.push(`/event/${eventTypeId}`)
}
</script>

<template>
  <div class="min-h-dvh py-12 px-4">
    <h1 class="text-3xl font-bold text-center mb-10">
      Выберите тип встречи
    </h1>

    <div class="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
      <div
        v-for="et in mockEventTypes"
        :key="et.id"
        class="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-semibold">{{ et.name }}</h2>
          <span class="text-sm text-muted-foreground font-mono tabular-nums">
            {{ et.duration }} мин
          </span>
        </div>
        <p class="text-muted-foreground text-sm mb-6 flex-1">
          {{ et.description }}
        </p>
        <Button class="w-full" @click="goToBooking(et.id)">
          Забронировать
        </Button>
      </div>
    </div>
  </div>
</template>
