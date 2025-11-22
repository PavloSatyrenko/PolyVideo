import { computed, inject, Injectable, Signal, signal, WritableSignal } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { io, Socket } from "socket.io-client";
import { ChatsService } from "./chats.service";
import { ChatType } from "@shared/types/ChatType";
import { ChatMessageType } from "@shared/types/ChatMessageType";
import { openDB, DBSchema, IDBPDatabase } from "idb";

interface ChatDB extends DBSchema {
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

    private indexedDB: Promise<IDBPDatabase<ChatDB>> = openDB<ChatDB>("chatDatabase", 1, {
        upgrade(db) {
            db.createObjectStore("messages");
        }
    });;

    private internalChats: WritableSignal<ChatType[]> = signal([]);
    public chats: Signal<ChatType[]> = computed(() => this.internalChats());

    private internalChatMessages: WritableSignal<Record<string, ChatMessageType[]>> = signal({});
    public chatMessages: Signal<Record<string, ChatMessageType[]>> = computed(() => this.internalChatMessages());

    private chatsService: ChatsService = inject(ChatsService);

    public connect(): void {
        this.socket = io(environment.serverURL + "/chat", { withCredentials: true });

        this.chatsService.getChats()
            .then((chats: ChatType[]) => {
                this.internalChats.set(chats);
            });

        this.socket.on("message-sent", async (data: { message: ChatMessageType, userId: string }) => {
            const indexedDB: IDBPDatabase<ChatDB> = await this.indexedDB;

            const oldMessages: ChatMessageType[] = this.chatMessages()[data.userId] ?? [];

            this.internalChatMessages.update((messages: Record<string, ChatMessageType[]>) => ({
                ...messages,
                [data.userId]: [...oldMessages, data.message],
            }));

            const last20Messages: ChatMessageType[] = [...oldMessages, data.message].slice(-20);

            await indexedDB.put("messages", last20Messages, data.userId);
        });

        this.socket.on("chat-message", async (data: { message: ChatMessageType, userId: string }) => {
            const indexedDB: IDBPDatabase<ChatDB> = await this.indexedDB;

            const oldMessages: ChatMessageType[] = this.chatMessages()[data.userId] ?? [];

            this.internalChatMessages.update((messages: Record<string, ChatMessageType[]>) => ({
                ...messages,
                [data.userId]: [...oldMessages, data.message],
            }));

            const last20Messages: ChatMessageType[] = [...oldMessages, data.message].slice(-20);

            await indexedDB.put("messages", last20Messages, data.userId);
        });
    }

    public async getMessagesForChat(chatUserId: string): Promise<void> {
        const indexedDB: IDBPDatabase<ChatDB> = await this.indexedDB;

        const storedMessages: ChatMessageType[] = (await indexedDB.get("messages", chatUserId)) ?? [];

        this.internalChatMessages.update((messages: Record<string, ChatMessageType[]>) => ({
            ...messages,
            [chatUserId]: storedMessages,
        }));

        await this.chatsService.getMessages(chatUserId)
            .then(async (newMessages: ChatMessageType[]) => {
                this.internalChatMessages.update((messages: Record<string, ChatMessageType[]>) => ({
                    ...messages,
                    [chatUserId]: newMessages,
                }));

                const last20Messages: ChatMessageType[] = newMessages.slice(-20);

                await indexedDB.put("messages", last20Messages, chatUserId);
            });
    }

    public sendMessage(chatUserId: string, content: string): void {
        this.socket.emit("chat-message", { userId: chatUserId, content });
    }
}
