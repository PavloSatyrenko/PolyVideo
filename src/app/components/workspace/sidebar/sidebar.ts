import { Component, signal, WritableSignal } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SidebarItemType } from "@shared/types/SidebarItemType";
import { SidebarItem } from "@components/workspace/sidebar-item/sidebar-item";

@Component({
    selector: "app-workspace-sidebar",
    imports: [RouterModule, SidebarItem],
    templateUrl: "./sidebar.html",
    styleUrl: "./sidebar.css"
})
export class Sidebar {
    protected isSidebarExpanded: WritableSignal<boolean> = signal<boolean>(false);

    protected sidebarItems: SidebarItemType[] = [
        { link: "meetings", label: "Meetings", icon: "fa-solid fa-video", isNotified: false },
        { link: "chat", label: "Chat", icon: "fa-solid fa-comment-dots", isNotified: true },
    ];

    toggleSidebarExpansion(): void {
        this.isSidebarExpanded.update((value: boolean) => !value);
    }
}
