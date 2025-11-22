import { Component, computed, effect, ElementRef, inject, input, InputSignal, signal, Signal, viewChild, WritableSignal } from "@angular/core";
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

    private chatLength: Signal<number> = computed(() => this.chat().length);

    protected chatUserName: Signal<string> = computed(() => {
        const chat = this.chatWebSocket.chats().find((chat: ChatType) => chat.user.id === this.chatUserId());
        return chat ? `${chat.user.name} ${chat.user.surname}` : "Unknown";
    });

    protected newMessageContent: WritableSignal<string> = signal<string>("");

    protected messagesContainer: Signal<ElementRef<HTMLDivElement>> = viewChild.required<ElementRef<HTMLDivElement>>("messagesContainer");

    private chatWebSocket: ChatWebsocket = inject(ChatWebsocket);

    constructor() {
        effect(async () => {
            await this.chatWebSocket.getMessagesForChat(this.chatUserId());
        });

        effect(() => {
            this.chatLength();
            this.chatUserId();

            setTimeout(() => {
                this.messagesContainer().nativeElement.scrollTop = this.messagesContainer().nativeElement.scrollHeight;
            }, 0);
        })
    }

    protected sendMessage(): void {
        const content: string = this.newMessageContent().trim();

        if (content === "") {
            return;
        }

        this.chatWebSocket.sendMessage(this.chatUserId(), content);

        this.newMessageContent.set("");
    }
}
