export type ChatMessageType = {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    sentAt: Date;
};