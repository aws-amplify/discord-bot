import { writable } from 'svelte/store'
import { v4 as uuid } from 'uuid'
import type { Readable } from 'svelte/store'
import type { ToastNotificationProps } from 'carbon-components-svelte/types/Notification/ToastNotification.svelte'

type Notification = ToastNotificationProps & {
  id: string
}

type NotificationStore = Readable<Notification[]> & {
  add: (notification: ToastNotificationProps) => void
  remove: (notification: Notification) => void
}

if (import.meta.vitest) {
  const { test } = import.meta.vitest

  const notification: Notification = {
    id: '123',
    kind: 'success',
    title: 'Successfully synced commands',
    subtitle: '',
    caption: new Date().toLocaleString(),
  }

  test.todo('notifications')
}

function createNotifications(): NotificationStore {
  const { subscribe, update } = writable<Notification[]>([])

  return {
    subscribe,
    add: (notification: ToastNotificationProps) => {
      const newNotification: Notification = {
        id: uuid(),
        caption: new Date().toLocaleString(),
        subtitle: '',
        kind: 'info',
        ...notification,
      }
      return update((n) => [...n, newNotification])
    },
    remove: (notification) =>
      update((n) => n.filter((n) => n.id !== notification.id)),
  }
}

export const store = createNotifications()
