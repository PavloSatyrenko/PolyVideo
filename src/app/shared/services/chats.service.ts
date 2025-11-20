import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@shared/environments/environment";
import { ChatType } from "@shared/types/ChatType";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class ChatsService {
    private httpClient: HttpClient = inject(HttpClient);

    public async getChats(): Promise<ChatType[]> {
        return await firstValueFrom(this.httpClient.get<ChatType[]>(environment.serverURL + "/chats"));
    }

    public async sendMessage(receiverId: string, content: string): Promise<void> {
        await firstValueFrom(this.httpClient.post<void>(environment.serverURL + "/chats", { receiverId, content }));
    }
}
