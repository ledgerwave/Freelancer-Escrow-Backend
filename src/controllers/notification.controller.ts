import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Body,
    HttpStatus,
    HttpCode
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery
} from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get notifications for a user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiQuery({
        name: 'unreadOnly',
        required: false,
        type: Boolean,
        description: 'Return only unread notifications'
    })
    @ApiResponse({
        status: 200,
        description: 'Notifications retrieved',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    user_id: { type: 'string' },
                    type: { type: 'string' },
                    read: { type: 'boolean' },
                    content: { type: 'string' },
                    created_at: { type: 'string' }
                }
            }
        }
    })
    async getUserNotifications(
        @Param('userId') userId: string,
        @Query('unreadOnly') unreadOnly?: boolean
    ) {
        return await this.notificationService.getUserNotifications(
            userId,
            unreadOnly === true
        );
    }

    @Post(':id/read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiParam({ name: 'id', description: 'Notification ID' })
    @ApiResponse({
        status: 200,
        description: 'Notification marked as read',
        schema: {
            example: {
                success: true,
                message: 'Notification marked as read'
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Notification not found'
    })
    async markNotificationAsRead(@Param('id') id: string) {
        const success = await this.notificationService.markNotificationAsRead(id);
        return {
            success,
            message: success ? 'Notification marked as read' : 'Notification not found'
        };
    }

    @Post('user/:userId/read-all')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark all notifications as read for a user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'Notifications marked as read',
        schema: {
            example: {
                success: true,
                message: 'All notifications marked as read',
                count: 5
            }
        }
    })
    async markAllNotificationsAsRead(@Param('userId') userId: string) {
        const count = await this.notificationService.markAllNotificationsAsRead(userId);
        return {
            success: true,
            message: 'All notifications marked as read',
            count
        };
    }

    @Post('email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Send email notification (for testing)' })
    @ApiResponse({
        status: 200,
        description: 'Email sent successfully',
        schema: {
            example: {
                success: true,
                message: 'Email notification sent'
            }
        }
    })
    async sendTestEmail(
        @Body() body: { userId: string; subject: string; message: string }
    ) {
        await this.notificationService.sendEmail(body.userId, body.subject, body.message);
        return {
            success: true,
            message: 'Email notification sent'
        };
    }

    @Post('push')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Send push notification (for testing)' })
    @ApiResponse({
        status: 200,
        description: 'Push notification sent successfully',
        schema: {
            example: {
                success: true,
                message: 'Push notification sent'
            }
        }
    })
    async sendTestPush(
        @Body() body: { userId: string; payload: any }
    ) {
        await this.notificationService.sendPush(body.userId, body.payload);
        return {
            success: true,
            message: 'Push notification sent'
        };
    }
}
