import { Component, computed, ElementRef, HostListener, inject, signal, Signal, viewChild, WritableSignal } from "@angular/core";
import { ChatWebsocket } from "@shared/services/chat-websocket";
import { List } from "@components/chat/list/list";
import { ChatType } from "@shared/types/ChatType";
import { Window } from "@components/chat/window/window";
import { Button } from "@shared/components/button/button";
import { Title } from "@shared/components/title/title";
import { UserType } from "@shared/types/UserType";
import { ChatsService } from "@shared/services/chats.service";
import { NgClass } from "@angular/common";
import { Input } from "@shared/components/input/input";
import { toObservable } from "@angular/core/rxjs-interop";
import { debounceTime, distinctUntilChanged, Observable, switchMap, tap } from "rxjs";

@Component({
    selector: "app-chat",
    imports: [List, Window, Button, Title, NgClass, Input],
    templateUrl: "./chat.html",
    styleUrl: "./chat.css"
})
export class Chat {
    protected chats: Signal<ChatType[]> = computed(() => this.chatWebSocket.chats());

    protected selectedChatUserId: WritableSignal<string | null> = signal<string | null>(null);

    protected isUsersPopupOpen: WritableSignal<boolean> = signal<boolean>(false);
    private popupContent: Signal<ElementRef<HTMLDivElement> | undefined> = viewChild<ElementRef<HTMLDivElement> | undefined>("popup");

    protected searchUserQuery: WritableSignal<string> = signal<string>("");
    protected searchUserState: WritableSignal<"loading" | "loaded" | "no-results"> = signal<"loading" | "loaded" | "no-results">("loading");
    protected searchUserDebounceTimeout: ReturnType<typeof setTimeout> | null = null;

    protected users: WritableSignal<UserType[]> = signal<UserType[]>([]);
    protected selectedUserId: WritableSignal<string> = signal<string>("");

    private chatWebSocket: ChatWebsocket = inject(ChatWebsocket);
    private chatsService: ChatsService = inject(ChatsService);

    constructor() {
        const searchQueryObservable: Observable<string> = toObservable(this.searchUserQuery);

        searchQueryObservable.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searchUserState.set("loading")),
            switchMap((query: string) => this.chatsService.getUsersToChat(query))
        ).subscribe((users: UserType[]) => {
            this.users.set(users);
            this.searchUserState.set(users.length === 0 ? "no-results" : "loaded");
        });
    }

    protected openUsersPopup(): void {
        this.searchUserQuery.set("");

        this.searchUserState.set("loading");

        this.chatsService.getUsersToChat("")
            .then((users: UserType[]) => {
                this.users.set(users);
                this.searchUserState.set(users.length === 0 ? "no-results" : "loaded");

                if (this.selectedUserId() && !users.find((user: UserType) => user.id === this.selectedUserId())) {
                    this.selectedUserId.set("");
                }
            });

        this.selectedUserId.set("");
        this.isUsersPopupOpen.set(true);
    }

    protected closeUsersPopup(): void {
        this.isUsersPopupOpen.set(false);
    }

    protected isUserSelected(userId: string): boolean {
        return this.selectedUserId() === userId;
    }

    protected selectUser(userId: string): void {
        this.selectedUserId.set(userId);
    }

    protected startChatWithSelectedUser(): void {
        const userId: string = this.selectedUserId();

        if (!userId) {
            return;
        }

        const user: UserType | undefined = this.users().find((user: UserType) => user.id === userId);

        if (user) {
            this.chatWebSocket.startChatWithUser(user);
        }

        this.selectedChatUserId.set(userId);
        this.closeUsersPopup();
    }

    @HostListener("document:click", ["$event"])
    protected onBackdropClick(event: MouseEvent): void {
        if (!this.popupContent()) {
            return;
        }

        const targetNode: Node | null = event.target as Node | null;

        if (targetNode && this.popupContent()?.nativeElement.contains(targetNode)) {
            return;
        }

        this.closeUsersPopup();
    }

    @HostListener("document:keydown", ["$event"])
    protected onDocumentKeyDown(event: KeyboardEvent): void {
        if (!this.popupContent()) {
            return;
        }

        if (event.key === "Escape" || event.key === "Esc") {
            event.preventDefault();

            this.closeUsersPopup();
        }
    }
}
