import { Component, inject, input, InputSignal, signal, WritableSignal } from "@angular/core";
import { Title } from "@shared/components/title/title";
import { MessageType } from "@shared/types/MessageType";
import { Input } from "@shared/components/input/input";
import { ConferenceWebsocket } from "@shared/services/conference-websocket";
import { Button } from "@shared/components/button/button";

@Component({
    selector: "app-conference-chat-sidebar",
    imports: [Title, Input, Button],
    templateUrl: "./chat-sidebar.html",
    styleUrl: "./chat-sidebar.css",
})
export class ChatSidebar {
    public messages: InputSignal<MessageType[]> = input<MessageType[]>([]);

    protected newMessageContent: WritableSignal<string> = signal<string>("");

    private conferenceWebSocket: ConferenceWebsocket = inject(ConferenceWebsocket);

    protected sendMessage(): void {
        const content: string = this.newMessageContent().trim();

        if (content === "") {
            return;
        }

        this.conferenceWebSocket.sendMessage(content);

        this.newMessageContent.set("");
    }
}
