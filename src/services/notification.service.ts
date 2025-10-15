import { Injectable } from '@nestjs/common';
import { Notification, NotificationType } from '../entities/notification.entity';
import { JsonStorageUtil } from '../utils/json-storage.util';

@Injectable()
export class NotificationService {
    /**
     * Send email notification (simulated - logs to console)
     * TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
     */
    async sendEmail(userId: string, subject: string, message: string): Promise<void> {
        // TODO: Implement actual email sending
        // This could integrate with:
        // - SendGrid
        // - AWS SES
        // - Mailgun
        // - Custom SMTP server

        console.log('📧 EMAIL NOTIFICATION:');
        console.log(`To: User ${userId}`);
        console.log(`Subject: ${subject}`);
        console.log(`Message: ${message}`);
        console.log('---');

        // Save notification to database
        await this.createNotification(userId, NotificationType.ESCROW_CREATED, message);
    }

    /**
     * Send push notification (simulated - logs to console)
     * TODO: Integrate with actual push notification service (FCM, APNS, etc.)
     */
    async sendPush(userId: string, payload: any): Promise<void> {
        // TODO: Implement actual push notification sending
        // This could integrate with:
        // - Firebase Cloud Messaging (FCM)
        // - Apple Push Notification Service (APNS)
        // - Web Push API
        // - Custom push service

        console.log('📱 PUSH NOTIFICATION:');
        console.log(`To: User ${userId}`);
        console.log(`Payload:`, JSON.stringify(payload, null, 2));
        console.log('---');

        // Save notification to database
        await this.createNotification(userId, NotificationType.MESSAGE_RECEIVED, payload.message || 'Push notification');
    }

    /**
     * Create a notification record
     */
    async createNotification(
        userId: string,
        type: NotificationType,
        content: string
    ): Promise<Notification> {
        const notification: Notification = {
            id: JsonStorageUtil.generateId(),
            user_id: userId,
            type,
            read: false,
            content,
            created_at: new Date().toISOString()
        };

        JsonStorageUtil.addEntity('notifications', notification);
        return notification;
    }

    /**
     * Get notifications for a user
     */
    async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
        const notifications = JsonStorageUtil.findEntitiesByField('notifications', 'user_id', userId);

        if (unreadOnly) {
            return notifications.filter(notification => !notification.read);
        }

        return notifications.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    /**
     * Mark notification as read
     */
    async markNotificationAsRead(notificationId: string): Promise<boolean> {
        return JsonStorageUtil.updateEntityById('notifications', notificationId, {
            read: true
        });
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllNotificationsAsRead(userId: string): Promise<number> {
        const notifications = JsonStorageUtil.findEntitiesByField('notifications', 'user_id', userId);
        let markedCount = 0;

        for (const notification of notifications) {
            if (!notification.read) {
                const updated = JsonStorageUtil.updateEntityById('notifications', notification.id, {
                    read: true
                });
                if (updated) {
                    markedCount++;
                }
            }
        }

        return markedCount;
    }

    /**
     * Send escrow state change notification
     */
    async sendEscrowNotification(
        userId: string,
        escrowId: string,
        state: string,
        message: string
    ): Promise<void> {
        let notificationType: NotificationType;

        switch (state) {
            case 'CREATED':
                notificationType = NotificationType.ESCROW_CREATED;
                break;
            case 'LOCKED':
                notificationType = NotificationType.ESCROW_LOCKED;
                break;
            case 'DELIVERED':
                notificationType = NotificationType.ESCROW_DELIVERED;
                break;
            case 'RELEASED':
                notificationType = NotificationType.ESCROW_RELEASED;
                break;
            case 'REFUNDED':
                notificationType = NotificationType.ESCROW_REFUNDED;
                break;
            default:
                notificationType = NotificationType.ESCROW_CREATED;
        }

        await this.createNotification(userId, notificationType, message);

        // Also send via email
        await this.sendEmail(userId, `Escrow ${state}`, message);
    }

    /**
     * Send dispute notification
     */
    async sendDisputeNotification(
        userId: string,
        disputeId: string,
        status: string,
        message: string
    ): Promise<void> {
        const notificationType = status === 'OPEN'
            ? NotificationType.DISPUTE_OPENED
            : NotificationType.DISPUTE_RESOLVED;

        await this.createNotification(userId, notificationType, message);

        // Also send via email
        await this.sendEmail(userId, `Dispute ${status}`, message);
    }
}
