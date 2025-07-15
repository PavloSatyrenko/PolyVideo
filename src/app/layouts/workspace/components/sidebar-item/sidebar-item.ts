import { CommonModule } from "@angular/common";
import { Component, input, InputSignal } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
    selector: "app-sidebar-item",
    imports: [RouterModule, CommonModule],
    templateUrl: "./sidebar-item.html",
    styleUrl: "./sidebar-item.css"
})
export class SidebarItem {
    public readonly link: InputSignal<string | undefined> = input<string>();
    public readonly label: InputSignal<string | undefined> = input<string>();
    public readonly icon: InputSignal<string | undefined> = input<string>();
    public badgeCount: InputSignal<number | undefined> = input<number>();
    public isExpanded: InputSignal<boolean | undefined> = input<boolean>();
}
