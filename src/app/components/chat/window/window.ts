import { Component, computed, effect, inject, input, InputSignal, signal, Signal, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { ChatWebsocket } from "@shared/services/chat-websocket";
import { ChatMessageType } from "@shared/types/ChatMessageType";
import { ChatType } from "@shared/types/ChatType";

@Component({
    selector: "app-chat-window",
    imports: [Input, Button],
    templateUrl: "./window.html",
    styleUrl: "./window.css",
})
export class Window {
    public chatUserId: InputSignal<string> = input.required<string>();

    protected chat: Signal<ChatMessageType[]> = computed(() => this.chatWebSocket.chatMessages()[this.chatUserId()] || []);

    protected chatUserName: Signal<string> = computed(() => {
        const chat = this.chatWebSocket.chats().find((chat: ChatType) => chat.user.id === this.chatUserId());
        return chat ? `${chat.user.name} ${chat.user.surname}` : "Unknown";
    });

    protected newMessageContent: WritableSignal<string> = signal<string>("");

    private chatWebSocket: ChatWebsocket = inject(ChatWebsocket);

    constructor() {
        effect(async () => {
            await this.chatWebSocket.getMessagesForChat(this.chatUserId());
        })
    }

    protected sendMessage(): void {

    }
}
