import { db } from '@/lib/db'
import { Notification, NotificationType, NotificationPriority, RelatedEntityType } from '@prisma/client'

interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type: NotificationType
  priority?: NotificationPriority
  actionUrl?: string
  relatedEntityId?: string
    relatedEntityType?: RelatedEntityType
}

export class NotificationService {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db.notification.findMany({
      where: {
        userId,
      },
      orderBy: [
        { read: 'asc' },
        { createdAt: 'desc' }
      ]
    })
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await db.notification.updateMany({
      where: {
        id: notificationId,
        userId
      },
      data: {
        read: true,
        updatedAt: new Date()
      }
    })
  }

  async markAllAsRead(userId: string): Promise<void> {
    await db.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true,
        updatedAt: new Date()
      }
    })
  }

  async createNotification(params: CreateNotificationParams): Promise<Notification> {
    return await db.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        priority: params.priority || NotificationPriority.MEDIUM,
        actionUrl: params.actionUrl,
      }
    })
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    await db.notification.deleteMany({
      where: {
        id: notificationId,
        userId
      }
    })
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await db.notification.count({
      where: {
        userId,
        read: false
      }
    })
  }

  async createTimesheetNotification(
    userId: string,
    timesheetId: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
  ): Promise<Notification> {
    const titles = {
      PENDING: 'Timesheet Needs Review',
      APPROVED: 'Timesheet Approved',
      REJECTED: 'Timesheet Rejected'
    }

    const messages = {
      PENDING: 'A new timesheet requires your review',
      APPROVED: 'Your timesheet has been approved',
      REJECTED: 'Your timesheet has been rejected'
    }

    return await this.createNotification({
      userId,
      title: titles[status],
      message: messages[status],
      type: `TIMESHEET_${status}` as NotificationType,
      priority: status === 'REJECTED' ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
      relatedEntityId: timesheetId,
      relatedEntityType: 'TIMESHEET',
    })
  }
}

export const notificationService = new NotificationService()