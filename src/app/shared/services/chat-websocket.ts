import { computed, inject, Injectable, Signal, signal, WritableSignal } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { io, Socket } from "socket.io-client";
import { ChatsService } from "./chats.service";
import { ChatType } from "@shared/types/ChatType";
import { ChatMessageType } from "@shared/types/ChatMessageType";
import { openDB, DBSchema, IDBPDatabase } from "idb";
import { UserType } from "@shared/types/UserType";
import { NotificationService } from "./notification.service";

interface ChatDB extends DBSchema {
    chats: {
        key: string,
        value: ChatType;
    },
    messages: {
        key: string;
        value: ChatMessageType[];
    }
}

@Injectable({
    providedIn: "root",
})
export class ChatWebsocket {
    private socket!: Socket;

    private indexedDB: Promise<IDBPDatabase<ChatDB>> = openDB<ChatDB>("chatDatabase", 2, {
        upgrade(db: IDBPDatabase<ChatDB>) {
            if (!db.objectStoreNames.contains("chats")) {
                db.createObjectStore("chats");
            }

            if (!db.objectStoreNames.contains("messages")) {
                db.createObjectStore("messages");
            }
        }
    });

    private internalChats: WritableSignal<ChatType[]> = signal([]);
    public chats: Signal<ChatType[]> = computed(() => this.internalChats());

    public selectedChatUserId: WritableSignal<string | null> = signal<string | null>(null);

    private internalChatMessages: WritableSignal<Record<string, ChatMessageType[]>> = signal({});
    public chatMessages: Signal<Record<string, ChatMessageType[]>> = computed(() => this.internalChatMessages());

    private chatsService: ChatsService = inject(ChatsService);
    private notificationService: NotificationService = inject(NotificationService);

    public connect(): void {
        this.socket = io(environment.serverURL + "/chat", { withCredentials: true });

        this.getChats();

        this.socket.on("message-sent", async (data: { message: ChatMessageType, userId: string }) => {
            this.getNewMessage(data.message, data.userId);
        });

        this.socket.on("chat-message", async (data: { message: ChatMessageType, userId: string }) => {
            this.getNewMessage(data.message, data.userId);

            if (this.selectedChatUserId() !== data.userId) {
                this.notificationService.showNotification("New Message", "You received a new message in workspace chat", "info", 5000);
            }
        });
    }

    private async getChats(): Promise<void> {
        const indexedDB: IDBPDatabase<ChatDB> = await this.indexedDB;

        const storedChats: ChatType[] = (await indexedDB.getAll("chats")) ?? [];

        storedChats.sort((a: ChatType, b: ChatType) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime());

        this.internalChats.set(storedChats);

        this.chatsService.getChats()
            .then(async (newChats: ChatType[]) => {
                this.internalChats.set(newChats);

                for (const chat of newChats) {
                    await indexedDB.put("chats", chat, chat.user.id);
                }
            });
    }

    public startChatWithUser(user: UserType): void {
        if (this.chats().find((chat: ChatType) => chat.user.id === user.id)) {
            return;
        }

        const newChat: ChatType = {
            user: user,
            sentAt: new Date().toISOString(),
        };

        this.internalChats.update((chats: ChatType[]) => [newChat, ...chats]);
    }

    public async getMessagesForChat(chatUserId: string): Promise<void> {
        const indexedDB: IDBPDatabase<ChatDB> = await this.indexedDB;

        const storedMessages: ChatMessageType[] = (await indexedDB.get("messages", chatUserId)) ?? [];

        this.internalChatMessages.update((messages: Record<string, ChatMessageType[]>) => ({
            ...messages,
            [chatUserId]: storedMessages,
        }));

        await this.chatsService.getMessages(chatUserId)
            .then(async (response: { messages: ChatMessageType[], hasMore: boolean }) => {
                this.internalChatMessages.update((messages: Record<string, ChatMessageType[]>) => ({
                    ...messages,
                    [chatUserId]: response.messages,
                }));

                const last20Messages: ChatMessageType[] = response.messages.slice(-20);

                await indexedDB.put("messages", last20Messages, chatUserId);
            });
    }

    public async updateChatMessages(newMessages: ChatMessageType[], chatUserId: string): Promise<void> {
        this.internalChatMessages.update((messages: Record<string, ChatMessageType[]>) => ({
            ...messages,
            [chatUserId]: newMessages,
        }));
    }

    public sendMessage(chatUserId: string, content: string): void {
        this.socket.emit("chat-message", { userId: chatUserId, content });
    }

    private async getNewMessage(message: ChatMessageType, chatUserId: string): Promise<void> {
        const indexedDB: IDBPDatabase<ChatDB> = await this.indexedDB;

        const oldMessages: ChatMessageType[] = this.chatMessages()[chatUserId] ?? [];

        this.internalChatMessages.update((messages: Record<string, ChatMessageType[]>) => ({
            ...messages,
            [chatUserId]: [...oldMessages, message],
        }));

        const last20Messages: ChatMessageType[] = [...oldMessages, message].slice(-20);

        await indexedDB.put("messages", last20Messages, chatUserId);

        const chat: ChatType | undefined = this.chats().find((chat: ChatType) => chat.user.id === chatUserId);

        if (chat) {
            const updatedChat: ChatType = {
                ...message,
                user: chat.user,
            };

            const newChats: ChatType[] = this.internalChats().map((chat: ChatType) => {
                if (chat.user.id === chatUserId) {
                    return updatedChat;
                }

                return chat;
            });

            newChats.sort((a: ChatType, b: ChatType) => new Date(b.sentAt!).getTime() - new Date(a.sentAt!).getTime());

            this.internalChats.set(newChats);

            await indexedDB.put("chats", updatedChat, chatUserId);
        }
    }
}
