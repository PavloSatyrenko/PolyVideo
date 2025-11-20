import { computed, inject, Injectable, Signal, signal, WritableSignal } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { io, Socket } from "socket.io-client";
import { ChatsService } from "./chats.service";
import { ChatType } from "@shared/types/ChatType";

@Injectable({
    providedIn: "root",
})
export class ChatWebsocket {
    private socket!: Socket;

    private internalChats: WritableSignal<ChatType[]> = signal([]);
    public chats: Signal<ChatType[]> = computed(() => this.internalChats());

    private chatsService: ChatsService = inject(ChatsService);

    public connect(): void {
        this.socket = io(environment.serverURL + "/chat", { withCredentials: true });

        this.chatsService.getChats()
            .then((chats: ChatType[]) => {
                this.internalChats.set(chats);
            });
    }
}
