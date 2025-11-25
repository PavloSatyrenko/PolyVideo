import { NgClass } from "@angular/common";
import { Component, computed, input, InputSignal, model, ModelSignal, Signal } from "@angular/core";
import { ChatType } from "@shared/types/ChatType";

@Component({
    selector: "app-chat-list",
    imports: [NgClass],
    templateUrl: "./list.html",
    styleUrl: "./list.css",
})
export class List {
    public chats: InputSignal<ChatType[]> = input.required();

    protected isAnyChatAvailable: Signal<boolean> = computed(() => this.chats().length > 0);

    public selectedChatUserId: ModelSignal<string | null> = model<string | null>(null);

    protected selectChat(userId: string): void {
        this.selectedChatUserId.set(userId);
    }
}
