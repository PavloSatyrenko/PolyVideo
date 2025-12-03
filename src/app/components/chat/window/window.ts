import { NgClass } from "@angular/common";
import { Component, computed, effect, ElementRef, inject, input, InputSignal, signal, Signal, viewChild, WritableSignal } from "@angular/core";
import { Button } from "@shared/components/button/button";
import { Input } from "@shared/components/input/input";
import { AuthService } from "@shared/services/auth.service";
import { ChatWebsocket } from "@shared/services/chat-websocket";
import { ChatsService } from "@shared/services/chats.service";
import { ChatMessageType } from "@shared/types/ChatMessageType";
import { ChatType } from "@shared/types/ChatType";

@Component({
    selector: "app-chat-window",
    imports: [Input, Button, NgClass],
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

    private scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    private isMessagesLoaded: boolean = false;
    private isLoadingMoreMessage: boolean = false;
    private hasMore: boolean = true;

    private chatWebSocket: ChatWebsocket = inject(ChatWebsocket);
    private chatsService: ChatsService = inject(ChatsService);
    private authService: AuthService = inject(AuthService);

    constructor() {
        effect(async () => {
            await this.chatWebSocket.getMessagesForChat(this.chatUserId());
        });

        effect(() => {
            this.chatLength();
            this.chatUserId();

            if (!this.isLoadingMoreMessage) {
                this.isMessagesLoaded = false;

                setTimeout(() => {
                    this.messagesContainer().nativeElement.scrollTop = this.messagesContainer().nativeElement.scrollHeight;
                    this.isMessagesLoaded = true;
                }, 0);
            }
        })
    }

    protected isOwnMessage(message: ChatMessageType): boolean {
        return message.senderId === this.authService.user()?.id;
    }

    protected onChatScroll(): void {
        const threshold: number = 100;

        if (this.messagesContainer().nativeElement.scrollTop <= threshold && this.isMessagesLoaded && this.hasMore) {
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }

            this.isLoadingMoreMessage = true;

            this.scrollTimeout = setTimeout(() => {
                this.chatsService.getMessages(this.chatUserId(), this.chat()[0]?.id)
                    .then((response: { messages: ChatMessageType[], hasMore: boolean }) => {
                        if (response.messages.length === 0) {
                            return;
                        }

                        const previousHeight: number = this.messagesContainer().nativeElement.scrollHeight;

                        const updatedMessages: ChatMessageType[] = [...response.messages, ...this.chat()];

                        this.chatWebSocket.updateChatMessages(updatedMessages, this.chatUserId());

                        this.hasMore = response.hasMore;

                        setTimeout(() => {
                            const newHeight: number = this.messagesContainer().nativeElement.scrollHeight;
                            this.messagesContainer().nativeElement.scrollTop = newHeight - previousHeight;
                            this.isLoadingMoreMessage = false;
                        }, 0);
                    });
            }, 100);
        }
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
