import { Component, model, ModelSignal } from "@angular/core";
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
    public isSidebarOpened: ModelSignal<boolean> = model<boolean>(false);

    protected sidebarItems: SidebarItemType[] = [
        { link: "meetings", label: "Meetings", icon: "fa-solid fa-video", isNotified: false },
        { link: "chat", label: "Chat", icon: "fa-solid fa-comment-dots", isNotified: false },
    ];

    toggleSidebarExpansion(): void {
        this.isSidebarOpened.update((value: boolean) => !value);
    }
}
