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
    public readonly link: InputSignal<string> = input.required<string>();
    public readonly label: InputSignal<string> = input.required<string>();
    public readonly icon: InputSignal<string> = input.required<string>();
    public badgeCount: InputSignal<number | undefined> = input<number | undefined>();
    public isExpanded: InputSignal<boolean> = input.required<boolean>();
}
