'use server'

import { notificationService } from '@/services/NotificationService'

export async function getNotifications(userId: string) {
  try {
    const notifications = await notificationService.getUserNotifications()
    return { data: notifications }
  } catch (error) {
    return { error: 'Failed to fetch notifications' }
  }
}

export async function markAsRead(userId:string, id: string) {
  try {
    await notificationService.markAsRead(id)
    return { success: true }
  } catch (error) {
    return { error: 'Failed to mark notification as read' }
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await notificationService.markAllAsRead()
    return { success: true }
  } catch (error) {
    return { error: 'Failed to mark all notifications as read' }
  }
}