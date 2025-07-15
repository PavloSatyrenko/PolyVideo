import { Component, signal, WritableSignal } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SidebarItemType } from "@shared/types/SidebarItemType";
import { SidebarItem } from "../sidebar-item/sidebar-item";

@Component({
    selector: "app-workspace-sidebar",
    imports: [RouterModule, SidebarItem],
    templateUrl: "./sidebar.html",
    styleUrl: "./sidebar.css"
})
export class Sidebar {
    protected isSidebarExpanded: WritableSignal<boolean> = signal<boolean>(false);

    protected sidebarItems: SidebarItemType[] = [
        { link: "meetings", label: "Meetings", icon: "fa-solid fa-video" },
        { link: "chat", label: "Chat", icon: "fa-solid fa-comment-dots", badgeCount: 5 },
        { link: "documents", label: "Documents", icon: "fa-solid fa-file" },
        { link: "calendar", label: "Calendar", icon: "fa-solid fa-calendar-days" },
        { link: "dashboards", label: "Dashboards", icon: "fa-solid fa-chalkboard" }
    ];

    toggleSidebarExpansion(): void {
        this.isSidebarExpanded.update((value: boolean) => !value);
    }
}
