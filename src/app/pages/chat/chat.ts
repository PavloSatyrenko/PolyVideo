import { Component, computed, inject, signal, Signal, WritableSignal } from "@angular/core";
import { ChatWebsocket } from "@shared/services/chat-websocket";
import { List } from "@components/chat/list/list";
import { ChatType } from "@shared/types/ChatType";

@Component({
    selector: "app-chat",
    imports: [List],
    templateUrl: "./chat.html",
    styleUrl: "./chat.css"
})
export class Chat {
    protected chats: Signal<ChatType[]> = computed(() => this.chatWebSocket.chats());

    protected selectedChatUserId: WritableSignal<string | null> = signal<string | null>(null);

    private chatWebSocket: ChatWebsocket = inject(ChatWebsocket);
}
