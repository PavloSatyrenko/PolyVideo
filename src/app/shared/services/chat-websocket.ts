import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { environment } from "@shared/environments/environment";

@Injectable({
    providedIn: "root"
})
export class ChatWebSocketService {

    private socket: Socket | null = null;

    connect(): void {
        this.socket = io(environment.serverURL + "/chat");

        this.socket.on("connect_error", (error: Error) => {
            console.error("Connection error:", error.message);
        });
    }
}
