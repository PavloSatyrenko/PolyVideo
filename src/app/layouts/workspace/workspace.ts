import { Component, inject, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Sidebar } from "@components/workspace/sidebar/sidebar";
import { Topbar } from "@components/workspace/topbar/topbar";
import { ChatWebsocket } from "@shared/services/chat-websocket";

@Component({
    selector: "app-layout-workspace",
    imports: [RouterOutlet, Topbar, Sidebar],
    templateUrl: "./workspace.html",
    styleUrl: "./workspace.css"
})
export class Workspace implements OnInit { 
    private chatWebSocket: ChatWebsocket = inject(ChatWebsocket);

    public ngOnInit(): void {
        this.chatWebSocket.connect();
    }
}
