import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { ChatMessageType } from "@shared/types/ChatMessageType";
import { ChatType } from "@shared/types/ChatType";
import { UserType } from "@shared/types/UserType";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class ChatsService {
    private httpClient: HttpClient = inject(HttpClient);

    public async getChats(): Promise<ChatType[]> {
        return await firstValueFrom(this.httpClient.get<ChatType[]>(environment.serverURL + "/chats"));
    }

    public async getMessages(chatUserId: string, beforeMessageId?: string): Promise<ChatMessageType[]> {
        const params: Record<string, string> = {};

        if (beforeMessageId) {
            params["before"] = beforeMessageId;
        }

        return await firstValueFrom(this.httpClient.get<ChatMessageType[]>(environment.serverURL + "/chats/" + chatUserId, {
            params: params,
        }));
    }

    public async sendMessage(receiverId: string, content: string): Promise<void> {
        await firstValueFrom(this.httpClient.post<void>(environment.serverURL + "/chats", { receiverId, content }));
    }

    public async getUsersToChat(query: string): Promise<UserType[]> {
        const params: Record<string, string> = {};

        if (query) {
            params["search"] = query;
        }

        return await firstValueFrom(this.httpClient.get<UserType[]>(environment.serverURL + "/users", {
            params: params,
        }));
    }
}