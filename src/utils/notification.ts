import {
    NotificationType,
    PrismaClient,
    PrismaService,
} from '@optimatech88/titomeet-shared-lib';
import { NotificationDto } from 'src/dto/notifications.dto';

export const getMailDetails = async (payload: {
    notification: NotificationDto;
    username: string;
}) => {
    let subject = '';
    let html = '';
    const { notification, username } = payload;
    const prisma = new PrismaService();
    const { type } = notification;

    switch (type) {
        case NotificationType.EVENT_VALIDATION:
        case NotificationType.EVENT_REJECTION:
            const isValidated = type === NotificationType.EVENT_VALIDATION;
            subject = isValidated ? 'Événement validé' : 'Événement rejeté';
            const eventValidatedData = notification.data as {
                eventId: string;
                reason?: string;
            };

            const event = await prisma.event.findUnique({
                where: {
                    id: eventValidatedData.eventId,
                },
                select: {
                    name: true,
                },
            });

            if (!event) {
                throw new Error('Event not found');
            }
            html = `
            <p>Bonjour ${username},</p>
            <p>Votre événement <b>${event.name}</b> a été ${isValidated ? 'validé' : 'rejeté'}.</p>
            ${isValidated
                    ? '<p>Vous pouvez désormais le modifier et le partager avec vos clients.</p>'
                    : `<p>Le motif du rejet est : <br/>
                <span>${eventValidatedData.reason || 'Aucun motif fourni'}</span></p>`
                }
            `;
            break;

        case NotificationType.EVENT_ASSIGNMENT:
            subject = 'Événement assigné';
            break;
    }

    return {
        subject,
        html,
    };
};
