import { NgClass } from "@angular/common";
import { Component, input, InputSignal, model, ModelSignal } from "@angular/core";
import { ChatType } from "@shared/types/ChatType";

@Component({
    selector: "app-chat-list",
    imports: [NgClass],
    templateUrl: "./list.html",
    styleUrl: "./list.css",
})
export class List {
    public chats: InputSignal<ChatType[]> = input.required();

    public selectedChatUserId: ModelSignal<string | null> = model<string | null>(null);

    protected selectChat(userId: string): void {
        this.selectedChatUserId.set(userId);
    }
 }
